import { useState, useEffect } from 'react';

interface EntranceState {
  navbarReady: boolean;
  greetingReady: boolean;
  subtitleReady: boolean;
  buttonReady: boolean;
  cardsReady: boolean;
  isComplete: boolean;
}

export function useEntranceSequence(): EntranceState {
  const [state, setState] = useState<EntranceState>({
    navbarReady: false,
    greetingReady: false,
    subtitleReady: false,
    buttonReady: false,
    cardsReady: false,
    isComplete: false,
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setState({
        navbarReady: true,
        greetingReady: true,
        subtitleReady: true,
        buttonReady: true,
        cardsReady: true,
        isComplete: true,
      });
      return;
    }

    const t1 = setTimeout(() => setState(s => ({ ...s, navbarReady: true })), 400);
    const t2 = setTimeout(() => setState(s => ({ ...s, greetingReady: true })), 800);
    const t3 = setTimeout(() => setState(s => ({ ...s, subtitleReady: true })), 1000);
    const t4 = setTimeout(() => setState(s => ({ ...s, buttonReady: true })), 1200);
    const t5 = setTimeout(() => setState(s => ({ ...s, cardsReady: true })), 1700);
    const t6 = setTimeout(() => setState(s => ({ ...s, isComplete: true })), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  return state;
}
