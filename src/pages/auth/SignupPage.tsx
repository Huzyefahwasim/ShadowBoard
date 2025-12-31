import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';

export function SignupPage() {
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Assuming simple form structure: First Name, Last Name, Email, Password
        const form = e.target as HTMLFormElement;
        const email = (form.elements[2] as HTMLInputElement).value;
        const password = (form.elements[3] as HTMLInputElement).value;
        const username = (form.elements[0] as HTMLInputElement).value + (form.elements[1] as HTMLInputElement).value; // Simple username generation

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created! Please sign in.');
                navigate('/login');
            } else {
                alert(data.error || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Failed to connect to server');
        }
    };

    return (
        <AuthLayout title="Create Account" subtitle="Join the future of executive decision making">
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5">First Name</label>
                        <input type="text" className="w-full bg-[#0A0A0C] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Last Name</label>
                        <input type="text" className="w-full bg-[#0A0A0C] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email address</label>
                    <input
                        type="email"
                        className="w-full bg-[#0A0A0C] border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                        placeholder="name@company.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
                    <input
                        type="password"
                        className="w-full bg-[#0A0A0C] border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                        placeholder="Create a password"
                    />
                </div>
                <button
                    type="submit"
                    className="group relative w-full bg-[#6EE7B7] text-black font-bold py-3.5 rounded-lg transition-colors mt-2 overflow-hidden"
                >
                    <span className="relative z-10">Create Account</span>
                    <div className="absolute inset-0 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                </button>
            </form>
            <p className="mt-8 text-center text-sm text-zinc-500">
                Already have an account? <Link to="/login" className="text-white hover:underline">Sign in</Link>
            </p>
        </AuthLayout>
    );
}
