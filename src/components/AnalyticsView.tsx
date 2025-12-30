import { motion } from 'framer-motion';
import { TrendingUp, Clock, AlertTriangle } from 'lucide-react';

const mockHistory = [
    { id: 1, title: 'Q4 Market Expansion Strategy', date: '2 hours ago', score: 85, status: 'Completed' },
    { id: 2, title: 'Competitor Acquisition Risk', date: '1 day ago', score: 42, status: 'High Risk' },
    { id: 3, title: 'Supply Chain Diversification', date: '3 days ago', score: 92, status: 'Completed' },
];

export const AnalyticsView = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto w-full h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-medium text-white">Analytics Intelligence</h1>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-zinc-900 text-zinc-400 rounded-lg text-sm hover:text-white transition-colors">7 Days</button>
                    <button className="px-4 py-2 bg-[#27272a] text-white rounded-lg text-sm">30 Days</button>
                    <button className="px-4 py-2 bg-zinc-900 text-zinc-400 rounded-lg text-sm hover:text-white transition-colors">All Time</button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card-dark p-6">
                    <div className="flex items-center gap-3 mb-2 text-zinc-400">
                        <TrendingUp size={18} />
                        <span className="text-sm font-medium uppercase tracking-wider">Avg. Viability Score</span>
                    </div>
                    <div className="text-4xl font-light text-white mb-2">78.4</div>
                    <div className="text-[#6EE7B7] text-xs flex items-center gap-1">
                        <span>+2.4%</span>
                        <span className="text-zinc-600">vs last period</span>
                    </div>
                </div>

                <div className="card-dark p-6">
                    <div className="flex items-center gap-3 mb-2 text-zinc-400">
                        <Clock size={18} />
                        <span className="text-sm font-medium uppercase tracking-wider">Total Simulations</span>
                    </div>
                    <div className="text-4xl font-light text-white mb-2">142</div>
                    <div className="text-zinc-500 text-xs">
                        Across 12 Projects
                    </div>
                </div>

                <div className="card-dark p-6">
                    <div className="flex items-center gap-3 mb-2 text-zinc-400">
                        <AlertTriangle size={18} />
                        <span className="text-sm font-medium uppercase tracking-wider">Risk Detections</span>
                    </div>
                    <div className="text-4xl font-light text-white mb-2">08</div>
                    <div className="text-red-400 text-xs flex items-center gap-1">
                        <span>-12%</span>
                        <span className="text-zinc-600">vs last period</span>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="card-dark p-0 overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-lg font-medium text-white">Recent Simulations</h2>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-zinc-500 text-xs border-b border-zinc-800">
                                <th className="p-4 font-medium uppercase tracking-wider pl-6">Scenario</th>
                                <th className="p-4 font-medium uppercase tracking-wider">Date</th>
                                <th className="p-4 font-medium uppercase tracking-wider">Score</th>
                                <th className="p-4 font-medium uppercase tracking-wider text-right pr-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-zinc-300">
                            {mockHistory.map((item) => (
                                <tr key={item.id} className="group hover:bg-zinc-900/50 transition-colors border-b border-zinc-800/50 last:border-0">
                                    <td className="p-4 pl-6 font-medium text-white">{item.title}</td>
                                    <td className="p-4 text-zinc-500">{item.date}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-full bg-zinc-800 rounded-full h-1.5 w-24">
                                                <div className="bg-[#6EE7B7] h-1.5 rounded-full" style={{ width: `${item.score}%` }} />
                                            </div>
                                            <span className="text-xs font-mono">{item.score}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${item.status === 'High Risk'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-emerald-500/10 text-[#6EE7B7] border-emerald-500/20'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {/* Filler Rows */}
                            {[...Array(5)].map((_, i) => (
                                <tr key={`mock-${i}`} className="group hover:bg-zinc-900/50 transition-colors border-b border-zinc-800/50 last:border-0">
                                    <td className="p-4 pl-6 font-medium text-zinc-600">Untitled Simulation #{100 - i}</td>
                                    <td className="p-4 text-zinc-700">Last week</td>
                                    <td className="p-4 opacity-30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-full bg-zinc-800 rounded-full h-1.5 w-24">
                                                <div className="bg-zinc-600 h-1.5 rounded-full" style={{ width: `${60 - i * 5}%` }} />
                                            </div>
                                            <span className="text-xs font-mono">{60 - i * 5}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <span className="px-2 py-1 rounded-full text-xs border bg-zinc-900 text-zinc-500 border-zinc-800">
                                            Archived
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};
