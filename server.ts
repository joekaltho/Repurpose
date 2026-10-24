import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

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

import {
  CREDIT_CONFIG,
  calculateRepurposeCost,
  DEFAULT_FREE_ALLOWANCE,
} from "./src/config/credits";
import {
  validateContentGrounding,
  sanitizeUngroundedClaims,
} from "./src/utils/sourceGrounding";

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: "gemini-3.8-flash",
  });
});

// Central credit configuration endpoint
app.get("/api/credit-config", (req, res) => {
  res.json({
    defaultFreeAllowance: DEFAULT_FREE_ALLOWANCE,
    creditConfig: CREDIT_CONFIG,
  });
});

// URL content extraction endpoint
app.post("/api/extract-url", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Valid URL is required" });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch webpage (HTTP ${response.status})`);
    }

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

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

// Voice Profile Analysis endpoint (Extracts founder voice fingerprint from samples)
app.post("/api/analyze-voice", async (req, res) => {
  try {
    const {
      writingSamples = [],
      bio = "",
      startupOneLiner = "",
      founderName = "",
      userBalance,
      requestId = `voice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    } = req.body;

    if (!writingSamples || writingSamples.length === 0 || writingSamples.join("").trim().length < 40) {
      return res.status(400).json({
        error: "Please provide at least one representative writing sample (40+ characters) to analyze.",
      });
    }

    // Server-side credit check: voice analysis costs CREDIT_CONFIG.VOICE_FINGERPRINT_ANALYSIS
    const requiredCredits = CREDIT_CONFIG.VOICE_FINGERPRINT_ANALYSIS;
    if (typeof userBalance === "number" && userBalance < requiredCredits) {
      return res.status(402).json({
        error: "Insufficient credits",
        requiredCredits,
        balance: userBalance,
        message: `Voice fingerprint analysis requires ${requiredCredits} credits, but you have ${userBalance} available.`,
      });
    }

    const ai = getGeminiClient();
    let resultPayload: any = null;

    if (ai) {
      try {
        const prompt = `You are an expert ghostwriter and voice analyst for technical founders, indie hackers, and startup CEOs.
Analyze the following writing samples and context from a founder:
FOUNDER NAME: ${founderName || "Founder"}
BIO / BACKGROUND: ${bio || "Technical Founder"}
STARTUP ONE-LINER: ${startupOneLiner || "B2B Software"}

WRITING SAMPLES:
${writingSamples.map((s: string, i: number) => `Sample ${i + 1}:\n"""${s}"""`).join("\n\n")}

Task: Extract their distinctive voice fingerprint.
Return strictly valid JSON with this schema:
{
  "voiceSummary": "2-3 sentences summarizing their signature voice, cadence, and worldview.",
  "toneCharacteristics": ["4-6 concise tone adjectives, e.g. 'Direct', 'Unflinching', 'Operator-pragmatic']",
  "signatureRhythm": "1-2 sentences on sentence length, whitespace, and structural quirks.",
  "recommendedBannedPhrases": ["4-6 specific buzzwords that would ruin this founder's voice"]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        });

        const rawText = response.text || "";
        const jsonText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        resultPayload = JSON.parse(jsonText);
      } catch (geminiErr) {
        console.error("Voice analysis with Gemini failed, falling back to heuristic:", geminiErr);
      }
    }

    if (!resultPayload) {
      // Heuristic fallback
      const sampleText = writingSamples.join(" ");
      const words = sampleText.split(/\s+/).filter(Boolean);
      const sentences = sampleText.split(/[.?!]+/).filter(Boolean);
      const avgSentLen = words.length / (sentences.length || 1);
      const isPunchy = avgSentLen < 15;
      const isTechnical = /latency|postgres|api|code|docker|infra|scale|deploy|sql|db/i.test(sampleText);

      resultPayload = {
        voiceSummary: `Authoritative, ${isPunchy ? "punchy and high-velocity" : "deliberate and analytical"} voice focused on practical realities rather than theoretical hype. Speaks from firsthand builder experience with zero patience for corporate posturing.`,
        toneCharacteristics: [
          isPunchy ? "Direct & concise" : "Analytical & rigorous",
          isTechnical ? "Deep technical credibility" : "Pragmatic builder perspective",
          "Zero fluff",
          "Hard-won realism",
          "Action-oriented",
        ],
        signatureRhythm: `${isPunchy ? "Short, declarative sentences (average ~" + Math.round(avgSentLen) + " words) with sharp line breaks" : "Structured paragraphs with clear causal argumentation"}. Leans on real operational contrasts over abstract claims.`,
        recommendedBannedPhrases: [
          "supercharge",
          "game changer",
          "in today's fast-paced world",
          "let's dive in",
          "unlock your potential",
          "buckle up",
        ],
      };
    }

    // Credits are charged ONLY when generation succeeds
    return res.json({
      ...resultPayload,
      creditUsage: {
        operation: "voice_analysis",
        cost: requiredCredits,
        description: "AI Voice Fingerprint Analysis",
        requestId,
      },
    });
  } catch (err: any) {
    console.error("Voice analysis error:", err);
    return res.status(500).json({ error: err.message || "Failed to analyze voice." });
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
      targetAudience = "Technical founders, engineers, and startup CEOs",
      desiredTone = "Insightful, direct, conversational",
      callToAction = "Share thoughts in comments or follow for more",
      preserveVoice = true,
      regeneratePlatform,
      voiceProfile,
      contentGoal = "Share engineering lessons",
      userBalance,
      requestId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    } = req.body;

    if (!sourceContent || typeof sourceContent !== "string" || sourceContent.trim().length < 20) {
      return res.status(400).json({
        error: "Source content is required and should be at least 20 characters.",
      });
    }

    // Calculate actual cost based on operations performed
    const isRegeneration = Boolean(regeneratePlatform);
    const requiredCredits = calculateRepurposeCost(platforms, isRegeneration);

    // Enforce balance check on the server
    if (typeof userBalance === "number" && userBalance < requiredCredits) {
      return res.status(402).json({
        error: "Insufficient credits",
        requiredCredits,
        balance: userBalance,
        message: `This operation requires ${requiredCredits} credits, but you have ${userBalance} available. Please upgrade your capacity or select fewer platforms.`,
      });
    }

    const ai = getGeminiClient();

    // Prepare voice profile context & learned feedback rules
    const hasFounderName = Boolean(voiceProfile?.founderName && voiceProfile.founderName.trim());
    const founderName = hasFounderName ? voiceProfile.founderName : "Founder";
    const hasStartupName = Boolean(voiceProfile?.startupName && voiceProfile.startupName.trim());
    const startupName = hasStartupName ? voiceProfile.startupName : "";
    const startupOneLiner = voiceProfile?.startupOneLiner || "";
    const founderBio = voiceProfile?.bio || "";
    const activeAdjustments = (voiceProfile?.learnedAdjustments || [])
      .filter((adj: any) => adj.active)
      .map((adj: any) => adj.feedback);

    const bannedPhrases = Array.from(
      new Set([
        "in today's fast-paced world",
        "here's the thing",
        "let's dive in",
        "unlock your potential",
        "game changer",
        "supercharge",
        "crucial",
        "it's no secret that",
        "buckle up",
        "at the end of the day",
        "delve",
        "testament",
        "landscape",
        ...(voiceProfile?.bannedPhrases || []),
      ])
    );

    const writingSamples = voiceProfile?.writingSamples || [];

    let generationFailed = false;
    if (ai) {
      try {
        const systemPrompt = `You are an elite editorial ghostwriter and content repurposing strategist exclusively for technical founders, indie hackers, and startup CEOs.
Your mission is to take ONE raw thought, incident, learning, or note and reconstruct it into platform-native content that sounds authentically like the user.

USER CONTEXT:
- Founder Name: ${hasFounderName ? founderName : "(Not specified - speak in authentic founder voice without inventing a persona)"}
- Founder Role & Background: ${founderBio || "Technical Founder"}
- Startup Name: ${hasStartupName ? startupName : "(Not specified - do NOT invent a company or product name)"}
- Startup What-It-Does: ${startupOneLiner || "(Not specified - only refer to product details provided in the source)"}
- Target Audience: ${targetAudience || voiceProfile?.targetAudience || "Engineers and founders"}
- Content Objective / Goal: ${contentGoal}
- Content Style / Archetype: ${style}
- Desired Tone: ${desiredTone}
- Preferred Call to Action: ${callToAction}
- Tone Traits: ${(voiceProfile?.toneCharacteristics || []).join(", ") || "Direct, pragmatic, grounded"}

ACTIVE LEARNED VOICE ADJUSTMENTS (RULES TAUGHT BY USER FEEDBACK):
${activeAdjustments.length > 0 ? activeAdjustments.map((a: string) => `• ${a}`).join("\n") : "• Maintain a natural, unfiltered builder tone with concise paragraphs."}

${writingSamples.length > 0 ? `
REPRESENTATIVE WRITING SAMPLES (MIMIC THIS EXACT CADENCE AND STYLE, DO NOT COPY FACTS FROM IT):
${writingSamples.map((s: string, i: number) => `Sample ${i + 1}:\n"""${s}"""`).join("\n\n")}
` : ""}

================================================================================
CRITICAL CONSTITUTION: ABSOLUTE FACTUAL INTEGRITY & ZERO-FABRICATION MANDATE
================================================================================
You must follow these rules without exception. Violating any rule breaks trust with the user.

1. ZERO FABRICATION OF FACTS & FIRST-PERSON ANECDOTES:
   - NEVER invent personal experiences, past launches, customer conversations, user feedback, experiments, decisions, or outcomes.
   - NEVER invent customer interviews, user counts, ghosting counts, revenue, MRR, ARR, percentages, dates, metrics, or business milestones.
   - ABSOLUTELY PROHIBITED CLAIMS (NEVER GENERATE UNLESS EXPLICITLY IN THE SOURCE):
     * "Interviewing 40 potential customers"
     * "39 people ghosting after being asked to pay"
     * "Growing a company to $45k MRR in four months"
     * "A logistics broker managing 14 spreadsheets"
     * "Here is what we learned from launching our first version"
     * "When we launched, everyone gave polite compliments"
     * "The turning point was talking to one user..."
     * "We stripped out our fancy secondary features..."
     * Or any other fabricated customer conversation, dollar figure, or growth milestone.
   - If the user did not say they launched a product, DO NOT say they launched.
   - If the user did not say they interviewed users, DO NOT invent customer interviews or conversations.
   - If the user did not say they reached a revenue number, DO NOT invent a revenue number.

2. SEPARATE FACTS FROM CREATIVE WRITING:
   - Your job is to improve structure, clarity, storytelling cadence, hooks, tone, and platform formatting.
   - If the user provides an OPINION, CURRENT STRUGGLE, or EARLY UNCERTAINTY (e.g. "I struggle to get businesses to sign up. I'm still learning what customers need"):
     * Write honest, grounded content addressing THAT EXACT CURRENT REALITY.
     * Frame lessons as open principles, candid reflections, and questions for other founders—NOT as past victories, solved problems, or specific past incidents!
   - If a metric or evidence would strengthen a post, DO NOT invent a number. Instead:
     * Use a clean bracketed placeholder (e.g., "[Insert your latency / metric here]" or "[Add your drop-off %]").
     * Note it in the "missingContextNotes" array so the founder can supply their real number if they wish.

3. PRESERVE FACTUAL SCOPE:
   - Never turn a hypothetical example into a first-person claim of fact (e.g. never claim "When I did X" if the user was stating a general principle).
   - Preserve the exact meaning and factual scope of the source material across all platforms.
   - Never assume the user's company, identity, customers, or achievements based on a default profile.

4. BANNED PHRASES & CLICHES:
   - NEVER use: ${bannedPhrases.map((p) => `"${p}"`).join(", ")}.
   - Avoid generic AI corporate transitions ("Whether you are a...", "In conclusion", "Fast forward to today").

5. PLATFORM NATIVE CONVENTIONS:
   - Discerning technical readers: engineers, founders, and operators who hate corporate fluff.
   - Use whitespace intentionally. No emojis at the start of bullet points unless natural.

PLATFORM SPECIFICATIONS:
- "intelligence":
  * "coreMessage": exactly 1 sharp sentence defining the central insight or argument from the source.
  * "bestAngle": the single strongest angle (e.g., contrarian perspective, counter-intuitive insight, honest builder mistake).
  * "potentialHooks": array of 3 strong, distinct scroll-stopping hooks extracted or crafted from the text without inventing fake facts.
  * "contentOpportunities": array of 3-4 specific spin-off post ideas that could be created from distinct sub-points in the source.
  * "keyQuotesAndClaims": array of 2-3 quotable punchy lines from the source text.
  * "missingContextNotes": array of 1-2 prompts noting details the founder could optionally add for higher proof (e.g., "Adding your actual metric or timeframe would make the opening even stronger").

${platforms.includes("x") ? `
- "x":
  * "hooks": exactly 3 genuinely different hook options (1 bold contrarian assertion, 1 curiosity/tradeoff hook, 1 direct question/bottleneck hook) strictly derived from source points.
  * "standalonePost": 1 complete, publish-ready single post under 270 characters, crisp linebreaks, high-signal, zero corporate jargon, with relevant closing or CTA.
  * "thread": array of 4 to 6 tweet strings forming a cohesive, logically connected thread with a clear beginning, useful middle, and strong conclusion. Every tweet MUST contain the actual text of that post in sequence (e.g. "1/5 ...", "2/5 ..."), contribute real substantive points from the source notes, and advance the argument. NO repetitive filler.
  * "closingLines": 3 alternative strong ending lines / RT calls that feel natural for a founder.
  * "callToAction": 1 relevant natural call to action.
` : ""}

${platforms.includes("linkedin") ? `
- "linkedin":
  * "variations": array of 3 post variations, where the FIRST variation (variations[0]) is the COMPLETE, PUBLISH-READY PRIMARY POST with title "Primary Publish-Ready Post", a clear argument, useful explanation, natural paragraph flow, generous readable whitespace, and a relevant ending discussion question or CTA.
  * "alternativeHooks": array of exactly 2 alternative opening hooks for the primary post so the founder can easily test different openings without assembling fragments.
` : ""}

${platforms.includes("tiktok") ? `
- "tiktok":
  * "scripts": array of 1 to 2 video scripts, where scripts[0] is the COMPLETE VIDEO SCRIPT ready to speak on camera.
    Must include:
    - "title": descriptive hook style.
    - "hook": the exact first 3 seconds spoken line.
    - "spokenScript": the full, natural, speakable body dialogue with concrete substance and natural conversational pacing that a human founder can genuinely say on camera.
    - "onScreenText": array of 3-4 text overlay cues in a separate section.
    - "callToAction": clear, natural verbal CTA at the end.
    - "estimatedDuration": e.g., "35 seconds" or "45 seconds".
` : ""}

${platforms.includes("instagram") ? `
- "instagram":
  * "captions": 1 to 2 complete captions with clear paragraph flow, bullet points, natural CTA, and 4-6 targeted hashtags.
  * "carousel": 1 high-value educational/story carousel outline. Must include "topic" and "slides" array of 5 to 7 slides, where every slide contributes substantive value to the story (slideNumber, headline, bodyText with real meat, visualNote).
  * "hookIdeas": 3 visual / first-slide hook ideas for covers.
` : ""}

Output MUST be strictly valid JSON matching the schema with no markdown code blocks or surrounding text.`;

        const userPrompt = `SOURCE CONTENT TYPE: ${inputType.toUpperCase()}
SOURCE CONTENT:
"""
${sourceContent}
"""

${regeneratePlatform ? `NOTE: Regenerate content specifically for platform: ${regeneratePlatform}. Produce fresh, high-signal variations.` : ""}

MANDATORY FACTUAL INTEGRITY INSTRUCTION:
Do NOT invent customer interviews (e.g. "interviewed 40 people"), ghosting counts ("39 ghosted"), revenue metrics ("$45k MRR"), customer job titles ("logistics broker with 14 spreadsheets"), or personal anecdotes not explicitly stated in the source text above. If the source is an argument or thought, write compelling content around the argument. Return strictly JSON.`;

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
        const jsonText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        const parsed = JSON.parse(jsonText);

        // Run Source Grounding Validation Check
        const groundingReport = validateContentGrounding(sourceContent, voiceProfile, parsed);

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
          voiceProfileId: voiceProfile?.id,
          voiceProfileName: voiceProfile?.name || (hasFounderName ? `${founderName}${hasStartupName ? ` (${startupName})` : ''}` : "Builder Voice"),
          contentGoal,
          sourceGrounding: groundingReport,
          intelligence: parsed.intelligence || {
            coreMessage: "Central insight extracted from your source idea.",
            bestAngle: "Direct actionable framework",
            potentialHooks: ["Most people approach this completely backward."],
            contentOpportunities: ["Deep-dive into step 1", "Engineering postmortem"],
            missingContextNotes: ["Consider adding your exact time saved or metric for extra proof."],
          },
          x: platforms.includes("x") ? parsed.x : undefined,
          linkedin: platforms.includes("linkedin") ? parsed.linkedin : undefined,
          tiktok: platforms.includes("tiktok") ? parsed.tiktok : undefined,
          instagram: platforms.includes("instagram") ? parsed.instagram : undefined,
        };

        const creditUsage = {
          operation: isRegeneration ? "platform_regenerate" : "repurpose",
          cost: requiredCredits,
          description: isRegeneration
            ? `Regenerated ${String(regeneratePlatform).toUpperCase()}`
            : `Repurposed across ${platforms.length} platform${platforms.length > 1 ? "s" : ""} (${platforms.join(", ").toUpperCase()})`,
          requestId,
        };

        return res.json({
          ...result,
          creditUsage,
        });
      } catch (geminiError: any) {
        console.error("Gemini generation failed:", geminiError);
        generationFailed = true;
      }
    }

    // No templated fallback: it produced generic text and still charged credits.
    // Fail honestly instead; the client only deducts credits on success.
    return res.status(503).json({
      error: !ai
        ? "Generation is not configured on this server (missing GEMINI_API_KEY)."
        : generationFailed
        ? "Generation failed. You were not charged. Please try again."
        : "No content was generated. You were not charged.",
    });
  } catch (err: any) {
    console.error("Repurpose route error:", err);
    return res.status(500).json({
      error: err.message || "Failed to repurpose content. Please try again.",
    });
  }
});

