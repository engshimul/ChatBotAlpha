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
    return new Response(JSON.stringify({ error: "Method not allowed", reply: null }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = env.OPENROUTER_API_KEY;
  console.log("OpenRouter API Key present:", !!apiKey);

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured (OPENROUTER_API_KEY)", reply: null }),
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

    const systemPrompt = `You are ChatBotAlpha, a friendly and knowledgeable AI assistant.

Your job is to:
1. Answer the user's message in 2-3 sentences — be helpful, warm, and accurate
2. Then ask a relevant, engaging follow-up question to keep the conversation going
3. Keep total response concise (3-4 sentences max)

Be conversational, curious, and engaging.`;

    console.log("Calling OpenRouter API...");
    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://chatbotalpha.pages.dev",
        "X-Title": "ChatBotAlpha",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    const orData = await openRouterRes.json();
    console.log("OpenRouter status:", openRouterRes.status);
    console.log("OpenRouter response:", JSON.stringify(orData).substring(0, 300));

    if (!openRouterRes.ok) {
      return new Response(
        JSON.stringify({
          error: "OpenRouter API error: " + (orData.error?.message || JSON.stringify(orData)),
          reply: null,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const reply = orData.choices?.[0]?.message?.content?.trim() ||
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
