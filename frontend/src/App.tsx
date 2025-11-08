import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import UserProfilePage from './pages/UserProfilePage';
import ErrorBoundary from './components/ErrorBoundary';
import EditProfilePage from './pages/EditProfilePage';

function App() {
  return (
    <HashRouter>
      <div className="bg-reddit-dark text-reddit-text-primary min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-5 max-w-5xl">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/post/:postId" element={<PostDetailPage />} />
              <Route path="/user/:username" element={<UserProfilePage />} />
              <Route path="/user/:username/edit" element={<EditProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;