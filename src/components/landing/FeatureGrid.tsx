import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, Users } from 'lucide-react';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export const FeatureGrid = () => {
    return (
        <section className="py-32 px-6 bg-[#050505]">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Precision Engineered <br />
                        <span className="text-zinc-500">Boardroom Dynamics</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                    {/* Card 1: Persona Simulation (Large, Spans 2 rows if needed) */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="group relative md:col-span-1 md:row-span-2 rounded-3xl bg-zinc-900/30 border border-zinc-800 p-8 overflow-hidden hover:border-[#6EE7B7]/50 transition-colors duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />

                        {/* Animated Icon Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -10, 0],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                        duration: 3 + i,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="h-24 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center"
                                >
                                    <Users size={24} className="text-[#6EE7B7]" />
                                </motion.div>
                            ))}
                        </div>

                        <div className="relative z-20 mt-auto">
                            <div className="w-12 h-12 rounded-full bg-[#6EE7B7]/10 flex items-center justify-center mb-4">
                                <Users className="text-[#6EE7B7]" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Multi-Agent Simulation</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Run scenarios against a triad of specialized AI personas (CFO, CMO, Policy) to uncover blind spots.
                            </p>
                        </div>
                    </motion.div>

                    {/* Card 2: Real-time Analysis (Top Right) */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="group relative md:col-span-2 rounded-3xl bg-zinc-900/30 border border-zinc-800 p-8 overflow-hidden hover:border-[#6EE7B7]/50 transition-colors duration-500 min-h-[300px]"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                            <TrendingUp size={120} className="text-[#6EE7B7]" />
                        </div>

                        <div className="relative z-20 h-full flex flex-col justify-end">
                            <div className="w-12 h-12 rounded-full bg-[#6EE7B7]/10 flex items-center justify-center mb-4">
                                <Zap className="text-[#6EE7B7]" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Instant Strategic Scoring</h3>
                            <p className="text-zinc-400 leading-relaxed max-w-md">
                                Get quantitative feedback on your proposals with a composite viability index calculated in real-time.
                            </p>
                        </div>
                    </motion.div>

                    {/* Card 3: Security / Risk (Bottom Right) */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="group relative md:col-span-2 rounded-3xl bg-zinc-900/30 border border-zinc-800 p-8 overflow-hidden hover:border-[#6EE7B7]/50 transition-colors duration-500"
                    >
                        {/* Scanline Effect */}
                        <motion.div
                            animate={{ top: ['0%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6EE7B7] to-transparent opacity-50 z-10"
                        />

                        <div className="relative z-20">
                            <div className="w-12 h-12 rounded-full bg-[#6EE7B7]/10 flex items-center justify-center mb-4">
                                <Shield className="text-[#6EE7B7]" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Uncompromising Security</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Enterprise-grade encryption ensures your strategic data remains strictly confidential.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
