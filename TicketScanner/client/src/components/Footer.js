import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span>Cybernauts</span>
        </div>
        
        <div className="social-links">
          <a href="https://www.linkedin.com/company/cybernauts-cvr/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
            <i className="social-icon linkedin"></i>
          </a>
          <a href="https://www.instagram.com/cybernauts_cvr/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
            <i className="social-icon instagram"></i>
          </a>
          <a href="mailto:cybernautscvr@gmail.com" className="social-link" aria-label="Email">
            <i className="social-icon email"></i>
          </a>
        </div>
        
        <div className="copyright">
          <p>© 2025 Cybernauts CVR. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 