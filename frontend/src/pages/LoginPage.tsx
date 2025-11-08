import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-8">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Log In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
              required
            />
          </div>
          {error && <p className="text-reddit-orange text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-reddit-blue text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors duration-200 disabled:bg-gray-500"
          >
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <p className="text-center text-sm text-reddit-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-reddit-blue hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
