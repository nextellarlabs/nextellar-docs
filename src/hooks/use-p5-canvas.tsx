'use client';

import { useEffect, useRef, useCallback } from 'react';
import type p5 from 'p5';

type P5Sketch = (p: p5) => void;

export function useP5Canvas(sketch: P5Sketch) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const sketchRef = useRef(sketch);

  useEffect(() => {
    sketchRef.current = sketch;
  }, [sketch]);

  useEffect(() => {
    let instance: p5 | null = null;

    const initP5 = async () => {
      if (!containerRef.current || p5InstanceRef.current) return;

      const p5Module = await import('p5');
      const P5 = p5Module.default;

      instance = new P5(sketchRef.current, containerRef.current);
      p5InstanceRef.current = instance;
    };

    initP5();

    return () => {
      if (instance) {
        instance.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;

      import('p5').then((p5Module) => {
        if (containerRef.current) {
          const P5 = p5Module.default;
          p5InstanceRef.current = new P5(sketchRef.current, containerRef.current);
        }
      });
    }
  }, []);

  return { containerRef, reset, p5Instance: p5InstanceRef };
}
