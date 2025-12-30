import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';

export function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to your executive dashboard">
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email address</label>
                    <input
                        type="email"
                        className="w-full bg-[#0A0A0C] border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                        placeholder="name@company.com"
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-zinc-400">Password</label>
                        <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Forgot password?</a>
                    </div>
                    <input
                        type="password"
                        className="w-full bg-[#0A0A0C] border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                        placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    className="group relative w-full bg-[#6EE7B7] text-black font-bold py-3.5 rounded-lg transition-colors mt-2 overflow-hidden"
                >
                    <span className="relative z-10">Sign In</span>
                    <div className="absolute inset-0 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                </button>
            </form>
            <p className="mt-8 text-center text-sm text-zinc-500">
                Don't have an account? <Link to="/signup" className="text-white hover:underline">Sign up</Link>
            </p>
        </AuthLayout>
    );
}
