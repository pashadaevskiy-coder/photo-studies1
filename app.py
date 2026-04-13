"""
Главный файл приложения Flask
Сайт фотостудии "PHOTO STUDIES"
"""

import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text


# Базовый класс для моделей SQLAlchemy
class Base(DeclarativeBase):
    pass


# Инициализация приложения и БД
db = SQLAlchemy(model_class=Base)
app = Flask(__name__)

# Конфигурация
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///photo_studios.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_AS_ASCII'] = False  # Поддержка кириллицы в JSON

# Инициализация БД с приложением
db.init_app(app)


# Модель Booking для хранения заявок
class Booking(db.Model):
    """Модель заявки на запись"""
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    service = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)  # ISO дата
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        """Преобразование модели в словарь для JSON"""
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'service': self.service,
            'date': self.date,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ========== ОСНОВНЫЕ ROUTES ==========

@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html')


@app.route('/portfolio')
def portfolio():
    """Страница портфолио"""
    return render_template('portfolio.html')


@app.route('/booking')
def booking():
    """Страница записи"""
    return render_template('booking.html')


@app.route('/contacts')
def contacts():
    """Страница контактов"""
    return render_template('contacts.html')


@app.route('/admin')
def admin():
    """Админка — просмотр заявок"""
    return render_template('admin.html')


# ========== API ENDPOINTS ==========

@app.route('/api/booking', methods=['POST'])
def create_booking():
    """
    Создание новой заявки на запись
    Ожидает JSON: {name, phone, email, service, date, comment}
    """
    try:
        data = request.get_json()

        # Валидация обязательных полей
        required_fields = ['name', 'phone', 'email', 'service', 'date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Поле {field} обязательно'}), 400

        # Валидация email
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return jsonify({'error': 'Неверный формат email'}), 400

        # Валидация телефона (простая проверка)
        phone_clean = re.sub(r'[^\d+]', '', data['phone'])
        if len(phone_clean) < 10:
            return jsonify({'error': 'Неверный формат телефона'}), 400

        # Создание заявки
        booking = Booking(
            name=data['name'].strip(),
            phone=data['phone'].strip(),
            email=data['email'].strip().lower(),
            service=data['service'].strip(),
            date=data['date'].strip(),
            comment=data.get('comment', '').strip()
        )

        db.session.add(booking)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Заявка успешно отправлена',
            'booking': booking.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Ошибка при создании заявки: {str(e)}')
        return jsonify({'error': 'Внутренняя ошибка сервера'}), 500


@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    """
    Получение всех заявок (для админки)
    Поддерживает простую защиту через query параметр ?key=admin
    """
    # Простая защита (пароль в коде)
    admin_key = request.args.get('key')
    if admin_key != 'admin123':  # TODO: вынести в конфиг
        return jsonify({'error': 'Доступ запрещён'}), 403

    # Получение всех заявок, сортировка по дате создания (новые сверху)
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()

    return jsonify({
        'success': True,
        'bookings': [b.to_dict() for b in bookings]
    })


@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """
    Получение изображений портфолио
    В реальном проекте это можно брать из БД или папки
    """
    # Пример структуры данных (в будущем из БД)
    portfolio_items = [
        {
            'id': 1,
            'url': '/static/images/portfolio/1.jpg',
            'category': 'individual',
            'title': 'Индивидуальная съёмка'
        },
        {
            'id': 2,
            'url': '/static/images/portfolio/2.jpg',
            'category': 'love',
            'title': 'Love Story'
        },
        {
            'id': 3,
            'url': '/static/images/portfolio/3.jpg',
            'category': 'family',
            'title': 'Семейная съёмка'
        },
        # ... больше изображений
    ]

    return jsonify({
        'success': True,
        'items': portfolio_items
    })


# ========== ОБРАБОТКА ОШИБОК ==========

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    app.logger.error(f'Server error: {str(error)}')
    return render_template('500.html'), 500


# ========== ИНИЦИАЛИЗАЦИЯ БД ==========

def init_db():
    """Инициализация базы данных"""
    with app.app_context():
        db.create_all()
        print("✅ База данных инициализирована")


if __name__ == '__main__':
    # При первом запуске создаём БД
    if not os.path.exists('photo_studios.db'):
        init_db()

    # Запуск сервера
    app.run(debug=True, host='0.0.0.0', port=5000)
