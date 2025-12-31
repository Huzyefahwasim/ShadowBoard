import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { processIdea, getAppConfig, type ConversationTurn } from "./engine";
import { networkInterfaces } from "os";

const app = new Elysia()
  .use(cors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })) // Allows your frontend to talk to this backend
  .get("/", () => {
    const config = getAppConfig();
    return {
      message: "Sovereign Suite API",
      endpoints: {
        "POST /analyze": "Analyze a business idea with AI board of directors (returns complete result)",
        "POST /analyze/stream": "Streaming analysis - receive conversation turns in real-time as they happen",
        "GET /config": "Get current configuration (without sensitive data)",
        "GET /health": "Health check endpoint",
      },
      config: {
        model: config.model.model,
        provider: config.model.provider,
        temperature: config.model.temperature,
        personas: config.personas.map(p => ({ name: p.name, role: p.role })),
      },
    };
  })
  .get("/health", () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      server: "Sovereign Suite API",
    };
  })
  .get("/config", () => {
    const config = getAppConfig();
    return {
      model: {
        provider: config.model.provider,
        model: config.model.model,
        temperature: config.model.temperature,
        maxTokens: config.model.maxTokens,
      },
      personas: config.personas,
      rules: config.rules,
      policyContextLength: config.policyContext.length,
    };
  })
  .post("/analyze", async ({ body }) => {
    const config = getAppConfig();
    const startTime = Date.now();
    
    try {
      console.log(`[${new Date().toISOString()}] Starting analysis for idea: ${body.idea.substring(0, 50)}...`);
      
      // Build custom config override if provided
      const customConfig = body.config ? {
        model: {
          ...config.model,
          ...(body.config.model?.model && { model: body.config.model.model }),
          ...(body.config.model?.temperature !== undefined && { temperature: body.config.model.temperature }),
        }
      } : undefined;
      
      const result = await processIdea(body.idea, customConfig);
      const processingTime = Date.now() - startTime;
      
      console.log(`[${new Date().toISOString()}] Analysis completed in ${processingTime}ms with ${result.turns.length} turns`);
    
    // Extract risk level description
    const riskLevel = result.riskScore <= 3 ? 'low' : result.riskScore <= 6 ? 'medium' : result.riskScore <= 8 ? 'high' : 'critical';
    
    // Extract veto reason if present
    let vetoReason: string | null = null;
    if (result.isVetoed) {
      // Find the turn with the veto
      const vetoTurn = result.turns.find(turn => turn.message.includes(config.rules.vetoKeyword));
      if (vetoTurn) {
        vetoReason = vetoTurn.message.replace(config.rules.vetoKeyword, '').trim();
      }
    }
    
    // Parse persona contributions from turns
    const personaContributions: Record<string, string[]> = {};
    config.personas.forEach(persona => {
      const contributions = result.turns
        .filter(turn => turn.speaker === persona.name)
        .map(turn => turn.message);
      if (contributions.length > 0) {
        personaContributions[persona.name] = contributions;
      }
    });
    
    // Count tasks by category (simple heuristic: check for common keywords)
    const taskCategories = {
      technical: result.tasks?.filter((t: string) => /tech|code|develop|build|implement/i.test(t)).length || 0,
      business: result.tasks?.filter((t: string) => /market|business|revenue|customer|sales/i.test(t)).length || 0,
      legal: result.tasks?.filter((t: string) => /legal|compliance|policy|regulation|law/i.test(t)).length || 0,
      other: result.tasks?.filter((t: string) => {
        const lower = t.toLowerCase();
        return !/tech|code|develop|build|implement|market|business|revenue|customer|sales|legal|compliance|policy|regulation|law/i.test(lower);
      }).length || 0,
    };

    return {
      // Backward compatible fields (keep exact same structure)
      transcript: result.transcript,
      tasks: result.tasks || [],
      riskScore: result.riskScore,
      isVetoed: result.isVetoed,
      
      // New conversation structure
      conversation: {
        turns: result.turns,
        turnCount: result.turns.length,
        speakers: [...new Set(result.turns.map(t => t.speaker))],
      },
      
      // Additional detailed fields
      metadata: {
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime,
        model: customConfig?.model?.model || config.model.model,
        provider: config.model.provider,
        temperature: customConfig?.model?.temperature ?? config.model.temperature,
      },
      analysis: {
        riskLevel: riskLevel,
        riskBreakdown: {
          score: result.riskScore,
          level: riskLevel,
          description: riskLevel === 'low' ? 'Low risk - Proceed with confidence' :
                      riskLevel === 'medium' ? 'Medium risk - Proceed with caution' :
                      riskLevel === 'high' ? 'High risk - Significant concerns identified' :
                      'Critical risk - Major issues must be addressed',
        },
        taskSummary: {
          total: result.tasks?.length || 0,
          byCategory: taskCategories,
        },
        vetoDetails: result.isVetoed ? {
          isVetoed: true,
          reason: vetoReason,
          keyword: config.rules.vetoKeyword,
        } : {
          isVetoed: false,
        },
      },
      personas: {
        contributions: personaContributions,
        count: config.personas.length,
        names: config.personas.map(p => p.name),
      },
      originalIdea: body.idea,
    };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`[${new Date().toISOString()}] Error during analysis:`, error);
      
      return {
        error: true,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
      };
    }
  }, {
    body: t.Object({
      idea: t.String(),
      config: t.Optional(t.Object({
        model: t.Optional(t.Object({
          model: t.Optional(t.String()),
          temperature: t.Optional(t.Number()),
        })),
      })),
    }),
  })
  .post("/analyze/stream", async ({ body }) => {
    const config = getAppConfig();
    const startTime = Date.now();
    
    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        const sendEvent = (event: string, data: any) => {
          try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
            console.log(`[Stream] Sent event: ${event}`);
          } catch (error) {
            console.error(`[Stream] Error sending event ${event}:`, error);
          }
        };
        
        try {
          console.log(`[${new Date().toISOString()}] Starting streaming analysis for idea: ${body.idea.substring(0, 50)}...`);
          
          // Build custom config override if provided
          const customConfig = body.config ? {
            model: {
              ...config.model,
              ...(body.config.model?.model && { model: body.config.model.model }),
              ...(body.config.model?.temperature !== undefined && { temperature: body.config.model.temperature }),
            }
          } : undefined;
          
          // Send initial event immediately
          sendEvent("start", {
            timestamp: new Date().toISOString(),
            idea: body.idea,
          });
          
          // Small delay to ensure start event is flushed
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Process with streaming callback
          const result = await processIdea(body.idea, customConfig, async (turn: ConversationTurn) => {
            // Send each turn as it happens
            sendEvent("turn", turn);
          });
          
          const processingTime = Date.now() - startTime;
          
          // Extract risk level description
          const riskLevel = result.riskScore <= 3 ? 'low' : result.riskScore <= 6 ? 'medium' : result.riskScore <= 8 ? 'high' : 'critical';
          
          // Extract veto reason if present
          let vetoReason: string | null = null;
          if (result.isVetoed) {
            const vetoTurn = result.turns.find(turn => turn.message.includes(config.rules.vetoKeyword));
            if (vetoTurn) {
              vetoReason = vetoTurn.message.replace(config.rules.vetoKeyword, '').trim();
            }
          }
          
          // Parse persona contributions from turns
          const personaContributions: Record<string, string[]> = {};
          config.personas.forEach(persona => {
            const contributions = result.turns
              .filter(turn => turn.speaker === persona.name)
              .map(turn => turn.message);
            if (contributions.length > 0) {
              personaContributions[persona.name] = contributions;
            }
          });
          
          // Count tasks by category
          const taskCategories = {
            technical: result.tasks?.filter((t: string) => /tech|code|develop|build|implement/i.test(t)).length || 0,
            business: result.tasks?.filter((t: string) => /market|business|revenue|customer|sales/i.test(t)).length || 0,
            legal: result.tasks?.filter((t: string) => /legal|compliance|policy|regulation|law/i.test(t)).length || 0,
            other: result.tasks?.filter((t: string) => {
              const lower = t.toLowerCase();
              return !/tech|code|develop|build|implement|market|business|revenue|customer|sales|legal|compliance|policy|regulation|law/i.test(lower);
            }).length || 0,
          };
          
          // Send final complete event with all data
          sendEvent("complete", {
            transcript: result.transcript,
            tasks: result.tasks || [],
            riskScore: result.riskScore,
            isVetoed: result.isVetoed,
            conversation: {
              turns: result.turns,
              turnCount: result.turns.length,
              speakers: [...new Set(result.turns.map(t => t.speaker))],
            },
            metadata: {
              timestamp: new Date().toISOString(),
              processingTimeMs: processingTime,
              model: customConfig?.model?.model || config.model.model,
              provider: config.model.provider,
              temperature: customConfig?.model?.temperature ?? config.model.temperature,
            },
            analysis: {
              riskLevel: riskLevel,
              riskBreakdown: {
                score: result.riskScore,
                level: riskLevel,
                description: riskLevel === 'low' ? 'Low risk - Proceed with confidence' :
                            riskLevel === 'medium' ? 'Medium risk - Proceed with caution' :
                            riskLevel === 'high' ? 'High risk - Significant concerns identified' :
                            'Critical risk - Major issues must be addressed',
              },
              taskSummary: {
                total: result.tasks?.length || 0,
                byCategory: taskCategories,
              },
              vetoDetails: result.isVetoed ? {
                isVetoed: true,
                reason: vetoReason,
                keyword: config.rules.vetoKeyword,
              } : {
                isVetoed: false,
              },
            },
            personas: {
              contributions: personaContributions,
              count: config.personas.length,
              names: config.personas.map(p => p.name),
            },
            originalIdea: body.idea,
          });
          
          console.log(`[${new Date().toISOString()}] Streaming analysis completed in ${processingTime}ms with ${result.turns.length} turns`);
        } catch (error) {
          const processingTime = Date.now() - startTime;
          console.error(`[${new Date().toISOString()}] Error during streaming analysis:`, error);
          
          sendEvent("error", {
            error: true,
            message: error instanceof Error ? error.message : "Unknown error occurred",
            processingTimeMs: processingTime,
            timestamp: new Date().toISOString(),
          });
        } finally {
          controller.close();
        }
      },
    });
    
    // Return Response with proper headers for SSE
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Accel-Buffering": "no", // Disable buffering in nginx
      },
    });
  }, {
    body: t.Object({
      idea: t.String(),
      config: t.Optional(t.Object({
        model: t.Optional(t.Object({
          model: t.Optional(t.String()),
          temperature: t.Optional(t.Number()),
        })),
      })),
    }),
  })
  .listen({
    port: parseInt(process.env.PORT || "3000"),
    hostname: process.env.HOSTNAME || "0.0.0.0", // Listen on all interfaces
  });

// Get network IP address for display
function getNetworkIP(): string {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const addrs = interfaces[name];
    if (!addrs) continue;
    for (const iface of addrs) {
      // Handle both string and number family types (IPv4 can be "IPv4" or 4)
      const family = String(iface.family);
      if ((family === "IPv4" || family === "4") && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const networkIP = getNetworkIP();
const port = app.server?.port || 3000;

console.log(`🚀 Sovereign Suite Backend running:`);
console.log(`   Local:   http://localhost:${port}`);
console.log(`   Network: http://${networkIP}:${port}`);
console.log(`   Use the Network URL from your other laptop!`);