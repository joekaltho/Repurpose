import { GroundingFlag, Platform, SourceGroundingReport } from '../types';

/**
 * SOURCE GROUNDING & FACTUAL INTEGRITY ENGINE
 * 
 * Enforces strict factual integrity across all AI generations and platform repurposing.
 * Prevents hallucinations, fabricated metrics, invented customer counts, fake revenue,
 * and false first-person anecdotes.
 */

// Common metric & anecdote trigger patterns
const METRIC_REGEX = /(?:\$\s*\d+[\d,.]*(?:\s*[kKmMbB])?|\b\d+[\d,.]*\s*(?:%|percent|k|m|b|mrr|arr|users|customers|clients|hours|months|days|weeks|spreadsheets|interviews)\b)/gi;

const ANECDOTE_TRIGGERS = [
  {
    pattern: /\b(?:interview(?:ed|ing)?|survey(?:ed|ing)?|talk(?:ed|ing)? to)\s+(\d+)\b/i,
    name: 'Customer interview count',
  },
  {
    pattern: /\b(\d+)\s+(?:of them|people|users)?\s+(?:ghosted|ghosting)\b/i,
    name: 'Ghosting/churn count',
  },
  {
    pattern: /\b(?:grew|scaled|reached)\s+to\s+(\$[\d,.]+[kKmM]?|\d+[kKmM]?\s+mrr)/i,
    name: 'Revenue/MRR outcome',
  },
  {
    pattern: /\bmanaging\s+(\d+)\s+spreadsheets\b/i,
    name: 'Spreadsheet count anecdote',
  },
  {
    pattern: /\b(?:tripled|doubled|quadrupled)\s+in\s+(\d+\s+(?:days|weeks|months))\b/i,
    name: 'Accelerated growth timeframe',
  },
  {
    pattern: /\bworked\s+(\d+)-hour\s+days\b/i,
    name: 'Working hours anecdote',
  },
  {
    pattern: /\b(?:here is what we learned from launching|what we learned from launching)\b/i,
    name: 'Fabricated launch takeaway narrative',
  },
  {
    pattern: /\b(?:when we launched|launching our first version|after we launched)\b/i,
    name: 'Fabricated product launch event',
  },
  {
    pattern: /\b(?:everyone gave polite compliments|polite compliments|polite praise)\b/i,
    name: 'Fabricated polite praise anecdote',
  },
  {
    pattern: /\b(?:the turning point was talking to|turning point was talking to|turning point was)\b/i,
    name: 'Fabricated turning point customer story',
  },
  {
    pattern: /\b(?:we stripped out our fancy|stripped out our fancy secondary|stripped out secondary features)\b/i,
    name: 'Fabricated feature removal narrative',
  },
  {
    pattern: /\b(?:logistics broker|managing 14 spreadsheets)\b/i,
    name: 'Fabricated logistics broker anecdote',
  },
  {
    pattern: /\b(?:our first customer said|one user told us|a customer told us)\b/i,
    name: 'Fabricated user conversation',
  },
];

/**
 * Extracts all explicit factual tokens (numbers, currency figures, percentages)
 * present in the source text and voice profile.
 */
export function extractExplicitFacts(sourceText: string, voiceProfile?: any): Set<string> {
  const facts = new Set<string>();

  const combined = [
    sourceText,
    voiceProfile?.bio || '',
    voiceProfile?.startupOneLiner || '',
    ...(voiceProfile?.writingSamples || []),
  ].join(' ').toLowerCase();

  // Extract all numbers and metrics
  const matches = combined.match(/\b\d+[\d,.]*(?:%|[kKmMbB])?\b/g) || [];
  matches.forEach((m) => facts.add(m.trim().replace(/,/g, '')));

  // Extract dollar amounts
  const dollars = combined.match(/\$\s*\d+[\d,.]*(?:[kKmMbB])?/g) || [];
  dollars.forEach((d) => facts.add(d.toLowerCase().replace(/[\s,]/g, '')));

  // Extract key words / numbers
  const words = combined.match(/\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\b/gi) || [];
  words.forEach((w) => facts.add(w.toLowerCase()));

  return facts;
}

/**
 * Performs a comprehensive audit of generated content against the source input.
 * Flags any metric, statistic, revenue claim, or customer count not grounded in the source.
 */
