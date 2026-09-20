document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ------------------------------------------------------------------------
       1. STICKY DUAL-STAGE NAVBAR CONTROLLER
       ------------------------------------------------------------------------ */
    const siteHeader = document.getElementById('site-header');
    
    const handleScrollHeader = () => {
        if (window.scrollY > 40) {
            siteHeader.classList.add('header-scrolled');
        } else {
            siteHeader.classList.remove('header-scrolled');
        }
    };

    window.addEventListener('scroll', handleScrollHeader, { passive: true });
    handleScrollHeader(); // Run on initial render

    /* ------------------------------------------------------------------------
       2. MOBILE DRAWER MENU & ACCESSIBILITY TRAP
       ------------------------------------------------------------------------ */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerAnchors = document.querySelectorAll('.drawer-anchor, .drawer-cta');

    const toggleMenu = (shouldOpen) => {
        const isOpen = shouldOpen !== undefined ? shouldOpen : !mobileDrawer.classList.contains('is-open');
        
        menuToggle.classList.toggle('is-active', isOpen);
        mobileDrawer.classList.toggle('is-open', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen.toString());
        mobileDrawer.setAttribute('aria-hidden', (!isOpen).toString());
        
        // Prevent background scrolling when drawer is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener('click', () => toggleMenu());

        drawerAnchors.forEach(anchor => {
            anchor.addEventListener('click', () => toggleMenu(false));
        });

        // Close drawer if user presses Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
                toggleMenu(false);
            }
        });
    }

    /* ------------------------------------------------------------------------
       3. ACTIVE SCROLLSPY HIGHLIGHTING (DESKTOP)
       ------------------------------------------------------------------------ */
    const sections = document.querySelectorAll('main section[id]');
    const navAnchors = document.querySelectorAll('.nav-anchor');

    const highlightActiveNav = () => {
        const scrollPosition = window.scrollY + 120;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop;
            const sectionId = current.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navAnchors.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightActiveNav, { passive: true });

    /* ------------------------------------------------------------------------
       4. SCROLL REVEAL (IntersectionObserver)
       ------------------------------------------------------------------------ */
    const revealTargets = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Trigger only once
                }
            });
        }, {
            root: null,
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealTargets.forEach(target => revealObserver.observe(target));
    } else {
        // Fallback for older browsers
        revealTargets.forEach(target => target.classList.add('is-visible'));
    }

    /* ------------------------------------------------------------------------
       5. FAQ ACCORDION (One Open at a Time with Fluid Transition)
       ------------------------------------------------------------------------ */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const body = item.querySelector('.faq-body');

        trigger.addEventListener('click', () => {
            const isCurrentlyActive = item.classList.contains('is-active');

            // Close all items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('is-active');
                otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
                const otherBody = otherItem.querySelector('.faq-body');
                otherBody.style.maxHeight = null;
                otherBody.hidden = true;
            });

            // Open clicked item if it was closed
            if (!isCurrentlyActive) {
                item.classList.add('is-active');
                trigger.setAttribute('aria-expanded', 'true');
                body.hidden = false;
                body.style.maxHeight = `${body.scrollHeight}px`;
            }
        });
    });

    /* ------------------------------------------------------------------------
       6. MEMBERSHIP PLAN PRE-SELECTION BRIDGE
       ------------------------------------------------------------------------ */
    const planActionButtons = document.querySelectorAll('[data-plan]');
    const planSelectDropdown = document.getElementById('plan-select');

    planActionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedPlan = btn.getAttribute('data-plan');
            if (planSelectDropdown && selectedPlan) {
                planSelectDropdown.value = selectedPlan;
                
                // Clear any prior validation error on the plan select
                planSelectDropdown.classList.remove('has-error');
                const errorSpan = document.getElementById('error-plan');
                if (errorSpan) errorSpan.textContent = '';
            }
        });
    });

    /* ------------------------------------------------------------------------
       7. GALLERY LIGHTBOX MODAL
       ------------------------------------------------------------------------ */
    const galleryCells = document.querySelectorAll('.gallery-cell');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-target-img');
    const lightboxLegend = document.getElementById('lightbox-legend');
    const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

    if (lightbox && lightboxImg) {
        galleryCells.forEach(cell => {
            cell.addEventListener('click', () => {
                const highResUrl = cell.getAttribute('data-full');
                const captionSpan = cell.querySelector('.gallery-caption span');
                const captionText = captionSpan ? captionSpan.textContent : 'UNICORN Welness';

                lightboxImg.src = highResUrl;
                lightboxLegend.textContent = captionText;
                lightbox.removeAttribute('hidden');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.setAttribute('hidden', '');
            lightboxImg.src = '';
            document.body.style.overflow = '';
        };

        if (lightboxCloseBtn) {
            lightboxCloseBtn.addEventListener('click', closeLightbox);
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target.classList.contains('lightbox-backdrop') || e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) {
                closeLightbox();
            }
        });
    }

    /* ------------------------------------------------------------------------
       8. FORM VALIDATION & WHATSAPP ENQUIRY DISPATCH ENGINE
       ------------------------------------------------------------------------ */
    const membershipForm = document.getElementById('membership-form');
    const feedbackNotice = document.getElementById('form-feedback-notice');
    const submitBtn = document.getElementById('submit-btn');

    if (membershipForm) {
        const fullnameInput = document.getElementById('fullname');
        const emailInput = document.getElementById('email');
        const planSelect = document.getElementById('plan-select');

        // Validation helpers
        const validateEmail = (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        };

        const displayError = (inputEl, errorId, message) => {
            inputEl.classList.add('has-error');

            const errSpan = document.getElementById(errorId);
            if (errSpan) {
                errSpan.textContent = message;
            }
        };

        const clearError = (inputEl, errorId) => {
            inputEl.classList.remove('has-error');

            const errSpan = document.getElementById(errorId);
            if (errSpan) {
                errSpan.textContent = '';
            }
        };

        // Real-time input clearing
        fullnameInput.addEventListener('input', () => {
            clearError(fullnameInput, 'error-fullname');
        });

        emailInput.addEventListener('input', () => {
            clearError(emailInput, 'error-email');
        });

        planSelect.addEventListener('change', () => {
            clearError(planSelect, 'error-plan');
        });

        membershipForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isFormValid = true;

            // 1. Full Name check
            if (!fullnameInput.value.trim()) {
                displayError(
                    fullnameInput,
                    'error-fullname',
                    'Full Name is required.'
                );
                isFormValid = false;
            } else {
                clearError(fullnameInput, 'error-fullname');
            }

            // 2. Email check
            if (!emailInput.value.trim()) {
                displayError(
                    emailInput,
                    'error-email',
                    'Email Address is required.'
                );
                isFormValid = false;
            } else if (!validateEmail(emailInput.value.trim())) {
                displayError(
                    emailInput,
                    'error-email',
                    'Enter a valid email address.'
                );
                isFormValid = false;
            } else {
                clearError(emailInput, 'error-email');
            }

            // 3. Plan Selection check
            if (!planSelect.value) {
                displayError(
                    planSelect,
                    'error-plan',
                    'Please select a membership plan.'
                );
                isFormValid = false;
            } else {
                clearError(planSelect, 'error-plan');
            }

            // Stop if validation fails
            if (!isFormValid) {
                return;
            }

            // ----------------------------------------------------------------
            // GET PREFERRED CONTACT METHOD
            // ----------------------------------------------------------------
            const preferredContactInput = document.querySelector(
                'input[name="preferredContact"]:checked'
            );

            const preferredContact = preferredContactInput
                ? preferredContactInput.value
                : 'Not specified';

            // ----------------------------------------------------------------
            // GET MESSAGE FIELD
            // ----------------------------------------------------------------
            const messageInput = document.getElementById('message');

            const messageText = messageInput
                ? messageInput.value.trim()
                : '';

            // ----------------------------------------------------------------
            // CREATE WHATSAPP MESSAGE
            // SAME ORDER AS FORM
            // ----------------------------------------------------------------
            const whatsappMessage =
`New Membership Enquiry

Full Name: ${fullnameInput.value.trim()}
Email Address: ${emailInput.value.trim()}
Membership Plan: ${planSelect.value}
Preferred Contact Method: ${preferredContact}
Message: ${messageText || 'No message provided.'}`;

            // ----------------------------------------------------------------
            // WHATSAPP NUMBER
            // ----------------------------------------------------------------
            const whatsappNumber = '918999610354';

            // Encode message safely for WhatsApp URL
            const whatsappURL =
                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

            // ----------------------------------------------------------------
            // BUTTON PROCESSING STATE
            // ----------------------------------------------------------------
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>PROCESSING...</span>';

            // Small delay for button feedback
            setTimeout(() => {

                // Open WhatsApp with pre-filled message
                window.open(whatsappURL, '_blank');

                // Reset form
                membershipForm.reset();

                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                // Show success message
                feedbackNotice.classList.add('is-visible');

                // Auto-hide feedback after 8 seconds
                setTimeout(() => {
                    feedbackNotice.classList.remove('is-visible');
                }, 8000);

            }, 500);
        });
    }
});
