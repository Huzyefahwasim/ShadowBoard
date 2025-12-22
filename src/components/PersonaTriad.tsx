import React from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Wallet } from 'lucide-react';
import clsx from 'clsx';

type Persona = {
    id: 'cfo' | 'cmo' | 'policy';
    name: string;
    role: string;
    color: string;
    icon: React.ComponentType<any>;
    isActive: boolean;
};

// Mock state for now
const personas: Persona[] = [
    { id: 'cmo', name: 'CMO', role: 'Growth', color: 'text-cmo', icon: TrendingUp, isActive: false },
    { id: 'policy', name: 'Policy Pilot', role: 'Security', color: 'text-policy', icon: Shield, isActive: true }, // Mock active state
    { id: 'cfo', name: 'CFO', role: 'Finance', color: 'text-cfo', icon: Wallet, isActive: false },
];

export const PersonaTriad = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 w-full mb-8">
            {personas.map((p) => (
                <div key={p.id} className="relative group w-full">
                    {/* Pulsing Aura */}
                    {p.isActive && (
                        <motion.div
                            layoutId={`aura-${p.id}`}
                            className={clsx("absolute inset-0 rounded-xl blur-2xl opacity-40", {
                                'bg-cmo': p.id === 'cmo',
                                'bg-policy': p.id === 'policy',
                                'bg-cfo': p.id === 'cfo',
                            })}
                            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                    )}

                    <div className={clsx(
                        "glass-card relative w-full p-6 rounded-xl border transition-all duration-300 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4",
                        p.isActive ? "border-white/20 bg-white/10" : "border-white/5 opacity-80 hover:opacity-100"
                    )}>
                        <div className="flex items-center gap-4 lg:flex-col">
                            <div className={clsx("p-3 rounded-full bg-white/5 shadow-inner", p.color)}>
                                <p.icon size={24} />
                            </div>
                            <div className="text-left lg:text-center">
                                <h3 className="font-bold text-lg tracking-tight">{p.name}</h3>
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">{p.role}</span>
                            </div>
                        </div>

                        {/* Thinking Indicator */}
                        {p.isActive && (
                            <div className="flex gap-1">
                                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-1 h-1 rounded-full bg-white/50" />
                                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 rounded-full bg-white/50" />
                                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 rounded-full bg-white/50" />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
