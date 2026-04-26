/* ==========================================================================
   main.js - TechDev Solutions
   Gestión del carrusel, animaciones de scroll, menú móvil y formularios.
   ========================================================================== */

(function () {
    'use strict';

    /* -------------------------------------------------------------------------
       Funciones auxiliares (no dependen del DOM)
       ---------------------------------------------------------------------- */

    /**
     * Muestra un mensaje de feedback en el formulario dado.
     * @param {HTMLElement} form - Elemento del formulario
     * @param {string} text - Texto del mensaje
     * @param {boolean} isError - Si es un mensaje de error
     */
    const showFormMsgHandler = (form, text, isError = false) => {
        const existing = form.querySelector('.form-msg');
        if (existing) existing.remove();
        const msg = document.createElement('p');
        msg.className = isError ? 'form-msg form-msg-error' : 'form-msg form-msg-success';
        msg.textContent = text;
        form.appendChild(msg);
        setTimeout(() => { if (msg.parentNode) msg.remove(); }, 4000);
    };

    /* -------------------------------------------------------------------------
       Inicialización al cargar el DOM
       ---------------------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {

        /* --- Constantes: elementos del DOM --- */
        const track      = document.querySelector('.carousel-track');
        const dots       = document.querySelectorAll('.nav-dot');
        const prevBtn    = document.querySelector('.carousel-prev');
        const nextBtn    = document.querySelector('.carousel-next');
        const nav        = document.querySelector('nav');
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks   = document.querySelector('.nav-links');

        /* --- Variables de estado --- */
        let currentIndex     = 0;
        let autoPlayInterval;
        let isScrollTicking  = false;

        /* --- Regex para validación de email --- */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        /* -----------------------------------------------------------------------
           Carrusel de eventos
           -------------------------------------------------------------------- */

        /* Actualiza posición del carrusel y el dot activo */
        const updateCarouselHandler = (index) => {
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
            currentIndex = index;
        };

        /* Inicia o reinicia el autoplay del carrusel cada 5 segundos */
        const startAutoPlayHandler = () => {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(() => {
                updateCarouselHandler((currentIndex + 1) % dots.length);
            }, 5000);
        };

        if (track && dots.length > 0) {
            /* Evento: clic en un dot de navegación */
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    updateCarouselHandler(index);
                    startAutoPlayHandler();
                });
            });

            /* Evento: botones anterior / siguiente */
            if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', () => {
                    updateCarouselHandler((currentIndex - 1 + dots.length) % dots.length);
                    startAutoPlayHandler();
                });
                nextBtn.addEventListener('click', () => {
                    updateCarouselHandler((currentIndex + 1) % dots.length);
                    startAutoPlayHandler();
                });
            }

            startAutoPlayHandler();
        }

        /* -----------------------------------------------------------------------
           Animaciones de entrada con IntersectionObserver
           -------------------------------------------------------------------- */

        /* Observer: añade la clase 'reveal' cuando el elemento entra en vista */
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('section, .card').forEach(el => revealObserver.observe(el));

        /* -----------------------------------------------------------------------
           Botón Scroll To Top
           -------------------------------------------------------------------- */

        /* Crea y añade el botón de scroll al inicio */
        const scrollTopBtn = document.createElement('button');
        scrollTopBtn.id = 'scrollTop';
        scrollTopBtn.setAttribute('title', 'Volver arriba');
        scrollTopBtn.setAttribute('aria-label', 'Volver arriba');
        scrollTopBtn.innerHTML = '↑';
        document.body.appendChild(scrollTopBtn);

        /* Evento: clic en botón scroll to top */
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        /* -----------------------------------------------------------------------
           Efectos de scroll (con requestAnimationFrame para optimizar)
           -------------------------------------------------------------------- */

        /* Handler del evento scroll — usa RAF para evitar layout thrashing */
        const scrollHandler = () => {
            if (!isScrollTicking) {
                requestAnimationFrame(() => {
                    /* Mostrar u ocultar botón de scroll top */
                    window.scrollY > 300
                        ? scrollTopBtn.classList.add('active')
                        : scrollTopBtn.classList.remove('active');

                    /* Cambio de estilo de la barra de navegación */
                    window.scrollY > 50
                        ? nav.classList.add('scrolled')
                        : nav.classList.remove('scrolled');

                    isScrollTicking = false;
                });
                isScrollTicking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler);

        /* -----------------------------------------------------------------------
           Menú móvil
           -------------------------------------------------------------------- */

        /* Evento: apertura/cierre del menú hamburguesa en móvil */
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                const isMenuOpen = navLinks.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', isMenuOpen);
            });
        }

        /* -----------------------------------------------------------------------
           Enlace activo en la navegación
           -------------------------------------------------------------------- */

        /* Marca el enlace correspondiente a la página actual como activo */
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            const linkPath = link.getAttribute('href');
            const isCurrentPage = linkPath === currentPath || (currentPath === '' && linkPath === 'index.html');
            if (isCurrentPage) link.classList.add('active');
        });

        /* -----------------------------------------------------------------------
           Validación del formulario de contacto
           -------------------------------------------------------------------- */

        const contactForm = document.getElementById('contact-form');
        if (contactForm) {

            /* Evento: envío del formulario de contacto */
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const name    = document.getElementById('name').value.trim();
                const email   = document.getElementById('email').value.trim();
                const message = document.getElementById('message').value.trim();
                const isPrivacyChecked = document.getElementById('privacy').checked;

                if (!name || !email || !message) {
                    showFormMsgHandler(contactForm, 'Por favor, completa todos los campos del formulario.', true);
                } else if (!emailRegex.test(email)) {
                    showFormMsgHandler(contactForm, 'Por favor, introduce un email válido.', true);
                } else if (message.length < 10) {
                    showFormMsgHandler(contactForm, 'El mensaje debe tener al menos 10 caracteres.', true);
                } else if (!isPrivacyChecked) {
                    showFormMsgHandler(contactForm, 'Debes aceptar la política de privacidad para continuar.', true);
                } else {
                    showFormMsgHandler(contactForm, `¡Gracias ${name}! Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.`);
                    contactForm.reset();
                }
            });
        }

        /* -----------------------------------------------------------------------
           Smooth scrolling para anclas internas
           -------------------------------------------------------------------- */

        /* Evento: clic en enlaces con "#" para scroll suave hacia la sección */
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });

    });

}());
