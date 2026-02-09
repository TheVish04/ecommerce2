import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOtpStep, setShowOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    const { login, verifyEmail, resendOtp } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!GMAIL_REGEX.test(email.trim())) {
            setError('Only Gmail addresses are allowed');
            return;
        }
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result?.needsVerification) {
                setShowOtpStep(true);
            } else {
                navigate(redirectTo);
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : err.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyEmail(email, otp);
            navigate(redirectTo);
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setResendLoading(true);
        try {
            await resendOtp(email);
            setOtp('');
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    if (showOtpStep) {
        return (
            <div className="min-h-screen bg-light-900 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors duration-300">
                <div className="glass-card bg-white dark:bg-white/5 border border-light-700 dark:border-white/10 max-w-md w-full p-8 space-y-8 shadow-xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Verify Your Email</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Enter the 6-digit OTP sent to <strong className="text-dark-900 dark:text-white">{email}</strong>
                        </p>
                    </div>

                    {error && <div className="bg-red-100 dark:bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-500 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-light-800 dark:bg-dark-800 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-dark-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Didn't receive it?{' '}
                            <button type="button" onClick={handleResendOtp} disabled={resendLoading} className="text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50">
                                {resendLoading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        </p>
                    </form>
                    <button type="button" onClick={() => { setShowOtpStep(false); setOtp(''); setError(''); }} className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        ← Back to login
                    </button>
                </div>
            </div>
        );
    }

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
                            placeholder="Gmail address (e.g. you@gmail.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-light-800 dark:bg-dark-800 border border-gray-300 dark:border-white/10 rounded-lg pl-12 pr-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-light-800 dark:bg-dark-800 border border-gray-300 dark:border-white/10 rounded-lg pl-12 pr-12 py-3 text-dark-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
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
