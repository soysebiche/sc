import React from 'react';

function Button({ children, className = '', onClick, ...props }) {
  return (
    <button className={`btn ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

Button.Icon = function IconButton({ children, className = '', onClick, ...props }) {
  return (
    <button className={`btn-ghost p-2 rounded ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

Button.Group = function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {children}
    </div>
  );
};

Button.Toggle = function ToggleButton({ children, className = '', active = false, ...props }) {
  return (
    <button className={`tab ${active ? 'tab-active' : 'tab-inactive'} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
