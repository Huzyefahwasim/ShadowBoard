import { motion } from 'framer-motion';
import { TrendingUp, Wallet, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export type Message = {
    id: string;
    sender: 'cfo' | 'cmo' | 'policy' | 'system';
    text: string;
    timestamp: string;
    metrics?: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' };
    isVetoed?: boolean;
};

export const PerspectiveBlock = ({ message }: { message: Message }) => {
    const isCFO = message.sender === 'cfo';
    const isCMO = message.sender === 'cmo';
    const isPolicy = message.sender === 'policy';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={clsx(
                "w-full flex mb-6",
                isCFO && "justify-end",
                isCMO && "justify-start",
                isPolicy && "justify-center"
            )}
        >
            <div className={clsx(
                "relative max-w-[80%] rounded-2xl p-4 backdrop-blur-md border shadow-xl overflow-hidden",
                isCFO && "bg-gradient-to-br from-[#1a1a1a] to-[#2a2010] border-cfo/30 rounded-tr-sm",
                isCMO && "bg-gradient-to-br from-[#1a1a1a] to-[#2a1025] border-cmo/30 rounded-tl-sm",
                isPolicy && "w-[90%] bg-policy/10 border-policy/50 text-center"
            )}>
                {/* Header Badge */}
                <div className={clsx(
                    "flex items-center gap-2 mb-2 pb-2 border-b border-white/5",
                    isCFO && "justify-end text-cfo",
                    isCMO && "justify-start text-cmo",
                    isPolicy && "justify-center text-policy"
                )}>
                    {isCFO && <span className="font-mono text-xs uppercase">Financial Logic</span>}
                    {isCFO && <Wallet size={14} />}

                    {isCMO && <TrendingUp size={14} />}
                    {isCMO && <span className="font-mono text-xs uppercase">Market Signal</span>}

                    {isPolicy && <ShieldAlert size={14} />}
                    {isPolicy && <span className="font-mono text-xs uppercase">Compliance Check</span>}
                </div>

                {/* Content */}
                <p className={clsx(
                    "text-sm leading-relaxed",
                    message.isVetoed ? "text-gray-500 line-through blur-[1px]" : "text-gray-200"
                )}>
                    {message.text}
                </p>

                {/* Micro-Metrics (Flavor) */}
                {message.metrics && !message.isVetoed && (
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
                        <span>{message.metrics.label}</span>
                        <span className={clsx(
                            "font-bold",
                            message.metrics.trend === 'up' && "text-green-400",
                            message.metrics.trend === 'down' && "text-red-400"
                        )}>
                            {message.metrics.value}
                        </span>
                    </div>
                )}

                {/* VETO Overlay */}
                {message.isVetoed && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ scale: 2, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: -15 }}
                            className="border-4 border-red-500/80 text-red-500/80 font-black text-4xl p-2 rounded transform -rotate-12 bg-black/50 backdrop-blur-sm"
                        >
                            VETOED
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
