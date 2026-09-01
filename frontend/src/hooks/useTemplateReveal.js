import { useEffect, useRef } from 'react';

/**
 * Progressive-enhancement reveal motion for a template-owned scroll viewport.
 * Content stays visible until the observer is ready, so a failed observer can
 * never leave an invitation blank.
 */
export function useTemplateReveal(selector, readyClass = 'motion-ready') {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { root, threshold: 0.06, rootMargin: '5% 0px 5% 0px' });

    const observe = (scope = root) => scope.querySelectorAll?.(selector).forEach((element) => {
      if (element.dataset.revealObserved) return;
      element.dataset.revealObserved = 'true';
      observer.observe(element);
    });

    observe();
    root.classList.add(readyClass);
    const mutationObserver = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) observe(node);
    })));
    mutationObserver.observe(root, { childList: true, subtree: true });

    // Fail-safe for engines that delay observer delivery inside a scaled preview.
    const fallback = window.setTimeout(() => root.querySelectorAll(selector).forEach((element) => element.classList.add('is-visible')), 1800);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
      mutationObserver.disconnect();
      root.classList.remove(readyClass);
    };
  }, [readyClass, selector]);

  return rootRef;
}
