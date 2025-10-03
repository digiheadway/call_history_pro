
'use client';
import { useRef, useEffect, useCallback } from 'react';

export function usePersistentScroll(key: string) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scrollable = scrollRef.current;
    if (!scrollable) return;

    try {
      const savedPosition = localStorage.getItem(key);
      if (savedPosition) {
        scrollable.scrollTop = parseInt(savedPosition, 10);
      }
    } catch (error) {
        console.error(`Error reading scroll position for key "${key}":`, error);
    }
    

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        try {
            localStorage.setItem(key, scrollable.scrollTop.toString());
        } catch (error) {
            console.error(`Error setting scroll position for key "${key}":`, error);
        }
      }, 100);
    };

    scrollable.addEventListener('scroll', handleScroll);

    return () => {
      scrollable.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [key]);

  return scrollRef;
}
