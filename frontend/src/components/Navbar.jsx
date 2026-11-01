/**
 * Navbar.jsx — Top navigation bar.
 */

import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/detect', label: 'Detection' },
  { to: '/about', label: 'About Model' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-primary-600 font-bold text-lg tracking-tight focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg px-1"
          aria-label="RoadDefect AI — home"
        >
          {/* Road / scan icon */}
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22V2M5 19l7-17 7 17M5 19h14" />
          </svg>
          RoadDefect&nbsp;<span className="text-gray-900">AI</span>
        </Link>

        {/* Nav links */}
        <ul className="flex items-center gap-1" role="list">
          {navLinks.map(({ to, label }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to);

            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
