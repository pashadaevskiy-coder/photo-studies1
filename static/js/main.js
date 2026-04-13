/**
 * Главный JavaScript файл для сайта фотостудии "PHOTO STUDIES"
 * Логика навигации, анимации, интерактивные элементы
 */

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========

let currentTestimonialIndex = 0;
let testimonialTrack = null;
let testimonialDots = null;
let totalTestimonials = 0;


// ========== ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initTestimonialSlider();
    initSmoothScroll();
});


// ========== NAVBAR ==========

/**
 * Инициализация navbar: скрытие/показ при скролле
 */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const currentScrollY = window.scrollY;

        // Добавляем тень при скролле
        if (currentScrollY > 10) {
            navbar.classList.add('shadow-md');
        } else {
            navbar.classList.remove('shadow-md');
        }

        // Скрываем/показываем navbar при скролле вниз/вверх
        if (currentScrollY > 100) {
            if (currentScrollY > lastScrollY) {
                // Скролл вниз — скрываем
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Скролл вверх — показываем
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
}


// ========== MOBILE MENU ==========

/**
 * Инициализация мобильного меню
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!menuBtn || !mobileMenu) return;

    // Открытие меню
    menuBtn.addEventListener('click', function() {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    // Закрытие меню
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }

    // Закрытие при клике на ссылку
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Закрытие при клике вне меню
    document.addEventListener('click', function(e) {
        if (mobileMenu.classList.contains('open') &&
            !mobileMenu.contains(e.target) &&
            !menuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });
}

/**
 * Закрытие мобильного меню
 */
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }
}


// ========== SCROLL ANIMATIONS (Intersection Observer) ==========

/**
 * Инициализация анимаций появления при скролле
 */
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Не отключаем observer, чтобы анимация срабатывала каждый раз
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}


// ========== TESTIMONIAL SLIDER ==========

/**
 * Инициализация слайдера отзывов
 */
function initTestimonialSlider() {
    const track = document.getElementById('testimonial-track');
    const dotsContainer = document.getElementById('testimonial-dots');

    if (!track) return;

    testimonialTrack = track;
    const slides = track.querySelectorAll('.testimonial-slide');
    totalTestimonials = slides.length;

    // Создание точек
    if (dotsContainer && totalTestimonials > 1) {
        testimonialDots = dotsContainer;
        for (let i = 0; i < totalTestimonials; i++) {
            const dot = document.createElement('button');
            dot.className = 'w-3 h-3 rounded-full bg-gray-300 hover:bg-accent transition-all';
            dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
            if (i === 0) dot.classList.add('bg-accent');
            dot.addEventListener('click', () => goToTestimonial(i));
            testimonialDots.appendChild(dot);
        }
    }

    // Навигационные кнопки
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentTestimonialIndex = (currentTestimonialIndex - 1 + totalTestimonials) % totalTestimonials;
            updateTestimonialSlider();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentTestimonialIndex = (currentTestimonialIndex + 1) % totalTestimonials;
            updateTestimonialSlider();
        });
    }

    // Автопрокрутка (опционально, можно отключить)
    // startAutoPlayTestimonials();

    // Пауза автопрокрутки при наведении
    track.addEventListener('mouseenter', stopAutoPlayTestimonials);
    track.addEventListener('mouseleave', startAutoPlayTestimonials);
}

/**
 * Обновление позиции слайдера
 */
function updateTestimonialSlider() {
    if (!testimonialTrack) return;

    const offset = -currentTestimonialIndex * 100;
    testimonialTrack.style.transform = `translateX(${offset}%)`;

    // Обновление точек
    if (testimonialDots) {
        const dots = testimonialDots.querySelectorAll('button');
        dots.forEach((dot, index) => {
            if (index === currentTestimonialIndex) {
                dot.classList.add('bg-accent');
            } else {
                dot.classList.remove('bg-accent');
            }
        });
    }
}

/**
 * Переход к конкретному отзыву
 */
function goToTestimonial(index) {
    currentTestimonialIndex = index;
    updateTestimonialSlider();
}

let testimonialAutoPlay = null;

/**
 * Запуск автопрокрутки
 */
function startAutoPlayTestimonials() {
    if (totalTestimonials <= 1) return;

    stopAutoPlayTestimonials();
    testimonialAutoPlay = setInterval(() => {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % totalTestimonials;
        updateTestimonialSlider();
    }, 5000); // Каждые 5 секунд
}

/**
 * Остановка автопрокрутки
 */
function stopAutoPlayTestimonials() {
    if (testimonialAutoPlay) {
        clearInterval(testimonialAutoPlay);
        testimonialAutoPlay = null;
    }
}


// ========== SMOOTH SCROLL ==========

/**
 * Инициализация плавного скролла для якорных ссылок
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}


// ========== UTILITY FUNCTIONS ==========

/**
 * Debounce функция для оптимизации
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle функция для оптимизации
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


// ========== LAZY LOADING IMAGES ==========

/**
 * Инициализация lazy loading для изображений (если нужно кастомное)
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if ('loading' in HTMLImageElement.prototype) {
        // Браузер поддерживает нативное lazy loading
        return;
    }

    // Для старых браузеров можно добавить Intersection Observer
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}


// ========== TOAST NOTIFICATIONS ==========

/**
 * Показ toast уведомления (уже есть в booking.html, но можно вынести сюда)
 */
function showToast(message, type = 'success', duration = 5000) {
    // Удаляем существующие toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Показываем
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Автоматически скрываем
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}


// ========== EXPORT ==========

// Экспорт функций в глобальную область для использования в других скриптах
window.initTestimonialSlider = initTestimonialSlider;
window.openLightbox = function(url, title) {
    // Будет переопределено в portfolio.html
    console.log('Lightbox not initialized');
};
window.closeLightbox = function(event) {
    // Будет переопределено в portfolio.html
    console.log('Lightbox close not initialized');
};
window.showToast = showToast;
