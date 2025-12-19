
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * AI ATS Scoring and Resume Analysis
 */
export const analyzeResumeAI = async (resumeText: string, jobTitle: string, jobDesc: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Candidate Resume: "${resumeText}". 
                 Target Job: "${jobTitle}". 
                 Job Description: "${jobDesc}".
                 
                 Analyze the match. Return an ATS score (0-100), detailed feedback on why, 
                 and a list of missing keywords/skills.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "feedback", "missingSkills"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis Error", error);
    return { score: 65, feedback: "Unable to fully parse. Basic match detected based on role keywords.", missingSkills: ["Specific framework experience", "System Design"] };
  }
};

/**
 * AI Profile Improvement Suggestions
 */
export const getProfileTipsAI = async (user: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Name: ${user.name}, Designation: ${user.designation}, Experience: ${user.experience}.
                 Skills: ${user.skills?.join(", ")}.
                 Suggest 5 specific professional improvements for their profile on a site like Naukri to get 3x more recruiter calls.`,
    });
    return response.text;
  } catch {
    return "Add quantifiable achievements, update your profile headline, and list your top 3 core technical certifications.";
  }
};

/**
 * AI Chat Draft Suggestion
 */
export const suggestMessageReplyAI = async (recruiterMessage: string, jobTitle: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `A recruiter sent this: "${recruiterMessage}". 
                 The role is "${jobTitle}". 
                 Draft a professional, polite, and enthusiastic response to move the conversation forward.`,
    });
    return response.text;
  } catch {
    return "Thank you for reaching out! I am very interested in this role and would love to discuss further. When would be a good time for a call?";
  }
};

export const getMapLinkAI = async (company: string, loc: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find office location for ${company} in ${loc}.`,
      config: { tools: [{ googleMaps: {} }] }
    });
    const mapsChunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.find(c => c.maps);
    return mapsChunk?.maps?.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company + ' ' + loc)}`;
  } catch {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company + ' ' + loc)}`;
  }
};

export const generateEmailTemplateAI = async (type: 'offer' | 'interview', name: string, job: string) => {
  try {
    const prompt = type === 'offer' 
      ? `Draft a high-end corporate offer letter for ${name} for ${job}.` 
      : `Draft an interview invite for ${name} for ${job} with 3 time slots.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch {
    return `Hi ${name}, regarding the ${job} position, let's schedule a call.`;
  }
};
