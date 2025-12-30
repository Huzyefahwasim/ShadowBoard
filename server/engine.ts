import Groq from "groq-sdk";
import { loadConfig, type AppConfig, type Persona } from "./config";
import { RedditService } from "./reddit";
import { policyBot } from "./rag";

let config: AppConfig | null = null;
let groqClient: Groq | null = null;

export interface ConversationTurn {
  speaker: string;
  message: string;
  timestamp: string;
  concerns?: string[];
}

export interface ConversationResult {
  transcript: string;
  turns: ConversationTurn[];
  tasks: string[];
  riskScore: number;
  isVetoed: boolean;
  finalSummary?: string;
}

function getConfig(): AppConfig {
  if (!config) {
    config = loadConfig();
  }
  return config;
}

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

async function callLLM(
  messages: Array<{ role: string; content: string }>,
  model: string,
  temperature: number,
  maxTokens?: number
): Promise<string> {
  try {
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: model,
      temperature: temperature,
      max_tokens: maxTokens,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";
    if (!content) {
      console.warn("Empty response from LLM");
    }
    return content;
  } catch (error) {
    console.error("Error calling LLM:", error);
    throw new Error(`LLM call failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function callPersonaAgent(
  persona: Persona,
  userIdea: string,
  conversationHistory: ConversationTurn[],
  policyContext: string,
  model: string,
  temperature: number,
  maxTokens?: number
): Promise<string> {
  const historyText = conversationHistory
    .map(turn => `[${turn.speaker}]: ${turn.message}`)
    .join("\n\n");

  let specificContext = policyContext;
  let ragSources: string[] = [];

  // LEGAL PERSONA RAG INTEGRATION
  if (persona.name === "POLICY PILOT") {
    try {
      // Use the user idea + last few turns for query context
      const queryContext = `${userIdea} ${conversationHistory.slice(-2).map(t => t.message).join(' ')}`;
      console.log(`[Engine] Querying PolicyBot for context...`);
      const ragResult = await policyBot.query(queryContext);

      if (ragResult.answerContext) {
        specificContext = `OFFICIAL POLICY DOCUMENTATION:\n${ragResult.answerContext}\n\nGENERAL GUIDELINES:\n${policyContext}`;
        ragSources = ragResult.sources;
        console.log(`[Engine] PolicyBot found context from: ${ragSources.join(', ')}`);
      }
    } catch (e) {
      console.error("[Engine] PolicyBot query failed:", e);
    }
  }

  const systemPrompt = `You are ${persona.name}, the ${persona.role}.
${persona.description}

Policy Context:
${specificContext}

IMPORTANT: Keep your response SHORT and CONVERSATIONAL - like you're speaking in a board meeting.
- 2-4 sentences maximum
- Be direct and to the point
- If you have concerns, state them briefly
- If you need another persona's input, mention their name briefly
- Speak naturally, as if talking to colleagues
- Do NOT write long paragraphs or detailed analysis
- Do NOT use brackets or special formatting - just speak naturally
${ragSources.length > 0 ? `- CITE SOURCES: You must mention these sources in your response: ${ragSources.join(', ')}` : ''}`;

  const userPrompt = `Business Idea: ${userIdea}

${conversationHistory.length > 0 ? `Conversation so far:\n${historyText}\n\n` : ""}
Provide your brief perspective on this idea. Keep it SHORT - 2-4 sentences maximum. Speak like you're in a board meeting.`;

  // Limit persona responses to 150 tokens max for shorter, more conversational responses
  const personaMaxTokens = 150;

  return await callLLM(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model,
    temperature,
    personaMaxTokens
  );
}

async function callOrchestrator(
  userIdea: string,
  conversationHistory: ConversationTurn[],
  availablePersonas: Persona[],
  lastResponse: string,
  lastSpeaker: string,
  model: string,
  temperature: number,
  maxTokens?: number
): Promise<{ nextSpeaker: string; reason: string }> {
  const historyText = conversationHistory
    .map(turn => `[${turn.speaker}]: ${turn.message}`)
    .join("\n\n");

  const personaList = availablePersonas.map(p => `- ${p.name} (${p.role}): ${p.description}`).join("\n");

  const systemPrompt = `You are the conversation orchestrator for a board of directors meeting.
Your job is to decide who should speak next based on the conversation flow and concerns raised.

Available personas:
${personaList}

Rules:
1. Analyze the last response and identify any concerns or questions raised
2. Determine which persona is best suited to address those concerns
3. If the last speaker raised concerns about their domain, they may need to elaborate
4. If concerns are about another domain, pass the turn to the relevant expert
5. If all concerns are addressed and the conversation is complete, respond with "END_CONVERSATION"
6. If there are policy violations or critical issues, ensure POLICY PILOT speaks
7. Keep the conversation focused and avoid unnecessary repetition
8. Keep responses SHORT - this is a conversation, not a report

IMPORTANT: Respond ONLY with valid JSON: {"nextSpeaker": "PERSONA_NAME", "reason": "brief explanation"}
Keep the reason to 1 sentence maximum.`;

  const userPrompt = `Business Idea: ${userIdea}

Conversation History:
${historyText || "No conversation yet"}

Last Response from [${lastSpeaker}]:
${lastResponse}

Who should speak next and why?`;

  const response = await callLLM(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model,
    temperature,
    maxTokens
  );

  // Try to parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const firstPersona = availablePersonas[0];
      if (firstPersona) {
        return {
          nextSpeaker: parsed.nextSpeaker || firstPersona.name,
          reason: parsed.reason || "Continuing conversation",
        };
      }
    } catch (e) {
      // Fallback: try to extract speaker name from text
    }
  }

  // Fallback: try to find persona name in response
  for (const persona of availablePersonas) {
    if (response.includes(persona.name)) {
      return {
        nextSpeaker: persona.name,
        reason: "Orchestrator selected based on response analysis",
      };
    }
  }

  // Default: rotate to next persona
  if (availablePersonas.length === 0) {
    throw new Error("No personas available");
  }
  const lastIndex = availablePersonas.findIndex(p => p.name === lastSpeaker);
  const nextIndex = (lastIndex + 1) % availablePersonas.length;
  const nextPersona = availablePersonas[nextIndex];
  if (!nextPersona) {
    throw new Error("No next persona available");
  }
  return {
    nextSpeaker: nextPersona.name,
    reason: "Rotating to next persona",
  };
}

