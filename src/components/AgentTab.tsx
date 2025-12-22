import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, Wallet, TrendingUp, Shield } from 'lucide-react';
import clsx from 'clsx';

export interface AgentFeedback {
    agentId: 'cfo' | 'cmo' | 'policy' | 'overall';
    summary: string;
    points: (string | { text: string; source: 'cfo' | 'cmo' | 'policy' })[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'critical' | 'rejection';
    score: number; // 0-100
}

interface AgentTabProps {
    feedback: AgentFeedback;
    isActive: boolean;
}

export const AgentTab = ({ feedback, isActive }: AgentTabProps) => {
    if (!isActive) return null;

    const isCFO = feedback.agentId === 'cfo';
    const isCMO = feedback.agentId === 'cmo';
    const isPolicy = feedback.agentId === 'policy';
    const isOverall = feedback.agentId === 'overall';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full overflow-y-auto p-6 lg:p-10"
        >
            {/* Executive Summary Header */}
            <div className="mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className={clsx(
                        "text-xs font-mono uppercase tracking-widest px-2 py-1 rounded bg-white/5",
                        isCFO && "text-cfo border-cfo/20 border",
                        isCMO && "text-cmo border-cmo/20 border",
                        isPolicy && "text-policy border-policy/20 border",
                        isOverall && "text-white border-white/20 border"
                    )}>
                        {isCFO ? "Financial Viability" : isCMO ? "Market Impact" : isPolicy ? "Risk & Compliance" : "Executive Summary"}
                    </span>
                    <div className="text-4xl font-light text-white font-mono">
                        {feedback.score}<span className="text-lg text-gray-500">/100</span>
                    </div>
                </div>
                <h2 className="text-2xl font-serif text-white leading-relaxed">
                    "{feedback.summary}"
                </h2>
            </div>

            {/* Key Analysis Points */}
            <div className="grid gap-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Key Analysis</h3>
                <div className="grid gap-4">
                    {feedback.points.map((point, idx) => {
                        const isString = typeof point === 'string';
                        const text = isString ? point : point.text;
                        const source = isString ? null : point.source;

                        return (
                            <div key={idx} className={clsx(
                                "flex gap-4 p-4 rounded-lg border transition-colors",
                                source === 'cfo' ? "bg-cfo/10 border-cfo/20" :
                                    source === 'cmo' ? "bg-cmo/10 border-cmo/20" :
                                        source === 'policy' ? "bg-policy/10 border-policy/20" :
                                            "bg-white/5 border-white/5 hover:border-white/10"
                            )}>
                                <div className="flex-shrink-0 mt-1">
                                    {source === 'cfo' ? <Wallet size={20} className="text-cfo" /> :
                                        source === 'cmo' ? <TrendingUp size={20} className="text-cmo" /> :
                                            source === 'policy' ? <Shield size={20} className="text-policy" /> :
                                                (feedback.sentiment === 'critical' || feedback.sentiment === 'rejection' ? <AlertCircle className="text-red-500" size={20} /> :
                                                    feedback.sentiment === 'negative' ? <Info className="text-yellow-500" size={20} /> :
                                                        <CheckCircle2 className="text-green-500" size={20} />)
                                    }
                                </div>
                                <p className={clsx(
                                    "leading-relaxed font-light",
                                    source ? "text-gray-200" : "text-gray-300"
                                )}>{text}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recommendation Footer */}
            <div className={clsx(
                "mt-10 p-6 rounded-lg border-l-4",
                feedback.sentiment === 'positive' && "bg-green-500/10 border-green-500",
                (feedback.sentiment === 'critical' || feedback.sentiment === 'rejection') && "bg-red-500/10 border-red-500",
                feedback.sentiment === 'neutral' && "bg-gray-500/10 border-gray-500",
                feedback.sentiment === 'negative' && "bg-yellow-500/10 border-yellow-500",
            )}>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Final Recommendation</h4>
                <p className="text-lg font-medium text-white">
                    {feedback.sentiment === 'positive' && "Proceed with outlined strategy."}
                    {(feedback.sentiment === 'critical' || feedback.sentiment === 'rejection') && "Immediate revision required before visual."}
                    {feedback.sentiment === 'negative' && "Proceed with extreme caution."}
                    {feedback.sentiment === 'neutral' && "Further data required for definitive approval."}
                </p>
            </div>
        </motion.div>
    );
};
