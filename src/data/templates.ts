import { TemplatePrompt } from '../types';

export const SAMPLE_TEMPLATES: TemplatePrompt[] = [
  {
    id: 'contrarian-insight',
    title: 'The Contrarian Lesson',
    category: 'Startup & Strategy',
    description: 'Challenge common industry wisdom with clear arguments and focused principles.',
    suggestedStyle: 'Bold / Contrarian',
    suggestedTone: 'Direct, sharp, no-fluff',
    suggestedAudience: 'Founders, operators, and ambitious builders',
    suggestedGoal: 'Spark debate',
    sampleInput: `Most startups struggle not because their underlying technology is flawed, but because they focus on secondary features rather than one acute problem customers urgently need solved.

When you ask for feedback in broad, polite terms, people will usually give encouraging praise. But general encouragement rarely correlates with actual workflow adoption.

The true test of customer need is whether someone has an active bottleneck so painful they are already attempting to fix it manually. If that friction does not exist, expanding the roadmap will not create demand.`
  },
  {
    id: 'engineering-framework',
    title: 'Framework Breakdown',
    category: 'Engineering & Tech',
    description: 'Deconstruct a complex technical or operational concept into actionable steps.',
    suggestedStyle: 'Educational',
    suggestedTone: 'Pragmatic, clear, authoritative',
    suggestedAudience: 'Software engineers, tech leads, and product teams',
    suggestedGoal: 'Share engineering lessons',
    sampleInput: `A guiding principle for backend architecture: premature microservices often introduce network and operational overhead before the team has organizational scale to justify it.

Two common pitfalls when splitting services too early:
1. Distributed transactions: Cascading synchronous HTTP calls between microservices increase latency and create single-point-of-failure chains.
2. Debugging complexity: Tracing failures across independent services requires distributed tracing infrastructure that small teams often struggle to maintain.

A simpler alternative:
- Start with a modular monolith where domain boundaries are enforced in code.
- Use internal in-memory queues or asynchronous message workers for background tasks.
- Only break out a service when team ownership or distinct scaling profiles require it.`
  },
  {
    id: 'founder-vulnerability',
    title: 'Early Stage Reflection',
    category: 'Personal & Founder',
    description: 'An honest reflection on the early-stage challenge of discovering genuine customer pain.',
    suggestedStyle: 'Storytelling',
    suggestedTone: 'Honest, grounded, reflective',
    suggestedAudience: 'Early-stage founders, indie builders, solo developers',
    suggestedGoal: 'Document journey',
    sampleInput: `The hardest part of building early is having the patience to listen deeply before building solutions.

It is very tempting to stay inside the codebase where everything is predictable and controllable. Talking to potential users and hearing genuine ambivalence can be uncomfortable.

The core realization: building software is easy compared to finding an acute problem that people genuinely care about solving. Prioritizing problem discovery over feature velocity is the hardest discipline in a startup.`
  },
  {
    id: 'tactical-playbook',
    title: 'The Tactical Playbook',
    category: 'Marketing & Growth',
    description: 'High-density, step-by-step framework that readers immediately want to bookmark.',
    suggestedStyle: 'Founder',
    suggestedTone: 'Punchy, actionable, high signal',
    suggestedAudience: 'Founders, technical marketers, product leads',
    suggestedGoal: 'Build in public',
    sampleInput: `A straightforward 4-step framework for early customer discovery:

Step 1: Identify Where the Problem Lives. Observe community forums, issue trackers, and discussions where practitioners complain about daily friction.

Step 2: Study Current Workarounds. Look at what spreadsheets, manual scripts, or duct-tape processes people use today. If no workaround exists, the problem may not be urgent enough.

Step 3: Ask Concrete Questions. Ask about the last time they experienced the issue and what it cost them in time or money, rather than whether they like your hypothetical solution.

Step 4: Build for the Bottleneck. Deliver the simplest functional utility that relieves that specific friction before designing secondary features.`
  }
];
