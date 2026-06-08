import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

// Render modals into a div INSIDE .admin-root so CSS-scoped styles apply.
// This fixes the bug where modals appeared at the bottom because styles like
// `.admin-root .modal-overlay { align-items: center }` didn't match when
// the portal was appended to document.body (outside .admin-root).
const getPortalRoot = () => {
  let portalRoot = document.getElementById('admin-modal-portal');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'admin-modal-portal';
    // Append inside .admin-root so CSS scope applies
    const adminRoot = document.querySelector('.admin-root');
    if (adminRoot) {
      adminRoot.appendChild(portalRoot);
    } else {
      document.body.appendChild(portalRoot);
    }
  }
  return portalRoot;
};

const Modal = ({ isOpen, onClose, title, children }) => {
  const portalRootRef = useRef(null);

  useEffect(() => {
    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!portalRootRef.current) {
    portalRootRef.current = getPortalRoot();
  }

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>,
    portalRootRef.current
  );
};

export default Modal;
