import { motion } from 'framer-motion';
import { User, Bell } from 'lucide-react';

export const SettingsView = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto w-full h-full overflow-y-auto pb-20 pr-2"
        >
            <h1 className="text-3xl font-medium text-white mb-8 sticky top-0 bg-[#0A0A0C]/95 backdrop-blur z-10 py-4">Settings</h1>

            {/* Profile Settings */}
            <div className="card-dark p-8 mb-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-zinc-900 rounded-xl">
                        <User className="text-[#6EE7B7]" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-white">Profile</h2>
                        <p className="text-zinc-500 text-sm">Update your personal information and preferences.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Full Name</label>
                        <input type="text" defaultValue="Alex Rivera" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6EE7B7] transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Email Address</label>
                        <input type="email" defaultValue="alex@example.com" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6EE7B7] transition-colors" />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="card-dark p-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-zinc-900 rounded-xl">
                        <Bell className="text-[#6EE7B7]" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-white">Notifications</h2>
                        <p className="text-zinc-500 text-sm">Configure how you want to be alerted by your agents.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {['Analysis Completed', 'Risk Alerts', 'Weekly Digest'].map((item) => (
                        <div key={item} className="flex items-center justify-between py-2 border-b border-zinc-900 last:border-0">
                            <span className="text-zinc-300">{item}</span>
                            <div className="w-10 h-6 bg-[#6EE7B7] rounded-full relative cursor-pointer">
                                <div className="absolute top-1 right-1 w-4 h-4 bg-black rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
