
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, Flashcard, SummaryResult, ChatMessage, MnemonicItem, StoryResult } from "../types";

const API_KEY = "AIzaSyDRPnG-GZm_H234VaGFheeY39FqnpjeQ4Y"|| "";

const BASE_CLEAN_TEXT_INSTRUCTION = `
IMPORTANT: Do not use Markdown symbols like #, *, **, or _ in your response. 
Do not use labels like "The Text:", "The Explanation:", or "Explanation:". 
Present information in a clean, natural reading style. 
Use double line breaks between sections for clarity. 
If you need to list items, use simple numbering like 1. 2. 3. without any special characters around the numbers.`;

const getSocraticInstruction = (isSocratic: boolean) => {
  const base = isSocratic 
    ? `You are a Socratic Tutor. Never give the direct answer. Provide guidance and ask questions to lead the student to the answer.` 
    : `You are a helpful, direct study buddy.`;
  
  return base + BASE_CLEAN_TEXT_INSTRUCTION;
};

export const explainConcept = async (concept: string, imageBase64?: string, isSocratic: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const parts: any[] = [{ text: `Explain this: ${concept}` }];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64,
      },
    });
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: getSocraticInstruction(isSocratic),
      tools: [{ googleSearch: {} }],
    },
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Reference",
    uri: chunk.web?.uri || "#"
  })) || [];

  return {
    text: response.text,
    sources
  };
};

export const chatWithDocument = async (history: ChatMessage[], documentContent: string, isSocratic: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const lastUserMsg = history[history.length - 1].text;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { role: 'user', parts: [{ text: `CONTEXT FROM DOCUMENT:\n${documentContent}\n\nUSER QUESTION: ${lastUserMsg}` }] }
    ],
    config: {
      systemInstruction: getSocraticInstruction(isSocratic) + " Base your responses strictly on the provided document context if relevant. " + BASE_CLEAN_TEXT_INSTRUCTION,
    }
  });

  return response.text;
};

export const summarizeNotes = async (text: string): Promise<SummaryResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize the following study notes. Provide a concise title, a brief summary paragraph, and a list of key takeaways. ${BASE_CLEAN_TEXT_INSTRUCTION} \n\n${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "summary", "keyPoints"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateQuiz = async (topicOrContext: string): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 challenging multiple choice questions based on the following content: ${topicOrContext}. Each question must have exactly 4 options and one correct answer index (0-3). Include a helpful explanation. ${BASE_CLEAN_TEXT_INSTRUCTION}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const generateFlashcards = async (topicOrNotes: string): Promise<Flashcard[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 8 study flashcards (front-back style) for the following topic or text: ${topicOrNotes}. ${BASE_CLEAN_TEXT_INSTRUCTION}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING }
          },
          required: ["front", "back"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const generateMnemonics = async (text: string): Promise<MnemonicItem[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 4 creative mnemonics to help remember key terms in the following text. ${BASE_CLEAN_TEXT_INSTRUCTION} \n\n${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            phrase: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["type", "phrase", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const generateStory = async (text: string, theme: string): Promise<StoryResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write an engaging story explaining the concepts in the following text. Theme: "${theme}". ${BASE_CLEAN_TEXT_INSTRUCTION} \n\nSTUDY TEXT: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "content"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};
