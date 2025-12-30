import { useState } from 'react';
import { Layout, type TabId } from '../components/Layout';
import { Boardroom } from '../components/Boardroom';
import { AnalyticsView } from '../components/AnalyticsView';
import { SettingsView } from '../components/SettingsView';
import { motion, AnimatePresence } from 'framer-motion';

export function Dashboard() {
    const [currentTab, setCurrentTab] = useState<TabId>('board');

    return (
        <Layout activeTab={currentTab} onTabChange={setCurrentTab}>
            <div className="w-full h-full flex flex-col overflow-hidden px-4 lg:px-8">
                {/* Main Content Area with Transitions */}
                <section className="flex-1 min-h-0 relative">
                    <AnimatePresence mode="wait">
                        {currentTab === 'board' && (
                            <motion.div
                                key="board"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <Boardroom />
                            </motion.div>
                        )}

                        {currentTab === 'analytics' && <AnalyticsView key="analytics" />}

                        {currentTab === 'settings' && <SettingsView key="settings" />}
                    </AnimatePresence>
                </section>
            </div>
        </Layout>
    );
}