// Smart generator function that produces strictly source-grounded content directly from source ideas
function generateSmartRepurpose(
  source: string,
  inputType: string,
  platforms: string[],
  style: string,
  targetAudience: string,
  desiredTone: string,
  callToAction: string,
  preserveVoice: boolean,
  voiceProfile?: any,
  contentGoal?: string
) {
  const hasFounderName = Boolean(voiceProfile?.founderName && voiceProfile.founderName.trim());
  const hasStartupName = Boolean(voiceProfile?.startupName && voiceProfile.startupName.trim());
  const companyMention = hasStartupName ? ` at ${voiceProfile.startupName}` : "";
  const founderMention = hasFounderName ? voiceProfile.founderName : "Founder";

  // Clean and parse sentences from the raw source note
  const rawSentences = source
    .replace(/\r?\n+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);

  const fallbackThesis = source.length > 140 ? `${source.slice(0, 137)}...` : source;
  const coreThesis = rawSentences.find((s) => s.length > 25 && s.length < 180) || rawSentences[0] || fallbackThesis;
  const otherSentences = rawSentences.filter((s) => s !== coreThesis);

  const point1 = otherSentences[0] || "Identify the acute bottleneck and address it directly.";
  const point2 = otherSentences[1] || "Eliminate vanity distractions that don't solve the core headache.";
  const point3 = otherSentences[2] || "Prioritize tangible clarity and execution over theoretical complexity.";

  const resultId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const intelligence = {
    coreMessage: coreThesis.endsWith(".") ? coreThesis : `${coreThesis}.`,
    bestAngle: `Grounded builder insight for ${targetAudience.toLowerCase()}: Actionable lessons derived directly from your notes.`,
    potentialHooks: [
      coreThesis,
      `A critical perspective on how to approach this:`,
      `The single most overlooked reality for ${targetAudience.toLowerCase()}:`,
      `Why standard assumptions break down when applied here:`,
      `A practical principle on this challenge:`,
    ],
    contentOpportunities: [
      `Deep-dive into: "${point1.slice(0, 50)}..."`,
      `Strategic breakdown: "${point2.slice(0, 50)}..."`,
      `Implementation pitfalls: "${coreThesis.slice(0, 45)}..."`,
      `Execution postmortem: "${point3.slice(0, 50)}..."`,
    ],
    keyQuotesAndClaims: [
      coreThesis,
      point1,
      point2,
    ],
    missingContextNotes: [
      "Tip: If you have a specific metric or timeframe from your actual results, add it directly to your post. Never invent numbers.",
    ],
  };

  const xContent = platforms.includes("x")
    ? {
        hooks: [
          coreThesis,
          `Unpopular perspective for ${targetAudience.toLowerCase()}: ${point1}`,
          `The single question founders avoid asking about this:`,
        ],
        standalonePost: `${coreThesis}\n\n${point1}\n\n${callToAction || "What is your experience with this?"}`,
        thread: [
          `1/5 ${coreThesis}\n\nHere is a practical breakdown for ${targetAudience.toLowerCase()}:`,
          `2/5 The root bottleneck:\n\n${point1}\n\nWhen this goes unaddressed, adding secondary features only obscures the friction.`,
          `3/5 What works instead:\n\n${point2}\n\nFocus on eliminating the immediate drag before building for future scale.`,
          `4/5 Guiding principle:\n\n${point3}\n\nClarity in execution beats speculative complexity every single time.`,
          `5/5 ${callToAction || "If this resonated, bookmark this thread and drop your thoughts below."}`,
        ],
        closingLines: [
          `If this resonated with your experience, drop your perspective in the replies.`,
          `Save this thread before your next planning review.`,
          `Share this if you value substance over premature complexity.`,
        ],
        callToAction: callToAction || "Drop your perspective in the replies.",
      }
    : undefined;

  const linkedinContent = platforms.includes("linkedin")
    ? {
        variations: [
          {
            title: "Primary Publish-Ready Post",
            angle: "A grounded, clear founder perspective addressing the central premise with actionable clarity.",
            content: `${coreThesis}\n\nMost teams spend too much time on secondary details while overlooking the root bottleneck.\n\nThree key observations on this challenge:\n\n1. Target the Core Problem\n${point1}\n\n2. Strip Out the Noise\n${point2}\n\n3. Deliver Definite Clarity\n${point3}\n\n${callToAction || "How does your team filter out distractions when tackling this?"}`,
          },
          {
            title: "The Tactical Breakdown (Actionable)",
            angle: "Clear, grounded framework addressing the core premise directly from the notes.",
            content: `A builder lesson worth remembering:\n\n${coreThesis}\n\nWhen you examine why initiatives stall, it is rarely due to lack of effort. It is almost always a lack of focus on the single outcome that actually delivers relief.\n\n${point1}\n\n${point2}\n\nFocus on solving the acute headache first.\n\nWhat is your team's primary priority this week?`,
          },
          {
            title: "The Contrarian Angle (High Signal)",
            angle: "Sharp, thought-provoking examination of common assumptions.",
            content: `Unpopular observation:\n\n${coreThesis}\n\nConventional advice often pushes for more layers, more features, and more process.\n\nIn reality, breakthroughs come from clarity:\n- ${point1}\n- ${point2}\n- ${point3}\n\nAgree or disagree?`,
          },
        ],
        alternativeHooks: [
          `The hardest part of building isn't the technical execution—it's this:`,
          `Most advice on this topic focuses on the wrong variable entirely.`,
        ],
      }
    : undefined;

  const tiktokContent = platforms.includes("tiktok")
    ? {
        scripts: [
          {
            title: "The Direct Founder Breakdown",
            hook: "Stop approaching this the conventional way. Here is why.",
            spokenScript: `(Direct to camera, steady conversational pace)\n\nStop approaching this the conventional way. Here is why.\n\n${coreThesis}\n\nMost people get bogged down in secondary noise and lose sight of the real issue.\n\nHere is the shift:\n${point1}\n\n${point2}\n\nWhen you cut straight to the acute problem, everything becomes ten times clearer.\n\n${callToAction || "Drop a comment if you have experienced this too."}`,
            onScreenText: [
              "The Conventional Trap 🛑",
              "The Root Bottleneck 🎯",
              "What Actually Works 💡",
              "Core Principle 📌",
            ],
            callToAction: callToAction || "Drop a comment if you've seen this happen too.",
            estimatedDuration: "35 seconds",
          },
          {
            title: "The 3-Point Teardown",
            hook: "Three things to remember before you overcomplicate your project.",
            spokenScript: `(Visual list layout)\n\nThree things to keep in mind:\n\nPoint 1: ${point1}\n\nPoint 2: ${point2}\n\nPoint 3: ${point3}\n\nSimplicity scales.`,
            onScreenText: [
              "3 KEY POINTS 📌",
              "1. The Core Focus",
              "2. Eliminate Noise",
              "3. Execute with Clarity",
            ],
            callToAction: "Save this for your next project review.",
            estimatedDuration: "30 seconds",
          },
        ],
      }
    : undefined;

  const instagramContent = platforms.includes("instagram")
    ? {
        captions: [
          {
            caption: `${coreThesis}\n\nIt is tempting to believe that more complexity leads to better results.\n\nIn reality, progress comes from ruthless clarity:\n• ${point1}\n• ${point2}\n• ${point3}\n\nSwipe through the carousel 👉 for the full breakdown.\n\n${callToAction || "Save this post for your next strategy session."}`,
            callToAction: "Save this post for your next planning session.",
            suggestedHashtags: [
              "#startuptips",
              "#technicalfounder",
              "#softwareengineering",
              "#buildinginpublic",
              "#clarity",
            ],
          },
        ],
        carousel: {
          topic: coreThesis.slice(0, 50),
          slides: [
            {
              slideNumber: 1,
              headline: coreThesis.slice(0, 50),
              bodyText: "Swipe to see the breakdown of what actually works in practice.",
              visualNote: "Minimal dark charcoal canvas with high-contrast typography.",
            },
            {
              slideNumber: 2,
              headline: "The Core Bottleneck",
              bodyText: `${point1}\n\nWhen this goes unaddressed, adding more features only obscures the real friction.`,
              visualNote: "Clean centered quote block with subtle accent border.",
            },
            {
              slideNumber: 3,
              headline: "The Common Trap",
              bodyText: `Most teams focus on surface symptoms instead of addressing the underlying constraint.`,
              visualNote: "Split layout highlighting the trap vs the reality.",
            },
            {
              slideNumber: 4,
              headline: "What Works Instead",
              bodyText: `${point2}\n\nEliminating unnecessary drag delivers immediate momentum.`,
              visualNote: "Contrasting layout emphasizing subtraction over addition.",
            },
            {
              slideNumber: 5,
              headline: "The Guiding Rule",
              bodyText: `${point3}\n\nClarity in execution beats speculative complexity every single time.`,
              visualNote: "Summary takeaway slide with clean bullet structure.",
            },
            {
              slideNumber: 6,
              headline: "Save For Later",
              bodyText: callToAction || "Double tap and save this for your next sprint review.",
              visualNote: "Action slide with bookmark iconography.",
            },
          ],
        },
        hookIdeas: [
          coreThesis.slice(0, 50),
          "Why conventional wisdom fails in practice:",
          "The single rule that keeps our priorities clear:",
        ],
      }
    : undefined;

  const rawOutput = {
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
    voiceProfileId: voiceProfile?.id,
    voiceProfileName: voiceProfile?.name || (hasFounderName ? `${founderMention}${companyMention}` : "Builder Voice"),
    contentGoal,
    intelligence,
    x: xContent,
    linkedin: linkedinContent,
    tiktok: tiktokContent,
    instagram: instagramContent,
  };

  const groundingReport = validateContentGrounding(source, voiceProfile, rawOutput);

  return {
    ...rawOutput,
    sourceGrounding: groundingReport,
  };
}

// Start the Express server
async function startServer() {
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
