import { useEffect, useRef, useState } from 'react';

interface Options {
  charsPerSecond?: number;
  startDelay?: number;
  enabled?: boolean;
  onDone?: () => void;
}

export function useStreamingText(text: string, options: Options = {}) {
  const { charsPerSecond = 120, startDelay = 0, enabled = true, onDone } = options;
  const [visibleChars, setVisibleChars] = useState(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!enabled) {
      setVisibleChars(0);
      return;
    }
    setVisibleChars(0);
    if (!text) {
      onDoneRef.current?.();
      return;
    }

    let rafId = 0;
    let timeoutId = 0;
    let startMs = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startMs;
      const next = Math.min(text.length, Math.floor((elapsed / 1000) * charsPerSecond));
      setVisibleChars(next);
      if (next >= text.length) {
        onDoneRef.current?.();
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    timeoutId = window.setTimeout(() => {
      startMs = performance.now();
      rafId = window.requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [text, charsPerSecond, startDelay, enabled]);

  return {
    displayed: text.slice(0, visibleChars),
    isStreaming: visibleChars < text.length,
    isDone: visibleChars >= text.length,
    progress: text.length === 0 ? 1 : visibleChars / text.length,
  };
}

export function useSequentialReveal(stepCount: number, intervalMs = 350, startDelay = 0) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    if (stepCount === 0) return;

    let rafId = 0;
    let timeoutId = 0;
    let startMs = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startMs;
      const next = Math.min(stepCount, Math.floor(elapsed / intervalMs) + 1);
      setRevealed(next);
      if (next >= stepCount) return;
      rafId = window.requestAnimationFrame(tick);
    };

    timeoutId = window.setTimeout(() => {
      startMs = performance.now();
      rafId = window.requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [stepCount, intervalMs, startDelay]);

  return revealed;
}
