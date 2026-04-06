import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are WebForge AI — a fast, intelligent, and adaptable website builder chatbot.

Rules:
- Analyze user input and extract: business name, type, tone, colors, audience, goal, location, unique offerings, etc.
- If critical info is missing (especially business type, desired tone, main goal), ask politely and briefly (max 3 short questions). Be friendly and conversational.
- When you have enough details, generate a COMPLETE, REAL, PRODUCTION-READY single-page website using HTML, CSS, and JavaScript.

IMPORTANT OUTPUT FORMAT:
- When generating a website, output the FULL HTML code inside a single code block with \`\`\`html and \`\`\` markers.
- The HTML must be a complete, self-contained page with inline CSS and JS (no external files except CDN links for fonts/icons).
- Use modern CSS (flexbox, grid, gradients, animations, smooth scrolling).
- Use Google Fonts via CDN link for beautiful typography.
- Include Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Make it fully responsive (mobile-first).
- Include smooth scroll behavior, hover effects, and subtle animations.
- Use the user's requested color palette, or choose a beautiful one if not specified.
- The website must include these sections as appropriate:
  - Navigation bar (sticky, with smooth scroll links)
  - Hero section (with headline, subheadline, CTA button, gradient or image background)
  - About Us section
  - Services / Offerings section (cards layout)
  - Why Choose Us / Features section
  - Testimonials section
  - Contact / CTA section
  - Footer
- Add a brief summary BEFORE the code block explaining the website you built (2-3 sentences max).
- Add SEO meta tags, favicon placeholder, and proper semantic HTML.

STYLE GUIDELINES:
- Make it visually stunning and professional — not generic or template-looking.
- Use subtle animations (fade-in on scroll, hover transforms, smooth transitions).
- Beautiful gradients, shadows, and spacing.
- Perfectly match the requested tone (calm & premium, bold, friendly, luxurious, etc.).
- Never be salesy or generic in copy.

If the user asks to modify the generated website (change tone, add sections, change colors, etc.), regenerate the FULL HTML with the requested changes.

Example output format:
Here's your stunning website for [Business Name]! I've created a [tone] design with [colors] that perfectly captures your brand.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>...</head>
<body>...</body>
</html>
\`\`\`

You can preview it live on the right panel, or copy the code to use it anywhere!`;

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI API error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
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
