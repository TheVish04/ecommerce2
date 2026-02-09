import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!GMAIL_REGEX.test(email.trim())) {
            setError('Only Gmail addresses are allowed');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/forgotpassword', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
                <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Check your email</h2>
                    <p className="text-gray-400">
                        We've sent a password reset link to <strong className="text-white">{email}</strong>. Check your inbox and spam folder.
                    </p>
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 block">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full p-8 space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                    <p className="text-gray-400">Enter your email to reset your password</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="email"
                            required
                            placeholder="Gmail address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-800 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-6">
                    Remember your password?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
