import type { AgentFeedback } from "../components/AgentTab";

export interface DashboardResponse {
    transcript: string;
    tasks: string[];
    riskScore: number;
    isVetoed: boolean;
}

export const parseAgentResponse = (response: DashboardResponse): Record<string, AgentFeedback> => {
    // 1. Extract Sections via Regex
    const cmoMatch = response.transcript.match(/\*\*CMO.*?\*\*\n([\s\S]*?)(?=\*\*CFO|\*\*POLICY|$)/);
    const cfoMatch = response.transcript.match(/\*\*CFO.*?\*\*\n([\s\S]*?)(?=\*\*CMO|\*\*POLICY|$)/);
    const policyMatch = response.transcript.match(/\*\*POLICY.*?\*\*\n([\s\S]*?)(?=\*\*CMO|\*\*CFO|## Tasks|$)/);

    const cmoText = cmoMatch ? cmoMatch[1].trim() : "Analysis pending...";
    const cfoText = cfoMatch ? cfoMatch[1].trim() : "Analysis pending...";
    const policyText = policyMatch ? policyMatch[1].trim() : "Analysis pending...";

    // 2. Mock Sentiment/Score derivation based on global riskScore and keywords
    // In a real app, the LLM should return these per agent.
    // Here we distribute the global score logic.
    // Heuristic:
    const calculateScore = (text: string, risk: number) => {
        const positiveKeywords = ['growth', 'viral', 'strong', 'viable', 'high', 'clear'];
        const negativeKeywords = ['risk', 'avoid', 'concern', 'burn rate', 'caution'];

        let score = 100 - (risk * 8); // Base score
        positiveKeywords.forEach(k => { if (text.toLowerCase().includes(k)) score += 5; });
        negativeKeywords.forEach(k => { if (text.toLowerCase().includes(k)) score -= 5; });
        return Math.min(100, Math.max(0, score));
    };

    const cmoScore = calculateScore(cmoText, response.riskScore);
    const cfoScore = calculateScore(cfoText, response.riskScore);
    const policyScore = calculateScore(policyText, response.riskScore);

    const compositeScore = Math.round((cmoScore + cfoScore + policyScore) / 3);

    // 3. Extract points (sentences)
    const extractPoints = (text: string) => text.split('. ').filter(s => s.length > 10).map(s => s.endsWith('.') ? s : s + '.');

    return {
        overall: {
            agentId: 'overall',
            summary: "Board Consensus: " + (compositeScore > 70 ? "Strategy Approved" : "Revision Needed"),
            points: [
                { text: cfoText.substring(0, 50) + "...", source: 'cfo' },
                { text: cmoText.substring(0, 50) + "...", source: 'cmo' },
                { text: policyText.substring(0, 50) + "...", source: 'policy' }
            ],
            sentiment: response.isVetoed ? 'rejection' : (compositeScore > 70 ? 'positive' : 'neutral'),
            score: compositeScore
        },
        cfo: {
            agentId: 'cfo',
            summary: cfoText.split('.')[0] + ".",
            points: extractPoints(cfoText).slice(0, 3), // Take top 3 sentences
            sentiment: cfoScore > 70 ? 'positive' : 'negative',
            score: cfoScore
        },
        cmo: {
            agentId: 'cmo',
            summary: cmoText.split('.')[0] + ".",
            points: extractPoints(cmoText).slice(0, 3),
            sentiment: cmoScore > 70 ? 'positive' : 'neutral',
            score: cmoScore
        },
        policy: {
            agentId: 'policy',
            summary: policyText.split('.')[0] + ".",
            points: extractPoints(policyText).slice(0, 3),
            sentiment: policyScore > 80 ? 'positive' : 'critical',
            score: policyScore
        }
    };
};
