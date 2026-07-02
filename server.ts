import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client safely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Helper to generate content with exponential backoff retry and a fallback model if gemini-3.5-flash experiences high demand.
  async function generateContentWithRetry(params: {
    contents: any;
    config?: any;
    fallbackToLite?: boolean;
  }) {
    const maxRetries = 3;
    let delay = 1000;
    let lastError: any = null;

    // First, try with gemini-3.5-flash with retries on transient errors
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        const errorMessage = (error?.message || "").toLowerCase();
        const isTransient = 
          errorMessage.includes("503") || 
          errorMessage.includes("unavailable") || 
          errorMessage.includes("high demand") ||
          errorMessage.includes("temporary") ||
          error?.status === "UNAVAILABLE" ||
          error?.code === 503;

        if (isTransient && attempt < maxRetries) {
          console.warn(`[Gemini API] Transient error (503/UNAVAILABLE) on attempt ${attempt}. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        } else {
          break; // Exit retry loop to fall back or throw
        }
      }
    }

    // If fallback is enabled, try gemini-3.1-flash-lite
    if (params.fallbackToLite) {
      console.warn("[Gemini API] gemini-3.5-flash failed or hit 503 high demand after retries. Falling back to gemini-3.1-flash-lite...");
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (fallbackError: any) {
        console.error("[Gemini API] Fallback to gemini-3.1-flash-lite also failed:", fallbackError);
        throw fallbackError;
      }
    }

    throw lastError;
  }

  // API endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, agent } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request. 'messages' must be an array." });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured. Please add it to your secrets in Settings." });
      }

      // Map client messages to `@google/genai` expected format
      const contents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      let systemInstruction = "";

      if (agent === "somatic") {
        systemInstruction = `You are BeaconMind's Somatic Grounding Coach, a compassionate and expert somatic practitioner.
Your goal is to guide the user through physical grounding techniques, breathing paces, and body-scans directly inside the chat.
- Actively guide them through simple somatic tasks (e.g. "Take a breath for 4 seconds, I'll count with you", or "Let's do a quick physical touch check").
- Keep responses extremely clear, slow-paced, and calming.
- Keep paragraphs to 1-2 sentences maximum. Avoid long theoretical explanations about nervous system mechanics—guide them by *doing*.
- Encourage them to try the "Grounding Space" tab in this app for fully interactive, real-time timers and 5-4-3-2-1 tools.
- If they express severe distress, panic, or thoughts of self-harm, immediately provide emergency contacts: call or text 988 (Suicide & Crisis Lifeline) in a prominent separate section.`;
      } else if (agent === "navigator") {
        systemInstruction = `You are BeaconMind's Clinical Referral Navigator, an expert consultant designed to help users demystify the search for professional therapists.
Your focus is to help the user identify key specialties, formulate directory filters, prepare questions for consultation calls, and write customized therapist inquiry templates.
- Break down the process of finding a therapist into ultra-clear, actionable, low-stress mini-steps.
- Help them craft perfect inquiry letters (e.g. "Hi [Name], I am seeking support for [Issue]...").
- Keep your tone highly organized, encouraging, reassuring, and highly scannable using markdown.
- Ask at most one question at a time to help narrow down what they want in a provider.
- Encourage them to try the "Search Planner" tab in this app to generate and save a complete structured referral package.
- In case of acute crisis, immediately provide emergency details: Call or text 988.`;
      } else {
        systemInstruction = `You are BeaconMind's Empathetic Guide, a highly supportive, compassionate mental health companion.
Your ultimate goal is to lower the cognitive barrier to finding help. When people are overwhelmed, depressed, anxious, or burnt out, reading long paragraphs or filling out clinical forms is exhausting.
- Always speak in brief, comforting, and easy-to-read sentences. Keep paragraphs short (1-2 sentences maximum).
- Use simple markdown (bullet points, bold highlights) to keep things visually scannable.
- Keep your tone incredibly warm, gentle, reassuring, and objective. Never sound cold or overly clinical.
- Ask at most one gentle, open-ended question at a time to help them explore their needs, but do not make them feel interrogated.
- If they express thoughts of self-harm, distress, or crisis, immediately, gently, and clearly present emergency numbers: Call or text 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line). Always place this in a distinct, prominent section for safety.
- Encourage self-guided tools like the interactive breathing or grounding exercises, which are readily available as buttons in this app.`;
      }

      const response = await generateContentWithRetry({
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
        fallbackToLite: true
      });

      res.json({ content: response.text });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: error.message || "An error occurred during chat generation." });
    }
  });

  app.post("/api/simplify-search", async (req, res) => {
    try {
      const { feeling, insurance, mode, location, preferences } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured. Please add it to your secrets in Settings." });
      }

      const prompt = `Formulate a simplified, low-stress mental health therapist search helper plan for a person with the following attributes:
- Current state/feeling: ${feeling || "Not specified / overwhelmed"}
- Insurance status: ${insurance || "Not specified"}
- Preferred session mode: ${mode || "Not specified / open"}
- Location: ${location || "Not specified"}
- Personal preferences / specialties needed: ${preferences || "None specified"}

Focus on making the starting steps as frictionless as possible. Draft an extremely gentle, copy-pasteable email/message template they can send to inquire about a consult. Give them 3 precise, manageable questions to ask, and 3 high-impact keywords/filters for directories. Provide the response strictly matching the schema.`;

      const response = await generateContentWithRetry({
        contents: prompt,
        config: {
          systemInstruction: "You are an expert therapist matchmaking assistant and clinical navigator designed to turn the overwhelming task of finding a therapist into 3 simple steps.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 simple, low-effort action items to start the search."
              },
              emailTemplate: {
                type: Type.STRING,
                description: "A very short, low-pressure template email for contacting therapists. Leave placeholders like [Therapist Name] or [My Name]."
              },
              keyQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 straightforward questions to ask the therapist during a consultation call."
              },
              suggestedDirectoryKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 search filters or specialty keywords to type into directory search fields."
              }
            },
            required: ["actionPlan", "emailTemplate", "keyQuestions", "suggestedDirectoryKeywords"]
          }
        },
        fallbackToLite: true
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("Error in /api/simplify-search:", error);
      res.status(500).json({ error: error.message || "An error occurred during search plan generation." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