export function validateContentGrounding(
  sourceText: string,
  voiceProfile: any,
  generatedContent: any
): SourceGroundingReport {
  const explicitFacts = extractExplicitFacts(sourceText, voiceProfile);
  const flags: GroundingFlag[] = [];
  const normalizedSource = sourceText.toLowerCase();

  // Helper to test text segment for ungrounded claims
  const inspectText = (text: string, platform: Platform | 'general', locationDescription: string) => {
    if (!text || typeof text !== 'string') return;

    // 1. Check anecdote patterns
    for (const trigger of ANECDOTE_TRIGGERS) {
      const match = text.match(trigger.pattern);
      if (match) {
        const matchedSnippet = match[0];
        // Check if this exact snippet or its key number exists in the source text
        const keyNumber = match[1]?.toLowerCase().replace(/[\$,]/g, '');
        const isPresentInSource =
          normalizedSource.includes(matchedSnippet.toLowerCase()) ||
          (keyNumber && (explicitFacts.has(keyNumber) || normalizedSource.includes(keyNumber)));

        if (!isPresentInSource) {
          flags.push({
            claim: matchedSnippet,
            reason: `Fabricated claim/anecdote detected (${trigger.name}: "${matchedSnippet}"). Not present in source notes.`,
            severity: 'warning',
            platform,
          });
        }
      }
    }

    // 2. Check general metrics ($ figures, % figures, customer counts)
    const metricMatches = text.match(METRIC_REGEX) || [];
    for (const metric of metricMatches) {
      const cleanMetric = metric.toLowerCase().replace(/[\s,]/g, '');
      const rawNumber = cleanMetric.replace(/[^\d.]/g, '');

      // Allow harmless slide numbers like "1/6", "Slide 1", "Step 1", or general list numbers 1-10
      if (/^(?:1|2|3|4|5|6|7|8|9|10)$/.test(rawNumber) && !cleanMetric.includes('$') && !cleanMetric.includes('%') && !cleanMetric.includes('k') && !cleanMetric.includes('mrr')) {
        continue;
      }

      // If metric is a placeholder like [Insert your metric here], ignore
      if (text.includes(`[${metric}]`) || text.includes(`[Insert`) || text.includes(`[Add`)) {
        continue;
      }

      const isGrounded =
        explicitFacts.has(cleanMetric) ||
        explicitFacts.has(rawNumber) ||
        normalizedSource.includes(cleanMetric) ||
        normalizedSource.includes(metric.toLowerCase());

      if (!isGrounded) {
        // Check if already flagged
        const alreadyFlagged = flags.some((f) => f.claim.toLowerCase() === metric.toLowerCase());
        if (!alreadyFlagged) {
          flags.push({
            claim: metric,
            reason: `Metric or figure "${metric}" appears in ${locationDescription} but was never supplied in your source notes.`,
            severity: 'warning',
            platform,
          });
        }
      }
    }
  };

  // Audit Content Intelligence (Hooks, Core Message, Opportunities)
  if (generatedContent.intelligence) {
    inspectText(generatedContent.intelligence.coreMessage, 'general', 'Intelligence Core Message');
    (generatedContent.intelligence.potentialHooks || []).forEach((h: string, idx: number) =>
      inspectText(h, 'general', `Intelligence Hook #${idx + 1}`)
    );
    (generatedContent.intelligence.contentOpportunities || []).forEach((opp: string, idx: number) =>
      inspectText(opp, 'general', `Content Opportunity #${idx + 1}`)
    );
  }

  // Audit X content
  if (generatedContent.x) {
    (generatedContent.x.hooks || []).forEach((h: string, idx: number) =>
      inspectText(h, 'x', `X Hook #${idx + 1}`)
    );
    inspectText(generatedContent.x.standalonePost, 'x', 'X Standalone Post');
    (generatedContent.x.thread || []).forEach((tweet: string, idx: number) =>
      inspectText(tweet, 'x', `X Tweet #${idx + 1}`)
    );
  }

  // Audit LinkedIn content
  if (generatedContent.linkedin) {
    (generatedContent.linkedin.variations || []).forEach((v: any, idx: number) => {
      inspectText(v.content, 'linkedin', `LinkedIn Variation #${idx + 1} ("${v.title || 'Post'}")`);
    });
  }

  // Audit TikTok content
  if (generatedContent.tiktok) {
    (generatedContent.tiktok.scripts || []).forEach((s: any, idx: number) => {
      inspectText(s.spokenScript, 'tiktok', `TikTok Spoken Script #${idx + 1}`);
      inspectText(s.hook, 'tiktok', `TikTok Hook #${idx + 1}`);
    });
  }

  // Audit Instagram content
  if (generatedContent.instagram) {
    (generatedContent.instagram.captions || []).forEach((c: any, idx: number) => {
      inspectText(c.caption, 'instagram', `Instagram Caption #${idx + 1}`);
    });
    if (generatedContent.instagram.carousel?.slides) {
      generatedContent.instagram.carousel.slides.forEach((sl: any) => {
        inspectText(`${sl.headline} ${sl.bodyText}`, 'instagram', `Instagram Slide #${sl.slideNumber}`);
      });
    }
  }

  // Calculate score and status
  const score = Math.max(0, 100 - flags.length * 20);
  const status: 'grounded' | 'needs_review' = flags.length === 0 ? 'grounded' : 'needs_review';

  const message =
    flags.length === 0
      ? 'Factual integrity verified: All claims and angles are grounded in your source notes.'
      : `${flags.length} potential ungrounded claim${flags.length > 1 ? 's' : ''} detected. Review before publishing.`;

  return {
    isGrounded: flags.length === 0,
    status,
    score,
    checkedAt: new Date().toISOString(),
    flags,
    verifiedFactsCount: explicitFacts.size,
    message,
    explicitFactsDetected: Array.from(explicitFacts).slice(0, 8),
  };
}

