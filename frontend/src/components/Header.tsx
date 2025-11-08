import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RedditIcon } from './icons/RedditIcon';
import { SearchIcon } from './icons/SearchIcon';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-reddit-dark-soft border-b border-reddit-border p-2">
      <div className="container mx-auto flex items-center justify-between max-w-5xl">
        <Link to="/" className="flex items-center space-x-2">
          <RedditIcon className="h-8 w-8 text-reddit-orange" />
          <span className="text-white font-bold text-xl hidden sm:block">reddit</span>
        </Link>
        
        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-reddit-text-secondary" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Reddit"
                className="w-full bg-reddit-dark-soft border border-reddit-border rounded-full py-2 pl-10 pr-4 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
              />
            </div>
          </form>
        </div>
        
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <span className="text-white font-bold hidden sm:block">u/{user.name}</span>
              <button 
                onClick={logout}
                className="bg-reddit-blue text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80 transition-colors duration-200"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block border border-reddit-blue text-reddit-blue font-bold py-2 px-4 rounded-full hover:bg-reddit-blue hover:text-white transition-colors duration-200">
                Log In
              </Link>
              <Link to="/signup" className="bg-reddit-blue text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80 transition-colors duration-200">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;