import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-8">
                        <div className="flex items-center space-x-3">
                            <img src="/favicon.svg" alt="Logo" className="w-12 h-12" />
                            <span className="text-2xl font-bold tracking-tight">Shadow Board</span>
                        </div>
                    </Link>
                    <h2 className="text-3xl font-bold mb-2">{title}</h2>
                    {subtitle && <p className="text-zinc-400">{subtitle}</p>}
                </div>

                <div className="bg-[#16161A]/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
