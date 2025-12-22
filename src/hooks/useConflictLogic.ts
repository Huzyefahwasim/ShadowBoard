import { useCallback } from 'react';
import type { Task } from '../components/SprintDrawer';

// Keywords that trigger score changes
const FRICTION_KEYWORDS = ['expensive', 'risky', 'burn rate', 'unsustainable', 'danger'];
const SYNERGY_KEYWORDS = ['growth', 'roi', 'opportunity', 'scale', 'profit'];

export const useConflictLogic = () => {
    const analyzeText = useCallback((text: string) => {
        let delta = 0;
        const lowerText = text.toLowerCase();

        // Check for VETO
        if (text.includes('[VETO]')) {
            return { delta: 0, veto: true, tasks: [] }; // Immediate return on Veto
        }

        // Sentiment Analysis
        FRICTION_KEYWORDS.forEach(word => {
            if (lowerText.includes(word)) delta += 10;
        });

        SYNERGY_KEYWORDS.forEach(word => {
            if (lowerText.includes(word)) delta -= 5;
        });

        // JSON Parsing for Tasks
        let tasks: Task[] = [];
        if (text.includes('```json')) {
            const match = text.match(/```json([\s\S]*?)```/);
            if (match && match[1]) {
                try {
                    const parsed = JSON.parse(match[1]);
                    if (Array.isArray(parsed)) {
                        tasks = parsed.map((t: any) => ({
                            id: Math.random().toString(36).substr(2, 9),
                            text: t.task || t.title || "Unknown Task",
                            completed: false
                        }));
                    }
                } catch (e) {
                    console.error("Failed to parse task JSON", e);
                }
            }
        }

        return { delta, veto: false, tasks };
    }, []);

    return { analyzeText };
};
