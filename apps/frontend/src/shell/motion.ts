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

/**
 * Apple-like scroll: Lenis smooth + GSAP ScrollTrigger + entrance timeline.
 */
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
    // Hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      root.querySelectorAll('[data-hero-line]'),
      { y: 48, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.05, stagger: 0.12 },
      0.15,
    )
      .fromTo(
        root.querySelector('.shell__cta'),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.35',
      )
      .fromTo(
        root.querySelector('.shell__scroll-hint'),
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        '-=0.2',
      );

    // Parallax layers in pin stage
    const stage = root.querySelector('.shell__stage');
    if (stage) {
      gsap.to(root.querySelector('.shell__skyline-far'), {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      gsap.to(root.querySelector('.shell__skyline-near'), {
        y: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
      gsap.to(root.querySelector('.shell__sun'), {
        y: 50,
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Chapter fades
    root.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter) => {
      gsap.fromTo(
        chapter.querySelectorAll('[data-reveal]'),
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: chapter,
            start: 'top 72%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    // Cards lift
    root.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
      gsap.fromTo(
        card,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    // Soft floating CTA pulse
    gsap.to(root.querySelector('.shell__cta:not(:disabled)'), {
      boxShadow: '0 0 0 12px rgba(224,122,95,0)',
      repeat: -1,
      duration: 2.2,
      ease: 'power1.inOut',
      keyframes: [
        { boxShadow: '0 0 0 0 rgba(224,122,95,0.35)' },
        { boxShadow: '0 0 0 14px rgba(224,122,95,0)' },
      ],
    });
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