function extractConcerns(response: string, persona: Persona): string[] {
  const concerns: string[] = [];
  const concernKeywords = ["concern", "issue", "problem", "risk", "worry", "question", "need", "should", "must"];

  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (concernKeywords.some(keyword => lower.includes(keyword))) {
      concerns.push(sentence.trim());
    }
  }

  return concerns;
}

export type TurnCallback = (turn: ConversationTurn) => void | Promise<void>;

export async function processIdea(
  userIdea: string,
  customConfig?: Partial<AppConfig>,
  onTurn?: TurnCallback
): Promise<ConversationResult> {
  const appConfig = getConfig();
  const finalConfig = customConfig
    ? { ...appConfig, ...customConfig, model: { ...appConfig.model, ...customConfig.model } }
    : appConfig;

  if (finalConfig.model.provider !== "groq") {
    throw new Error("Only Groq provider is currently supported for multi-agent conversations");
  }

  if (finalConfig.personas.length === 0) {
    throw new Error("No personas configured");
  }

  const turns: ConversationTurn[] = [];
  const maxTurns = 6; // Reduced from 12 to speed up responses
  const firstPersona = finalConfig.personas[0];
  if (!firstPersona) {
    throw new Error("No personas available");
  }
  let currentSpeaker = firstPersona.name; // Start with first persona
  let isVetoed = false;
  let conversationEnded = false;

  console.log(`Starting conversation with ${finalConfig.personas.length} personas, max ${maxTurns} turns`);

  // Initial turn: first persona speaks

  // Reddit Search Integration
  let redditContext = "";
  try {
    // Only search if the idea is long enough to have keywords, otherwise just use the whole string
    // Simple keyword extraction: take first 5 meaningful words or the whole thing if short
    const searchTerms = userIdea.split(" ").slice(0, 10).join(" ");
    console.log(`[Engine] Fetching Reddit data for: ${searchTerms}...`);
    const redditPosts = await RedditService.searchRelevantDiscussions(searchTerms);
    redditContext = RedditService.formatForContext(redditPosts);
    console.log(`[Engine] Reddit search found ${redditPosts.length} posts`);
  } catch (err) {
    console.error("[Engine] Reddit search failed:", err);
  }

  // update userIdea with Reddit context for subsequent turns so all agents see it
  const userIdeaWithContext = `${userIdea}\n\n${redditContext}`;

  // Initial turn: first persona speaks
  console.log(`[Turn 0] ${currentSpeaker} speaking...`);
  const firstResponse = await callPersonaAgent(
    firstPersona,
    userIdeaWithContext,
    turns,
    finalConfig.policyContext,
    finalConfig.model.model,
    finalConfig.model.temperature,
    finalConfig.model.maxTokens
  );
  console.log(`[Turn 0] ${currentSpeaker} completed`);


  const firstConcerns = extractConcerns(firstResponse, firstPersona);
  const firstTurn: ConversationTurn = {
    speaker: currentSpeaker,
    message: firstResponse,
    timestamp: new Date().toISOString(),
    concerns: firstConcerns,
  };
  turns.push(firstTurn);

  // Notify callback of first turn
  if (onTurn) {
    await onTurn(firstTurn);
  }

  // Check for veto in first response
  if (firstResponse.includes(finalConfig.rules.vetoKeyword)) {
    isVetoed = true;
    conversationEnded = true;
  }

  // Continue conversation with orchestrator managing turns
  for (let turn = 1; turn < maxTurns && !conversationEnded; turn++) {
    const lastTurn = turns[turns.length - 1];
    if (!lastTurn) {
      break; // Safety check
    }

    // After 3 turns, use simpler rotation instead of orchestrator to speed things up
    let orchestratorDecision: { nextSpeaker: string; reason: string };

    if (turn <= 3) {
      // Use orchestrator for first few turns
      console.log(`[Turn ${turn}] Orchestrator deciding next speaker...`);
      try {
        orchestratorDecision = await callOrchestrator(
          userIdeaWithContext, // Use context-enhanced idea
          turns,
          finalConfig.personas,
          lastTurn.message,
          lastTurn.speaker,
          finalConfig.model.model,
          finalConfig.model.temperature,
          finalConfig.model.maxTokens
        );
        console.log(`[Turn ${turn}] Orchestrator selected: ${orchestratorDecision.nextSpeaker} - ${orchestratorDecision.reason}`);
      } catch (error) {
        console.warn(`[Turn ${turn}] Orchestrator failed, using rotation:`, error);
        // Fallback to rotation
        const lastIndex = finalConfig.personas.findIndex(p => p.name === lastTurn.speaker);
        const fallbackIndex = (lastIndex + 1) % finalConfig.personas.length;
        const fallbackPersona = finalConfig.personas[fallbackIndex];
        if (!fallbackPersona) {
          break;
        }
        orchestratorDecision = {
          nextSpeaker: fallbackPersona.name,
          reason: "Rotation fallback after orchestrator error",
        };
      }
    } else {
      // Simple rotation after initial turns
      const lastIndex = finalConfig.personas.findIndex(p => p.name === lastTurn.speaker);
      const nextIndex = (lastIndex + 1) % finalConfig.personas.length;
      const nextPersona = finalConfig.personas[nextIndex];
      if (!nextPersona) {
        break;
      }
      orchestratorDecision = {
        nextSpeaker: nextPersona.name,
        reason: "Rotating to next persona",
      };
      console.log(`[Turn ${turn}] Using rotation: ${orchestratorDecision.nextSpeaker}`);
    }

    // Check if conversation should end
    if (orchestratorDecision.nextSpeaker === "END_CONVERSATION" ||
      orchestratorDecision.reason.includes("END") ||
      orchestratorDecision.reason.includes("complete")) {
      conversationEnded = true;
      break;
    }

    // Find the next persona
    const nextPersona = finalConfig.personas.find(p => p.name === orchestratorDecision.nextSpeaker);
    if (!nextPersona) {
      // Fallback: rotate to next persona
      const lastIndex = finalConfig.personas.findIndex(p => p.name === lastTurn.speaker);
      const fallbackIndex = (lastIndex + 1) % finalConfig.personas.length;
      const fallbackPersona = finalConfig.personas[fallbackIndex];
      if (!fallbackPersona) {
        break; // Safety check
      }
      currentSpeaker = fallbackPersona.name;
    } else {
      currentSpeaker = nextPersona.name;
    }

    // Next persona speaks
    let persona = finalConfig.personas.find(p => p.name === currentSpeaker);
    if (!persona) {
      persona = firstPersona;
    }
    console.log(`[Turn ${turn}] ${currentSpeaker} speaking...`);
    const response = await callPersonaAgent(
      persona,
      userIdeaWithContext, // Use context-enhanced idea
      turns,
      finalConfig.policyContext,
      finalConfig.model.model,
      finalConfig.model.temperature,
      finalConfig.model.maxTokens
    );
    console.log(`[Turn ${turn}] ${currentSpeaker} completed`);

    const concerns = extractConcerns(response, persona);
    const newTurn: ConversationTurn = {
      speaker: currentSpeaker,
      message: response,
      timestamp: new Date().toISOString(),
      concerns: concerns,
    };
    turns.push(newTurn);

    // Notify callback of new turn
    if (onTurn) {
      await onTurn(newTurn);
    }

    // Check for veto
    if (response.includes(finalConfig.rules.vetoKeyword)) {
      isVetoed = true;
      conversationEnded = true;
    }

    // Early exit: if all personas have spoken at least once and we have at least 3 turns
    if (turns.length >= finalConfig.personas.length && turns.length >= 3) {
      const uniqueSpeakers = new Set(turns.map(t => t.speaker));
      // If all personas have spoken, check for completion signals
      if (uniqueSpeakers.size >= finalConfig.personas.length) {
        const recentTurns = turns.slice(-2);
        const completionIndicators = ["agree", "consensus", "conclusion", "summary", "final", "complete", "done"];
        const lastMessages = recentTurns.map(t => t.message.toLowerCase()).join(" ");
        if (completionIndicators.some(indicator => lastMessages.includes(indicator))) {
          console.log("Conversation ending: completion indicators found");
          conversationEnded = true;
        } else if (turns.length >= finalConfig.personas.length * 2) {
          // Force end after 2 rounds
          console.log("Conversation ending: reached maximum rounds");
          conversationEnded = true;
        }
      }
    }
  }

  // Generate final summary and extract tasks/risk score
  const transcript = turns.map(t => `[${t.speaker}]: ${t.message}`).join("\n\n");

  console.log(`Extracting tasks and risk score from ${turns.length} turns...`);

  // Call LLM to extract tasks and risk score from conversation
  const summaryPrompt = `Analyze this board of directors conversation and extract:
1. A list of actionable tasks
2. A risk score from 1-10

Conversation:
${transcript}

Respond with ONLY a JSON object: {"tasks": ["task1", "task2"], "risk_score": 5}`;

  const summaryResponse = await callLLM(
    [
      {
        role: "system",
        content: "You are a conversation analyzer. Extract tasks and risk score from board discussions. Respond only with valid JSON.",
      },
      { role: "user", content: summaryPrompt },
    ],
    finalConfig.model.model,
    finalConfig.model.temperature,
    finalConfig.model.maxTokens
  );

  console.log("Summary extraction completed");

  // Parse tasks and risk score
  const jsonMatch = summaryResponse.match(/\{[\s\S]*\}/);
  let tasks: string[] = [];
  let riskScore = 5;

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      tasks = parsed.tasks || [];
      riskScore = parsed.risk_score || 5;
    } catch (e) {
      // Fallback parsing
    }
  }

  const result: ConversationResult = {
    transcript,
    turns,
    tasks,
    riskScore,
    isVetoed,
  };

  return result;
}

// Export config getter for external use
export function getAppConfig(): AppConfig {
  return getConfig();
}

// Allow reloading config (useful for development or config updates)
export function reloadConfig(): void {
  config = null;
  loadConfig();
}