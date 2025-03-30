import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';

interface MobileMenuProps {
  isAuthenticated: boolean;
}

export default function MobileMenu({ isAuthenticated }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { logout } = useAuth();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  return (
    <div className="block md:hidden">
      <button 
        onClick={toggleMenu}
        className="p-2 focus:outline-none focus:ring-2 focus:ring-white rounded"
      >
        <span className="material-icons">{isOpen ? 'close' : 'menu'}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-16 right-0 left-0 bg-[#1b5e20] z-50 shadow-xl">
          <nav className="container mx-auto px-4 py-3">
            <ul className="space-y-3">
              <li>
                <Link href="/marketplace">
                  <a 
                    className={`block py-2 px-4 hover:bg-[#4caf50] rounded ${location === '/marketplace' ? 'bg-[#4caf50]' : ''}`}
                    onClick={closeMenu}
                  >
                    Marketplace
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/community">
                  <a 
                    className={`block py-2 px-4 hover:bg-[#4caf50] rounded ${location === '/community' ? 'bg-[#4caf50]' : ''}`}
                    onClick={closeMenu}
                  >
                    Community
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/farm-management">
                  <a 
                    className={`block py-2 px-4 hover:bg-[#4caf50] rounded ${location === '/farm-management' ? 'bg-[#4caf50]' : ''}`}
                    onClick={closeMenu}
                  >
                    Farm Management
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/weather">
                  <a 
                    className={`block py-2 px-4 hover:bg-[#4caf50] rounded ${location === '/weather' ? 'bg-[#4caf50]' : ''}`}
                    onClick={closeMenu}
                  >
                    Weather
                  </a>
                </Link>
              </li>
              
              {!isAuthenticated ? (
                <li>
                  <Link href="/login">
                    <a 
                      className="block py-2 px-4 bg-white text-[#2E7D32] font-medium rounded text-center"
                      onClick={closeMenu}
                    >
                      Log In
                    </a>
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/profile">
                      <a 
                        className={`block py-2 px-4 hover:bg-[#4caf50] rounded ${location === '/profile' ? 'bg-[#4caf50]' : ''}`}
                        onClick={closeMenu}
                      >
                        Profile
                      </a>
                    </Link>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="block py-2 px-4 bg-white text-[#2E7D32] font-medium rounded text-center"
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                    >
                      Logout
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
