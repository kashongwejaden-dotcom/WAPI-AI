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
    <div className="flex items-center justify-center min-h-screen market-pattern">
      <div className="w-full max-w-md p-8 pt-6 bg-white border border-[#2E7D32]/20 rounded-3xl shadow-xl">
        <div className="flex items-center justify-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF8F00] flex items-center justify-center text-[#4E342E] font-black text-2xl shadow-sm">
            W
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#4E342E]">WapiAI</h1>
        </div>
        
        <h2 className="text-xl font-bold text-[#4E342E] mb-6 text-center">
          {isLogin ? 'Sign In to your account' : 'Create a new account'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#4E342E]/70 mb-1 tracking-wide">Email address</label>
            <input
              type="email"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#4E342E] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 transition-all font-medium placeholder:text-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4E342E]/70 mb-1 tracking-wide">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#4E342E] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 transition-all font-medium placeholder:text-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>
          
          {error && <div className="text-red-600 text-sm font-medium p-3 bg-red-50 rounded-xl border border-red-200">{error}</div>}
          
          {!import.meta.env.VITE_SUPABASE_URL && (
            <div className="text-[#FF8F00] text-sm font-medium p-3 bg-[#FF8F00]/10 rounded-xl border border-[#FF8F00]/20">
              Note: Supabase credentials are not configured in environment variables. Authentication will fail.
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-6 text-lg rounded-xl shadow-md transition-colors"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#4E342E]/60 hover:text-[#2E7D32] text-sm transition-colors font-bold tracking-wide"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
