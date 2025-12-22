import { motion } from 'framer-motion';
import { Swords, Scale, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

type Phase = 'conflict' | 'audit' | 'resolution';

interface PhaseProgressBarProps {
    currentPhase: Phase;
}

const steps = [
    { id: 'conflict', label: 'Conflict', icon: Swords },
    { id: 'audit', label: 'Audit', icon: Scale },
    { id: 'resolution', label: 'Resolution', icon: CheckCircle2 },
];

export const PhaseProgressBar = ({ currentPhase }: PhaseProgressBarProps) => {
    const currentIndex = steps.findIndex(s => s.id === currentPhase);

    return (
        <div className="w-full max-w-lg mx-auto mb-8 relative">
            {/* Progress Line Background */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />

            {/* Active Progress Line */}
            <motion.div
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cmo to-policy -translate-y-1/2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2">
                            <motion.div
                                className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 z-10 bg-background",
                                    isActive ? "border-policy text-white" : "border-white/10 text-gray-500",
                                    isCurrent && "shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                )}
                                animate={isCurrent ? { scale: 1.1 } : { scale: 1 }}
                            >
                                <step.icon size={18} />
                            </motion.div>
                            <span className={clsx(
                                "text-xs font-mono uppercase tracking-wider transition-colors",
                                isActive ? "text-white" : "text-gray-600"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
