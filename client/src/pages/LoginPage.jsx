import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';
import Button from '../components/Button';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate(redirectTo);
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light-900 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="glass-card bg-white dark:bg-white/5 border border-light-700 dark:border-white/10 max-w-md w-full p-8 space-y-8 shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-500 dark:text-gray-400">Sign in to your KalaVPP account</p>
                </div>

                {error && <div className="bg-red-100 dark:bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-500 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            required
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-light-800 dark:bg-dark-800 border border-gray-300 dark:border-white/10 rounded-lg pl-12 pr-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-light-800 dark:bg-dark-800 border border-gray-300 dark:border-white/10 rounded-lg pl-12 pr-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                            <input type="checkbox" className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-transparent" />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgotpassword" className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Forgot Password?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/30"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-bold">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
