"use client";

import { useEffect } from "react";

const STAGGER_MS = 80;

/**
 * One-shot "fade in and rise" for elements marked `data-reveal` (service and
 * barber cards). Elements are never hidden up front: an element only gets
 * `data-reveal="in"` — which plays the CSS animation in globals.css — as it
 * enters the viewport, so without JavaScript (or with reduced motion) cards
 * are simply visible. Cards that are already on screen when the page loads
 * are left as they are, and each card animates at most once.
 */
export function ScrollReveal() {
  // iOS Safari only applies :active styles (the cards' press-down feedback)
  // when the page has a touch listener; an empty passive one is enough.
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pending = new Set(document.querySelectorAll<HTMLElement>('[data-reveal=""]'));
    let isFirstCallback = true;

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement);
        entering.forEach((element, index) => {
          observer.unobserve(element);
          pending.delete(element);
          if (isFirstCallback) {
            element.dataset.reveal = "static"; // visible on load: no animation
            return;
          }
          element.style.setProperty("--reveal-delay", `${index * STAGGER_MS}ms`);
          element.dataset.reveal = "in";
        });
        isFirstCallback = false;
      },
      // Start just before a card crosses into view, so its first frame is already the faded state.
      { rootMargin: "0px 0px 12% 0px" },
    );

    pending.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
