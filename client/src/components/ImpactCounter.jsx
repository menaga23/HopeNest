import React, { useEffect, useState } from 'react';

/**
 * Renders an animated counter counting up to a target number
 */
const ImpactCounter = ({ target, label, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target) || 0;
    if (end === 0) return;

    const duration = 1500; // duration in ms
    const increment = Math.ceil(end / 60); // 60fps refresh rate
    const stepTime = Math.floor(duration / 60);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="flex flex-col items-center p-5 bg-hn-white/10 dark:bg-hn-dark/20 backdrop-blur-md rounded-2xl border border-hn-white/20 shadow-md">
      <h3 className="text-3xl sm:text-4xl font-extrabold text-hn-white">
        {prefix}{count.toLocaleString()}{suffix}
      </h3>
      <p className="text-xs sm:text-sm text-hn-white/95 font-medium tracking-wide uppercase mt-1">
        {label}
      </p>
    </div>
  );
};

export default ImpactCounter;
