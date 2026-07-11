---
title: "AI Icons for React Apps in 2026: Sparkles, Wand, Bot and Agent UI Guide"
description: "A research-backed guide to choosing AI icons for React, Next.js, shadcn/ui and product interfaces in 2026. Includes Sparkles, WandSparkles, Bot, BrainCircuit, Workflow, accessibility patterns, and SEO search intent."
date: "2026-07-02"
author: "IconSearch Team"
category: "Guide"
tags: ["ai icons", "react icons", "lucide", "sparkles", "chatbot", "ai agents", "nextjs", "shadcn", "2026"]
featured: true
---

AI features are no longer hidden in a settings panel. In 2026 they sit inside editors, search bars, dashboards, CRMs, support widgets, coding tools, design tools, ecommerce flows, analytics products, and mobile apps. That shift has created a very practical design problem: every team now needs a clear icon language for AI.

The common answer is the sparkle icon. It is everywhere because users have learned to associate sparkles with "magic", generation, enhancement, cleanup, autocomplete, and model-powered actions. The Wall Street Journal covered how sparkles became a near-standard AI symbol across major software products, and recent product launches keep reinforcing that association. Figma's 2026 Config announcements, for example, put AI directly into motion, shader, code, and agent workflows. AI is becoming normal interface infrastructure, not a novelty.

But there is a catch. A sparkle by itself does not always mean AI. It can also mean favorite, premium, featured, clean, polished, new, optimize, or celebration. Nielsen Norman Group's long-running icon usability guidance is still relevant here: universal icons are rare, and most icons need visible text labels to remove ambiguity.

This guide is for developers and designers choosing AI icons for React, Next.js, shadcn/ui, Tailwind, and product dashboards. It covers the icon searches and use cases people are clustering around right now, which icon names to use in popular libraries, how to avoid the "everything is sparkles" problem, and how to make AI icons accessible.

Use [IconSearch](/icon-search) while reading if you want to compare the exact icons across Lucide, Tabler, Heroicons, Phosphor, Remix Icon, Iconoir, and other libraries.

## The Current AI Icon Search Intent in 2026

People are not only searching for "AI icon". They are searching by task. That matters because the best icon for a chatbot is not the best icon for a one-click text rewrite, and the best icon for an autonomous workflow is not the best icon for a model setting.

Here is the search intent this article is optimized around.

| Search intent | What the user usually needs | Best icon direction |
|---|---|---|
| AI icon | A generic symbol for AI-powered features | `Sparkles`, `BrainCircuit`, `Bot`, `Cpu` |
| Sparkles icon | A small "powered by AI" or "enhance" affordance | `Sparkles`, `Sparkle`, `Stars` |
| Magic wand icon | One-click generation, cleanup, rewrite, improve | `WandSparkles`, `Wand`, `MagicWand` |
| Chatbot icon | AI support, AI assistant, help chat | `BotMessageSquare`, `Bot`, `MessageCircle` |
| AI agent icon | An assistant that can act, plan, or work across tools | `Bot`, `BrainCircuit`, `Workflow` |
| Copilot icon | Embedded helper inside an editor or workflow | `Sparkles`, `Bot`, `MessageCircleCode` |
| Automation icon | Background tasks, no-code flows, rules, triggers | `Workflow`, `IconAutomation`, `GitBranch` |
| Prompt icon | Prompt input, command bar, ask AI field | `MessageSquareText`, `Terminal`, `Sparkles` |
| Image generation icon | Generate image, edit image, remove background | `WandSparkles`, `ImagePlus`, `Sparkles` |
| AI search icon | Semantic search, ask docs, natural language query | `Search`, `BrainCircuit`, `Sparkles` |
| Model icon | Model picker, reasoning mode, intelligence level | `BrainCircuit`, `Cpu`, `SlidersHorizontal` |
| Summarize icon | Summaries, meeting notes, email digest | `ScrollText`, `FileText`, `Sparkles` |

The pattern is clear: AI icon searches are use-case searches. If your page targets "AI icons for React", it should not only list sparkle icons. It should help people choose icons by job-to-be-done.

## The Best Default AI Icon for React Apps

For most React and Next.js apps, the best default AI icon is **Lucide `Sparkles`**.

```tsx
import { Sparkles } from 'lucide-react'

export function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm">
      <Sparkles className="h-4 w-4" aria-hidden="true" focusable="false" />
      AI
    </span>
  )
}
```

