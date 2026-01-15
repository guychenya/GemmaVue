
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are MedGemma, a state-of-the-art clinical decision support AI. 
Follow these rules:
1. Use standard medical terminology (e.g., ICD-10 aligned).
2. Maintain a professional, objective tone.
3. Prioritize patient safety by flagging concerning findings immediately.
4. All outputs must include a disclaimer that this is for clinical decision support, not a primary diagnosis.
5. In layman mode, explain complex pathophysiology using simple analogies.`;

export const analyzeRadiologyImage = async (base64Image: string, modality: string, bodyPart: string) => {
  const ai = getAI();
  const prompt = `Perform a detailed radiological analysis of this ${modality} of the ${bodyPart}. 
  Provide structured findings and a definitive impression.`;

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
  const prompt = `As MedGemma, synthesize an answer for: "${query}" 
  based on the current patient context: ${JSON.stringify(patientContext)}. 
  If the information is not in the context, use your medical knowledge to explain general principles while noting the lack of specific data.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: SYSTEM_INSTRUCTION }
  });

  return response.text;
};

// Fix: Added queryClinicalDocs to resolve the import error in DocumentsModule.tsx
export const queryClinicalDocs = async (docs: string[], query: string) => {
  const ai = getAI();
  const prompt = `Based on the following clinical documents, answer this query: "${query}"
  
  DOCUMENTS:
  ${docs.join('\n---\n')}
  
  Provide a concise, evidence-based synthesis of the patient's records.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: SYSTEM_INSTRUCTION }
  });

  return response.text;
};

export const analyzeDermImage = async (base64Image: string, symptoms: string, duration: string) => {
  const ai = getAI();
  const prompt = `Evaluate this dermatological lesion. History: ${symptoms}. Duration: ${duration}.
  Provide differential diagnoses and a risk-stratified triage plan.`;

  const response = await ai.models.generateContent({
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
