import React, { useState } from 'react';
import { Menu, X, Bell, LogOut, Sun, Moon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children, onLogout }) => {
  const { registrations } = useData();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    return localStorage.getItem('admin-sidebar-expanded') === 'true';
  });

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-expanded', String(next));
      return next;
    });
  };

  return (
    <div 
      className={`layout ${isMobileMenuOpen ? 'mobile-menu-open' : ''} ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
      data-theme={theme}
    >
      <div className="mobile-header">
        <button className="menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1>KJ Studio Admin</h1>
        
        {/* Mobile Header Actions */}
        <button onClick={toggleTheme} className="mobile-theme-btn" style={{ marginLeft: 'auto' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {onLogout && (
          <button onClick={onLogout} className="mobile-logout-btn" style={{ marginLeft: '10px' }}>
            <LogOut size={18} />
          </button>
        )}
      </div>
      
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={toggleMobileMenu}></div>
      
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        isExpanded={isSidebarExpanded}
        onToggleExpand={toggleSidebar}
      />
      
      <main className="content">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">Admin Management</h1>
          </div>
          <div className="topbar-actions">
            <button onClick={toggleTheme} className="theme-toggle-btn" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NavLink to="/admin/registrations" className="topbar-notification">
              <Bell size={20} />
              {registrations.length > 0 && <span className="notification-badge">{registrations.length}</span>}
            </NavLink>
            {onLogout && (
              <button onClick={onLogout} className="logout-btn">
                Logout
              </button>
            )}
          </div>
        </header>
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
