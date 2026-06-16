document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       Header Scroll Effect
       ========================================================================== */
    const header = document.querySelector('.site-header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    /* ==========================================================================
       Mobile Menu Toggle
       ========================================================================== */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking links
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    /* ==========================================================================
       Scroll Animations (Intersection Observer)
       ========================================================================== */
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animated class to trigger transition
                entry.target.classList.add('animated');
                // Once animated, no need to observe anymore
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
    });
    
    animateElements.forEach(el => {
        animationObserver.observe(el);
    });

    /* ==========================================================================
       Video Performance Optimization (Autoplay & Pause on Scroll & Lazy Loading)
       ========================================================================== */
    const videos = document.querySelectorAll('video');
    const isMobile = window.innerWidth < 768; // スマホ環境かどうかの簡易判定
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            const isHero = video.id === 'heroVideo';
            
            if (entry.isIntersecting) {
                // PC環境、またはスマホのヒーロー動画の場合はロードして再生
                if (!isMobile || isHero) {
                    const dataSrc = video.getAttribute('data-src');
                    if (dataSrc && !video.src) {
                        video.src = dataSrc;
                        video.load();
                    }
                    video.play().catch(error => {
                        console.log('Autoplay prevented or failed:', error);
                    });
                }
            } else {
                if (!isMobile || isHero) {
                    video.pause();
                }
            }
        });
    }, {
        threshold: 0.1 // Play when at least 10% is visible
    });
    
    videos.forEach(video => {
        // Ensure standard settings for muted autoplay
        video.muted = true;
        video.setAttribute('playsinline', '');
        video.loop = true;
        
        const isHero = video.id === 'heroVideo';
        
        if (isMobile && !isHero) {
            // スマホ環境ではヒーロー動画以外の動画リソースを一切ロードせず、ポスター画像のみを表示し続ける
            video.removeAttribute('src');
            video.preload = 'none';
        } else {
            // ヒーロー動画、およびPC環境の動画はObserverで監視する
            if (isHero) {
                video.preload = 'auto';
            }
            videoObserver.observe(video);
        }
    });
});