Why `Sparkles` works:

- It is familiar because major software products use a sparkle/star pattern for AI actions.
- It is visually compact, so it works in buttons, badges, nav items, menus, and input adornments.
- It is available in Lucide, Heroicons, Tabler, Iconoir, Iconify collections, and many other libraries.
- It does not imply a specific AI modality like chat, image generation, or automation.
- It is easy to pair with text like "Generate", "Summarize", "Ask AI", or "Improve".

Why `Sparkles` is not enough:

- It becomes meaningless when every AI feature uses it.
- It can conflict with "favorite", "premium", "featured", "new", or "recommended".
- It does not tell users whether the action is generative, conversational, automated, or analytical.
- It needs a visible label in most production UI.

Use `Sparkles` as your generic AI marker, but use more specific icons when the feature has a clear behavior.

## Sparkles vs Wand vs Bot vs Brain vs Workflow

The easiest way to build a coherent AI icon system is to reserve each symbol for one type of AI behavior.

| Icon metaphor | Use it for | Avoid it for |
|---|---|---|
| Sparkles | AI-powered enhancement, generic AI label, new model capability | Persistent assistants, workflow automation, status icons |
| Magic wand | Generate, rewrite, clean up, transform, remove background | Passive AI labels, model settings, chat support |
| Bot or chat bot | Conversational assistant, support agent, coding copilot | One-click text polish, analytics insights |
| Brain or circuit | Reasoning, model intelligence, semantic search, model picker | Friendly support chat, simple enhancement buttons |
| Workflow or automation | Agents, background jobs, task chains, triggers | One-off generation actions |
| CPU or chip | Model infrastructure, local AI, inference, developer settings | Consumer-facing AI features unless technical |
| Message bubble | Ask AI, chat with docs, prompt input, assistant thread | Silent background automation |

This gives your UI a grammar:

- `Sparkles` means "AI is involved".
- `WandSparkles` means "AI will transform this".
- `BotMessageSquare` means "talk to an assistant".
- `BrainCircuit` means "model, reasoning, or intelligence".
- `Workflow` means "AI will perform a sequence of steps".

Users learn faster when the same metaphor always means the same class of action.

## Recommended Lucide AI Icons

[Lucide Icons](/icons/lucide-icons) is the best starting point for modern React AI interfaces because it is popular, tree-shakable, TypeScript-friendly, and visually aligned with shadcn/ui. These are the most useful Lucide icons for AI features.

| Use case | Lucide icon | React import | Best label |
|---|---|---|---|
| Generic AI action | `Sparkles` | `import { Sparkles } from 'lucide-react'` | AI |
| One-click generation | `WandSparkles` | `import { WandSparkles } from 'lucide-react'` | Generate |
| Rewrite or improve | `WandSparkles` | `import { WandSparkles } from 'lucide-react'` | Improve |
| Chat assistant | `BotMessageSquare` | `import { BotMessageSquare } from 'lucide-react'` | Ask AI |
| Simple bot | `Bot` | `import { Bot } from 'lucide-react'` | Assistant |
| Model reasoning | `BrainCircuit` | `import { BrainCircuit } from 'lucide-react'` | Reasoning |
| Model settings | `SlidersHorizontal` | `import { SlidersHorizontal } from 'lucide-react'` | Model settings |
| AI search | `Search` plus `Sparkles` | `import { Search, Sparkles } from 'lucide-react'` | Search with AI |
| Agent workflow | `Workflow` | `import { Workflow } from 'lucide-react'` | Automate |
| Code assistant | `MessageCircleCode` | `import { MessageCircleCode } from 'lucide-react'` | Ask about code |
| Summarize | `FileText` or `ScrollText` | `import { FileText } from 'lucide-react'` | Summarize |
| Analyze | `ChartNoAxesCombined` | `import { ChartNoAxesCombined } from 'lucide-react'` | Analyze |

Example:

