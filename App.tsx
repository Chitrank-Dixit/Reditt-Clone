
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <HashRouter>
      <div className="bg-reddit-dark text-reddit-text-primary min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-5 max-w-5xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
