import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOtpStep, setShowOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    const { signup, verifyEmail, resendOtp } = useAuth();
    const navigate = useNavigate();

    const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!GMAIL_REGEX.test(email.trim())) {
            setError('Only Gmail addresses are allowed');
            return;
        }
        if (!STRONG_PASSWORD_REGEX.test(password)) {
            setError('Password must be 8+ chars with uppercase, lowercase, number & special char (@$!%*?&)');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);

        try {
            const result = await signup(name, email, password, role);
            if (result?.needsVerification) {
                setShowOtpStep(true);
            } else {
                navigate('/');
            }
        } catch (err) {
            const msg = typeof err === 'string' ? err : 'Failed to create an account.';
            setError(msg);
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
            navigate('/');
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
            setError('');
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
                            We sent a 6-digit OTP to <strong className="text-dark-900 dark:text-white">{email}</strong>
                        </p>
                    </div>

                    {error && <div className="bg-red-100 dark:bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-500 p-3 rounded-lg text-sm text-center font-medium">{error}</div>}

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-light-800 dark:bg-dark-800 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-dark-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendLoading}
                                className="text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
                            >
                                {resendLoading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        </p>
                    </form>

                    <button
                        type="button"
                        onClick={() => { setShowOtpStep(false); setOtp(''); setError(''); }}
                        className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        ← Use a different email
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-900 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="glass-card bg-white dark:bg-white/5 border border-light-700 dark:border-white/10 max-w-md w-full p-8 space-y-8 shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Create Account</h2>
                    <p className="text-gray-500 dark:text-gray-400">Join the KalaVPP community today</p>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-500 p-3 rounded-lg text-sm text-center font-medium">
                        {error}
                        {error.toLowerCase().includes('already exists') && (
                            <span className="block mt-2">
                                <Link to="/login" className="text-blue-600 dark:text-blue-400 underline font-medium">Sign in</Link>
                                {' '}or{' '}
                                <Link to="/forgotpassword" className="text-blue-600 dark:text-blue-400 underline font-medium">reset your password</Link>
                            </span>
                        )}
                    </div>
                )}

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
                            placeholder="Gmail address only (e.g. you@gmail.com)"
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

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4">
                        Min 8 chars, include uppercase, lowercase, number & special char (@$!%*?&)
                    </p>

                    <div>
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
