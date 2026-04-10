import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className={`layout ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="mobile-header">
        <button className="menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1>Dance Studio</h1>
      </div>
      
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={toggleMobileMenu}></div>
      
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="content">
        <header className="topbar">
          <h1>Admin Management</h1>
        </header>
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
