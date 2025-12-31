import React from 'react';
import { LayoutGrid, PieChart, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export type TabId = 'board' | 'analytics' | 'settings';

interface LayoutProps {
    children: React.ReactNode;
    activeTab?: TabId;
    onTabChange?: (id: TabId) => void;
}

export function Layout({ children, activeTab = 'board', onTabChange }: LayoutProps) {
    const navigate = useNavigate();
    const navItems = [
        { id: 'board', icon: LayoutGrid, label: 'Boardroom' },
        { id: 'analytics', icon: PieChart, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ] as const;

    return (
        <div className="fixed inset-0 w-full h-full bg-background text-[#EDEDED] flex overflow-hidden font-sans selection:bg-primary/30">
            {/* Minimal Sidebar */}
            <aside className="w-20 flex-shrink-0 flex flex-col items-center py-8 border-r border-[#27272a] z-20 h-full bg-surface">
                <img src="/favicon.svg" alt="Logo" className="w-12 h-12 mb-12" />

                <div className="flex flex-col gap-8">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange?.(item.id)}
                            className={clsx(
                                "p-3 rounded-xl transition-all duration-300 relative group",
                                activeTab === item.id
                                    ? "bg-[#27272a] text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                    : "text-[#71717a] hover:bg-[#27272a]/50 hover:text-zinc-400"
                            )}
                        >
                            <item.icon size={24} />
                            {activeTab === item.id && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-1 h-8 bg-primary rounded-l-full" />
                            )}

                            {/* Tooltip */}
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                                {item.label}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-auto mb-8">
                    <button
                        onClick={async () => {
                            const token = localStorage.getItem('token');
                            try {
                                await fetch('http://localhost:3001/api/auth/logout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ token })
                                });
                            } catch (e) {
                                console.error('Logout failed', e);
                            }
                            localStorage.removeItem('isAuthenticated');
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            navigate('/login');
                        }}
                        className="p-3 text-[#71717a] hover:bg-[#27272a]/50 hover:text-red-400 rounded-xl transition-all duration-300 relative group"
                    >
                        <LogOut size={24} />
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                            Log Out
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Stage */}
            <main className="flex-1 flex flex-col relative h-full min-w-0 bg-background p-8 overflow-hidden">
                <div className="relative z-10 flex-1 flex flex-col min-h-0">
                    {children}
                </div>
            </main>
        </div>
    );
};
