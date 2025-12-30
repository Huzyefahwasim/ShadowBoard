import React from 'react';

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

interface PersonaTriadProps {
    activeAgentId?: 'cfo' | 'cmo' | 'policy' | 'all' | null;
}

export const PersonaTriad = ({ activeAgentId }: PersonaTriadProps) => {
    return (
        <div className="flex justify-around items-center w-full max-w-md relative">
            {personas.map((p, i) => {
                const isActive = activeAgentId === 'all' || activeAgentId === p.id;

                return (
                    <div key={p.id} className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer" style={{ marginTop: i === 1 ? '40px' : '0' }}>
                        {/* Connection Lines (Pseudo) */}
                        {i === 1 && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-px bg-zinc-800 -z-10" />
                        )}

                        <div className={clsx(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                            isActive
                                ? "bg-black border-primary shadow-[0_0_20px_rgba(110,231,183,0.3)]"
                                : "bg-black border-zinc-800 opacity-50 hover:opacity-100 hover:border-zinc-700"
                        )}>
                            <p.icon size={24} className={clsx("transition-colors", isActive ? "text-primary" : "text-zinc-600")} />
                        </div>

                        <div className="text-center">
                            <div className={clsx("text-xs font-bold font-mono tracking-widest uppercase transition-colors", isActive ? "text-primary" : "text-zinc-600")}>
                                {p.name}
                            </div>
                            <div className="text-[10px] text-zinc-500 uppercase">{p.role}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};
