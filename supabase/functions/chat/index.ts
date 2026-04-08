import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are WebForge AI — a fast, intelligent, and adaptable website builder chatbot.

Rules:
- Analyze user input and extract: business name, type, tone, colors, audience, goal, location, and unique offerings.
- If critical info is missing, ask politely and briefly with at most 3 short questions.
- When you have enough details, generate a complete, production-ready single-page website using HTML, CSS, and JavaScript.

Output requirements:
- Return a short 2-3 sentence summary first.
- Then return the FULL HTML inside one markdown code block tagged as html.
- The HTML must be a complete, self-contained page with inline CSS and JS.
- Use modern CSS, responsive layout, subtle animations, and smooth scrolling.
- Include Google Fonts and Tailwind CDN when helpful.
- Use the user's requested color palette, or choose a strong one if none is provided.

Images:
- Every major section must include at least one visible, topic-relevant image.
- Use real Pexels CDN images with valid photo IDs.
- Use different photo IDs across the page and avoid placeholders or empty image sources.
- Add descriptive alt text for every image.

Required sections:
- Sticky header with logo/business name
- Navigation links: Home, About, Services, Contact
- Login and Sign Up buttons in the header
- Hero section
- About section
- Services section
- Features or Why Choose Us section
- Testimonials section
- Contact or CTA section
- Footer with repeated navigation and social links

Style:
- Make it visually polished and relevant to the business topic.
- Match the requested tone closely.
- Avoid generic filler copy.

If the user asks to modify the website, regenerate the full HTML with the requested changes.`;

type ProviderResult = {
  response: Response;
  provider: "lovable-ai" | "groq";
};

function jsonResponse(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function parseError(response: Response) {
  const rawText = await response.text();
  let message = "AI service error. Please try again.";

  try {
    const parsed = JSON.parse(rawText);
    message = parsed?.message || parsed?.error?.message || parsed?.error || message;
  } catch {
    if (rawText) message = rawText.slice(0, 300);
  }

  return { rawText, message };
}

async function callLovableAI(messages: unknown[]) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 16000,
    }),
  });
}

async function callGroq(messages: unknown[]) {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

  return await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 8192,
      temperature: 0.8,
    }),
  });
}

async function getProviderResponse(messages: unknown[]): Promise<ProviderResult> {
  const lovableResponse = await callLovableAI(messages);

  if (lovableResponse.ok) {
    return { response: lovableResponse, provider: "lovable-ai" };
  }

  const lovableError = await parseError(lovableResponse.clone());
  console.error("Lovable AI error:", lovableResponse.status, lovableError.rawText);

  if (lovableResponse.status !== 402 && lovableResponse.status !== 429) {
    return { response: lovableResponse, provider: "lovable-ai" };
  }

  if (!Deno.env.get("GROQ_API_KEY")) {
    return { response: lovableResponse, provider: "lovable-ai" };
  }

  const groqResponse = await callGroq(messages);
  if (groqResponse.ok) {
    console.info("Falling back to Groq after Lovable AI failure", lovableResponse.status);
    return { response: groqResponse, provider: "groq" };
  }

  const groqError = await parseError(groqResponse.clone());
  console.error("Groq fallback error:", groqResponse.status, groqError.rawText);
  return { response: lovableResponse, provider: "lovable-ai" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return jsonResponse(400, "messages array required");
    }

    const { response, provider } = await getProviderResponse(messages);

    if (!response.ok) {
      const { message, rawText } = await parseError(response);
      console.error("Final AI provider error:", provider, response.status, rawText);

      if (response.status === 402) {
        return jsonResponse(402, "AI credits are exhausted for this project. Please add workspace credits in Settings → Workspace → Usage and try again.");
      }

      if (response.status === 429) {
        return jsonResponse(429, "Too many AI requests right now. Please wait a moment and try again.");
      }

      return jsonResponse(response.status >= 400 && response.status < 600 ? response.status : 500, message);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-AI-Provider": provider,
      },
    });
  } catch (e) {
    console.error("chat error:", e);
    return jsonResponse(500, e instanceof Error ? e.message : "Unknown error");
  }
});