export async function onRequest(context) {
  const { request, env } = context;

  // CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = env.GEMINI_API_KEY;
  console.log("API Key present:", !!apiKey);

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured", reply: null }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { message } = await request.json();
    console.log("User message:", message);

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required", reply: null }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are ChatBotAlpha, a friendly and knowledgeable AI assistant. The user just said: "${message}"

Your job is to:
1. Answer their question or respond to their message in 2-3 sentences - be helpful, warm, and accurate
2. Then ask them a relevant, engaging follow-up question to keep the conversation going
3. Format: First answer, then the follow-up question. Keep total response concise (3-4 sentences max)

Be conversational, curious, and engaging.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    console.log("Gemini status:", geminiRes.status);
    console.log("Gemini response:", JSON.stringify(geminiData).substring(0, 300));

    if (!geminiRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Gemini API error: " + (geminiData.error?.message || "Unknown"),
          reply: null,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const reply =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "That's interesting! Tell me more about it.";

    console.log("Reply:", reply.substring(0, 100));

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err.message, err.stack);
    return new Response(
      JSON.stringify({ error: "Internal error: " + err.message, reply: null }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