```tsx
import {
  BotMessageSquare,
  BrainCircuit,
  Sparkles,
  WandSparkles,
  Workflow,
} from 'lucide-react'

const aiActions = [
  { label: 'Generate summary', icon: WandSparkles },
  { label: 'Ask assistant', icon: BotMessageSquare },
  { label: 'Reason over data', icon: BrainCircuit },
  { label: 'Run workflow', icon: Workflow },
]

export function AiActionMenu() {
  return (
    <div className="grid gap-2">
      {aiActions.map(({ label, icon: Icon }) => (
        <button key={label} className="flex items-center gap-2 rounded-md px-3 py-2">
          <Icon className="h-4 w-4" aria-hidden="true" focusable="false" />
          <span>{label}</span>
        </button>
      ))}
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
        Powered by AI
      </span>
    </div>
  )
}
```

## Best AI Icons by Library

Different libraries are better for different AI icon needs. Lucide is usually best for shadcn/ui and clean SaaS apps. Tabler is better when you need a broader vocabulary. Phosphor is better when you need fill, duotone, or weight changes. Heroicons is best when you want Tailwind-native familiarity. Remix and Iconoir are useful when you want more explicit AI, robot, brain, or magic symbols.

| Library | Best AI icons | Best fit |
|---|---|---|
| Lucide | `Sparkles`, `WandSparkles`, `Bot`, `BotMessageSquare`, `BrainCircuit`, `Workflow` | React apps, Next.js, shadcn/ui, SaaS dashboards |
| Heroicons | `SparklesIcon`, `CpuChipIcon`, `ChatBubbleLeftRightIcon` | Tailwind-first apps that need a smaller set |
| Tabler | `IconAutomation`, `IconRobot`, `IconSparkles`, `IconWand` | Complex dashboards, automation products, niche use cases |
| Phosphor | `Sparkle`, `MagicWand`, `Robot`, `Brain`, `Circuitry` | Apps that need fill, duotone, or weight variants |
| Remix Icon | `brain-ai-3-line`, `robot-line`, `sparkling-line` | Rich product UIs with filled and line variants |
| Iconoir | `MagicWand`, `BrainElectricity`, `ThreeStars` | Editorial UIs, creative tools, expressive product surfaces |
| Teenyicons | `ChatbotOutline`, `RobotOutline`, `WandOutline` | Compact toolbars and small icon sizes |

If you are already using Lucide, do not add a second icon package only for one sparkle icon. Use Lucide for the primary UI and reach for [Tabler Icons](/icons/tabler-icons), [Phosphor Icons](/icons/phosphor-icons), or [Remix Icon](/icons/remix-icon) only when you need a metaphor Lucide does not cover.

For a broader library decision, compare [Lucide vs Tabler](/compare/lucide-icons-vs-tabler-icons) or read the [best icons for shadcn/ui guide](/blog/best-icons-for-shadcn-ui-2026).

## AI Icon Patterns for Common Product Use Cases

The best AI icon depends on the surface. A homepage CTA, a toolbar action, a chat widget, and a dashboard automation panel all need different levels of specificity.

## AI Writing and Editing Tools

Use `WandSparkles` for actions that transform text:

- Rewrite
- Improve writing
- Fix grammar
- Change tone
- Shorten
- Expand
- Make professional
- Turn notes into an email

Good button labels:

- Improve writing
- Rewrite with AI
- Fix grammar
- Make shorter
- Generate draft

Avoid icon-only buttons for writing actions unless the toolbar is already familiar. A magic wand icon without a label may mean formatting, cleanup, effects, or AI depending on the product.

```tsx
import { WandSparkles } from 'lucide-react'

export function RewriteButton() {
  return (
    <button className="inline-flex items-center gap-2 rounded-md px-3 py-2">
      <WandSparkles className="h-4 w-4" aria-hidden="true" focusable="false" />
      Rewrite with AI
    </button>
  )
}
```

## AI Search and Ask-Docs Interfaces

AI search is tricky because search already has a universal icon: the magnifying glass. Do not replace search with sparkles. Combine the search metaphor with an AI label.

Best patterns:

- Use `Search` for the input.
- Add a small `Sparkles` badge or "Ask AI" label for semantic mode.
- Use placeholder text like "Ask docs in natural language" instead of only "Search".
- Use `BrainCircuit` only for advanced model or reasoning settings.

```tsx
import { Search, Sparkles } from 'lucide-react'

export function AiSearchInput() {
  return (
    <label className="flex items-center gap-2 rounded-md border px-3 py-2">
      <Search className="h-4 w-4" aria-hidden="true" focusable="false" />
      <input
        className="min-w-0 flex-1 bg-transparent outline-none"
        placeholder="Ask docs in natural language"
      />
      <span className="inline-flex items-center gap-1 text-xs">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
        AI
      </span>
    </label>
  )
}
```

