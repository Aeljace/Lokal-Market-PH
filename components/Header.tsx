import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LOCATIONS } from '../constants';
import { User, Notification, Chat } from '../types';

// Define reusable icon components inside the Header file to keep them co-located
const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const DashboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H3V7a4 4 0 004 4h2a4 4 0 004 4v2m-6 2h6m-6-2v2m0-10V5a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6" />
    </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);


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

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  province: string;
  setProvince: (province: string) => void;
  city: string;
  setCity: (city: string) => void;
  currentUser: User | null;
  notifications: Notification[];
  chats: Chat[];
  users: User[];
  onLoginClick: () => void;
  onNavigate: (page: 'marketplace' | 'register' | 'dashboard' | 'profile') => void;
  onLogout: () => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    searchTerm, setSearchTerm, province, setProvince, city, setCity,
    currentUser, notifications, chats, users, onLoginClick, onNavigate, onLogout, onMarkNotificationAsRead
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadAdminNotifications = notifications.filter(n => !n.isRead).length;
  const unreadChats = useMemo(() => {
    if (!currentUser) return [];
    return chats.filter(chat => {
      if (!chat.lastMessage) return false;
      const lastReadTimestamp = chat.lastRead?.[currentUser.id] ? new Date(chat.lastRead[currentUser.id]).getTime() : 0;
      const lastMessageTimestamp = new Date(chat.lastMessage.timestamp).getTime();
      return lastMessageTimestamp > lastReadTimestamp;
    });
  }, [chats, currentUser]);

  const totalUnreadCount = unreadAdminNotifications + unreadChats.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setIsNotifOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvince(e.target.value);
    setCity(''); // Reset city when province changes
  };
  
  const handleNotificationClick = (notification: Notification) => {
      onMarkNotificationAsRead(notification.id);
      onNavigate('dashboard');
      setIsNotifOpen(false);
  }

  const handleChatNotificationClick = (chat: Chat) => {
      onNavigate('dashboard');
      // The dashboard component will handle opening the correct chat
      setIsNotifOpen(false);
  };

  const getOtherParticipantName = (chat: Chat) => {
      if (!currentUser) return '...';
      const otherId = Object.keys(chat.participants).find(id => id !== currentUser.id);
      return users.find(u => u.id === otherId)?.fullName || 'Unknown User';
  };

  const NavLink: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    isDrawer?: boolean;
    className?: string;
  }> = ({ onClick, icon, label, isDrawer = false, className = '' }) => (
    <button
      onClick={() => { onClick(); setIsMenuOpen(false); }}
      className={`transition-colors flex items-center space-x-2 ${isDrawer ? 'text-lg text-gray-700 w-full p-3 rounded-lg hover:bg-gray-100' : 'text-gray-600 hover:text-brand-blue px-3 py-2 rounded-lg hover:bg-gray-100'} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 max-w-[1200px]">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-3">
            <button onClick={() => onNavigate('marketplace')} className="flex items-center space-x-2 focus:outline-none">
               <Logo className="w-40 sm:w-48 h-10" />
            </button>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {currentUser ? (
                  <>
                      <div className="relative" ref={notifRef}>
                          <button onClick={() => setIsNotifOpen(prev => !prev)} className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-brand-blue">
                              <BellIcon className="w-6 h-6" />
                              {totalUnreadCount > 0 && <span className="absolute top-0 right-0 block h-4 w-4 rounded-full text-white bg-red-500 text-xs font-bold flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">{totalUnreadCount}</span>}
                          </button>
                          {isNotifOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-30">
                                <div className="p-3 font-bold border-b">Notifications</div>
                                <div className="max-h-80 overflow-y-auto">
                                    {totalUnreadCount > 0 ? (
                                        <>
                                            {unreadChats.map(chat => (
                                                <button key={chat.id} onClick={() => handleChatNotificationClick(chat)} className="w-full text-left p-3 text-sm hover:bg-gray-100 bg-blue-50">
                                                    <p className="font-bold">New message from {getOtherParticipantName(chat)}</p>
                                                    <p className="text-xs text-gray-600 mt-1 truncate">{chat.lastMessage?.text}</p>
                                                </button>
                                            ))}
                                            {notifications.map(notif => (
                                                <button key={notif.id} onClick={() => handleNotificationClick(notif)} className={`w-full text-left p-3 text-sm hover:bg-gray-100 ${!notif.isRead ? 'bg-blue-50' : ''}`}>
                                                    <p className={`${!notif.isRead ? 'font-bold' : ''}`}>{notif.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                                                </button>
                                            ))}
                                        </>
                                    ) : <p className="p-4 text-sm text-gray-500 text-center">No new notifications.</p>}
                                </div>
                            </div>
                          )}
                      </div>
                      <span className="font-semibold text-gray-700 hidden lg:inline mr-2">Welcome, {currentUser.fullName.split(' ')[0]}!</span>
                      <NavLink onClick={() => onNavigate('marketplace')} icon={<HomeIcon className="w-5 h-5" />} label="Home" />
                      <NavLink onClick={() => onNavigate('dashboard')} icon={<DashboardIcon className="w-5 h-5" />} label="Dashboard" />
                      <NavLink onClick={() => onNavigate('profile')} icon={<UserCircleIcon className="w-5 h-5" />} label="Profile" />
                      <NavLink onClick={onLogout} icon={<LogoutIcon className="w-5 h-5" />} label="Logout" className="hover:text-red-500 hover:bg-red-50" />
                  </>
              ) : (
                  <>
                      <button onClick={onLoginClick} className="text-gray-600 hover:text-brand-blue font-semibold transition-colors px-4 py-2">Login</button>
                      <button onClick={() => onNavigate('register')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 font-semibold transition-colors">
                      Register
                      </button>
                      <button onClick={() => onNavigate('register')} className="bg-gradient-to-r from-brand-blue to-brand-purple text-white px-4 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg hidden sm:block">
                      Sell on Local Market
                      </button>
                  </>
              )}
            </div>
             {/* Mobile Menu Button */}
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(true)} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="relative md:col-span-6">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                      type="text"
                      placeholder="Search products, sellers, or locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition bg-white"
                  />
              </div>
              <div className="md:col-span-3">
                  <select 
                      value={province} 
                      onChange={handleProvinceChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition bg-white"
                  >
                      <option value="">All Provinces</option>
                      {Object.keys(LOCATIONS).sort().map(p => (
                          <option key={p} value={p}>{p}</option>
                      ))}
                  </select>
              </div>
              <div className="md:col-span-3">
                  <select 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      disabled={!province}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                      <option value="">All Cities</option>
                      {province && LOCATIONS[province].sort().map(c => (
                          <option key={c} value={c}>{c}</option>
                      ))}
                  </select>
              </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Drawer Menu */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMenuOpen(false)}
      ></div>
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg p-6 z-50 transform transition-transform md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center mb-8">
              <Logo className="w-36 h-8" />
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <CloseIcon className="w-6 h-6" />
              </button>
          </div>
          <nav className="flex flex-col space-y-3">
              {currentUser ? (
                  <>
                      <div className="px-3 py-2 border-b mb-2">
                          <p className="font-semibold text-lg text-gray-800">Welcome,</p>
                          <p className="text-gray-600 truncate">{currentUser.fullName}</p>
                      </div>
                      <NavLink onClick={() => onNavigate('marketplace')} icon={<HomeIcon className="w-6 h-6" />} label="Home" isDrawer />
                      <NavLink onClick={() => onNavigate('dashboard')} icon={<DashboardIcon className="w-6 h-6" />} label="Dashboard" isDrawer />
                      <NavLink onClick={() => onNavigate('profile')} icon={<UserCircleIcon className="w-6 h-6" />} label="Profile" isDrawer />
                      <NavLink onClick={onLogout} icon={<LogoutIcon className="w-6 h-6" />} label="Logout" isDrawer className="text-red-600 hover:bg-red-50" />
                  </>
              ) : (
                  <>
                      <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="w-full text-left bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg text-lg">
                          Login
                      </button>
                      <button onClick={() => { onNavigate('register'); setIsMenuOpen(false); }} className="w-full text-left bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-lg">
                          Register
                      </button>
                      <div className="border-t my-4"></div>
                      <button onClick={() => { onNavigate('register'); setIsMenuOpen(false); }} className="w-full text-left text-brand-blue font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors text-lg">
                          Sell on Local Market
                      </button>
                  </>
              )}
          </nav>
      </div>
    </>
  );
};

export default Header;