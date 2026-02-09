import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const emailFromUrl = searchParams.get('email') || '';
    const [email, setEmail] = useState(emailFromUrl);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const { verifyEmail, resendOtp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setEmail(emailFromUrl);
    }, [emailFromUrl]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!email?.trim()) {
            setError('Please enter your email');
            return;
        }
        if (otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }
        setLoading(true);

        try {
            await verifyEmail(email.trim(), otp);
            navigate('/');
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setResendLoading(true);
        try {
            await resendOtp(email.trim());
            setOtp('');
            setError('');
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light-900 dark:bg-dark-900 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="glass-card bg-white dark:bg-white/5 border border-light-700 dark:border-white/10 max-w-md w-full p-8 space-y-8 shadow-xl">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-blue-600 dark:text-blue-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Verify Your Email</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Enter the 6-digit OTP we sent to your email during signup
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-500 p-3 rounded-lg text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                    {!emailFromUrl && (
                        <input
                            type="email"
                            placeholder="Your Gmail address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-light-800 dark:bg-dark-800 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    )}
                    {emailFromUrl && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            OTP sent to <strong className="text-dark-900 dark:text-white">{email}</strong>
                        </p>
                    )}

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
                        disabled={loading || otp.length !== 6 || !email?.trim()}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify & Sign In'}
                    </button>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Didn't receive the code?{' '}
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={resendLoading || !email?.trim()}
                            className="text-blue-500 hover:text-blue-600 font-medium disabled:opacity-50"
                        >
                            {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </p>
                </form>

                <Link to="/login" className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    ← Back to login
                </Link>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
