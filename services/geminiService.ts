
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are MedGemma, a state-of-the-art clinical decision support AI. 
Follow these rules:
1. Use standard medical terminology (e.g., ICD-10 aligned).
2. Maintain a professional, objective tone.
3. Prioritize patient safety by flagging concerning findings immediately with ⚠️.
4. Use Markdown for all text outputs. Structure reports with clear headers (##, ###), bullet points, and medical icons.
5. All outputs must include a footer disclaimer that this is for clinical decision support, not a primary diagnosis.
6. In layman mode, explain complex pathophysiology using simple analogies.`;

export const analyzeRadiologyImage = async (base64Image: string, modality: string, bodyPart: string) => {
  const ai = getAI();
  const prompt = `Perform a detailed radiological analysis of this ${modality} of the ${bodyPart}. 
  Provide structured findings and a definitive impression using Markdown. Use 🔬 for findings and 🩺 for impressions.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          indication: { type: Type.STRING },
          findings: { type: Type.STRING },
          impression: { type: Type.STRING },
          followUp: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          layman_summary: { type: Type.STRING }
        },
        required: ["indication", "findings", "impression", "followUp", "tags", "layman_summary"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const performGlobalSearch = async (query: string, patientContext: any) => {
  const ai = getAI();
  const prompt = `As MedGemma, synthesize a high-fidelity Clinical Synthesis Report for the query: "${query}".
  
  Format the report as follows:
  # 📋 Clinical Synthesis Report
  
  ## 🩺 Executive Summary
  (One paragraph summary)
  
  ## 🔬 Relevant Findings & Evidence
  (Bullet points with dates if available)
  
  ## ⚠️ Risk Assessment & Safety Flags
  (Identify potential flags or contraindications)
  
  ## 📋 Clinical Recommendations
  (Next steps and suggested monitoring)

  Context: ${JSON.stringify(patientContext)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: SYSTEM_INSTRUCTION }
  });

  return response.text;
};

export const queryClinicalDocs = async (docs: string[], query: string) => {
  const ai = getAI();
  const prompt = `Based on the following clinical documents, provide a structured Markdown summary answering: "${query}"
  
  Structure with headers:
  ### 📄 Document Review
  ### 💡 Analysis
  ### 📍 Conclusion`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: SYSTEM_INSTRUCTION }
  });

  return response.text;
};

export const analyzeDermImage = async (base64Image: string, symptoms: string, duration: string) => {
  const ai = getAI();
  const prompt = `Evaluate this dermatological lesion. Provide a structured SOAP note in Markdown.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          assessment: { type: Type.STRING },
          riskTier: { type: Type.STRING },
          explanation: { type: Type.STRING },
          nextSteps: { type: Type.STRING },
          soapNote: { type: Type.STRING }
        },
        required: ["assessment", "riskTier", "explanation", "nextSteps", "soapNote"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