## AI Chatbots and Assistants

For a chat assistant, `BotMessageSquare` is usually clearer than generic sparkles. Users understand it as a conversational helper.

Use bot or message icons for:

- Support assistant
- Docs assistant
- Sales assistant
- Coding assistant
- Product copilot
- "Ask about this page"

Use a human avatar only if the assistant represents a human team member or live support. For AI, bot/message metaphors set expectations more honestly.

Good labels:

- Ask AI
- Open assistant
- Chat with docs
- Ask about this report
- Get help from AI

```tsx
import { BotMessageSquare } from 'lucide-react'

export function AssistantLauncher() {
  return (
    <button aria-label="Open AI assistant" className="rounded-full p-3">
      <BotMessageSquare className="h-5 w-5" aria-hidden="true" focusable="false" />
    </button>
  )
}
```

The button is icon-only, so the button gets `aria-label`. The SVG is decorative because the accessible name lives on the button. For more patterns, see the [React icon accessibility guide](/blog/icon-accessibility-react-2026).

## AI Agents and Automation

Agentic interfaces need a different icon vocabulary from chatbots. A chatbot answers. An agent acts.

Use `Workflow`, `IconAutomation`, `GitBranch`, `Route`, or `Network` when the AI will:

- Create tasks
- Chain multiple steps
- Run a workflow
- Connect tools
- Watch for triggers
- Execute in the background
- Route work to different systems

Use `Bot` or `BrainCircuit` only when the agent is represented as a personality or model.

Good labels:

- Run agent
- Automate workflow
- Create automation
- Plan steps
- Execute task
- Review agent run

```tsx
import { Workflow } from 'lucide-react'

export function AgentRunButton() {
  return (
    <button className="inline-flex items-center gap-2 rounded-md px-3 py-2">
      <Workflow className="h-4 w-4" aria-hidden="true" focusable="false" />
      Run agent
    </button>
  )
}
```

## AI Image Generation and Creative Tools

Creative AI tools should use a stronger transformation metaphor than a generic sparkle. `WandSparkles` is the safest default for generation and edit actions. `ImagePlus`, `ImageUp`, `Brush`, `Eraser`, and `Scissors` can make the action more concrete.

Use:

- `WandSparkles` for generate or transform
- `ImagePlus` for create image
- `Eraser` for remove background or cleanup
- `Brush` for restyle
- `Scissors` for cutout
- `Sparkles` for general AI badge

Good labels:

- Generate image
- Remove background
- Restyle with AI
- Expand image
- Clean up object
- Create variations

Do not use only sparkles for destructive or expensive AI image operations. If an action changes a user's asset, the label should say exactly what will happen.

## AI Analytics and Insights

For analytics, the icon should communicate insight, not magic. Sparkles can work as a secondary marker, but the primary metaphor should be chart, trend, alert, or brain depending on the task.

Use:

- `ChartNoAxesCombined` for insights
- `TrendingUp` for trends
- `CircleAlert` for anomalies
- `BrainCircuit` for model-generated analysis
- `Sparkles` for "AI insight" badges

Good labels:

- Explain trend
- Find anomalies
- Summarize report
- Forecast demand
- Generate insights

In B2B dashboards, overusing sparkles can make AI feel decorative. Analytical users usually respond better to concrete verbs and domain-specific icons.

## AI Icons for shadcn/ui

shadcn/ui uses Lucide by default, so your AI icon system can stay very simple:

```tsx
import {
  BotMessageSquare,
  BrainCircuit,
  Sparkles,
  WandSparkles,
  Workflow,
} from 'lucide-react'
```

Recommended shadcn/ui mapping:

| shadcn/ui surface | Icon | Label |
|---|---|---|
| Command item | `Sparkles` | Ask AI |
| Textarea action | `WandSparkles` | Improve writing |
| Assistant launcher | `BotMessageSquare` | Open assistant |
| Model picker | `BrainCircuit` | Model |
| Automation settings | `Workflow` | Workflows |
| Empty state CTA | `Sparkles` | Generate with AI |
| Alert action | `CircleAlert` plus `Sparkles` | Explain issue |

