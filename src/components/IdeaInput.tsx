import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface IdeaInputProps {
    onSubmit: (idea: string) => void;
    isAnalyzing: boolean;
}

export const IdeaInput = ({ onSubmit, isAnalyzing }: IdeaInputProps) => {
    const [idea, setIdea] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) {
            onSubmit(idea);
        }
    };

    return (
        <div className="w-full mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border rounded-xl p-6 shadow-2xl"
            >
                <div className="mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-cfo" />
                    <h3 className="text-xl font-semibold text-white tracking-tight">Proposal Submission</h3>
                </div>

                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="Describe your strategic initiative... (e.g., 'Expand into the APAC market with a subscription model')"
                        className="w-full h-32 bg-background border border-border rounded-lg p-4 text-[#EDEDED] placeholder-[#A1A1AA] focus:outline-none focus:border-cmo focus:ring-1 focus:ring-cmo/20 resize-none font-sans text-lg transition-all"
                        disabled={isAnalyzing}
                    />

                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={!idea.trim() || isAnalyzing}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Consulting Board...
                                </span>
                            ) : (
                                <>
                                    <span>Submit to Board</span>
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
