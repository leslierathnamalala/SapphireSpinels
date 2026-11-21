import { useEffect } from 'react';

export function useSiteMotion(pathname) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const apply = () => {
      const bar = document.querySelector('[data-scroll-progress]');
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        bar.style.transform = `scaleX(${progress})`;
      }

      if (media.matches) return;

      document.querySelectorAll('[data-hero]').forEach((hero) => {
        hero.style.setProperty('--hero-y', String(window.scrollY));
      });

      document.querySelectorAll('[data-parallax]').forEach((node) => {
        const speed = Number(node.dataset.parallax) || 0.15;
        const parent = node.parentElement ?? node;
        const rect = parent.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });

      document.querySelectorAll('[data-hscroll]').forEach((section) => {
        const track = section.querySelector('[data-hscroll-track]');
        if (!track) return;
        if (window.innerWidth < 900) {
          track.style.transform = 'none';
          return;
        }
        const total = section.offsetHeight - window.innerHeight;
        const passed = Math.min(Math.max(-section.getBoundingClientRect().top, 0), Math.max(total, 0));
        const progress = total > 0 ? passed / total : 0;
        const distance = Math.max(track.scrollWidth - section.clientWidth + 48, 0);
        track.style.transform = `translate3d(${(-distance * progress).toFixed(2)}px, 0, 0)`;
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);
}
