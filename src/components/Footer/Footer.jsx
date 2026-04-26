import React from 'react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Kana Quiz</h4>
          <p>Learn hiragana & katakana fast and easy</p>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul className="contact-list">
            <li>
              <a href="tel:+6285763458199" className="contact-link">
                <span className="contact-icon">📱</span>
                <span>085763458199</span>
              </a>
            </li>
            <li>
              <a href="https://instagram.com/rahawaeh_113" target="_blank" rel="noopener noreferrer" className="contact-link">
                <span className="contact-icon">📷</span>
                <span>@rahawaeh_113</span>
              </a>
            </li>
            <li>
              <a href="https://github.com/11NoName11" target="_blank" rel="noopener noreferrer" className="contact-link">
                <span className="contact-icon">💻</span>
                <span>11NoName11</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Links</h4>
          <ul className="links-list">
            <li><a href="https://github.com/11NoName11" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
            <li><a href="https://instagram.com/rahawaeh_113" target="_blank" rel="noopener noreferrer">Follow on Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Kana Quiz. Created by Raha | All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
