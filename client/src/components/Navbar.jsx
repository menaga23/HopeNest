import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, Sun, Moon, Heart, User as UserIcon, LogOut } from 'lucide-react';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Active route styling helper
  const linkClasses = (path) => 
    `text-sm font-medium transition-colors duration-200 py-2 px-1 border-b-2 ${
      isActive(path)
        ? 'text-hn-primary border-hn-primary font-semibold'
        : 'text-hn-dark/80 dark:text-hn-secondary/80 border-transparent hover:text-hn-primary hover:border-hn-primary/50'
    }`;

  const mobileLinkClasses = (path) =>
    `block text-base font-medium py-3 px-4 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-hn-primary/10 text-hn-primary font-semibold'
        : 'text-hn-dark dark:text-hn-secondary hover:bg-hn-secondary/50 dark:hover:bg-hn-dark/50'
    }`;

  const getDashboardPath = () => {
    if (!user) return '/';
    return user.role === 'public' ? '/dashboard' : '/admin';
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-hn-white/90 dark:bg-hn-dark/95 border-b border-hn-secondary/50 dark:border-hn-dark/50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-hn-primary p-2 rounded-full text-hn-white group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-hn-primary">
              HopeNest
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className={linkClasses('/')}>Home</Link>
            <Link to="/orphanages" className={linkClasses('/orphanages')}>Orphanages</Link>
            <Link to="/children" className={linkClasses('/children')}>Children</Link>
            <Link to="/volunteer" className={linkClasses('/volunteer')}>Volunteer</Link>
            <Link to="/sponsor" className={linkClasses('/sponsor')}>Sponsor</Link>
            <Link to="/adoption" className={linkClasses('/adoption')}>Adoption</Link>
            <Link to="/impact" className={linkClasses('/impact')}>Our Impact</Link>
          </div>

          {/* Action buttons & User Session */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-hn-secondary dark:hover:bg-hn-dark transition-colors text-hn-dark dark:text-hn-secondary"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 text-sm font-medium text-hn-dark dark:text-hn-secondary hover:text-hn-primary transition-colors py-1.5 px-3 rounded-full border border-hn-primary/20 hover:border-hn-primary/50 bg-hn-primary/5"
                >
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-sm font-semibold text-hn-white bg-hn-primary hover:bg-hn-primary/90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 py-2 px-5 rounded-full"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-hn-secondary dark:hover:bg-hn-dark transition-colors text-hn-dark dark:text-hn-secondary"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-hn-dark dark:text-hn-secondary focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden px-2 pt-2 pb-4 space-y-1 bg-hn-white dark:bg-hn-dark border-t border-hn-secondary/30 transition-all duration-300">
          <Link to="/" onClick={() => setIsOpen(false)} className={mobileLinkClasses('/')}>Home</Link>
          <Link to="/orphanages" onClick={() => setIsOpen(false)} className={mobileLinkClasses('/orphanages')}>Orphanages</Link>
          <Link to="/children" onClick={() => setIsOpen(false)} className={mobileLinkClasses('/children')}>Children</Link>
          <Link to="/volunteer" onClick={() => setIsOpen(false)} className={mobileLinkClasses('/volunteer')}>Volunteer</Link>
          <Link to="/sponsor" onClick={() => setIsOpen(false)} className={mobileLinkClasses('/sponsor')}>Sponsor</Link>
          <Link to="/adoption" onClick={() => setIsOpen(false)} className={mobileLinkClasses('/adoption')}>Adoption</Link>
          <Link to="/impact" onClick={() => setIsOpen(false)} className={mobileLinkClasses('/impact')}>Our Impact</Link>
          
          <div className="pt-4 border-t border-hn-secondary/20 mt-2 px-2 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-hn-dark dark:text-hn-secondary"
                >
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:bg-red-50 py-1.5 px-3 rounded-lg"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm font-semibold text-hn-white bg-hn-primary hover:bg-hn-primary/95 py-2.5 rounded-lg block"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
