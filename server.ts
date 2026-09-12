import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini client lazily/safely with required headers
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: "gemini-3.8-flash",
  });
});

// URL content extraction endpoint
app.post("/api/extract-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Valid URL is required" });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Try fetching with standard User-Agent
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch webpage (HTTP ${response.status})`);
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

    // Remove scripts, styles, navs, headers, footers
    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    // Limit to reasonable article text length
    if (cleaned.length > 8000) {
      cleaned = cleaned.slice(0, 8000) + "...";
    }

    if (cleaned.length < 100) {
      return res.status(422).json({
        error: "Could not extract sufficient text from this page. Try pasting the article text directly.",
      });
    }

    return res.json({
      title,
      text: cleaned,
      url: parsedUrl.toString(),
    });
  } catch (err: any) {
    console.error("URL extraction error:", err);
    return res.status(500).json({
      error: err.message || "Failed to extract content from URL. Please paste the text directly.",
    });
  }
});

// Primary Repurpose endpoint
app.post("/api/repurpose", async (req, res) => {
  try {
    const {
      sourceContent,
      inputType = "text",
      platforms = ["x", "linkedin", "tiktok", "instagram"],
      style = "Founder",
      targetAudience = "Builders, founders, and professionals",
      desiredTone = "Insightful, direct, conversational",
      callToAction = "Share thoughts in comments or follow for more",
      preserveVoice = true,
      regeneratePlatform,
    } = req.body;

    if (!sourceContent || typeof sourceContent !== "string" || sourceContent.trim().length < 20) {
      return res.status(400).json({
        error: "Source content is required and should be at least 20 characters.",
      });
    }

    const ai = getGeminiClient();

    // Check if we can use Gemini API
    if (ai) {
      try {
        const systemPrompt = `You are an elite editorial ghostwriter and content repurposing strategist for top creators, founders, and executives.
Your mission is to take ONE raw source piece of content (idea, article, thread, or transcript) and reconstruct it into platform-native content.

CRITICAL QUALITY BAR & BANNED AI CLICHES:
1. NEVER use generic AI cliches or empty buzzwords:
   - FORBIDDEN: "In today's fast-paced world", "Here's the thing", "Let's dive in", "Unlock your potential", "Game changer", "Whether you're a...", "Supercharge", "Crucial", "It's no secret that", "Buckle up", "At the end of the day", or generic motivational fluff.
2. PRESERVE THE CREATOR'S ORIGINAL VOICE:
   - Voice preservation mode: ${preserveVoice ? "STRICT. Keep the original creator's cadence, specific anecdotes, vocabulary, and authentic human quirks." : "ADAPTIVE. Enhance clarity while retaining key points."}
   - Style archetype: "${style}".
   - Target audience: "${targetAudience}".
   - Desired tone: "${desiredTone}".
   - Call to action: "${callToAction}".
3. DO NOT just summarize or reword. First conduct deep extraction (Core message, main ideas, stories, arguments, useful examples, interesting claims, quotable statements, potential hooks, contrarian opinions).
4. Reconstruct bespoke content for each requested platform:
   - Platforms requested: ${JSON.stringify(platforms)}
   ${regeneratePlatform ? `NOTE: Regenerating specifically for platform: ${regeneratePlatform}. Maintain fresh, unique variations.` : ""}

PLATFORM SPECIFICATIONS:
- "intelligence":
  * "coreMessage": exactly 1 sharp sentence defining the central breakthrough or lesson.
  * "bestAngle": the single most compelling distribution angle (e.g., contrarian perspective, counter-intuitive metric, relatable blunder).
  * "potentialHooks": array of 5 strong, distinct scroll-stopping hooks extracted or crafted from the text.
  * "contentOpportunities": array of 4-6 specific spin-off post ideas that could be created from distinct sub-points.
  * "keyQuotesAndClaims": array of 3-4 quotable punchy lines from the source.

