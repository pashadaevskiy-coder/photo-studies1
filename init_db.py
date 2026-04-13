"""
Скрипт для инициализации базы данных фотостудии "PHOTO STUDIES"
Создает таблицы и начальные данные
"""

import os
import sys
from datetime import datetime

# Добавляем корень проекта в путь для импорта
project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_dir)

# Импортируем Flask приложение и БД
from app import app, db


def init_db():
    """Инициализация базы данных"""
    with app.app_context():
        print("🔧 Подключение к базе данных...")
        
        # Создаем все таблицы
        db.create_all()
        print("✅ Таблицы созданы")
        
        # Проверяем, есть ли данные в таблице bookings
        from app import Booking
        count = Booking.query.count()
        
        if count == 0:
            print("📥 Добавление тестовых данных...")
            
            # Тестовые заявки
            test_bookings = [
                {
                    'name': 'Анна Петрова',
                    'phone': '+79991234567',
                    'email': 'anna.pet@mail.ru',
                    'service': 'Индивидуальная',
                    'date': '2024-05-15',
                    'comment': 'Хочу сделать портфолио для LinkedIn'
                },
                {
                    'name': 'Иван Иванов',
                    'phone': '+79991234568',
                    'email': 'ivan.ivanov@mail.ru',
                    'service': 'Love Story',
                    'date': '2024-05-20',
                    'comment': 'Для семейной фотосессии в парке города'
                },
                {
                    'name': 'Семья Семеновых',
                    'phone': '+79991234569',
                    'email': 'family.sem@mail.ru',
                    'service': 'Семейная',
                    'date': '2024-05-25',
                    'comment': 'С двумя детьми, раздельные фотографиии'
                },
                {
                    'name': 'Мария Сидорова',
                    'phone': '+79991234570',
                    'email': 'maria.sidorova@mail.ru',
                    'service': 'Портретная',
                    'date': '2024-06-01',
                    'comment': 'Нужно для резюме в Instagram'
                },
                {
                    'name': 'Дмитрий Петрович',
                    'phone': '+79991234571',
                    'email': 'dmitry.petrov@mail.ru',
                    'service': 'Событиевная',
                    'date': '2024-06-05',
                    'comment': 'День рождения дочи, нужно 10 фотографий'
                }
            ]
            
            for booking_data in test_bookings:
                booking = Booking(
                    name=booking_data['name'],
                    phone=booking_data['phone'],
                    email=booking_data['email'],
                    service=booking_data['service'],
                    date=booking_data['date'],
                    comment=booking_data['comment'],
                    created_at=datetime.utcnow()
                )
                db.session.add(booking)
            
            db.session.commit()
            print(f"✅ Добавлено {len(test_bookings)} тестовых заявок")
        else:
            print(f"ℹ️ Уже существует {count} заявок в базе данных")
        
        print("✅ База данных инициализирована")
        print("📋 Скрипт завершен. Можно запустить сервер: python app.py")


if __name__ == '__main__':
    print("🚀 Инициализация базы данных фотостудии PHOTO STUDIES")
    print("═" * 50)
    
    try:
        init_db()
    except Exception as e:
        print(f"❌ Ошибка при инициализации: {e}")
        sys.exit(1)
    
    print("═" * 50)
    print("✅ Готово! База данных готова к работе")
