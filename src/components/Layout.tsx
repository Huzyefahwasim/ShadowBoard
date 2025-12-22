import React from 'react';
import { Terminal, Users, Clock } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        // Enforce full view port with fixed positioning to guarantee coverage
        <div className="fixed inset-0 w-full h-full bg-background text-[#EDEDED] flex overflow-hidden font-sans selection:bg-cmo/30">
            {/* Sidebar - Fixed width */}
            <aside className="w-16 lg:w-64 glass-panel flex-shrink-0 flex flex-col border-r border-border z-20 h-full">
                <div className="p-4 border-b border-border flex items-center justify-center lg:justify-start gap-3 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cmo to-policy flex items-center justify-center shadow-lg shadow-cmo/20">
                        <Terminal size={18} className="text-white" />
                    </div>
                    <h2 className="hidden lg:block text-lg font-bold tracking-tight text-[#EDEDED]">
                        SHADOW_BOARD
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-2 px-2">
                    {/* Mock History Items */}
                    {['Strategy Session A', 'Q3 Budget Review', 'Policy Audit 2026'].map((item, i) => (
                        <div key={i} className="group p-3 rounded-lg hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors">
                            <Clock size={16} className="text-[#A1A1AA] group-hover:text-cmo transition-colors" />
                            <span className="hidden lg:block text-sm text-[#A1A1AA] group-hover:text-[#EDEDED] truncate transition-colors font-medium">{item}</span>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-border flex-shrink-0">
                    <div className="p-3 rounded-lg bg-white/5 flex items-center gap-3 border border-transparent hover:border-policy/30 transition-all">
                        <Users size={16} className="text-policy" />
                        <span className="hidden lg:block text-xs text-[#A1A1AA] font-mono tracking-wider">SYSTEM ONLINE</span>
                    </div>
                </div>
            </aside>

            {/* Main Stage - Flex grow to fill remaining width */}
            <main className="flex-1 flex flex-col relative h-full min-w-0">
                {/* Ambient Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cmo/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-policy/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10 flex-1 flex flex-col min-h-0">
                    {children}
                </div>
            </main>
        </div>
    );
};
