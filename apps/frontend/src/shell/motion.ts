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
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.05, stagger: 0.1 },
      0.1,
    )
      .fromTo(
        root.querySelector('.shell__cta-row'),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65 },
        '-=0.35',
      )
      .fromTo(
        root.querySelectorAll('.shell__api-status'),
        { opacity: 0 },
        { opacity: 1, duration: 0.45 },
        '-=0.2',
      );

    const orb = root.querySelector('.shell__stage-orb');
    if (orb) {
      gsap.to(orb, {
        y: -16,
        x: 10,
        duration: 4.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }
    const glow = root.querySelector('.shell__stage-glow');
    if (glow) {
      gsap.to(glow, {
        opacity: 0.5,
        duration: 2.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }

    // Horizontal story pin
    const pin = root.querySelector<HTMLElement>('[data-story-pin]');
    const track = root.querySelector<HTMLElement>('[data-story-track]');
    const bar = root.querySelector<HTMLElement>('[data-story-bar]');
    if (pin && track) {
      const getScroll = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -getScroll(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${getScroll() + window.innerHeight * 0.35}`,
          pin: true,
          scrub: 0.85,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
    }

    root.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter) => {
      gsap.fromTo(
        chapter.querySelectorAll('[data-reveal]'),
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: chapter,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    root.querySelectorAll<HTMLElement>('[data-card]').forEach((card, i) => {
      gsap.fromTo(
        card,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: (i % 4) * 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    root.querySelectorAll('.shell__cta:not(.shell__cta--ghost):not(:disabled)').forEach((btn) => {
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

    const hint = root.querySelector('.shell__scroll-hint');
    if (hint) {
      gsap.to(hint, { y: 6, duration: 1.15, yoyo: true, repeat: -1, ease: 'sine.inOut' });
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
