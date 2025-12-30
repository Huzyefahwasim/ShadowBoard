import React, { useState } from 'react';
import { Send } from 'lucide-react';
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
                className="h-full flex flex-col"
            >
                <form onSubmit={handleSubmit} className="relative flex-1 flex flex-col">
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="Type your strategic scenario..."
                        className="w-full flex-1 bg-transparent border-none p-0 text-white placeholder-zinc-600 focus:ring-0 resize-none font-sans text-xl leading-relaxed"
                        disabled={isAnalyzing}
                    />

                    <div className="mt-4 flex justify-between items-center border-t border-white/10 pt-4">
                        <span className="text-xs text-zinc-500 font-medium">
                            {idea.length} chars
                        </span>
                        <button
                            type="submit"
                            disabled={!idea.trim() || isAnalyzing}
                            className="group relative flex items-center gap-2 px-6 py-2 bg-[#6EE7B7] text-black rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isAnalyzing ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Analyzing
                                    </>
                                ) : (
                                    <>
                                        <span>Simulate</span>
                                        <Send size={14} />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
