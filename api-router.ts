import { Router, json } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// Middleware to parse JSON bodies specifically for our API router
router.use(json({ limit: '50mb' }));

let aiClient: GoogleGenAI | null = null;

/**
 * Lazily initialize the Google Gen AI client to prevent startup crashes if GEMINI_API_KEY is not defined yet.
 */
function getAiClient(apiKeyOverride?: string): GoogleGenAI {
  if (apiKeyOverride) {
    return new GoogleGenAI({
      apiKey: apiKeyOverride,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6J5Nnog2PkYMpWFrSSHuANUXQcpDXD-rjfiJv_3yjPBSQ';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Please add it to the Secrets panel in Settings.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Check key availability
router.get('/config', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ hasKey });
});

// Prompt generation endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, temperature, useSearchGrounding, model, attachments } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const ai = getAiClient(req.headers['x-api-key'] as string);
    const config: any = {};

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (temperature !== undefined) {
      config.temperature = Number(temperature);
    }
    if (useSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const selectedModel = model || 'gemini-2.5-flash';

    // Build contents with attachments if present
    let contents: any = prompt;
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const parts: any[] = [{ text: prompt }];
      for (const att of attachments) {
        if (att.base64) {
          parts.push({
            inlineData: {
              mimeType: att.type,
              data: att.base64,
            },
          });
        } else if (att.textContent) {
          parts.push({
            text: `\n\n[Attached File: ${att.name}]\n${att.textContent}\n`,
          });
        }
      }
      contents = parts;
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSupports = response.candidates?.[0]?.groundingMetadata?.groundingSupports || [];

    res.json({
      text,
      grounding: {
        chunks: groundingChunks,
        supports: groundingSupports,
      },
    });
  } catch (error: any) {
    console.error('API /generate Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred while generating content.' });
  }
});

// Stateful or stateless chat endpoint (takes full chat message list history)
router.post('/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, useSearchGrounding, model, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages history array is required' });
      return;
    }

    const ai = getAiClient(req.headers['x-api-key'] as string);
    const config: any = {};

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (temperature !== undefined) {
      config.temperature = Number(temperature);
    }
    if (useSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const selectedModel = model || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: messages,
      config,
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text,
      grounding: {
        chunks: groundingChunks,
      },
    });
  } catch (error: any) {
    console.error('API /chat Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during chat generation.' });
  }
});

export default router;
