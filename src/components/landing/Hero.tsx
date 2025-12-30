import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
};

const stagger = {
    visible: {
        transition: {
            staggerChildren: 0.15
        }
    }
};

export function Hero() {
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const y = useTransform(scrollY, [0, 300], [0, 100]);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
            {/* Animated Data Stream Background - Simplified for Performance */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(110, 231, 183, 0.03) 1px, transparent 1px), 
                                        linear-gradient(90deg, rgba(110, 231, 183, 0.03) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
                    }}
                />
            </div>

            <motion.div
                className="relative z-10 max-w-7xl mx-auto px-6 text-center mt-[-5vh]"
                initial="hidden"
                animate="visible"
                variants={stagger}
                style={{ opacity, y }}
            >
                <motion.div variants={fadeInUp} className="mb-8 flex justify-center">
                    <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
                        <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">Shadow Board Intelligence v3.0</span>
                    </div>
                </motion.div>

                <motion.h1
                    variants={fadeInUp}
                    className="text-7xl md:text-[8rem] font-bold tracking-tighter mb-8 text-white leading-[0.9]"
                >
                    The Intelligence <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        Engine.
                    </span>
                </motion.h1>

                <motion.p
                    variants={fadeInUp}
                    className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-16 leading-relaxed font-light"
                >
                    Simulate c-suite boardroom dynamics with autonomous AI agents.
                    Predict outcomes, mitigate risks, and strategize with precision.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        to="/signup"
                        className="group relative px-8 py-4 bg-[#6EE7B7] text-black rounded-full font-bold text-lg overflow-hidden min-w-[200px]"
                    >
                        <span className="relative z-10 flex items-center justify-center">
                            Start Simulation
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                    </Link>

                    <Link
                        to="/login"
                        className="px-8 py-4 bg-zinc-900 text-white border border-zinc-800 rounded-full font-medium text-lg hover:bg-zinc-800 transition-colors min-w-[200px]"
                    >
                        View Demo
                    </Link>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600"
            >
                <span className="text-[10px] uppercase tracking-widest">Scroll to Explore</span>
                <ChevronDown size={16} />
            </motion.div>
        </section>
    );
}
