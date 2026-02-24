import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) throw new Error("API key not set");

export const ai = new GoogleGenAI({ apiKey: API_KEY });
