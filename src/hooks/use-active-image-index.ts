'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UseActiveImageIndexResult = {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  imageRefs: Array<(node: HTMLElement | null) => void>;
  getElement: (index: number) => HTMLElement | null;
};

export function useActiveImageIndex(
  count: number,
  root: Element | null = null,
  enabled = true
): UseActiveImageIndexResult {
  const [activeIndex, setActiveIndex] = useState(0);
  const [connected, setConnected] = useState(0);
  const nodesRef = useRef<Array<HTMLElement | null>>([]);

  const imageRefs = useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      return (node: HTMLElement | null) => {
        if (nodesRef.current[index] === node) return;
        nodesRef.current[index] = node;
        setConnected((value) => value + 1);
      };
    });
  }, [count]);

  const getElement = useCallback((index: number): HTMLElement | null => {
    return nodesRef.current[index] ?? null;
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    nodesRef.current = nodesRef.current.slice(0, count);
  }, [count]);

  useEffect(() => {
    if (!enabled || count === 0) return;

    const observed = nodesRef.current
      .slice(0, count)
      .filter((node): node is HTMLElement => node != null);
    if (observed.length === 0) return;

    const ratios = new Array<number>(count).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = nodesRef.current.indexOf(entry.target as HTMLElement);
          if (index >= 0) ratios[index] = entry.intersectionRatio;
        }

        let next = 0;
        let best = -1;
        for (let i = 0; i < count; i++) {
          if (ratios[i] > best) {
            best = ratios[i];
            next = i;
          }
        }
        setActiveIndex((current) => (current === next ? current : next));
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observed.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [count, root, enabled, connected]);

  return { activeIndex, setActiveIndex, imageRefs, getElement };
}
