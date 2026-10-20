import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCursorProps {
  theme: 'dark' | 'light';
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const cursorPos = useRef({ x: -100, y: -100 });
  const hasPosition = useRef(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;

      mousePos.current = { x: event.clientX, y: event.clientY };
      if (!hasPosition.current) {
        cursorPos.current = mousePos.current;
        hasPosition.current = true;
      }
      setIsVisible(true);

      const target = event.target;
      const isInteractive =
        target instanceof Element &&
        Boolean(
          target.closest(
            'button, a, input, select, textarea, [role="button"], [role="switch"], .cursor-pointer',
          ),
        );
      setIsHovering(isInteractive);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setIsClicking(true);
    };
    const handlePointerUp = () => setIsClicking(false);
    const handleLeave = () => {
      setIsVisible(false);
      setIsHovering(false);
      setIsClicking(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('blur', handleLeave);
    document.addEventListener('mouseleave', handleLeave);

    const loop = () => {
      const ease = prefersReducedMotion ? 1 : 0.14;
      cursorPos.current.x +=
        (mousePos.current.x - cursorPos.current.x) * ease;
      cursorPos.current.y +=
        (mousePos.current.y - cursorPos.current.y) * ease;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', handleLeave);
      document.removeEventListener('mouseleave', handleLeave);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      className={`hidden md:block pointer-events-none fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      <div
        ref={cursorRef}
        className={`grainy-cursor fixed top-0 left-0 -ml-9 -mt-9 pointer-events-none ${
          isHovering ? 'grainy-cursor--interactive' : ''
        } ${isClicking ? 'grainy-cursor--clicking' : ''}`}
        style={
          {
            transform: `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`,
            '--cursor-opacity': isDark ? '0.34' : '0.42',
            '--cursor-gradient': isDark
              ? 'linear-gradient(90deg, aquamarine, mediumpurple)'
              : 'linear-gradient(90deg, #0066FF, #A855F7)',
            '--cursor-blob-opacity': isDark ? '0.68' : '0.78',
            '--cursor-blob-blur': isDark ? '34px' : '28px',
          } as React.CSSProperties
        }
      >
        <span className="grainy-cursor__blob" />
        <span className="grainy-cursor__grain" />
      </div>
    </div>
  );
};
