import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini Client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// AI Endpoint: Attendance Risk & Performance Analysis
app.post("/api/ai/attendance-analysis", async (req, res) => {
  try {
    const { role, userProfile, records, classes } = req.body;
    const ai = getGeminiClient();

    const prompt = `Act as an expert academic data scientist and attendance compliance advisor for Mindanao State University.
Analyze the following user profile and attendance data to provide structured, actionable, highly accurate insights:

User Role: ${role}
User Name: ${userProfile?.name || 'User'}
Student ID: ${userProfile?.studentId || 'N/A'}
Classes Count: ${classes?.length || 0}
Total Attendance Records Logged: ${records?.length || 0}

Class Details:
${JSON.stringify(classes || [], null, 2)}

Sample Records:
${JSON.stringify((records || []).slice(0, 15), null, 2)}

Requirements:
Return ONLY a valid JSON object with these exact keys:
1. "riskLevel": "Low" | "Medium" | "High" | "Critical"
2. "riskScore": number (0 to 100)
3. "keyObservation": short 1-2 sentence executive observation
4. "recommendations": array of 3 actionable, specific advice bullet points
5. "predictedAttendanceTrend": string (e.g., "Expected 94% attendance next month if current pattern holds")
6. "anomalies": array of detected concerns (e.g., "Frequent Monday tardiness", "Drop risk in CSC101")
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error("AI Attendance Analysis Error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to generate AI attendance analysis",
      fallback: {
        riskLevel: "Low",
        riskScore: 15,
        keyObservation: "Attendance consistency is currently stable across enrolled courses.",
        recommendations: [
          "Maintain current check-in habits for morning classes.",
          "Set alarm reminders 15 minutes before class schedule.",
          "Verify QR pass scans with instructor after each session."
        ],
        predictedAttendanceTrend: "Stable 95%+ attendance predicted for remaining semester.",
        anomalies: []
      }
    });
  }
});

// AI Endpoint: Intelligent Study & Schedule Advisor
app.post("/api/ai/smart-schedule-advice", async (req, res) => {
  try {
    const { classes } = req.body;
    const ai = getGeminiClient();

    const prompt = `Analyze this weekly academic schedule and generate an optimal study plan and workload distribution strategy:

Schedule:
${JSON.stringify(classes || [], null, 2)}

Return a JSON object with:
1. "heaviestDay": string (e.g. "Wednesday")
2. "recommendedStudyWindows": array of string descriptions for ideal review times
3. "workloadScore": number (0-100)
4. "wellnessTip": string advice for avoiding burnout
5. "scheduleOptimization": string suggested adjustment or buffer advice
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Endpoint: Interactive Academic Advisor Chatbot
app.post("/api/ai/advisor-chat", async (req, res) => {
  try {
    const { message, conversationHistory, context } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are "PulseAI", the official AI Academic & Attendance Advisor for ClassPulse 2.0 at Mindanao State University.
You provide intelligent, empathetic, and highly accurate guidance regarding:
- Attendance rules (e.g. 3 consecutive absents trigger Warning; 5 absents trigger Dropped status)
- QR check-in troubleshooting & biometric pass verification
- Study tips, schedule planning, and exam preparation
- Faculty & Admin attendance analytics interpretation

Contextual Data:
User Role: ${context?.role || 'student'}
User Name: ${context?.userName || 'Student'}
Enrolled Classes Count: ${context?.classesCount || 0}
Total Absences Logged: ${context?.absentCount || 0}

Keep responses concise, clear, and formatted with clean markdown bullet points where appropriate. Be warm, professional, and encouraging.`;

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction,
      },
    });

    // Send the latest user prompt
    const response = await chat.sendMessage({ message });
    res.json({ success: true, text: response.text });
  } catch (err: any) {
    console.error("Advisor Chat Error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to respond",
      text: "I am currently running in offline fallback mode. Please check your network connection or GEMINI_API_KEY setup."
    });
  }
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Vite Development & Production Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ClassPulse 2.0 AI-Powered Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
