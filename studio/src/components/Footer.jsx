// src/components/Footer.jsx
import React from 'react'
import './Footer.css'
import { Instagram, Phone } from '../icons.jsx'
import { STUDIO_NAME, STUDIO_FULL_NAME } from '../branding'

const Footer = () => {
  return (
    <footer id="contact" className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h1 className="logo-text logo-text--brand">
            {STUDIO_NAME.slice(0, -1)}<span>{STUDIO_NAME.slice(-1)}</span>
          </h1>
          <p>Empowering individuals through the magic of dance.</p>
          <div className="social-links">
            <a href="https://www.instagram.com/KJ_dance_studio?igsh=MjdqY2k0dHB6a2M0&utm_source=qr" target="_blank" rel="noopener noreferrer" className="social-link"><Instagram size={20} /></a>
            <a href="tel:+919626810194" className="social-link"><Phone size={20} /></a>
          </div>
        </div>
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">Home</a></li><li><a href="#about">About Us</a></li><li><a href="#services">Services</a></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h3>Contact Info</h3>
          <p>1057, P.K.S.A. Arumugam Road, Sivakasi</p>
          <p>Phone: 96268 10194</p><p>Email: KJ_dance_studio@gmail.com</p>
        </div>
      </div>
      <div className="footer-bottom"><p>&copy; {new Date().getFullYear()} {STUDIO_FULL_NAME}.</p></div>
    </footer>
  )
}

export default Footer
