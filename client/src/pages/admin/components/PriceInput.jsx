import React, { useEffect, useState } from 'react';

const parsePrice = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const clean = val.toString().toLowerCase().trim();
  if (clean.endsWith('k')) {
    const num = parseFloat(clean.replace('k', '').trim());
    return Number.isNaN(num) ? 0 : num * 1000;
  }
  const num = parseInt(clean.replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(num) ? 0 : num;
};

const PriceInput = ({ value, onChange, className = '', colorClass = 'text-white', disabled = false }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    const parsed = parsePrice(localValue);
    onChange(parsed);
    setLocalValue(parsed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`bg-transparent outline-none w-full ${colorClass} ${className} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      placeholder="0"
    />
  );
};

export default PriceInput;
