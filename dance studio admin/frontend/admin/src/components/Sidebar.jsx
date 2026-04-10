import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="logo-container">
        <h2>Expression</h2>
        <p>Dance Studio Admin</p>
      </div>
      <nav className="nav-menu">
        {navLinks.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={onClose}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
