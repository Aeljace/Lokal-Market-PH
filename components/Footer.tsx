import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 250 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#fbcfe8', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#d8b4fe', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <text fontFamily="Verdana, Geneva, sans-serif" fontSize="30" fontWeight="bold" fill="url(#logoGradient)" x="0" y="30">
            Lokal Market
        </text>
    </svg>
);

interface FooterProps {
    onNavigate: (page: 'marketplace' | 'register' | 'terms' | 'privacy' | 'community' | 'reportScammer') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-dark-gray text-white mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo className="w-40 h-10"/>
            <p className="text-gray-400 mt-2 text-sm">
              Connecting Local Sellers and Buyers — Safely, Securely, and Nearby.
            </p>
          </div>
          <div>
            <h4 className="font-semibold tracking-wider uppercase">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><button onClick={() => onNavigate('marketplace')} className="text-gray-300 hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('marketplace')} className="text-gray-300 hover:text-white transition-colors">Marketplace</button></li>
              <li><button onClick={() => onNavigate('register')} className="text-gray-300 hover:text-white transition-colors">Become a Seller</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold tracking-wider uppercase">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><button onClick={() => onNavigate('terms')} className="text-gray-300 hover:text-white transition-colors">Terms & Conditions</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="text-gray-300 hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('community')} className="text-gray-300 hover:text-white transition-colors">Community Guidelines</button></li>
              <li><button onClick={() => onNavigate('reportScammer')} className="text-red-400 hover:text-white transition-colors font-semibold">Report a Scammer</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold tracking-wider uppercase">Follow Us</h4>
             <div className="flex space-x-4 mt-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
             </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} LocalMarket PH. All Rights Reserved.</p>
           <p className="mt-1">Empowering Local Commerce — One Barangay at a Time</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;