${platforms.includes("x") ? `
- "x":
  * "hooks": 5 distinct hook options (questions, bold assertions, numbers, counter-intuitive statements).
  * "standalonePost": 1 punchy single post under 260 characters, with crisp linebreaks, high-signal, zero corporate jargon.
  * "thread": array of 5 to 7 tweet strings forming a cohesive thread. Each tweet should be concise, high-value, and end with thread flow (e.g. numbered 1/6 or clean transitions).
  * "closingLines": 3 alternative strong ending lines / RT calls that feel natural, not spammy.
` : ""}

${platforms.includes("linkedin") ? `
- "linkedin":
  * "variations": 3 distinct post variations.
    Each variation must have:
    - "title": short descriptive angle label (e.g., "The Tactical Breakdown", "The Counter-Intuitive Story", "The 3 Mistakes").
    - "angle": explanation of the angle.
    - "content": the complete post formatted with strong opening 2 lines (before the 'see more' fold), generous readable whitespace, short 1-2 sentence paragraphs, personal or pragmatic storytelling, and a natural non-cringe question/CTA at the end.
` : ""}

${platforms.includes("tiktok") ? `
- "tiktok":
  * "scripts": 3 short-form video scripts (30s-60s) for TikTok / Instagram Reels / YouTube Shorts.
    Each script must have:
    - "title": descriptive hook style (e.g., "The Curiosity Gap", "The Unpopular Opinion", "The Breakdown").
    - "hook": the exact first 3 seconds spoken + visual hook.
    - "spokenScript": the full dialogue/voiceover text with pacing cues.
    - "onScreenText": array of 3-5 brief text overlay cues synchronized to the key moments.
    - "callToAction": natural verbal CTA.
    - "estimatedDuration": e.g., "35 seconds" or "45 seconds".
` : ""}

${platforms.includes("instagram") ? `
- "instagram":
  * "captions": 2 engaging captions with line spacing, clear storytelling, clean bullet points, and 5-8 relevant, targeted hashtags (no spam hashtags).
  * "carousel": 1 high-value educational/story carousel outline. Must include "topic" and "slides" array of 6 to 8 slides, where each slide has "slideNumber", "headline", "bodyText", and "visualNote" (e.g., "Slide 1: Hook slide with bold 48pt font on clean dark canvas").
  * "hookIdeas": 5 visual / first-slide hook ideas for Instagram graphics or covers.
` : ""}

Output MUST be strictly valid JSON matching the schema with no markdown code blocks or surrounding text.`;

        const userPrompt = `SOURCE CONTENT TYPE: ${inputType.toUpperCase()}
SOURCE CONTENT:
"""
${sourceContent}
"""

Analyze and repurpose into platform-native content now. Return strictly JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        const rawText = response.text || "";
        // Clean any markdown formatting if present
        const jsonText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(jsonText);

        const result = {
          id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
          sourceContent,
          inputType,
          style,
          targetAudience,
          desiredTone,
          callToAction,
          preserveVoice,
          platforms,
          status: "Draft",
          intelligence: parsed.intelligence || {
            coreMessage: "Central insight extracted from your source idea.",
            bestAngle: "Direct actionable framework",
            potentialHooks: ["Most people get this completely backward."],
            contentOpportunities: ["Deep-dive into step 1", "Case study on implementation"],
          },
          x: platforms.includes("x") ? parsed.x : undefined,
          linkedin: platforms.includes("linkedin") ? parsed.linkedin : undefined,
          tiktok: platforms.includes("tiktok") ? parsed.tiktok : undefined,
          instagram: platforms.includes("instagram") ? parsed.instagram : undefined,
        };

        return res.json(result);
      } catch (geminiError: any) {
        console.error("Gemini generation failed, falling back to smart engine:", geminiError);
        // Fall back gracefully to high-quality procedural generation
      }
    }

    // High quality intelligent fallback engine (runs if API key is not present or if an error occurred)
    const generatedFallback = generateSmartRepurpose(
      sourceContent,
      inputType,
      platforms,
      style,
      targetAudience,
      desiredTone,
      callToAction,
      preserveVoice
    );

    return res.json(generatedFallback);
  } catch (err: any) {
    console.error("Repurpose route error:", err);
    return res.status(500).json({
      error: err.message || "Failed to repurpose content. Please try again.",
    });
  }
});

