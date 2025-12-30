import { useState, useEffect } from 'react';
import { IdeaInput } from './IdeaInput';
import { AgentTab, type AgentFeedback } from './AgentTab';
import { PersonaTriad } from './PersonaTriad';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { ArrowUpRight } from 'lucide-react';

import { parseAgentResponse } from '../utils/parser';
import type { AnalyzeResponse } from '../types/api';

const API_BASE_URL = 'http://172.29.104.128:3000';

export const Boardroom = () => {
    const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
    const [activeTab, setActiveTab] = useState<'cfo' | 'cmo' | 'policy' | 'overall'>('overall');
    const [feedbacks, setFeedbacks] = useState<Record<string, AgentFeedback>>({});
    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    // Health Check on Mount
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
                if (res.ok) setApiStatus('online');
                else setApiStatus('offline');
            } catch (e) {
                setApiStatus('offline');
            }
        };
        checkHealth();
    }, []);

    const handleAnalyze = async (idea: string) => {
        setStep('analyzing');

        // Live API Logic
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
            const data: AnalyzeResponse = await response.json();
            const parsedFeedbacks = parseAgentResponse(data);
            setFeedbacks(parsedFeedbacks);
        } catch (error: any) {
            console.error("API Fetch Failed:", error);
            // Fallback Mock... (Simplified for brevity in update)
            setFeedbacks(parseAgentResponse({ transcript: "Error", tasks: [], riskScore: 0, isVetoed: true } as any));
        }

        setActiveTab('overall');
        setStep('results');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // CountUp Animation
    const [score, setScore] = useState(0);
    useEffect(() => {
        if (feedbacks.overall?.score) {
            const duration = 2000;
            const steps = 60;
            const increment = feedbacks.overall.score / steps;
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= (feedbacks.overall?.score || 0)) {
                    current = feedbacks.overall?.score || 0;
                    clearInterval(timer);
                }
                setScore(Math.floor(current));
            }, duration / steps);
            return () => clearInterval(timer);
        }
    }, [feedbacks]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-medium tracking-tight text-white">Shadow Board</h1>
                </div>
                <div className="text-zinc-500 font-mono text-sm">{new Date().toLocaleTimeString()}</div>
            </div>

            {/* Bento Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-12 grid-rows-2 gap-6 h-full min-h-0"
            >
                {/* 1. Large Stats Card (Top Left) */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-5 card-dark p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <h2 className="text-xl font-medium text-white mb-1">Composite Score</h2>
                            <p className="text-zinc-500 text-sm">Strategic Viability Index</p>
                        </div>
                        <button className="text-xs border border-zinc-700 px-3 py-1 rounded-full hover:bg-zinc-800 transition-colors">
                            Change module
                        </button>
                    </div>

                    <div className="flex items-end gap-4 mt-8 z-10">
                        <span className="text-6xl font-light text-white tracking-tighter tabular-nums">
                            {score}
                        </span>
                        <span className="text-zinc-500 mb-2 font-mono text-sm">/ 100 POINTS</span>
                    </div>

                    {/* Decorative Bars */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-between px-8 pb-8 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500">
                        {[40, 60, 30, 80, 50, 90, 40, 60, 70, 40, 80, 60].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                                className="w-4 bg-primary rounded-t-sm"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* 2. Persona Connections (Top Middle) */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 card-dark p-6 relative group">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium text-white">Active Agents</h2>
                        <div className="w-10 h-6 bg-zinc-800 rounded-full relative">
                            <div className={clsx("absolute top-1 left-1 w-4 h-4 bg-primary rounded-full transition-transform", apiStatus === 'online' ? "translate-x-4" : "")} />
                        </div>
                    </div>
                    {/* Reuse simplified PersonaTriad here */}
                    <div className="h-48 flex items-center justify-center">
                        <PersonaTriad activeAgentId={step === 'analyzing' ? 'all' : (step === 'results' && activeTab !== 'overall' ? activeTab : null)} />
                    </div>
                </motion.div>

                {/* 3. Recommendation / Quick Tip (Top Right) */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-3 card-dark p-6 flex flex-col justify-between">
                    <h2 className="text-lg font-medium text-white mb-4">Recommendation</h2>
                    <div className="bg-zinc-900 rounded-2xl p-4 mb-4 flex-1 border border-zinc-800">
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            {feedbacks.overall?.summary
                                ? feedbacks.overall.summary.slice(0, 100) + "..."
                                : "Submit a proposal to generate strategic insights."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        AI Analysis Ready
                    </div>
                </motion.div>

                {/* 4. Proposal / Input (Bottom Left) - CONVERTED TO DARK */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 card-dark p-8 flex flex-col relative overflow-hidden border-primary/20">
                    <div className="flex justify-between items-start mb-6 z-10">
                        <h2 className="text-2xl font-medium text-white">Proposal</h2>
                        <div className="p-2 bg-white/5 rounded-full">
                            <ArrowUpRight className="text-white" size={20} />
                        </div>
                    </div>

                    <div className="flex-1 z-10">
                        {step === 'input' ? (
                            <IdeaInput onSubmit={handleAnalyze} isAnalyzing={false} />
                        ) : (
                            <div className="text-white">
                                <h3 className="font-bold text-lg mb-2">Analysis Complete</h3>
                                <button onClick={() => setStep('input')} className="group relative px-5 py-2.5 bg-[#6EE7B7] text-black font-bold rounded-full text-sm transition-colors overflow-hidden">
                                    <span className="relative z-10">New Analysis</span>
                                    <div className="absolute inset-0 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 5. Detailed Report (Bottom Right spanning) */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 card-dark p-0 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-[#121212] z-20">
                        <h2 className="text-xl font-medium text-white">Detailed Report</h2>
                        <div className="flex gap-2">
                            {(['overall', 'cfo', 'cmo', 'policy'] as const).map(id => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                                        activeTab === id
                                            ? "bg-primary text-black"
                                            : "bg-zinc-900 text-zinc-400 hover:text-white"
                                    )}
                                >
                                    {id.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            <AgentTab key={activeTab} feedback={feedbacks[activeTab]} isActive={true} />
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};
