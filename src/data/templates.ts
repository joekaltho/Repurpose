import { TemplatePrompt } from '../types';

export const SAMPLE_TEMPLATES: TemplatePrompt[] = [
  {
    id: 'contrarian-insight',
    title: 'The Contrarian Lesson',
    category: 'Startup & Strategy',
    description: 'Challenge common industry wisdom with hard-won experience and crisp arguments.',
    suggestedStyle: 'Bold / Contrarian',
    suggestedTone: 'Direct, sharp, no-fluff',
    suggestedAudience: 'Founders, operators, and ambitious builders',
    sampleInput: `Most startups fail not because their product is bad, but because they build for a phantom customer they wish existed rather than the desperate one who actually pays.

We spent 9 months building an AI workflow optimizer. We had 40 user interviews where people said "this looks super cool, definitely keep me updated." When we asked for $49/mo, 39 of them ghosted.

The one customer who paid? A frantic logistics broker managing 14 spreadsheets who didn't care about our sleek UI or AI buzzwords. He cared that his team was losing 4 hours every Tuesday fixing shipment tracking mismatches. We stripped out 80% of our fancy features, rebuilt around his messy Excel problem, and grew to $45k MRR in 4 months.

Polite feedback is the silent killer of early-stage companies. If someone isn't swearing about the problem or pulling out their card before the call ends, you are building a hobby, not a business.`
  },
  {
    id: 'engineering-framework',
    title: 'Framework Breakdown',
    category: 'Engineering & Tech',
    description: 'Deconstruct a complex technical or operational concept into actionable steps.',
    suggestedStyle: 'Educational',
    suggestedTone: 'Pragmatic, clear, authoritative',
    suggestedAudience: 'Software engineers, tech leads, and product teams',
    sampleInput: `Our latency dropped by 74% and our AWS bill dropped by $3,200/month after one architectural rethink: stopping premature microservices and moving to an event-driven modular monolith.

Here is what went wrong before:
1. Distributed transactions: We had 9 microservices talking over HTTP. One user checkout triggered 14 internal REST calls. If any single service had a blip, the whole cart failed.
2. Debugging nightmare: Tracing a bug across 6 repo boundaries took 3 engineers half a day.

What we changed:
- Unified the domain logic into a single deployment pipeline with strict internal domain boundaries.
- Replaced synchronous inter-service HTTP hops with an internal in-memory pub/sub queue for non-critical side effects (receipt generation, analytics, notifications).
- Cached database read models using lightweight Redis hashes keyed on tenant ID.

Result: P99 latency plummeted from 1.8s to 180ms. Before splitting your backend into 20 services, ensure your actual bottleneck is organizational scale, not code architecture.`
  },
  {
    id: 'founder-vulnerability',
    title: 'The Raw Origin Story',
    category: 'Personal & Founder',
    description: 'A vulnerable, authentic narrative about overcoming a major obstacle or turning point.',
    suggestedStyle: 'Storytelling',
    suggestedTone: 'Honest, grounded, reflective',
    suggestedAudience: 'Creators, solo-entrepreneurs, early-stage founders',
    sampleInput: `Three years ago I was 28, sitting in a rented car in a retail parking lot with $1,400 left to my name and our third pitch rejected in a row.

My co-founder and I had quit steady corporate jobs to build a marketplace. For 11 months, we tracked vanity metrics—registered users who never opened a second email, social media impressions, and coffee chats with mentors who had never built a marketplace.

That afternoon we made a pact: stop trying to look like a venture-backed tech company and start acting like a service company that actually solves one urgent pain point. We picked up the phone, called 50 local HVAC contractors, and asked: "What is the single most annoying manual task you have to do tonight after 7 PM?"

Thirty-four answered: writing follow-up quotes for emergency weekend calls. We manually wrote quotes for them that evening via SMS. That became our MVP. No code, just raw customer relief.

You don't need permission or funding to be useful. You just need to care more about their problem than your ego.`
  },
  {
    id: 'tactical-playbook',
    title: 'The Tactical 5-Step Playbook',
    category: 'Marketing & Growth',
    description: 'High-density, step-by-step tactics that readers immediately want to bookmark.',
    suggestedStyle: 'Founder',
    suggestedTone: 'Punchy, actionable, high signal',
    suggestedAudience: 'Growth marketers, B2B founders, agency owners',
    sampleInput: `How we generated our first 100 B2B customers without spending a dollar on paid ads:

Step 1: The Lurker Audit. Find 10 active Slack, Discord, or Reddit communities where your target users ask questions. Don't pitch. Spend 14 days solely answering technical questions with deep, exhaustive answers.

Step 2: The Free Tool Teardown. Build one tiny, single-purpose calculator or free diagnostic tool that solves 5% of their problem. Give it away without an email gate.

Step 3: Direct Value Outreach. When someone shares a problem in public, record a 90-second customized Loom video showing how to fix it immediately. Send it with zero sales pitch.

Step 4: The Public Build Log. Share the actual metrics, mistakes, and customer quotes every Friday. Authentic struggles attract better buyers than manufactured success.

Step 5: Frictionless Conversion. When they ask "can you just do this for us?", offer a 14-day trial with a 100% money-back guarantee.

Consistency beats cleverness every single time.`
  }
];
