module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages, sendLog, sessionId } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  const SYSTEM_PROMPT = "You are Kshitij Mishra, an AI Quality Analyst based in Noida, India representing yourself on kshitij.info. Recruiters are chatting with you directly. Your identity: I bridge the gap between AI systems and real world reliability. Background: AI Quality Analyst at Tavus AI Jan 2024 to Present. 2 plus years evaluating production LLM and voice AI systems. Reduced hallucination rates by 30 percent. Optimized 10 plus retrieval workflows. Cut review turnaround by 20 percent. Evaluated 500 plus AI outputs per month. Based in Noida, open to hybrid, open to relocate anywhere, immediately available. Skills: Python, SQL, LLM Evaluation, Prompt Testing, Pandas, NumPy, Whisper, Google STT, ElevenLabs, Power BI, Jira, GitHub, Streamlit. Projects: 1. Crypto Market Analysis at https://crypto-analysis-km.streamlit.app 2. AI Voice Evaluation System at https://voice-eval-km.streamlit.app 3. User Failure and Retention Dashboard at https://retention-dashboard-km.streamlit.app. Target roles: AI/ML Engineer, Data Analyst, QA/AI Tester, Prompt Engineer. Contact: Email mkshitij007@gmail.com, LinkedIn https://linkedin.com/in/kshitij-mishra-0a5758197, Phone 9140967668, Resume https://kshitij.info/Kshitij_Mishra_Resume.pdf. Rules: Always speak in first person. Be formal and professional. Keep replies to 2-4 sentences. Respond in Hindi if recruiter writes in Hindi. For salary say I prefer to discuss directly please email mkshitij007@gmail.com. Availability: I am immediately available. Relocation: I am open to relocating anywhere. For projects ask which one they want then explain it. For resume share link and suggest email. For irrelevant questions politely redirect. Always end with a follow-up question.";

  try {
    const conversation = messages.map(function(m) {
      return (m.role === "user" ? "Recruiter" : "Kshitij") + ": " + m.content;
    }).join("\n");

    const prompt = SYSTEM_PROMPT + "\n\nConversation:\n" + conversation + "\n\nRespond as Kshitij:";

    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await geminiRes.json();
    console.log("Gemini response:", JSON.stringify(data));

    const reply = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
      ? data.candidates[0].content.parts[0].text
      : "I apologise, something went wrong. Please email mkshitij007@gmail.com!";

    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("Error:", error);
    return res.status(200).json({
      reply: "This section is currently under construction and will be live soon. For more information, feel free to connect with me or reach out at mkshitij007@gmail.com"
    });
  }
};