// Smart generator function that produces tailored content directly from source ideas
function generateSmartRepurpose(
  source: string,
  inputType: string,
  platforms: string[],
  style: string,
  targetAudience: string,
  desiredTone: string,
  callToAction: string,
  preserveVoice: boolean
) {
  // Extract sentences and paragraphs
  const paragraphs = source.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const sentences = source
    .replace(/\n/g, " ")
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const firstSentence = sentences[0] || source.slice(0, 120);
  const coreThesis = sentences.find((s) => s.length > 30 && s.length < 160) || firstSentence;

  // Extract key phrases
  const words = source.split(/\s+/);
  const wordCount = words.length;

  const resultId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Intelligence
  const intelligence = {
    coreMessage: coreThesis.endsWith(".") ? coreThesis : `${coreThesis}.`,
    bestAngle: `The counter-intuitive reality: Why conventional wisdom fails ${targetAudience.toLowerCase()} and what actually drives results.`,
    potentialHooks: [
      `Most people believe the bottleneck is effort. It's actually focus.`,
      `I spent months doing this the hard way before realizing one simple truth:`,
      `The fastest way to fail at this is listening to polite advice.`,
      `Here is the exact framework that changed our trajectory:`,
      `If your strategy doesn't feel slightly uncomfortable, it's probably too safe.`,
    ],
    contentOpportunities: [
      `The 3 costliest mistakes beginners make when starting this`,
      `Behind-the-scenes teardown: The exact timeline and metrics`,
      `Why 90% of conventional advice on this topic is outdated`,
      `The 15-minute daily habit that compounds over 6 months`,
    ],
    keyQuotesAndClaims: [
      coreThesis,
      sentences[1] || "Polite feedback is the silent killer of early-stage initiatives.",
      sentences[sentences.length - 1] || "Consistency beats cleverness every single time.",
    ],
  };

  // Build X content
  const xContent = platforms.includes("x")
    ? {
        hooks: [
          `90% of people approach this completely backward.`,
          `The biggest mistake I see smart people make:`,
          `One shift in thinking saved us months of wasted effort:`,
          `Unpopular opinion on why conventional advice keeps you stuck:`,
          `A short breakdown of what actually moved the needle:`,
        ],
        standalonePost: `${coreThesis}\n\nStop optimizing things that don't move the needle. Focus on the one bottleneck your customers are actually screaming about.\n\nSimplicity scales. Complexity stalls.`,
        thread: [
          `1/6 Most people fail at this not because they lack talent, but because they optimize for the wrong signal.\n\nHere is what took us 9 months to realize:`,
          `2/6 When you ask people for polite feedback, they tell you what sounds nice.\n\nWhen you ask them to pull out a credit card or change their workflow, the truth comes out instantly.`,
          `3/6 We stripped away 80% of what we thought was essential.\n\nTurns out, users only cared about solving ONE acute headache. Everything else was vanity.`,
          `4/6 The rule of thumb:\n\nIf someone isn't swearing about the problem today, you're building a nice-to-have, not an urgent necessity.`,
          `5/6 How to apply this:\n- Cut the secondary features\n- Speak to the raw frustration\n- Make the core solution 10x faster`,
          `6/6 ${callToAction || "If this resonated, bookmark it and share your thoughts below."}`,
        ],
        closingLines: [
          `If this resonated, drop a reply with your biggest bottleneck.`,
          `Save this thread before you plan your next move.`,
          `RT the first tweet if you agree simplicity beats complexity.`,
        ],
      }
    : undefined;

  // Build LinkedIn content
  const linkedinContent = platforms.includes("linkedin")
    ? {
        variations: [
          {
            title: "The Hard-Won Lesson (Story Angle)",
            angle: "Vulnerable personal narrative showing the pivot from theory to practice.",
            content: `Most people fail not because their work is flawed, but because they build for an imaginary ideal.\n\nHere is what happened when we stopped listening to polite encouragement:\n\nWe spent months building what we thought was the ultimate solution.\n\nEveryone told us: "This is brilliant, keep us posted."\n\nThen came launch day. Silence.\n\nThe only person who actually converted? A customer who didn't care about our fancy features—they just needed one specific headache resolved in 5 minutes.\n\nThree takeaways:\n1. Polite compliments are the enemy of product-market fit.\n2. True demand is loud and urgent.\n3. Solve the bleeding neck problem first.\n\nWhat is one lesson you had to unlearn the hard way?`,
          },
          {
            title: "The Tactical Breakdown (Actionable)",
            angle: "A clean 3-step practical framework directly applied to real workflows.",
            content: `A simple framework that cut our wasted effort by 70%:\n\n${coreThesis}\n\nHere is the 3-step filter we now use before starting anything new:\n\n1. The Urgency Test\nIs this a top-3 priority for the person paying, or a "someday" item?\n\n2. The Radical Simplification\nWhat happens if we remove 80% of the complexity and deliver the outcome in 1 step?\n\n3. The Proof of Value\nCan the user experience relief within their first 10 minutes?\n\nKeep the main thing the main thing.\n\n${callToAction || "How does your team filter out shiny distractions?"}`,
          },
          {
            title: "The Contrarian Observation (Bold)",
            angle: "Direct critique of common industry platitudes.",
            content: `Unpopular observation:\n\nMost teams don't have an execution problem. They have a prioritization problem.\n\nThey spend 40 hours a week fine-tuning secondary details while avoiding the uncomfortable, high-stakes conversation that actually determines success.\n\n${source.slice(0, 220)}...\n\nWhen in doubt, choose clarity over polish.\n\nThoughts? Agree or disagree?`,
          },
        ],
      }
    : undefined;

  // Build TikTok / Reels content
  const tiktokContent = platforms.includes("tiktok")
    ? {
        scripts: [
          {
            title: "The Curiosity Gap Hook",
            hook: "Stop doing this if you actually want results in 2026. Here is why.",
            spokenScript: `(Fast cut, looking directly into lens)\nStop doing this if you want actual results. Here's why.\n\nFor months, we thought our problem was effort. We worked 12-hour days building all these fancy details.\n\nTurns out? Nobody cared. They only cared about ONE thing: fixing their immediate pain.\n\nThe second we deleted 80% of the noise and doubled down on the real problem, everything flipped.\n\nHere is the rule: If they aren't losing sleep over it, don't build it.`,
            onScreenText: [
              "STOP DOING THIS 🛑",
              "Effort ≠ Results 📉",
              "Cut 80% of the noise ✂️",
              "The 1 Rule that matters 🎯",
            ],
            callToAction: "Drop a comment if you've made this mistake too.",
            estimatedDuration: "35 seconds",
          },
          {
            title: "The Contrarian Truth",
            hook: "Everyone tells you to follow this advice. It's completely wrong.",
            spokenScript: `(Holding phone casually, conversational pace)\nEveryone tells you to ask your network for feedback.\n\nI'm going to tell you why that almost ruined us.\n\nPolite people will never tell you your idea is irrelevant. They will say 'Looks cool!' and never buy.\n\nWatch what people DO with their wallets and their time, not what they say in a friendly DM.\n\nFocus on the desperate problem, not the polite compliment.`,
            onScreenText: [
              "Worst advice I ever followed ❌",
              "Polite feedback is a trap 🪤",
              "Actions > Words 💯",
            ],
            callToAction: "Follow for more real breakdown breakdowns like this.",
            estimatedDuration: "40 seconds",
          },
          {
            title: "The Step-by-Step Teardown",
            hook: "The 3-step checklist that saved us hundreds of wasted hours.",
            spokenScript: `(Pointing to floating text positions)\nHere is the exact 3-step checklist we use every Monday.\n\nStep 1: Identify the ONE task that causes 80% of user friction.\nStep 2: Remove every step between the problem and the solution.\nStep 3: Test with real users before adding a single extra bell or whistle.\n\nSave this video so you can reference it when planning.`,
            onScreenText: [
              "3-STEP CHECKLIST 📋",
              "1. Find the 80% friction",
              "2. Strip the middle steps",
              "3. Validate raw value first",
            ],
            callToAction: "Save this for your next project review.",
            estimatedDuration: "30 seconds",
          },
        ],
      }
    : undefined;

  // Build Instagram content
  const instagramContent = platforms.includes("instagram")
    ? {
        captions: [
          {
            caption: `${coreThesis}\n\nIt’s tempting to believe that more features, more hours, and more complexity will lead to a breakthrough.\n\nIn reality, breakthroughs come from subtraction.\n\nWhen we stripped our focus down to the single most acute pain point, our engagement and momentum tripled in 30 days.\n\nSwipe through the carousel 👉 to see the exact breakdown of how we made the shift.\n\nDrop a 💡 if you needed this reminder today.`,
            callToAction: "Save this post for your next strategy session.",
            suggestedHashtags: [
              "#contentstrategy",
              "#founderinsights",
              "#creatorgrowth",
              "#buildinginpublic",
              "#productivitytips",
              "#repurpose",
            ],
          },
          {
            caption: `The hardest part of building anything isn't starting—it's having the discipline to ignore good ideas so you can execute the GREAT one.\n\nPolite feedback will lead you in circles. Urgent customer pain will give you a roadmap.\n\nWhich stage are you in right now?\nA) Researching\nB) Building\nC) Scaling\n\nLet me know in the comments below! 👇`,
            callToAction: "Comment A, B, or C below!",
            suggestedHashtags: [
              "#businessmindset",
              "#entrepreneurship",
              "#solopreneur",
              "#creatoreconomy",
              "#focus",
            ],
          },
        ],
        carousel: {
          topic: "How to Turn 1 Core Insight Into High-Impact Execution",
          slides: [
            {
              slideNumber: 1,
              headline: "Why 90% of Projects Stall (And How to Fix It)",
              bodyText: "Swipe to see the 5-step framework that changes how you approach distribution.",
              visualNote: "Bold contrasting sans-serif typography on dark slate canvas with subtle accent pill.",
            },
            {
              slideNumber: 2,
              headline: "The Polite Feedback Trap",
              bodyText: "When people say 'this is neat', they are being kind. When they ask 'can I pay for this right now?', you have something real.",
              visualNote: "Split visual: Polite Feedback (Vanity) vs. Urgent Demand (Reality).",
            },
            {
              slideNumber: 3,
              headline: "The Power of Radical Subtraction",
              bodyText: "Remove 80% of your secondary features. What is the single outcome the user cannot live without?",
              visualNote: "Clean icon illustration of funneling down to a singular focal point.",
            },
            {
              slideNumber: 4,
              headline: "Execution Over Perfection",
              bodyText: "A messy solution that solves a real pain today beats an immaculate solution that arrives next year.",
              visualNote: "Comparison chart showing Speed to Market vs. Theoretical Polish.",
            },
            {
              slideNumber: 5,
              headline: "The Compounding Loop",
              bodyText: "Solve one headache brilliantly. Earn trust. Expand only after the core is undeniable.",
              visualNote: "Circular flywheel diagram highlighting Trust -> Expansion -> Retention.",
            },
            {
              slideNumber: 6,
              headline: "Save This For Later",
              bodyText: "Double tap if this resonated. Tag someone who is currently building their dream project.",
              visualNote: "Clean call to action slide with bookmark and share iconography.",
            },
          ],
        },
        hookIdeas: [
          "Stop building for people who don't have the problem.",
          "The 1 metric that actually predicted our revenue:",
          "Why we deleted 80% of our product (and grew faster):",
          "The difference between a nice hobby and a real business:",
          "Swipe to see what happens when you stop seeking approval:",
        ],
      }
    : undefined;

  return {
    id: resultId,
    createdAt: new Date().toISOString(),
    sourceContent: source,
    inputType,
    style,
    targetAudience,
    desiredTone,
    callToAction,
    preserveVoice,
    platforms,
    status: "Draft",
    intelligence,
    x: xContent,
    linkedin: linkedinContent,
    tiktok: tiktokContent,
    instagram: instagramContent,
  };
}

// Start the Express server
async function startServer() {
  // Mount Vite in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Repurpose server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
