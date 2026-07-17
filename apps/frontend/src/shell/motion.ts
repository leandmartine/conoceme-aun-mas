import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export interface MotionHandle {
  destroy: () => void;
  lenis: Lenis | null;
}

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function bindShellMotion(root: HTMLElement): MotionHandle {
  if (prefersReducedMotion()) {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node) => {
      node.style.opacity = '1';
      node.style.transform = 'none';
    });
    return { destroy: () => undefined, lenis: null };
  }

  document.documentElement.classList.add('lenis');

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  const ticker = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      root.querySelectorAll('[data-hero-line]'),
      { y: 56, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: 0.11 },
      0.12,
    )
      .fromTo(
        root.querySelector('.shell__cta-row'),
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.4',
      )
      .fromTo(
        root.querySelector('.shell__api-status'),
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        '-=0.25',
      )
      .fromTo(
        root.querySelector('.shell__scroll-hint'),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.55 },
        '-=0.2',
      );

    // Floating orb loop
    const orb = root.querySelector('.shell__stage-orb');
    if (orb) {
      gsap.to(orb, {
        y: -18,
        x: 12,
        duration: 4.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to(orb, {
        scale: 1.08,
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }

    const glow = root.querySelector('.shell__stage-glow');
    if (glow) {
      gsap.to(glow, {
        opacity: 0.55,
        duration: 2.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }

    root.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter) => {
      gsap.fromTo(
        chapter.querySelectorAll('[data-reveal]'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: chapter,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    root.querySelectorAll<HTMLElement>('[data-card]').forEach((card, i) => {
      gsap.fromTo(
        card,
        { y: 48, opacity: 0, rotateX: 6 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.9,
          delay: (i % 3) * 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    // Place cards subtle float after reveal
    root.querySelectorAll<HTMLElement>('.shell__place-card').forEach((card, i) => {
      gsap.to(card, {
        y: -4,
        duration: 2.4 + (i % 4) * 0.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: i * 0.12,
      });
    });

    const primaryCta = root.querySelectorAll('.shell__cta:not(.shell__cta--ghost):not(:disabled)');
    primaryCta.forEach((btn) => {
      gsap.to(btn, {
        boxShadow: '0 0 0 14px rgba(224,122,95,0)',
        repeat: -1,
        duration: 2.1,
        ease: 'power1.inOut',
        keyframes: [
          { boxShadow: '0 0 0 0 rgba(224,122,95,0.4)' },
          { boxShadow: '0 0 0 16px rgba(224,122,95,0)' },
        ],
      });
    });

    // Scroll hint bounce
    const hint = root.querySelector('.shell__scroll-hint');
    if (hint) {
      gsap.to(hint, {
        y: 6,
        duration: 1.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }
  }, root);

  return {
    lenis,
    destroy: () => {
      ctx.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      document.documentElement.classList.remove('lenis');
    },
  };
}
