import { motion } from 'framer-motion';

interface ConflictDialProps {
    friction: number; // 0 to 100
}

export const ConflictDial = ({ friction }: ConflictDialProps) => {
    // Map friction (0-100) to degrees (-90 to 90)
    const rotation = (friction / 100) * 180 - 90;

    return (
        <div className="relative w-64 h-32 overflow-hidden flex items-end justify-center">
            {/* Background Arc */}
            <div className="absolute bottom-0 w-64 h-32 rounded-t-full bg-white/5 border-t border-l border-r border-white/10" />

            {/* Gradient Arc (Masked) */}
            <svg className="w-64 h-32 absolute bottom-0" viewBox="0 0 200 100">
                <defs>
                    <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" /> {/* Synergy (Green) */}
                        <stop offset="50%" stopColor="#eab308" /> {/* Neutral (Yellow) */}
                        <stop offset="100%" stopColor="#ef4444" /> {/* Friction (Red) */}
                    </linearGradient>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#dialGradient)" strokeWidth="15" strokeLinecap="round" className="opacity-80" />
            </svg>

            {/* Ticks */}
            <div className="absolute bottom-0 w-full h-full flex justify-center items-end">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bottom-0 h-28 w-1 bg-white/10 origin-bottom transform"
                        style={{ rotate: `${i * 45 - 90}deg` }}
                    />
                ))}
            </div>

            {/* Needle */}
            <motion.div
                className="absolute bottom-0 w-1 h-28 bg-white origin-bottom rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10"
                animate={{ rotate: rotation }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                style={{ borderRadius: '4px 4px 0 0' }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
            </motion.div>

            {/* Readout */}
            <div className="absolute bottom-4 font-mono font-bold text-2xl text-white drop-shadow-md">
                {friction.toFixed(0)}%
            </div>

            <div className="absolute bottom-[-20px] text-xs text-gray-400 uppercase tracking-widest">
                Friction
            </div>
        </div>
    );
};
