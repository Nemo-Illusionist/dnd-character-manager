// DropdownMenu Component - Popup menu triggered by a button
import { useState, useRef, useEffect, ReactNode } from 'react';
import './DropdownMenu.scss';

interface DropdownMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger?: ReactNode;
  className?: string;
}

export function DropdownMenu({ items, trigger, className = '' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleItemClick = (item: DropdownMenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className={`dropdown-menu ${className}`} ref={menuRef}>
      <button
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger || <span className="dropdown-dots">⋮</span>}
      </button>

      {isOpen && (
        <div className="dropdown-content">
          {items.map((item, index) => (
            <button
              key={index}
              className="dropdown-item"
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
              <span className="dropdown-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
