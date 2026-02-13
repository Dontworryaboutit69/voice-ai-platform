'use client';

import { useEffect, useRef } from 'react';

interface TourTooltipProps {
  title: string;
  description: string;
  step: number;
  totalSteps: number;
  position: 'top' | 'bottom' | 'left' | 'right';
  targetRef: React.RefObject<HTMLElement>;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export default function TourTooltip({
  title,
  description,
  step,
  totalSteps,
  position,
  targetRef,
  onNext,
  onPrev,
  onClose
}: TourTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Update positions on scroll and resize
  const updatePositions = () => {
    if (targetRef.current && tooltipRef.current && highlightRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      const highlight = highlightRef.current;

      // Update highlight position
      highlight.style.top = `${targetRect.top - 8}px`;
      highlight.style.left = `${targetRect.left - 8}px`;
      highlight.style.width = `${targetRect.width + 16}px`;
      highlight.style.height = `${targetRect.height + 16}px`;

      // Position tooltip based on prop
      switch (position) {
        case 'top':
          tooltip.style.top = `${targetRect.top - tooltip.offsetHeight - 16}px`;
          tooltip.style.left = `${targetRect.left + targetRect.width / 2 - tooltip.offsetWidth / 2}px`;
          break;
        case 'bottom':
          tooltip.style.top = `${targetRect.bottom + 16}px`;
          tooltip.style.left = `${Math.max(16, targetRect.left + targetRect.width / 2 - tooltip.offsetWidth / 2)}px`;
          break;
        case 'left':
          tooltip.style.top = `${targetRect.top + targetRect.height / 2 - tooltip.offsetHeight / 2}px`;
          tooltip.style.left = `${targetRect.left - tooltip.offsetWidth - 16}px`;
          break;
        case 'right':
          tooltip.style.top = `${targetRect.top + targetRect.height / 2 - tooltip.offsetHeight / 2}px`;
          tooltip.style.left = `${targetRect.right + 16}px`;
          break;
      }
    }
  };

  useEffect(() => {
    if (targetRef.current) {
      // Scroll target into view
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Initial position
      setTimeout(updatePositions, 100);

      // Update on scroll and resize
      window.addEventListener('scroll', updatePositions, true);
      window.addEventListener('resize', updatePositions);

      return () => {
        window.removeEventListener('scroll', updatePositions, true);
        window.removeEventListener('resize', updatePositions);
      };
    }
  }, [targetRef, position]);

  return (
    <>
      {/* Backdrop - lighter overlay that doesn't block clicks */}
      <div
        className="fixed inset-0 z-50 bg-black/20 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      ></div>

      {/* Spotlight highlight around target element */}
      <div
        ref={highlightRef}
        className="fixed z-[55] border-4 border-blue-500 rounded-xl shadow-2xl shadow-blue-500/50 pointer-events-none"
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[60] bg-white rounded-2xl shadow-2xl border-2 border-blue-500 p-6 max-w-md"
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {step}
            </div>
            <span className="text-sm font-medium text-gray-500">
              Step {step} of {totalSteps}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onPrev}
            disabled={step === 1}
            className="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx + 1 === step ? 'bg-blue-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          {step < totalSteps ? (
            <button
              onClick={onNext}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-600/30 transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-lg shadow-green-600/30 transition-all"
            >
              ✓ Finish
            </button>
          )}
        </div>
      </div>
    </>
  );
}