Use `h-4 w-4` for menu and button icons, `h-5 w-5` for section actions, and avoid mixing random stroke widths. Lucide defaults to a 24x24 grid and a 2px stroke, which is why it works so well with shadcn/ui.

## Accessibility Rules for AI Icons

AI icons are especially likely to be ambiguous, so accessibility is not only about screen readers. It is about clear meaning for everyone.

Use these rules:

- If the AI icon is next to visible text, hide the SVG from screen readers with `aria-hidden="true"`.
- If the AI icon is inside an icon-only button, put `aria-label` on the button.
- If the AI icon conveys status by itself, give the icon `role="img"` and an accessible label.
- Do not rely on tooltip-only labels because touch and keyboard users may miss them.
- Avoid using color alone to distinguish AI, beta, premium, and warning states.
- Keep labels verb-based: "Generate", "Summarize", "Ask AI", "Run agent".

W3C's accessible name guidance says interactive elements need names that convey purpose and distinguish them from other controls. That is exactly where many AI buttons fail: five sparkle buttons in one toolbar are five unnamed mysteries unless each one has a specific label.

Correct icon-only button:

```tsx
import { Sparkles } from 'lucide-react'

export function GenerateSummaryButton() {
  return (
    <button aria-label="Generate summary">
      <Sparkles className="h-4 w-4" aria-hidden="true" focusable="false" />
    </button>
  )
}
```

Correct button with visible text:

```tsx
import { WandSparkles } from 'lucide-react'

export function ImproveWritingButton() {
  return (
    <button className="inline-flex items-center gap-2">
      <WandSparkles className="h-4 w-4" aria-hidden="true" focusable="false" />
      Improve writing
    </button>
  )
}
```

Correct status icon:

```tsx
import { BrainCircuit } from 'lucide-react'

export function ReasoningStatus() {
  return (
    <BrainCircuit
      className="h-4 w-4"
      role="img"
      aria-label="Reasoning mode is enabled"
      focusable="false"
    />
  )
}
```

## SEO Tips for Pages About AI Icons

If you are writing a landing page, docs page, or blog post targeting AI icon searches, optimize around use cases rather than a single keyword.

Primary keyword targets:

- AI icons
- AI icons for React
- AI icon library
- Sparkles icon
- Magic wand icon
- Chatbot icon
- AI assistant icon
- AI agent icon
- Automation icon
- Lucide AI icons

Useful long-tail headings:

- Best AI icons for React apps
- Best Lucide icons for AI features
- Sparkles vs magic wand icon for AI
- Chatbot icon for AI assistants
- AI agent icon for workflow automation
- Accessible AI icons in React
- AI icons for shadcn/ui
- AI icons for Next.js

Internal links to include:

- Link to your icon search tool: [IconSearch icon search](/icon-search)
- Link to your primary library page: [Lucide Icons](/icons/lucide-icons)
- Link to alternatives: [Tabler Icons](/icons/tabler-icons), [Heroicons](/icons/heroicons), [Phosphor Icons](/icons/phosphor-icons)
- Link to accessibility guidance: [Icon Accessibility in React](/blog/icon-accessibility-react-2026)
- Link to performance guidance: [Icon bundle size optimization](/blog/icon-bundle-size-react-2026)

Do not stuff "AI icon" into every sentence. Search engines and readers both reward specificity. A page that explains "use `WandSparkles` for rewrite, `BotMessageSquare` for chat, and `Workflow` for agents" is more useful than a page that repeats "best AI icon" twenty times.

## Performance Notes for React and Next.js

AI-heavy products often add icons quickly: one for the assistant, one for model picker, one for prompt input, one for summarize, one for automate, one for rewrite, one for generate image, one for explain, one for insights. That is fine if you import correctly.

Good:

```tsx
import { BotMessageSquare, Sparkles, WandSparkles } from 'lucide-react'
```

Bad:

```tsx
import * as Icons from 'lucide-react'
```

Named imports let bundlers tree-shake unused icons. Namespace imports often make it harder to keep the bundle lean, especially when icons are passed dynamically across components.

For Next.js App Router, static icon components can render in Server Components. You only need `use client` when the surrounding component uses client-only state, event handlers, or browser APIs. The icon itself does not require a client boundary.

For a deeper performance guide, read [icon bundle size optimization](/blog/icon-bundle-size-react-2026).

## Common Mistakes

**Mistake 1: Using sparkles for everything**

