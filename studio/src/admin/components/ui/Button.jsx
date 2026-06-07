import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, onClick, type = 'button', className = '', ...props }) => {
  const baseClass = 'btn';
  const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : variant === 'icon' ? 'btn-icon' : '';
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  
  return (
    <button 
      type={type} 
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
