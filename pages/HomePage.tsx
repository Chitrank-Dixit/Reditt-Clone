
import React from 'react';
import PostList from '../components/PostList';
import Sidebar from '../components/Sidebar';

const HomePage: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <PostList />
      </div>
      <div className="hidden md:block">
        <Sidebar />
      </div>
    </div>
  );
};

export default HomePage;
