import type { AgentFeedback } from "../components/AgentTab";

export interface DashboardResponse {
    transcript: string;
    tasks: string[];
    riskScore: number;
    isVetoed: boolean;
}

export const parseAgentResponse = (response: DashboardResponse): Record<string, AgentFeedback> => {
    // 1. Extract Sections via Regex (More Robust)
    // Matches **Header** followed by any whitespace, then content, until next header or end
    const cmoMatch = response.transcript.match(/\*\*(?:CMO|Chief Marketing).*?\*\*[\s\S]*?([\s\S]*?)(?=\*\*(?:CFO|Chief Financial|POLICY)|$)/i);
    const cfoMatch = response.transcript.match(/\*\*(?:CFO|Chief Financial).*?\*\*[\s\S]*?([\s\S]*?)(?=\*\*(?:CMO|Chief Marketing|POLICY)|$)/i);
    // Explicitly stop before "## Tasks" or new line with ##
    const policyMatch = response.transcript.match(/\*\*(?:POLICY|Risk|Compliance).*?\*\*[\s\S]*?([\s\S]*?)(?=\*\*(?:CMO|CFO)|##\s*Tasks|$)/i);

    const cmoText = cmoMatch && cmoMatch[1].trim().length > 0 ? cmoMatch[1].trim() : "Analysis pending... (Check API Response Format)";
    const cfoText = cfoMatch && cfoMatch[1].trim().length > 0 ? cfoMatch[1].trim() : "Analysis pending... (Check API Response Format)";
    const policyText = policyMatch && policyMatch[1].trim().length > 0 ? policyMatch[1].trim() : "Analysis pending... (Check API Response Format)";

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
    const extractPoints = (text: string) => text.split('. ').filter(s => s.length > 20).map(s => s.endsWith('.') ? s : s + '.');

    // Combine Agent Insights + Global Tasks for the Summary
    const summaryPoints: (string | { text: string; source: 'cfo' | 'cmo' | 'policy' })[] = [
        { text: cfoText.substring(0, 60) + (cfoText.length > 60 ? "..." : ""), source: 'cfo' },
        { text: cmoText.substring(0, 60) + (cmoText.length > 60 ? "..." : ""), source: 'cmo' },
        { text: policyText.substring(0, 60) + (policyText.length > 60 ? "..." : ""), source: 'policy' },
        ...response.tasks // Append the explicit tasks from API
    ];

    return {
        overall: {
            agentId: 'overall',
            summary: "Board Consensus: " + (compositeScore > 70 ? "Strategy Approved" : "Revision Needed"),
            points: summaryPoints,
            sentiment: response.isVetoed ? 'rejection' : (compositeScore > 70 ? 'positive' : 'neutral'),
            score: compositeScore
        },
        cfo: {
            agentId: 'cfo',
            summary: cfoText.split('. ')[0] + ".",
            points: extractPoints(cfoText).slice(0, 3), // Take top 3 sentences
            sentiment: cfoScore > 70 ? 'positive' : 'negative',
            score: cfoScore
        },
        cmo: {
            agentId: 'cmo',
            summary: cmoText.split('. ')[0] + ".",
            points: extractPoints(cmoText).slice(0, 3),
            sentiment: cmoScore > 70 ? 'positive' : 'neutral',
            score: cmoScore
        },
        policy: {
            agentId: 'policy',
            summary: policyText.split('. ')[0] + ".",
            points: extractPoints(policyText).slice(0, 3),
            sentiment: policyScore > 80 ? 'positive' : 'critical',
            score: policyScore
        }
    };
};
