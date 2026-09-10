import { useEffect, useRef, useState } from 'react';

/** Live container width via ResizeObserver — the one thing both the Vega-Lite and RSC sides of every comparison need to size identically off the same measured pixel value. */
export function useContainerWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      setWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
