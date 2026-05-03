import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const METANARUSelect = ({ value, onChange, options, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0, maxHeight: 240 });
  const wrapRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const fallbackText = selectedOption == null && value != null && value !== '' ? String(value) : null;
  const closedLabel = selectedOption?.label ?? fallbackText ?? placeholder ?? '—';

  const updateMenuPosition = () => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.max(r.width, 140);
    const margin = 8;
    const gap = 4;
    const rowH = 44;
    const naturalH = Math.min(options.length * rowH + 16, 240);
    const spaceBelow = window.innerHeight - r.bottom - gap - margin;
    const spaceAbove = r.top - margin;

    let top;
    let maxHeight = naturalH;

    if (naturalH <= spaceBelow) {
      top = r.bottom + gap;
    } else if (naturalH <= spaceAbove) {
      top = r.top - gap - naturalH;
    } else if (spaceBelow >= spaceAbove) {
      top = r.bottom + gap;
      maxHeight = Math.max(120, spaceBelow);
    } else {
      maxHeight = Math.max(120, spaceAbove);
      top = r.top - gap - maxHeight;
    }

    let left = r.left;
    if (left + width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - width - margin);
    }
    if (left < margin) left = margin;

    if (top + maxHeight > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - margin - maxHeight);
    }
    if (top < margin) top = margin;

    setMenuPos({ top, left, width, maxHeight });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
    const id = requestAnimationFrame(() => updateMenuPosition());
    return () => cancelAnimationFrame(id);
  }, [isOpen, options.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onDoc = (e) => {
      if (wrapRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };
    const onReposition = () => updateMenuPosition();
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('scroll', onReposition, true);
    window.addEventListener('resize', onReposition);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('resize', onReposition);
    };
  }, [isOpen, options.length]);

  const menuPortal = isOpen && createPortal(
    <div
      ref={menuRef}
      className="fixed z-[99999] bg-[#1A1A1D] border border-white/15 rounded-lg shadow-2xl overflow-hidden"
      style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width, minWidth: 140 }}
      role="listbox"
    >
      <ul className="overflow-y-auto custom-scrollbar py-1" style={{ maxHeight: menuPos.maxHeight }}>
        {options.map((opt) => (
          <li key={String(opt.value)}>
            <button
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                String(value) === String(opt.value)
                  ? 'bg-[#FF0033] text-white font-bold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="truncate min-w-0">{opt.label}</span>
              {opt.badge && (
                <span
                  className={`text-[9px] font-black uppercase shrink-0 px-1.5 py-0.5 rounded border ${
                    String(value) === String(opt.value)
                      ? 'border-white/30 bg-white/20 text-white'
                      : opt.badgeKind === 'special'
                        ? 'border-purple-400/40 bg-purple-500/25 text-purple-200'
                        : 'border-emerald-400/30 bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {opt.badge}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );

  return (
    <div className={`relative min-w-[7rem] ${className}`} ref={wrapRef}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) updateMenuPosition();
          setIsOpen((o) => !o);
        }}
        className="w-full min-h-[38px] bg-[#1A1A1D] border border-white/20 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center gap-2 hover:border-white/40 transition-all"
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`truncate ${selectedOption || fallbackText != null ? 'text-white' : 'text-white/40'}`}>
            {closedLabel}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[9px] font-black uppercase shrink-0 px-1.5 py-0.5 rounded border ${
                selectedOption.badgeKind === 'special'
                  ? 'border-purple-400/35 bg-purple-500/25 text-purple-200'
                  : 'border-emerald-400/25 bg-emerald-500/15 text-emerald-300'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </span>
        <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {menuPortal}
    </div>
  );
};

export default METANARUSelect;
