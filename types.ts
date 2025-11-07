
export interface PlantInfo {
  plantName: string;
  description: string;
  careInstructions: {
    watering: string;
    sunlight: string;
    soil: string;
    fertilizer: string;
    pruning: string;
  };
  funFact: string;
}

export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
  // FIX: Add optional id property for tracking streaming messages in the chat UI.
  id?: number | string;
}
