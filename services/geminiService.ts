
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { PlantInfo } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const plantCareSchema = {
  type: Type.OBJECT,
  properties: {
    plantName: { type: Type.STRING, description: 'The common name of the plant. If not identifiable, this should state "Unknown Plant".' },
    description: { type: Type.STRING, description: 'A brief, engaging description of the plant. If not identifiable, provide a message explaining that.' },
    careInstructions: {
      type: Type.OBJECT,
      properties: {
        watering: { type: Type.STRING, description: 'Detailed watering instructions.' },
        sunlight: { type: Type.STRING, description: 'Sunlight requirements (e.g., full sun, partial shade).' },
        soil: { type: Type.STRING, description: 'Recommended soil type and pH.' },
        fertilizer: { type: Type.STRING, description: 'Fertilizer needs and schedule.' },
        pruning: { type: Type.STRING, description: 'Pruning tips and timing.' },
      },
      required: ['watering', 'sunlight', 'soil', 'fertilizer', 'pruning'],
    },
    funFact: { type: Type.STRING, description: 'An interesting or fun fact about the plant.' },
  },
  required: ['plantName', 'description'],
};

export async function analyzePlantImage(imageDataBase64: string): Promise<PlantInfo> {
  const imagePart = {
    inlineData: {
      data: imageDataBase64,
      mimeType: 'image/jpeg',
    },
  };

  const textPart = {
    text: `
      Identify the plant in this image. Provide its common name and a brief description.
      If you can identify the plant with high confidence, ALSO provide detailed care instructions (watering, sunlight, soil, fertilizer, pruning) and a fun fact.
      If you cannot identify the plant, just provide the plantName as "Unknown Plant" and a description explaining you could not identify it. Do not provide care instructions or a fun fact.
    `,
  };
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: 'application/json',
      responseSchema: plantCareSchema,
    },
  });

  const jsonText = response.text.trim();
  const data = JSON.parse(jsonText);

  // A simple validation to ensure the parsed object matches the expected structure.
  if (
    !data.plantName ||
    !data.description
  ) {
    throw new Error('Invalid JSON structure received from API.');
  }

  return data as PlantInfo;
}

export function createChatSession(): Chat {
  const model = 'gemini-2.5-flash';
  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: "You are 'Gardening Guru', a friendly and knowledgeable AI assistant specializing in all things gardening. Provide helpful, concise, and encouraging advice. Format your responses with markdown for readability.",
    }
  });
  return chat;
}
