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
       Gallery Dissolve Slideshow
       ========================================================================== */
    const slideshowContainer = document.querySelector('.gallery-slideshow-container');
    if (slideshowContainer) {
        const slides = slideshowContainer.querySelectorAll('.gallery-slide');
        const prevBtn = slideshowContainer.querySelector('.slideshow-arrow.prev');
        const nextBtn = slideshowContainer.querySelector('.slideshow-arrow.next');
        const dotsContainer = document.querySelector('.slideshow-dots');
        let currentSlideIdx = 0;
        let slideInterval;
        const intervalTime = 5000; // 5秒ごとにスライド切り替え

        // ドットインジケーターを動的に生成
        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('slideshow-dot');
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(idx));
            dotsContainer.appendChild(dot);
        });
        const dots = dotsContainer.querySelectorAll('.slideshow-dot');

        // スライド内のメディア（動画）の再生・一時停止およびロード解放処理
        const manageSlideMedia = (slide, play = true) => {
            const video = slide.querySelector('video');
            if (!video) return;

            if (play) {
                const dataSrc = video.getAttribute('data-src');
                if (dataSrc && !video.src) {
                    video.src = dataSrc;
                    video.load();
                }
                video.muted = true; // 音声無を確実に保証
                video.play().catch(err => console.log('Slide video play prevented:', err));
            } else {
                if (video.src) {
                    video.pause();
                    video.removeAttribute('src'); // srcを削除してロードを完全停止
                    video.load(); // 接続を切断して通信バッファを解放
                }
            }
        };

        const isGalleryInViewport = () => {
            const rect = slideshowContainer.getBoundingClientRect();
            return (
                rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom > 0
            );
        };

        const updateSlides = () => {
            slides.forEach((slide, idx) => {
                if (idx === currentSlideIdx) {
                    slide.classList.add('active');
                    dots[idx].classList.add('active');
                    // ギャラリーが画面内にある場合のみ動画を再生
                    if (isGalleryInViewport()) {
                        manageSlideMedia(slide, true);
                    }
                } else {
                    if (slide.classList.contains('active')) {
                        manageSlideMedia(slide, false); // 前の動画を一時停止
                    }
                    slide.classList.remove('active');
                    dots[idx].classList.remove('active');
                }
            });
        };

        const nextSlide = () => {
            currentSlideIdx = (currentSlideIdx + 1) % slides.length;
            updateSlides();
        };

        const prevSlide = () => {
            currentSlideIdx = (currentSlideIdx - 1 + slides.length) % slides.length;
            updateSlides();
        };

        const goToSlide = (idx) => {
            currentSlideIdx = idx;
            updateSlides();
            resetInterval();
        };

        const startInterval = () => {
            slideInterval = setInterval(nextSlide, intervalTime);
        };

        const resetInterval = () => {
            clearInterval(slideInterval);
            startInterval();
        };

        // ナビゲーションのイベント登録
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });

        // スクロール時にギャラリー動画の再生状態を更新
        window.addEventListener('scroll', () => {
            const activeSlide = slides[currentSlideIdx];
            if (isGalleryInViewport()) {
                manageSlideMedia(activeSlide, true);
            } else {
                manageSlideMedia(activeSlide, false);
            }
        });

        // ページ読み込み時に初期判定
        setTimeout(() => {
            if (isGalleryInViewport()) {
                manageSlideMedia(slides[currentSlideIdx], true);
            }
        }, 300);

        startInterval();
    }

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
        const isSlideVideo = video.closest('.gallery-slide');
        
        // スライドショー内の動画は、スライドショー側のJSで個別に制御するため、通常の動画監視から除外する
        if (isSlideVideo) {
            video.preload = 'none';
            return;
        }
        
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
