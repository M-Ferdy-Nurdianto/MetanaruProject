import React from 'react';

const LoadingSpinner = ({ size = 16, className = '' }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
    <div className="absolute inset-0 border-2 border-t-[#FF0033] rounded-full animate-spin"></div>
  </div>
);

export default LoadingSpinner;
