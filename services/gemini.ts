import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult } from "../types";
import { blobToBase64 } from "../utils/audioUtils";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

const CLEAN_REGEX = /```json|```/g;

export const translateAudio = async (audioBlob: Blob, forceLanguage?: string): Promise<TranslationResult> => {
  try {
    const base64Audio = await blobToBase64(audioBlob);

    // Determine mime type from blob, default to audio/wav if missing
    const mimeType = audioBlob.type || 'audio/wav';

    let promptText = "";
    if (forceLanguage) {
      promptText = `Listen to this audio. Treat the language strictly as ${forceLanguage}. Transcribe exactly what is said in ${forceLanguage}, and then provide an accurate translation into English. If the audio is silent or unintelligible, return the JSON with 'Audio unintelligible' as the transcription and 'Unknown' as the detectedLanguage.`;
    } else {
      promptText = "Listen to this audio. 1. Detect the main language spoken. 2. Transcribe exactly what is said. 3. Provide an accurate translation into English. If the audio is silent or unintelligible, return the JSON with 'Audio unintelligible' as the transcription and 'Unknown' as the detectedLanguage.";
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        systemInstruction: "You are an expert translator. Always return your response in a structured JSON format. Do not include markdown code blocks in the output, just raw JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: {
              type: Type.STRING,
              description: "The name of the language detected in the audio (e.g., 'Catalan', 'Spanish', 'English').",
            },
            originalTranscription: {
              type: Type.STRING,
              description: "The verbatim transcription of the audio.",
            },
            englishTranslation: {
              type: Type.STRING,
              description: "The English translation of the audio.",
            }
          },
          required: ["detectedLanguage", "originalTranscription", "englishTranslation"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    // Clean markdown code blocks if present (e.g. ```json ... ```)
    const cleanedText = text.replace(CLEAN_REGEX, '').trim();

    try {
      // Parse JSON safely
      const result = JSON.parse(cleanedText) as TranslationResult;
      return result;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      throw new Error("Failed to parse translation response.");
    }

  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
};

export const translateText = async (inputText: string, forceLanguage?: string): Promise<TranslationResult> => {
  try {
    let promptText = "";
    if (forceLanguage) {
      promptText = `Analyze the following text. Treat the language strictly as ${forceLanguage}. Return the text exactly as provided in the 'originalTranscription' field, and then provide an accurate translation into English. If the text is empty or meaningless, return 'Unknown' language.`;
    } else {
      promptText = "Analyze the following text. 1. Detect the main language. 2. Return the text exactly as provided in the 'originalTranscription' field. 3. Provide an accurate translation into English.";
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { text: `Text to translate: "${inputText}"` },
          { text: promptText }
        ]
      },
      config: {
        systemInstruction: "You are an expert translator. Always return your response in a structured JSON format. Do not include markdown code blocks in the output, just raw JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: {
              type: Type.STRING,
              description: "The name of the language detected (e.g., 'Catalan', 'Spanish', 'English').",
            },
            originalTranscription: {
              type: Type.STRING,
              description: "The original text provided.",
            },
            englishTranslation: {
              type: Type.STRING,
              description: "The English translation of the text.",
            }
          },
          required: ["detectedLanguage", "originalTranscription", "englishTranslation"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    const cleanedText = text.replace(CLEAN_REGEX, '').trim();

    try {
      const result = JSON.parse(cleanedText) as TranslationResult;
      return result;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", text);
      throw new Error("Failed to parse translation response.");
    }

  } catch (error) {
    console.error("Text Translation Error:", error);
    throw error;
  }
};