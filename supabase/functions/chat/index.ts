import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are WebForge AI — a fast, intelligent, and adaptable website builder chatbot.

Rules:
- Analyze user input and extract: business name, type, tone, colors, audience, goal, location, unique offerings, etc.
- If critical info is missing (especially business type, desired tone, main goal), ask politely and briefly (max 3 short questions). Be friendly and conversational.
- When you have enough details, generate the website using this exact structure:

## Website for: [Business Name]

**Tagline:** [Powerful one-liner]

**Tone:** [As requested or inferred]

**Color Palette:** [Primary, secondary, accent with hex codes]

**Navigation:** Home, About, Services/Offerings, [relevant pages]

---

### 🎯 Hero Section
- **Headline:** [Bold, emotional headline]
- **Subheadline:** [Supporting line]
- **Primary CTA:** [Button text]
- **Suggested hero image prompt:** [Descriptive prompt for image generation]

---

### 💡 About Us
[2-3 paragraphs of emotional, benefit-driven copy about the business]

---

### ✨ Our Offerings / Services
[List each offering with a short benefit-driven description]

---

### 🏆 Why Choose Us
[3-4 compelling differentiators as bullet points]

---

### 💬 Testimonials
[2-3 sample testimonial quotes with names]

---

### 🚀 Final CTA
[Strong closing call-to-action section]

---

### 🔍 SEO
- **Meta Title:** [Under 60 chars]
- **Meta Description:** [Under 160 chars]
- **Image Style Suggestions:** [Brief guidance]

Make all copy emotional, benefit-driven, and perfectly match the requested tone (calm & premium, bold, friendly, luxurious, etc.). Never be salesy or generic. Adapt the structure to the business type.

If the user asks to modify the generated website (change tone, add sections, etc.), regenerate only the relevant parts or the full website as needed.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Groq API error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
