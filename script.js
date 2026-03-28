document.addEventListener('DOMContentLoaded', () => {
  const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobileToggleActions = 'play none none none';

  // ==============================
  // Hero reveal loader (cropped -> expand)
  // ==============================
  const heroRevealLoader = document.getElementById('hero-reveal-loader');
  const heroRevealWindow = heroRevealLoader?.querySelector('.hero-reveal-window');
  const heroRevealVideo = heroRevealLoader?.querySelector('.hero-reveal-video');
  const heroVideo = document.querySelector('.hero-video');

  if (heroRevealLoader && heroRevealWindow && window.gsap) {
    let hasPlayedHeroReveal = false;

    const finishHeroReveal = () => {
      heroRevealLoader.remove();
    };

    // Keep hero video aligned with loader video to avoid visual jumps on handoff.
    if (heroVideo) {
      heroVideo.pause();
    }

    const playHeroReveal = () => {
      if (hasPlayedHeroReveal || !document.body.contains(heroRevealLoader)) {
        return;
      }
      hasPlayedHeroReveal = true;

      const cropWidth = Math.min(window.innerWidth * 0.78, 520);
      const cropHeight = cropWidth / 3.2;
      const horizontalInset = Math.max(0, (window.innerWidth - cropWidth) / 2);
      const verticalInset = Math.max(0, (window.innerHeight - cropHeight) / 2);

      gsap.set(heroRevealWindow, {
        clipPath: `inset(${verticalInset}px ${horizontalInset}px ${verticalInset}px ${horizontalInset}px round 6px)`
      });

      gsap.timeline({ onComplete: finishHeroReveal })
        .to(heroRevealWindow, {
          clipPath: 'inset(0px 0px 0px 0px round 0px)',
          duration: 1.05,
          ease: 'power3.inOut'
        })
        .add(() => {
          if (heroVideo && heroRevealVideo) {
            try {
              heroVideo.currentTime = heroRevealVideo.currentTime;
            } catch (e) {
              // Ignore sync errors on browsers that restrict setting currentTime early.
            }
            const playPromise = heroVideo.play();
            if (playPromise && typeof playPromise.catch === 'function') {
              playPromise.catch(() => {});
            }
          }
        }, '-=0.18')
        .to(heroRevealLoader, {
          autoAlpha: 0,
          duration: 0.45,
          ease: 'power1.inOut'
        }, '-=0.12');
    };

    if (document.readyState === 'complete') {
      requestAnimationFrame(playHeroReveal);
    } else {
      window.addEventListener('load', () => requestAnimationFrame(playHeroReveal), { once: true });
      setTimeout(playHeroReveal, 4500);
    }
  }

  // ==============================
  // Scroll-triggered fade-in
  // ==============================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  // Apply fade-in to key elements
  const animatedSelectors = [
    '.stat-item',
    '.pillar-card',
    '.endorsement-card',
    '.cert-logo-item',
    '.techstack-item',
    '.membership-logo-item',
    '.testimonial-card',
    '.about-card',
    '.about-right',
    '.section-heading',
    '.section-heading-light',
    '.section-heading-cream',
  ];

  animatedSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.classList.add('fade-in-up');
      el.style.transitionDelay = `${index * 0.07}s`;
      observer.observe(el);
    });
  });

  // ==============================
  // Stat counter animation
  // ==============================
  const statValues = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStatValue(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statValues.forEach(stat => statObserver.observe(stat));

  function animateStatValue(element) {
    const finalText = element.textContent;
    const numericMatch = finalText.match(/[\d.]+/);
    if (!numericMatch) return;

    const finalNum = parseFloat(numericMatch[0]);
    const prefix = finalText.substring(0, finalText.indexOf(numericMatch[0]));
    const suffix = finalText.substring(
      finalText.indexOf(numericMatch[0]) + numericMatch[0].length
    );
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(eased * finalNum);

      element.textContent = prefix + currentVal + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = finalText;
      }
    }

    requestAnimationFrame(update);
  }

  // ==============================
  // Smooth scroll for anchor links
  // ==============================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==============================
  // Parallax on hero background
  // ==============================
  const hero = document.querySelector('.hero');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      hero.style.backgroundPositionY = `${scrollY * 0.4}px`;
    }
  });

  // ==============================
  // Slot Machine Animation
  // ==============================
  const tracks = document.querySelectorAll('.slot-machine-track');
  tracks.forEach(track => {
    // Clone all children to make seamless infinite scroll
    const children = Array.from(track.children);
    children.forEach(child => {
      const clone = child.cloneNode(true);
      track.appendChild(clone);
    });
    // Adjust animation duration based on number of items
    const itemCount = children.length;
    track.style.animationDuration = `${itemCount * 1.5}s`;
  });

  // ==============================
  // Members Section Split Animation
  // ==============================
  const membershipContainer = document.querySelector('.membership-container');
  if (membershipContainer) {
    const membershipObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          membershipObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    membershipObserver.observe(membershipContainer);
  }

  // ==============================
  // Projects Carousel Reveal + Controls
  // ==============================
  const projectsSection = document.querySelector('.projects-carousel-section');
  const projectSlides = Array.from(document.querySelectorAll('.project-slide'));

  if (projectsSection && projectSlides.length) {
    const carouselViewport = projectsSection.querySelector('.projects-carousel-viewport');
    const previousProjectButton = projectsSection.querySelector('.projects-carousel-control-prev');
    const nextProjectButton = projectsSection.querySelector('.projects-carousel-control-next');
    const projectDots = Array.from(projectsSection.querySelectorAll('.projects-carousel-dot'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const totalProjects = projectSlides.length;
    let currentProjectIndex = 0;
    let touchStartX = null;

    const normalizeProjectOffset = (index) => {
      let offset = index - currentProjectIndex;
      const midpoint = totalProjects / 2;

      if (offset > midpoint) {
        offset -= totalProjects;
      } else if (offset < -midpoint) {
        offset += totalProjects;
      }

      return offset;
    };

    const updateProjectsCarousel = (nextIndex) => {
      currentProjectIndex = (nextIndex + totalProjects) % totalProjects;

      projectSlides.forEach((slide, slideIndex) => {
        const offset = normalizeProjectOffset(slideIndex);
        const absoluteOffset = Math.abs(offset);
        const isActive = absoluteOffset === 0;
        const isAdjacent = absoluteOffset === 1;

        slide.classList.toggle('is-active', isActive);
        slide.dataset.state = isActive ? 'active' : (isAdjacent ? 'adjacent' : 'hidden');
        slide.style.setProperty('--offset', offset);
        slide.style.setProperty('--card-scale', isActive ? '1' : (isAdjacent ? '0.72' : '0.5'));
        slide.style.setProperty('--card-opacity', isActive ? '1' : (isAdjacent ? '0.68' : '0'));
        slide.style.setProperty('--image-softness', isActive ? '0px' : (isAdjacent ? '1.6px' : '10px'));
        slide.style.setProperty('--card-z', isActive ? '3' : (isAdjacent ? '2' : '1'));
        slide.setAttribute('aria-pressed', isActive ? 'true' : 'false');

        if (isActive) {
          slide.setAttribute('aria-current', 'true');
        } else {
          slide.removeAttribute('aria-current');
        }

        if (absoluteOffset > 1) {
          slide.setAttribute('aria-hidden', 'true');
          slide.tabIndex = -1;
        } else {
          slide.removeAttribute('aria-hidden');
          slide.tabIndex = 0;
        }
      });

      projectDots.forEach((dot, dotIndex) => {
        const isActiveDot = dotIndex === currentProjectIndex;
        dot.classList.toggle('is-active', isActiveDot);
        dot.setAttribute('aria-selected', isActiveDot ? 'true' : 'false');
        dot.tabIndex = isActiveDot ? 0 : -1;
      });
    };

    const stepProjectsCarousel = (direction) => {
      updateProjectsCarousel(currentProjectIndex + direction);
    };

    if (prefersReducedMotion) {
      projectsSection.classList.add('is-revealed');
    } else {
      const projectsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            projectsSection.classList.add('is-revealed');
            projectsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      projectsObserver.observe(projectsSection);
    }

    previousProjectButton?.addEventListener('click', () => stepProjectsCarousel(-1));
    nextProjectButton?.addEventListener('click', () => stepProjectsCarousel(1));

    projectDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIndex = Number(dot.dataset.projectTarget);
        updateProjectsCarousel(targetIndex);
      });
    });

    projectSlides.forEach((slide, slideIndex) => {
      slide.addEventListener('click', () => {
        updateProjectsCarousel(slideIndex);
      });

      slide.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          updateProjectsCarousel(slideIndex);
        }
      });
    });

    projectsSection.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepProjectsCarousel(-1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepProjectsCarousel(1);
      }
    });

    carouselViewport?.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    carouselViewport?.addEventListener('touchend', (event) => {
      if (touchStartX === null) {
        return;
      }

      const touchEndX = event.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;

      if (Math.abs(deltaX) > 40) {
        stepProjectsCarousel(deltaX < 0 ? 1 : -1);
      }

      touchStartX = null;
    }, { passive: true });

    updateProjectsCarousel(0);
  }

  // ==============================
  // Section 1: Hero Blur-to-Focus Reveal
  // ==============================
  const heroHeading1 = new SplitType('.hero-text-left .hero-title', { types: 'words' });
  const heroHeading2 = new SplitType('.hero-text-right .hero-title', { types: 'words' });
  const heroSub = new SplitType('.hero-subtext', { types: 'words' });

  if (heroHeading1.words) {
    gsap.from([heroHeading1.words, heroHeading2.words, heroSub.words], {
      filter: 'blur(20px)',
      opacity: 0,
      stagger: 0.02,
      duration: 2,
      ease: 'power2.out',
      delay: 0.5
    });
  }

  // ==============================
  // Section 2: Blur-to-Focus Reveal (Extended)
  // ==============================
  const splitSelectors = [
    '.intro-label', 
    '.intro-name', 
    '.intro-subheadline', 
    '.intro-paragraph',
    '.endorsements-heading', 
    '.endorsement-quote', 
    '.endorsement-author'
  ];

  const allWords = [];
  splitSelectors.forEach(selector => {
    const split = new SplitType(selector, { types: 'words' });
    if (split.words) {
      allWords.push(...split.words);
    }
  });

  if (allWords.length > 0) {
    gsap.from(allWords, {
      scrollTrigger: isMobileViewport
        ? {
            trigger: '#about',
            start: 'top 82%',
            toggleActions: mobileToggleActions,
          }
        : {
            trigger: '#about',
            start: 'top 85%',
            end: 'bottom 85%',
            scrub: 1,
          },
      filter: 'blur(15px)',
      opacity: 0,
      stagger: 0.015,
      ease: 'power2.out'
    });
  }

  // ==============================
  // Custom Glassmorphism Cursor
  // ==============================
  const cursor = document.querySelector('.custom-cursor');
  const cursorGlass = document.querySelector('.cursor-glass');

  if (cursor && supportsFinePointer) {
    // Reveal cursor on first movement
    window.addEventListener('mousemove', () => {
      gsap.to(cursor, { opacity: 1, duration: 0.3 });
    }, { once: true });

    // Move cursor with Spring-like easing (quick start, slow settle)
    window.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power3.out'
      });
    });

    // Magnet Effect on buttons and Woodland font headers
    const magnets = document.querySelectorAll('a, button, .intro-name, .section-heading-yellow, .membership-heading, .footer-heading');
    magnets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        gsap.to(cursor, { scale: 1.5, duration: 0.3, ease: 'power2.out' });
        gsap.to(cursorGlass, { background: 'rgba(244, 237, 221, 0.2)', backdropFilter: 'blur(25px)', duration: 0.3 });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power2.in' });
        gsap.to(cursorGlass, { background: 'rgba(244, 237, 221, 0.1)', backdropFilter: 'blur(10px)', duration: 0.3 });
      });
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // ==============================
  // Section 6: Tech Stack Animations
  // ==============================
  // Prism Wipe Reveal for Header
  const techHeader = document.querySelector('.techstack-header-banner');
  if (techHeader) {
    ScrollTrigger.create({
      trigger: techHeader,
      start: 'top 80%',
      onEnter: () => techHeader.classList.add('reveal')
    });
  }

  // Clashing Cards Animation
  const techCards = gsap.utils.toArray('.tech-card');
  
  techCards.forEach((card, i) => {
    const isLeft = i % 2 === 0;
    const offset = isMobileViewport ? 60 : 150;

    gsap.from(card, {
      scrollTrigger: isMobileViewport
        ? {
            trigger: card,
            start: 'top 88%',
            toggleActions: mobileToggleActions,
          }
        : {
            trigger: card,
            start: 'top 98%',
            end: 'top 75%',
            scrub: 1,
          },
      x: isLeft ? -offset : offset,
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    });
  });

  // ==============================
  // Section 9: Footer Reveal
  // ==============================
  const footerCorner = document.querySelector('.footer-corner');
  const footerText = document.querySelector('.footer-content-left');

  if (footerCorner && footerText) {
    const cornerOffset = isMobileViewport ? -20 : -40;

    gsap.to(footerCorner, {
      scrollTrigger: isMobileViewport
        ? {
            trigger: '#footer',
            start: 'top 88%',
            toggleActions: mobileToggleActions,
          }
        : {
            trigger: '#footer',
            start: 'top 95%',
            end: 'top 60%',
            scrub: 1,
          },
      x: cornerOffset,
      y: cornerOffset,
      duration: isMobileViewport ? 0.8 : undefined,
      ease: 'power2.out'
    });

    gsap.to(footerText, {
      scrollTrigger: isMobileViewport
        ? {
            trigger: '#footer',
            start: 'top 86%',
            toggleActions: mobileToggleActions,
          }
        : {
            trigger: '#footer',
            start: 'top 90%',
            end: 'top 70%',
            scrub: 1,
          },
      opacity: 1,
      y: 0,
      duration: isMobileViewport ? 0.8 : undefined,
      ease: 'power2.out'
    });
  }

  // ==============================
  // Section 7.5: Experience Marquee Wipe
  // ==============================
  const marqueeWipe = document.querySelector('.marquee-wipe-layer');
  if (marqueeWipe) {
    ScrollTrigger.create({
      trigger: '#experience',
      start: 'top 70%',
      onEnter: () => marqueeWipe.classList.add('animate-wipe')
    });
  }
});
