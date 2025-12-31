import { readFileSync } from "fs";
import { join } from "path";

export interface Persona {
  name: string;
  role: string;
  description: string;
}

export interface ModelConfig {
  provider: "groq" | "openai" | "anthropic";
  model: string;
  temperature: number;
  maxTokens?: number;
}

export interface AppConfig {
  model: ModelConfig;
  personas: Persona[];
  policyContext: string;
  systemPromptTemplate: string;
  rules: {
    vetoKeyword: string;
    jsonOutputRequired: boolean;
  };
}

const DEFAULT_PERSONAS: Persona[] = [
  {
    name: "CMO",
    role: "Chief Marketing Officer",
    description: "Focused on viral growth and 'vibe'"
  },
  {
    name: "CFO",
    role: "Chief Financial Officer",
    description: "Focused on ROI, burn rate, and cutting costs"
  },
  {
    name: "POLICY PILOT",
    role: "Legal Guardian",
    description: "Ensures compliance with regulations and policies"
  }
];

const DEFAULT_POLICY_CONTEXT = `
- EU AI ACT 2026: Prohibits untargeted scraping of facial images. Requires labels for deepfakes/AI text.
- PRIVACY: All AI apps must have a 'Human-in-the-loop' for financial decisions.
- TAX: Digital solopreneur tax (v1.2) applies to cross-border AI services.
`.trim();

const DEFAULT_SYSTEM_PROMPT_TEMPLATE = `You are a Synthetic Board of Directors for a solopreneur.
Respond as {{personaCount}} distinct personas:
{{personas}}

STRICT RULES:
- If any persona suggests something violating policy, the POLICY PILOT must start with "{{vetoKeyword}}" and explain why.
- ALWAYS end with a JSON block: {"tasks": ["task1", "task2"], "risk_score": 1-10}`;

function loadPolicyContext(): string {
  // Try to load from file first
  const policyFile = process.env.POLICY_FILE || "policies.txt";
  try {
    const policyPath = join(process.cwd(), policyFile);
    return readFileSync(policyPath, "utf-8").trim();
  } catch {
    // Fall back to environment variable
    if (process.env.POLICY_CONTEXT) {
      return process.env.POLICY_CONTEXT;
    }
    // Fall back to default
    return DEFAULT_POLICY_CONTEXT;
  }
}

function loadPersonas(): Persona[] {
  const personasFile = process.env.PERSONAS_FILE;
  if (personasFile) {
    try {
      const personasPath = join(process.cwd(), personasFile);
      const content = readFileSync(personasPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load personas from ${personasFile}, using defaults:`, error);
    }
  }
  return DEFAULT_PERSONAS;
}

function buildSystemPrompt(personas: Persona[], policyContext: string, vetoKeyword: string): string {
  const personaList = personas
    .map((p, i) => `${i + 1}. [${p.name}]: ${p.description}`)
    .join("\n");

  return DEFAULT_SYSTEM_PROMPT_TEMPLATE
    .replace("{{personaCount}}", personas.length.toString())
    .replace("{{personas}}", personaList)
    .replace("{{vetoKeyword}}", vetoKeyword) + `\n\nPolicy Context:\n${policyContext}`;
}

export function loadConfig(): AppConfig {
  const personas = loadPersonas();
  const policyContext = loadPolicyContext();
  const vetoKeyword = process.env.VETO_KEYWORD || "!! VETO !!";

  const modelConfig: ModelConfig = {
    provider: (process.env.AI_PROVIDER as ModelConfig["provider"]) || "groq",
    model: process.env.AI_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: parseFloat(process.env.AI_TEMPERATURE || "0.6"),
    maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : undefined,
  };

  const systemPrompt = buildSystemPrompt(personas, policyContext, vetoKeyword);

  return {
    model: modelConfig,
    personas,
    policyContext,
    systemPromptTemplate: systemPrompt,
    rules: {
      vetoKeyword,
      jsonOutputRequired: process.env.JSON_OUTPUT_REQUIRED !== "false",
    },
  };
}

