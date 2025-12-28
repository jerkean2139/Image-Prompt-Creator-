import { useState, useRef } from 'react';

export default function SwipeableCard({ children, onSwipeLeft, onSwipeRight, className = '' }) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [offset, setOffset] = useState(0);
  const cardRef = useRef(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setSwiping(true);
  };

  const onTouchMove = (e) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const distance = currentTouch - touchStart;
    
    // Apply resistance at the edges
    const resistance = 0.3;
    setOffset(distance * resistance);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwiping(false);
      setOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }

    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    setSwiping(false);
    setOffset(0);
  };

  return (
    <div
      ref={cardRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`touch-pan-y ${className}`}
      style={{
        transform: `translateX(${offset}px)`,
        transition: swiping ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {children}
      
      {/* Swipe Action Indicators */}
      {Math.abs(offset) > 20 && (
        <>
          {offset < 0 && onSwipeRight && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-green-500 text-white px-3 py-2 rounded-lg opacity-80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {offset > 0 && onSwipeLeft && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white px-3 py-2 rounded-lg opacity-80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
}
