import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-reddit-orange">404</h1>
      <p className="text-2xl text-reddit-text-primary mt-4">Page Not Found</p>
      <p className="text-reddit-text-secondary mt-2">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 inline-block bg-reddit-blue text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors duration-200">
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
