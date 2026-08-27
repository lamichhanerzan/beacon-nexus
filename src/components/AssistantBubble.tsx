import React, { useRef, useState, useCallback, useEffect } from 'react';
import { BeaconLogo } from './BeaconLogo';

interface AssistantBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

export const AssistantBubble: React.FC<AssistantBubbleProps> = ({ onClick, isOpen }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; bx: number; by: number } | null>(null);
  const hasMoved = useRef(false);

  // Initialize position on mount
  useEffect(() => {
    if (position.x === -1) {
      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight - 100
      });
    }
  }, [position.x]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, bx: position.x, by: position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
    const newX = Math.max(10, Math.min(window.innerWidth - 90, dragStart.current.bx + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 90, dragStart.current.by + dy));
    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (!hasMoved.current) onClick();
  }, [onClick]);

  if (isOpen) return null;
  if (position.x === -1) return null;

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ left: position.x, top: position.y, touchAction: 'none' }}
      className={`fixed z-50 w-20 h-20 rounded-full bg-signal text-paper shadow-xl flex items-center justify-center cursor-grab focus:outline-none focus:ring-4 focus:ring-signal-light transition-shadow duration-200 ${
        isDragging ? 'cursor-grabbing shadow-2xl scale-110' : 'hover:-translate-y-1 hover:shadow-2xl'
      }`}
      aria-label="Open BEACON Assistant"
      title="Open BEACON Assistant — drag to reposition"
    >
      <BeaconLogo size="sm" showWordmark={false} className="text-paper" />
    </button>
  );
};
