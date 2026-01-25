import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (!token) {
            setMessage({ text: 'Invalid or missing access token.', type: 'error' });
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) return;

        if (password !== confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }

        if (password.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch('http://localhost:5000/api/auth/setup-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    new_password: password
                })
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Password set successfully! Redirecting to login...', type: 'success' });
                setTimeout(() => {
                    navigate('/partner/login');
                }, 2000);
            } else {
                setMessage({ text: data.error || 'Failed to set password.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
                    <p className="text-slate-600">This page requires a valid setup link. Please check your email.</p>
                    <button onClick={() => navigate('/partner/login')} className="mt-6 text-primary font-bold hover:underline">Go to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Setup Your Password</h2>
                    <p className="text-slate-500 text-sm">
                        Create a secure password to activate your account.
                    </p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 animate-[fadeIn_0.5s]">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold pr-12"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showConfirmPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLoading ? 'Setting Up...' : 'Save Password & Activate'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
