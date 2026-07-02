import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/generate", async (req, res) => {
    try {
      const { idea, tone, imageSize, aspectRatio, mediaData, mediaMimeType } = req.body;

      if (!idea && !mediaData) {
        return res.status(400).json({ error: "Idea or media is required" });
      }

      const safeTone = tone || "professional";
      const safeSize = imageSize || "1K";
      const userAspectRatio = aspectRatio || "Auto";

      const getRatio = (platform: string) => {
        if (userAspectRatio !== "Auto") return userAspectRatio;
        if (platform === "linkedin") return "16:9";
        if (platform === "twitter") return "16:9";
        if (platform === "instagram") return "1:1";
        return "1:1";
      };

      // 1. Generate Text
      const textContents: any[] = [
        { text: `Draft 3 social media posts for the following idea: "${idea}". The tone should be ${safeTone}.\nCreate 1 post for LinkedIn (long-form, engaging, professional), 1 for Twitter/X (short & punchy, under 280 characters), and 1 for Instagram (visual-focused with hashtags).\nReturn JSON with the following structure: { "linkedin": "...", "twitter": "...", "instagram": "..." }` }
      ];

      if (mediaData && mediaMimeType) {
        textContents.push({
          inlineData: {
            data: mediaData.split(',')[1] || mediaData,
            mimeType: mediaMimeType
          }
        });
      }

      const textPromise = ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: textContents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              linkedin: { type: Type.STRING },
              twitter: { type: Type.STRING },
              instagram: { type: Type.STRING },
            },
            required: ["linkedin", "twitter", "instagram"],
          },
        },
      }).then(response => {
        const jsonStr = response.text || "{}";
        
        let parsed = { linkedin: "", twitter: "", instagram: "" };
        try {
          const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) || jsonStr.match(/([\{\[][\s\S]*[\}\]])/);
          if (jsonMatch) {
             parsed = JSON.parse(jsonMatch[1]);
          } else {
             parsed = JSON.parse(jsonStr);
          }
        } catch (e) {
          console.error("Failed to parse text JSON:", e);
        }
        return parsed;
      });

      // 2. Generate Images
      const generateImage = async (platform: string, promptSuffix: string) => {
        try {
          const interaction = await ai.interactions.create({
            model: 'gemini-3.1-flash-image-preview',
            input: `A high quality image to accompany a ${platform} post about: ${idea}. ${promptSuffix}`,
            response_modalities: ['image'],
            generation_config: {
              image_config: {
                aspect_ratio: getRatio(platform),
                image_size: safeSize,
              },
            },
          });
          
          for (const step of interaction.steps) {
            if (step.type === 'model_output') {
              const imageContent = step.content?.find(c => c.type === 'image');
              if (imageContent?.data) {
                const mimeType = imageContent.mime_type || 'image/jpeg';
                return `data:${mimeType};base64,${imageContent.data}`;
              }
            }
          }
        } catch (error: any) {
          console.error(`Image generation for ${platform} failed:`, error.message);
        }
        return null;
      };

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      const textResult = await textPromise;
      const linkedinImg = await generateImage("LinkedIn", "Keep it professional, engaging, and suitable for a business network.");
      await delay(2000);
      const twitterImg = await generateImage("Twitter", "Keep it punchy, bold, and attention-grabbing.");
      await delay(2000);
      const instagramImg = await generateImage("Instagram", "Keep it highly visual, aesthetic, and vibrant.");

      res.json({
        linkedin: { text: textResult.linkedin, image: linkedinImg },
        twitter: { text: textResult.twitter, image: twitterImg },
        instagram: { text: textResult.instagram, image: instagramImg },
      });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to generate content. Ensure your API key is valid." });
    }
  });

  app.post("/api/regenerate", async (req, res) => {
    try {
      const { idea, tone, imageSize, aspectRatio, platform } = req.body;

      if (!idea || !platform) {
        return res.status(400).json({ error: "Idea and platform are required" });
      }

      const safeTone = tone || "professional";
      const safeSize = imageSize || "1K";
      const userAspectRatio = aspectRatio || "Auto";

      const getRatio = (platformName: string) => {
        if (userAspectRatio !== "Auto") return userAspectRatio;
        if (platformName === "linkedin") return "16:9";
        if (platformName === "twitter") return "16:9";
        if (platformName === "instagram") return "1:1";
        return "1:1";
      };

      let platformInstruction = "";
      if (platform === "linkedin") platformInstruction = "LinkedIn (long-form, engaging, professional)";
      else if (platform === "twitter") platformInstruction = "Twitter/X (short & punchy, under 280 characters)";
      else if (platform === "instagram") platformInstruction = "Instagram (visual-focused with hashtags)";

      const textPromise = ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Draft a social media post for the following idea: "${idea}". The tone should be ${safeTone}.
Create 1 post for ${platformInstruction}.
Return JSON with the following structure: { "text": "..." }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
            },
            required: ["text"],
          },
        },
      }).then(response => {
        const jsonStr = response.text || "{}";
        
        let parsed = { text: "" };
        try {
          const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) || jsonStr.match(/([\{\[][\s\S]*[\}\]])/);
          if (jsonMatch) {
             parsed = JSON.parse(jsonMatch[1]);
          } else {
             parsed = JSON.parse(jsonStr);
          }
        } catch (e) {
          console.error("Failed to parse text JSON:", e);
        }
        return parsed;
      });

      const generateImage = async (platformName: string, promptSuffix: string) => {
        const interaction = await ai.interactions.create({
          model: 'gemini-3.1-flash-image-preview',
          input: `A high quality image to accompany a ${platformName} post about: ${idea}. ${promptSuffix}`,
          response_modalities: ['image'],
          generation_config: {
            image_config: {
              aspect_ratio: getRatio(platform),
              image_size: safeSize,
            },
          },
        });
        
        for (const step of interaction.steps) {
          if (step.type === 'model_output') {
            const imageContent = step.content?.find(c => c.type === 'image');
            if (imageContent?.data) {
              const mimeType = imageContent.mime_type || 'image/jpeg';
              return `data:${mimeType};base64,${imageContent.data}`;
            }
          }
        }
        return null;
      };

      let imagePromise;
      if (platform === "linkedin") imagePromise = generateImage("LinkedIn", "Keep it professional, engaging, and suitable for a business network.");
      else if (platform === "twitter") imagePromise = generateImage("Twitter", "Keep it punchy, bold, and attention-grabbing.");
      else if (platform === "instagram") imagePromise = generateImage("Instagram", "Keep it highly visual, aesthetic, and vibrant.");

      const textResult = await textPromise;
      const imageResult = await imagePromise;

      res.json({
        text: textResult.text,
        image: imageResult
      });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to regenerate content." });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      formattedHistory.push({ role: 'user', parts: [{ text: message }] });

      const chatResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedHistory,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "You are an AI assistant helping a user brainstorm social media posts. You can search Google for current trends, news, and facts."
        },
      });

      res.json({ text: chatResponse.text });
    } catch (error) {
      console.error("Chat API Error:", error);
      res.status(500).json({ error: "Failed to generate chat response." });
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
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
