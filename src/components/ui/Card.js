import React from 'react';

function Card({ children, className = '' }) {
  return (
    <div className={`card-static p-4 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
