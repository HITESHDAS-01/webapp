
import { GoogleGenAI } from "@google/genai";
import { Language, ReportData } from "../types";

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const languageMap: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi',
    as: 'Assamese'
};

export const generateReportSummary = async (reportData: ReportData, language: Language): Promise<string> => {
  if (!ai) {
    return "API Key not configured.";
  }
  
  const model = 'gemini-2.5-flash';
  const targetLanguage = languageMap[language];

  const prompt = `
    You are a friendly business assistant for a small shop owner. 
    Based on the following financial report data: 
    ${JSON.stringify(reportData, null, 2)}
    
    Write a simple, one-paragraph, encouraging summary in ${targetLanguage}. 
    Focus on the key achievements like profit and top customer. Keep it simple and positive.
    Do not use markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text ?? "";
  } catch (error) {
    console.error("Error generating report summary:", error);
    return "Could not generate AI summary. Please try again later.";
  }
};
