import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthViewProps {
    theme: 'light' | 'dark';
}

const AuthView: React.FC<AuthViewProps> = ({ theme }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const isMissingConfig = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isMissingConfig) {
            setError('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your AI Studio Secrets.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            } else {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (signUpError) throw signUpError;
                // Auto login might happen or require verification depending on Supabase settings
                // But for now, we'll just handle success state.
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'dark bg-[#0b0f19] text-white' : 'bg-[#fcfdfd] text-gray-900'}`}>
            <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50">
                
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 transform rotate-3">
                        <i className="fas fa-wallet text-3xl text-white -rotate-3"></i>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {isLogin ? 'Enter your details to access your wallet' : 'Sign up to start tracking your budget'}
                    </p>
                </div>

                {isMissingConfig && (
                    <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-2xl flex items-start gap-3">
                        <i className="fas fa-exclamation-triangle text-orange-500 mt-0.5"></i>
                        <p className="text-sm text-orange-700 dark:text-orange-400 leading-relaxed">
                            <strong>Configuration Required:</strong><br />
                            Please configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your AI Studio Secrets menu to enable authentication.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl flex items-start gap-3">
                        <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                        <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-cyan-500/30 duration-300 outline-none"
                                placeholder="John Doe"
                                required={!isLogin}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-cyan-500/30 duration-300 outline-none"
                            placeholder="hello@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-cyan-500/30 duration-300 outline-none"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-2xl shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 mt-2"
                    >
                        {isLoading ? (
                            <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                        )}
                        {!isLoading && <i className="fas fa-arrow-right text-sm ml-1 opacity-80"></i>}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