Sparkles are useful, but they are generic. Use `WandSparkles` for transformation, `BotMessageSquare` for chat, `BrainCircuit` for reasoning, and `Workflow` for agents.

**Mistake 2: Shipping icon-only AI buttons with no labels**

An unlabeled sparkle button may look obvious to the designer and mean nothing to everyone else. Add visible text when possible. Use `aria-label` when icon-only is unavoidable.

**Mistake 3: Mixing icon styles across one toolbar**

Lucide, Heroicons, Tabler, and Phosphor all have different optical weights. Mixing them in the same row can make the UI feel messy. Pick one primary library.

**Mistake 4: Using a bot icon for non-chat actions**

A bot implies conversation or an assistant. For rewrite, generate, summarize, or cleanup, a wand or document icon is usually clearer.

**Mistake 5: Hiding AI behind cute language**

"Magic" is fun, but enterprise users often want to know what will happen. Prefer "Summarize report", "Generate SQL", "Rewrite email", or "Run agent" over vague labels like "Do magic".

## The Best AI Icon System for 2026

If you want a simple system that will work for most products, start here:

| Feature type | Default icon | Label style |
|---|---|---|
| Generic AI badge | `Sparkles` | AI |
| Text generation | `WandSparkles` | Generate draft |
| Text improvement | `WandSparkles` | Improve writing |
| Chat assistant | `BotMessageSquare` | Ask AI |
| Docs assistant | `MessageCircleQuestion` | Ask docs |
| Model reasoning | `BrainCircuit` | Reasoning |
| Model settings | `SlidersHorizontal` | Model settings |
| Workflow agent | `Workflow` | Run agent |
| Automation | `Workflow` or `IconAutomation` | Automate |
| AI analytics | `ChartNoAxesCombined` | Generate insights |
| AI search | `Search` plus `Sparkles` | Search with AI |
| Image generation | `ImagePlus` or `WandSparkles` | Generate image |

This is enough for most SaaS products, internal tools, content editors, and AI-first applications. Add specialized icons only when the product domain demands it.

## Research Sources

This guide combines IconSearch's local icon index with current public research and product coverage:

- [Figma's 2026 AI design and code tooling announcements](https://www.theverge.com/tech/955831/figma-code-design-tools-config-2026-announcements)
- [How the sparkle icon became associated with AI](https://www.wsj.com/tech/ai/how-the-sparkles-emoji-became-the-symbol-of-our-ai-future-e7786eef)
- [Nielsen Norman Group icon usability guidance](https://www.nngroup.com/articles/icon-usability/)
- [W3C accessible names and descriptions guidance](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)
- [2026 design trend coverage on human, expressive, less generic visual systems](https://www.creativebloq.com/design/graphic-design/texture-warmth-and-tactile-rebellion-the-big-graphic-design-trends-for-2026)

## Frequently Asked Questions

### What is the best AI icon for React apps?

For most React apps, use Lucide `Sparkles` as the generic AI marker, `WandSparkles` for generation or rewrite actions, `BotMessageSquare` for AI assistants, `BrainCircuit` for model reasoning, and `Workflow` for AI agents or automation.

### Should I use sparkles or a magic wand for AI?

Use `Sparkles` when you need a generic AI badge or small AI indicator, and use `WandSparkles` or a magic wand icon when the action transforms something, such as rewriting text, generating an image, cleaning up content, or improving a draft.

### What icon should I use for an AI chatbot?

Use a bot plus message icon such as Lucide `BotMessageSquare`, or pair a message bubble icon with the label "Ask AI". A plain sparkle icon is usually too generic for chat because it does not communicate conversation.

### What icon should I use for AI agents?

Use `Workflow`, `IconAutomation`, `GitBranch`, or a network-style icon when the AI agent performs multiple steps or connects tools. Use `Bot` only when the agent is represented as a conversational assistant.

### Are AI icons accessible by default?

No. Most SVG icon components need the right accessibility attributes. Decorative icons should use `aria-hidden="true"`, icon-only buttons need an `aria-label`, and standalone meaningful icons need `role="img"` with an accessible label.

### Which icon library has the best AI icons?

Lucide is the best default for React, Next.js, and shadcn/ui. Tabler has broader coverage for automation and niche symbols. Phosphor is best when you need multiple weights or duotone icons. Remix and Iconoir are useful for more explicit brain, robot, and magic-wand metaphors.
