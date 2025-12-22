export interface AnalyzeResponse {
    transcript: string;
    tasks: string[];
    riskScore: number;
    isVetoed: boolean;
}

export interface HealthResponse {
    status: "ok";
    timestamp: string;
    server: string;
}

export interface ConfigResponse {
    model: {
        provider: string;
        model: string;
        temperature: number;
        maxTokens: number | null;
    };
    personas: Array<{
        name: string;
        role: string;
        description: string;
    }>;
    rules: {
        vetoKeyword: string;
        jsonOutputRequired: boolean;
    };
    policyContextLength: number;
}

export interface AnalyzeRequest {
    idea: string;
    config?: {
        model?: {
            model?: string;
            temperature?: number;
        };
    };
}
