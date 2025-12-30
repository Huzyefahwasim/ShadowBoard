import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function LandingNav() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between"
        >
            <div className="flex items-center space-x-3">
                <img src="/favicon.svg" alt="Logo" className="w-10 h-10" />
                <span className="text-xl font-bold tracking-tight text-white">Shadow Board</span>
            </div>

            <div className="flex items-center space-x-6">
                <Link to="/login" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                    Log In
                </Link>
                <Link
                    to="/signup"
                    className="group relative px-5 py-2.5 bg-[#6EE7B7] text-black rounded-full text-sm font-bold transition-colors shadow-[0_0_15px_rgba(110,231,183,0.3)] overflow-hidden"
                >
                    <span className="relative z-10">Sign Up</span>
                    <div className="absolute inset-0 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                </Link>
            </div>
        </motion.nav>
    );
}