/**
 * Sanitizes generated text by replacing ungrounded fabricated metrics with clean brackets.
 * E.g., replaces "$45k MRR" with "[your MRR]" if $45k was not in source.
 */
export function sanitizeUngroundedClaims(
  content: string,
  sourceText: string,
  voiceProfile?: any
): string {
  if (!content || typeof content !== 'string') return content;
  const facts = extractExplicitFacts(sourceText, voiceProfile);
  const normalizedSource = sourceText.toLowerCase();

  let sanitized = content;

  // Replace severe fabricated anecdote patterns
  sanitized = sanitized.replace(/\binterviewed\s+(\d+)\s+potential customers\b/gi, (match, num) => {
    return facts.has(num) ? match : `spoke with multiple customers [insert exact count]`;
  });

  sanitized = sanitized.replace(/\b(\d+)\s+people ghosting\b/gi, (match, num) => {
    return facts.has(num) ? match : `a significant number ghosting [insert drop-off %]`;
  });

  sanitized = sanitized.replace(/\bgrowing (?:a company|our startup) to\s+\$45k MRR in four months\b/gi, (match) => {
    return normalizedSource.includes('45k') ? match : `growing our revenue [insert your MRR trajectory]`;
  });

  sanitized = sanitized.replace(/\ba logistics broker managing 14 spreadsheets\b/gi, (match) => {
    return normalizedSource.includes('logistics broker') ? match : `a customer managing messy manual spreadsheets`;
  });

  // Sanitize fabricated launch / polite compliments / turning point claims
  sanitized = sanitized.replace(/\b(?:here is what we learned from launching our first version|what we learned from launching our first version)\b/gi, (match) => {
    return normalizedSource.includes('first version') ? match : `Here is what becomes apparent when testing early ideas`;
  });

  sanitized = sanitized.replace(/\bwhen we launched,? everyone gave polite compliments(?:\s*\([^)]*\))?\b/gi, (match) => {
    return normalizedSource.includes('polite compliments') ? match : `Early on, polite praise often masks the absence of real daily necessity`;
  });

  sanitized = sanitized.replace(/\bthe turning point was talking to (?:one user|a user)[^.\n]*\b/gi, (match) => {
    return normalizedSource.includes('turning point') ? match : `Real clarity comes from isolating the single acute operational bottleneck`;
  });

  sanitized = sanitized.replace(/\bwe stripped out our fancy secondary features\b/gi, (match) => {
    return normalizedSource.includes('stripped out') ? match : `Stripping away non-essential features reveals the actual core value`;
  });

  return sanitized;
}
