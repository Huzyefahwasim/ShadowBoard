
import fs from 'fs';
import path from 'path';
// @ts-ignore
import pdf from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers to use cached models
env.allowLocalModels = false;
env.useBrowserCache = false;

// Simple interface for our document chunks
export interface DocumentChunk {
    content: string;
    metadata: Record<string, any>;
    embedding?: number[];
}

export class PolicyBot {
    private docs: DocumentChunk[] = [];
    private pipe: any = null;
    private isInitialized = false;
    private initializationPromise: Promise<void> | null = null;

    // Singleton instance
    private static instance: PolicyBot;

    private constructor() { }

    public static getInstance(): PolicyBot {
        if (!PolicyBot.instance) {
            PolicyBot.instance = new PolicyBot();
        }
        return PolicyBot.instance;
    }

    // Identify if we need to initialize
    public async ensureInitialized() {
        if (this.isInitialized) return;
        if (this.initializationPromise) return this.initializationPromise;

        this.initializationPromise = this.initialize();
        await this.initializationPromise;
    }

    private async getEmbedder() {
        if (!this.pipe) {
            console.log("Initializing embedding model (Xenova/all-MiniLM-L6-v2)...");
            this.pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
        return this.pipe;
    }

    private async embedText(text: string): Promise<number[]> {
        const embedder = await this.getEmbedder();
        const output = await embedder(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }

    private async initialize() {
        console.log("Initializing PolicyBot RAG engine...");

        const policyDir = path.join(process.cwd(), 'policies');
        if (!fs.existsSync(policyDir)) {
            console.log("Creating policies directory...");
            fs.mkdirSync(policyDir);
        }

        const files = fs.readdirSync(policyDir).filter(f => f.toLowerCase().endsWith('.pdf'));
        const rawDocs: { content: string, metadata: any }[] = [];

        if (files.length === 0) {
            console.log("No PDF policies found. Using default empty state.");
            // We don't need to do anything if empty, just keep docs empty
            // But the user script adds a dummy doc.
            rawDocs.push({
                content: "Knowledge base is empty.",
                metadata: { law_source: "NONE" }
            });
        } else {
            for (const file of files) {
                console.log(`Processing policy file: ${file}`);
                const filePath = path.join(policyDir, file);
                const buffer = fs.readFileSync(filePath);
                try {
                    const data = await pdf(buffer);
                    // Clean up text a bit (remove excessive newlines)
                    const cleanText = data.text.replace(/\n\s*\n/g, '\n');
                    rawDocs.push({
                        content: cleanText,
                        metadata: { law_source: file.replace('.pdf', '').toUpperCase() }
                    });
                } catch (e) {
                    console.error(`Failed to parse PDF ${file}:`, e);
                }
            }
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 900,
            chunkOverlap: 100,
        });

        const chunks = await splitter.createDocuments(
            rawDocs.map(d => d.content),
            rawDocs.map(d => d.metadata)
        );

        console.log(`Split into ${chunks.length} chunks. Generating embeddings...`);

        // Embed chunks sequentially to avoid memory pressure or race conditions
        for (const chunk of chunks) {
            try {
                const embedding = await this.embedText(chunk.pageContent);
                this.docs.push({
                    content: chunk.pageContent,
                    metadata: chunk.metadata,
                    embedding
                });
            } catch (e) {
                console.error("Error embedding chunk:", e);
            }
        }

        this.isInitialized = true;
        console.log(`PolicyBot initialized with ${this.docs.length} vectors.`);
    }

    private cosineSimilarity(a: number[], b: number[]) {
        let dot = 0;
        let magA = 0;
        let magB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    public async query(input: string, k: number = 3): Promise<{ answerContext: string, sources: string[] }> {
        await this.ensureInitialized();

        if (this.docs.length === 0) {
            return { answerContext: "", sources: [] };
        }

        const queryEmb = await this.embedText(input);

        const scored = this.docs
            .filter(d => d.embedding !== undefined)
            .map(doc => ({
                doc,
                score: this.cosineSimilarity(queryEmb, doc.embedding!)
            }));

        // Sort descending by score
        scored.sort((a, b) => b.score - a.score);

        const topK = scored.slice(0, k).map(s => s.doc);

        const contextParts = topK.map(doc => doc.content);
        const sources = [...new Set(topK.map(doc => doc.metadata.law_source))]; // Unique sources

        return {
            answerContext: contextParts.join("\n\n---\n\n"),
            sources
        };
    }
}

export const policyBot = PolicyBot.getInstance();
