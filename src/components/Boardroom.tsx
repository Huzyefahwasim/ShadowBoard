import { useState } from 'react';
import { IdeaInput } from './IdeaInput';
import { AgentTab, type AgentFeedback } from './AgentTab';
import { PersonaTriad } from './PersonaTriad';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { TrendingUp, Wallet, Shield, Layers } from 'lucide-react';

import { parseAgentResponse, type DashboardResponse } from '../utils/parser';

export const Boardroom = () => {
    const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
    const [activeTab, setActiveTab] = useState<'cfo' | 'cmo' | 'policy' | 'overall'>('overall');
    const [feedbacks, setFeedbacks] = useState<Record<string, AgentFeedback>>({});

    const handleAnalyze = async (idea: string) => {
        setStep('analyzing');

        // Live API Logic
        try {
            const response = await fetch('http://172.29.104.128:3000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea })
            });

            if (!response.ok) throw new Error('API request failed');

            const data: DashboardResponse = await response.json();

            // Parse the response using our utility
            const parsedFeedbacks = parseAgentResponse(data);
            setFeedbacks(parsedFeedbacks);

        } catch (error) {
            console.error("API Error, falling back to simulation:", error);

            // Fallback Mock (Preserving original flavor for offline demo)
            const mockApiResponse: DashboardResponse = {
                transcript: `**SYSTEM ERROR**: Unable to reach ShadowBoard Core at 172.29.104.128. Only local simulation available.
                
**CMO (Chief Marketing Officer)**
(Offline Simulation) This concept has viral potential if we leverage short-form video content.

**CFO (Chief Financial Officer)**
(Offline Simulation) Financial modeling is unavailable. Proceed with caution regarding OpEx.

**POLICY PILOT**
(Offline Simulation) Compliance checks are offline. Manual audit recommended.`,
                tasks: ["Check network connection", "Retry submission"],
                riskScore: 5,
                isVetoed: true
            };

            setFeedbacks(parseAgentResponse(mockApiResponse));
        }

        setActiveTab('overall');
        setStep('results');
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative w-full pt-4">

            {/* Persona Triad - Only shown in Input or Analyzing phase */}
            <AnimatePresence>
                {(step === 'input' || step === 'analyzing') && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex-shrink-0 w-full"
                    >
                        <PersonaTriad />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 relative w-full min-h-0 flex flex-col">
                <AnimatePresence mode='wait'>
                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex-1 flex flex-col items-center justify-center p-8 w-full"
                        >
                            <div className="mb-12 text-center space-y-4">
                                <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
                                    Executive Boardroom
                                </h1>
                                <p className="text-gray-400 text-lg max-w-xl mx-auto font-light">
                                    Submit your strategic initiative for autonomous multi-agent analysis.
                                </p>
                            </div>
                            <IdeaInput onSubmit={handleAnalyze} isAnalyzing={false} />
                        </motion.div>
                    )}

                    {/* Analysis Loading Phase */}
                    {step === 'analyzing' && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex items-center justify-center p-8"
                        >
                            <div className="text-center space-y-6">
                                <div className="relative w-32 h-32 mx-auto">
                                    <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-t-cfo border-r-cmo border-b-policy border-l-transparent rounded-full animate-spin" />
                                </div>
                                <h2 className="text-2xl font-mono text-gray-300 animate-pulse">
                                    AGENTS DELIBERATING...
                                </h2>
                            </div>
                        </motion.div>
                    )}

                    {/* Results Phase */}
                    {step === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col min-h-0 bg-background w-full h-full"
                        >
                            {/* Tab Headers */}
                            <div className="flex-shrink-0 flex items-center justify-center gap-1 p-2 bg-white/5 border-b border-white/10">
                                <button
                                    onClick={() => setActiveTab('overall')}
                                    className={clsx(
                                        "px-8 py-3 rounded-t-lg flex items-center gap-3 transition-all relative top-[1px] border-t border-x",
                                        activeTab === 'overall'
                                            ? "bg-surface border-border text-[#EDEDED] font-bold"
                                            : "bg-transparent border-transparent text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-surface/50"
                                    )}
                                >
                                    <Layers size={16} className={activeTab === 'overall' ? 'text-white' : 'text-current'} />
                                    <span className="uppercase tracking-wider text-sm">SUMMARY</span>
                                </button>
                                <div className="w-px h-8 bg-white/10 mx-2" />
                                {(['cfo', 'cmo', 'policy'] as const).map(id => (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        className={clsx(
                                            "px-8 py-3 rounded-t-lg flex items-center gap-3 transition-all relative top-[1px] border-t border-x",
                                            activeTab === id
                                                ? "bg-surface border-border text-[#EDEDED] font-bold"
                                                : "bg-transparent border-transparent text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-surface/50"
                                        )}
                                    >
                                        {id === 'cfo' && <Wallet size={16} className={activeTab === 'cfo' ? 'text-cfo' : 'text-current'} />}
                                        {id === 'cmo' && <TrendingUp size={16} className={activeTab === 'cmo' ? 'text-cmo' : 'text-current'} />}
                                        {id === 'policy' && <Shield size={16} className={activeTab === 'policy' ? 'text-policy' : 'text-current'} />}
                                        <span className="uppercase tracking-wider text-sm">
                                            {id === 'cfo' ? 'Finance' : id === 'cmo' ? 'Growth' : 'Trust'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 relative bg-surface border-b border-border shadow-inner overflow-hidden w-full">
                                <AnimatePresence mode='wait'>
                                    <AgentTab key={activeTab} feedback={feedbacks[activeTab]} isActive={true} />
                                </AnimatePresence>
                            </div>

                            {/* Footer Controls */}
                            <div className="p-4 flex justify-between items-center bg-background flex-shrink-0">
                                <button
                                    onClick={() => setStep('input')}
                                    className="text-sm text-[#A1A1AA] hover:text-[#EDEDED] underline decoration-[#A1A1AA]/30 hover:decoration-[#EDEDED] transition-all"
                                >
                                    Submit New Proposal
                                </button>

                                {/* Mini Conflict Dial (Contextual) */}
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-500 uppercase">Composite Score</span>
                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                            style={{ width: `${feedbacks.overall?.score || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xl font-bold font-mono">{feedbacks.overall?.score || 0}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
