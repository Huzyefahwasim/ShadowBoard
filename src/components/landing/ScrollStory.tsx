import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const features = [
    {
        title: "Model the Unpredictable",
        description: "Simulate black swan events and market shifts before they happen. Our agents digest millions of data points to forecast outcomes with uncanny accuracy."
    },
    {
        title: "Consensus Algorithms",
        description: "The Boardroom doesn't just argue; it converges. Watch as the CFO, CMO, and Policy Director negotiate real-time trade-offs to reach an optimal strategic consensus."
    },
    {
        title: "Executive Synthesis",
        description: "Complex dialogues are distilled into actionable executive summaries. Get the bottom line without wading through the noise."
    }
];

export const ScrollStory = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={containerRef} className="relative bg-[#050505]">
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Visual Side (Left) */}
                    <div className="relative h-[600px] w-full bg-zinc-900/20 rounded-3xl border border-zinc-800 overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900/50 to-transparent" />

                        {/* Abstract Visual Representation */}
                        <div className="relative z-10 w-64 h-64">
                            <motion.div
                                style={{ rotate: useTransform(scrollYProgress, [0, 1], [0, 360]) }}
                                className="absolute inset-0 rounded-full border border-[#6EE7B7]/20 border-dashed"
                            />
                            <motion.div
                                style={{ rotate: useTransform(scrollYProgress, [0, 1], [360, 0]) }}
                                className="absolute inset-4 rounded-full border border-[#6EE7B7]/40 border-t-transparent"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 bg-[#6EE7B7]/10 rounded-full blur-2xl animate-pulse" />
                            </div>
                        </div>

                        {/* Floating Data Points */}
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute bg-[#6EE7B7] rounded-full"
                                style={{
                                    width: Math.random() * 4 + 2,
                                    height: Math.random() * 4 + 2,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0])
                                }}
                            />
                        ))}
                    </div>

                    {/* Text Side (Right) - Placeholder to reserve space for the scrolling text overlap */}
                    <div className="hidden lg:block" />
                </div>
            </div>

            {/* Scrolling Text Overlay */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-[-100vh]">
                <div className="hidden lg:block" /> {/* Spacer for Left Side */}

                <div className="flex flex-col gap-64 pt-32 pb-96">
                    {features.map((feature, index) => (
                        <FeatureBlock key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const FeatureBlock = ({ title, description }: { title: string, description: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-40% 0px -40% 0px" }}
            transition={{ duration: 0.8 }}
            className="p-8 rounded-3xl bg-black/60 backdrop-blur-md border border-zinc-800/50"
        >
            <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
            <p className="text-xl text-zinc-400 leading-relaxed font-light">{description}</p>
        </motion.div>
    );
};
