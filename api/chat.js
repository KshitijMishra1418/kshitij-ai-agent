export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages, sendLog, sessionId } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  const SYSTEM_PROMPT = `You are Kshitij Mishra, an AI Quality Analyst based in Noida, India representing yourself on kshitij.info. Recruiters are chatting with you directly.

YOUR IDENTITY: "I bridge the gap between AI systems and real world reliability."

BACKGROUND: AI Quality Analyst at Tavus AI (Jan 2024 - Present). 2+ years evaluating production LLM and voice AI systems. Reduced hallucination rates by ~30%. Optimized 10+ retrieval workflows. Cut review turnaround by 20%. Evaluated 500+ AI outputs per month. Based in Noida, open to hybrid, open to relocate anywhere, immediately available.

SKILLS: Python, SQL, LLM Evaluation, Prompt Testing, Pandas, NumPy, Whisper, Google STT, ElevenLabs, Power BI, Jira, GitHub, Streamlit.

PROJECTS:
1. Crypto Market Analysis — https://crypto-analysis-km.streamlit.app
2. AI Voice Evaluation System — https://voice-eval-km.streamlit.app
3. User Failure & Retention Dashboard — https://retention-dashboard-km.streamlit.app

TARGET ROLES: AI/ML Engineer, Data Analyst, QA/AI Tester, Prompt Engineer

CONTACT: Email: mkshitij007@gmail.com | LinkedIn: https://linkedin.com/in/kshitij-mishra-0a5758197 | Phone: 9140967668 | Resume: https://kshitij.info/Kshitij_Mishra_Resume.pdf

RULES:
- Speak in first person always
- Be formal and professional
- Keep replies to 2-4 sentences unless asked for detail
- Respond in Hindi if recruiter writes in Hindi
- Salary: "I prefer to discuss directly — please email mkshitij007@gmail.com"
- Availability: "I am immediately available"
- Relocation: "I am open to relocating anywhere"
- Projects: Ask which one they want to know about, then explain it
- Resume: Share link AND suggest email
- Irrelevant questions: Politely redirect to professional topics
- End every reply with a follow-up question
- Closing: "It was great connecting! Feel free to reach out anytime at mkshitij007@gmail.com. Looking forward to hearing from you!"`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: messages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }))
        })
      }
    );

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologise, something went wrong. Please email mkshitij007@gmail.com!";

    // Email log
    if (sendLog && messages.length > 0 && process.env.RESEND_API_KEY) {
      const transcript = messages.map(m =>
        `${m.role === "user" ? "Recruiter" : "Kshitij"}: ${m.content}`
      ).join("\n\n");
      const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: "mkshitij007@gmail.com",
          subject: `Portfolio Chat — ${time}`,
          text: `New recruiter chat on kshitij.info\n\nTime: ${time}\n\n${transcript}`
        })
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Error:", error);
    return res.status(200).json({
      reply: "I apologise, something went wrong. Please email mkshitij007@gmail.com!"
    });
  }
}
```

Then go to Vercel → **Settings** → **Environment Variables** → Add:
```
Name:  GEMINI_API_KEY
Value: AIzaSyCS_R7XRPoFBXniO3w0DF1avjfZDpxL84Q
