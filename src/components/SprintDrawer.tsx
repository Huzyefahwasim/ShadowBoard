import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, X } from 'lucide-react';
import clsx from 'clsx';

export type Task = {
    id: string;
    text: string;
    completed: boolean;
};

interface SprintDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
}

export const SprintDrawer = ({ isOpen, onClose, tasks }: SprintDrawerProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f0f11] border-l border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cmo/20 text-cmo rounded">
                                    <CheckSquare size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Actionable Sprint</h2>
                                    <p className="text-xs text-gray-400">Generated from debate resolution</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {tasks.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10">
                                    No tasks generated yet. <br /> Wait for the 'Resolution' phase.
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <SprintTaskItem key={task.id} task={task} />
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <button className="w-full py-3 bg-gradient-to-r from-cmo to-policy rounded-lg font-bold text-white hover:opacity-90 transition-opacity">
                                Export to Jira
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Task Item with Glow Tracing effect
const SprintTaskItem = ({ task }: { task: Task }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!itemRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={itemRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group rounded-xl p-[1px] overflow-hidden"
        >
            {/* Glow Border */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-cmo/50 to-policy/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    maskImage: isHovered
                        ? `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`
                        : 'none',
                    WebkitMaskImage: isHovered
                        ? `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`
                        : 'none',
                }}
            />
            {/* Also a static subtle border */}
            <div className="absolute inset-0 border border-white/10 rounded-xl" />

            <div className="relative bg-[#18181b] rounded-xl p-4 flex items-start gap-4 z-10 transition-colors group-hover:bg-[#202025]">
                <div className={clsx(
                    "mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                    task.completed ? "bg-green-500 border-green-500" : "border-gray-600 group-hover:border-cmo"
                )}>
                    {task.completed && <CheckSquare size={12} className="text-black" />}
                </div>
                <p className={clsx("text-sm", task.completed ? "text-gray-500 line-through" : "text-gray-200")}>
                    {task.text}
                </p>
            </div>
        </div>
    );
};
