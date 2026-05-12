import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';

export function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authError = null;

    if (!import.meta.env.VITE_SUPABASE_URL) {
      setError("Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables via the Settings menu.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authError = error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        authError = error;
      }

      if (authError) {
        if (authError.message === 'Failed to fetch') {
          setError('Network error: Failed to connect to Supabase. Please verify your VITE_SUPABASE_URL is correct and the server is running.');
        } else {
          setError(authError.message);
        }
      } else {
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="w-full max-w-md p-8 pt-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl">
            W
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-200">WapiAI</h1>
        </div>
        
        <h2 className="text-xl font-bold text-slate-200 mb-6 text-center">
          {isLogin ? 'Sign In to your account' : 'Create a new account'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email address</label>
            <input
              type="email"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>
          
          {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-500/10 rounded-lg border border-red-500/20">{error}</div>}
          
          {!import.meta.env.VITE_SUPABASE_URL && (
            <div className="text-amber-500 text-sm font-medium p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              Note: Supabase credentials are not configured in environment variables. Authentication will fail.
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-6 text-lg"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 hover:text-amber-500 text-sm transition-colors font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
