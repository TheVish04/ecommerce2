import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock } from 'lucide-react';
import Button from '../components/Button';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer'); // Default role
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Send role as is (customer/vendor) to match backend enum
        const apiRole = role;

        try {
            await signup(name, email, password, apiRole);
            navigate('/');
        } catch (err) {
            setError('Failed to create an account. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light-900 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="glass-card bg-white dark:bg-white/5 border border-light-700 dark:border-white/10 max-w-md w-full p-8 space-y-8 shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Create Account</h2>
                    <p className="text-gray-500 dark:text-gray-400">Join the KalaVPP community today</p>
                </div>

                {error && <div className="bg-red-100 dark:bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-500 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-light-800 dark:bg-dark-800 border border-gray-300 dark:border-white/10 rounded-lg pl-12 pr-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

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

                    <div className="relative">
                        <div className="flex gap-4">
                            <label className={`flex-1 cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${role === 'customer' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="customer"
                                    checked={role === 'customer'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="hidden"
                                />
                                <span className="font-bold">Customer</span>
                                <span className="text-xs">Buy art & services</span>
                            </label>

                            <label className={`flex-1 cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${role === 'vendor' ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="vendor"
                                    checked={role === 'vendor'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="hidden"
                                />
                                <span className="font-bold">Artist/Vendor</span>
                                <span className="text-xs">Sell your work</span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/30"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:text-blue-600 font-bold">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
