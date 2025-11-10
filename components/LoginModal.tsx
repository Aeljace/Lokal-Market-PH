import React, { useState } from 'react';
import Modal from './Modal';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user?: any) => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess, onSwitchToRegister }) => {
  const [view, setView] = useState<'login' | 'forgotPassword' | 'confirmation'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [resetEmail, setResetEmail] = useState('');

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setView('login');
        setEmail('');
        setPassword('');
        setResetEmail('');
        setError('');
    }, 300);
  };
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
    } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
            setError('Invalid email or password.');
        } else if (err.code === 'auth/user-disabled') {
            setError('This account has been suspended.');
        } else {
            setError('An unexpected error occurred. Please try again.');
            console.error(err);
        }
    } finally {
        setLoading(false);
    }
  };
  
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!resetEmail) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }
    try {
        await sendPasswordResetEmail(auth, resetEmail);
        setView('confirmation');
    } catch (err: any) {
        if (err.code === 'auth/invalid-email') {
            setError('Please enter a valid email address.');
        } else {
            // For security, Firebase doesn't confirm if the email exists.
            // We proceed to the confirmation view anyway to prevent user enumeration.
            setView('confirmation');
        }
        console.error("Password reset error:", err);
    } finally {
        setLoading(false);
    }
  };

  const renderLoginView = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          id="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-white"
          required
          placeholder="you@example.com"
        />
      </div>
      <div>
         <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="text-sm">
                <button type="button" onClick={() => { setView('forgotPassword'); setError(''); }} className="font-medium text-brand-blue hover:underline focus:outline-none">
                    Forgot password?
                </button>
            </div>
        </div>
        <input
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-white"
          required
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white py-2 px-4 rounded-md font-semibold hover:opacity-90 transition-opacity shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p className="text-sm text-center text-gray-600">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="font-medium text-brand-blue hover:underline">
          Register here
        </button>
      </p>
    </form>
  );

  const renderForgotPasswordView = () => (
    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">Enter your email address and we'll send you a link to reset your password.</p>
        <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              id="reset-email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue bg-white"
              required
              placeholder="you@example.com"
            />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-blue text-white py-2 px-4 rounded-md font-semibold hover:bg-brand-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <p className="text-sm text-center text-gray-600">
          Remembered your password?{' '}
          <button type="button" onClick={() => { setView('login'); setError(''); }} className="font-medium text-brand-blue hover:underline">
            Back to Login
          </button>
        </p>
    </form>
  );

  const renderConfirmationView = () => (
    <div className="space-y-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
        <p className="text-sm text-gray-600">
            If an account exists for <span className="font-semibold">{resetEmail}</span>, you will receive an email with instructions on how to reset your password.
        </p>
        <button
          type="button"
          onClick={() => { setView('login'); setError(''); }}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-semibold hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
          Back to Login
        </button>
    </div>
  );

  const getModalContent = () => {
    switch(view) {
      case 'forgotPassword':
        return {
          title: 'Reset Password',
          content: renderForgotPasswordView()
        };
      case 'confirmation':
        return {
          title: 'Email Sent',
          content: renderConfirmationView()
        };
      case 'login':
      default:
        return {
          title: 'Login to your Account',
          content: renderLoginView()
        };
    }
  };

  const { title, content } = getModalContent();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {content}
    </Modal>
  );
};

export default LoginModal;