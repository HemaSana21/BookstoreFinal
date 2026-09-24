import React from 'react';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div>
        <h4>BookStore</h4>
        <p>Your one-stop destination for all things books.</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        <p>Home · Books · Cart · Orders</p>
      </div>
      <div>
        <h4>Sell With Us</h4>
        <p><a href="/seller/login" style={{ color: 'inherit' }}>Seller Login</a> · <a href="/seller/register" style={{ color: 'inherit' }}>Become a Seller</a></p>
      </div>
      <div>
        <h4>Contact</h4>
        <p>support@bookstore.com</p>
      </div>
    </div>
    <p className="footer-bottom">© {new Date().getFullYear()} BookStore. All rights reserved.</p>
  </footer>
);

export default Footer;
