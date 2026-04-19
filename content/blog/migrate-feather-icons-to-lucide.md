---
title: "How to Migrate from Feather Icons to Lucide Icons (2026 Guide)"
description: "Step-by-step guide to migrating from react-feather to lucide-react. Feather Icons is unmaintained — here is how to switch in under 10 minutes."
date: "2026-04-19"
author: "IconHub Team"
category: "Tutorial"
tags: ["lucide", "feather", "react", "migration", "icons"]
featured: true
---

Feather Icons was one of the most beloved icon libraries in the React ecosystem. Clean, minimal, consistent — it set the standard for open source icon design when it launched in 2017.

But Feather Icons has not received a meaningful update since 2020. There are over 180 open GitHub issues with no responses. The maintainer has moved on. If you are still using react-feather in 2026, you are using a dead library.

The good news is that Lucide Icons exists specifically to solve this problem. Lucide was forked directly from Feather in 2020, maintained all the original icons, and has since grown to 1,400+ icons with active maintenance, TypeScript support, and a thriving community.

Migrating from Feather to Lucide takes less than 10 minutes. This guide walks you through every step.

## Why You Should Migrate

Feather Icons has three problems that make it unsuitable for production use in 2026.

First, it is unmaintained. Bug reports go unanswered. Security vulnerabilities are not patched. New icons are not added. The last meaningful commit was in 2020.

Second, it has no TypeScript support. Modern React development relies heavily on TypeScript for autocomplete and type safety. react-feather has no official type definitions, meaning you get no autocomplete for icon names in VS Code.

Third, it only has 287 icons. Most moderately complex applications need icons that Feather simply does not have.

Lucide solves all three problems. It is actively maintained with weekly releases, ships with full TypeScript definitions, and has 1,400+ icons covering virtually every common UI need.

## Step 1: Install Lucide Icons

First install the Lucide React package:

```bash
npm install lucide-react
```

You can uninstall react-feather at the same time:

```bash
npm uninstall react-feather
```

## Step 2: Update Your Imports

This is the main migration step. The import syntax is almost identical between the two libraries.

Feather Icons import:

```jsx
import { Home, Settings, User } from 'react-feather'
```

Lucide Icons import:

```jsx
import { Home, Settings, User } from 'lucide-react'
```

For most icons, you only need to change the package name in the import statement. The icon component names are identical between Feather and Lucide for all 287 original Feather icons.

## Step 3: Update Any Custom Props

Both libraries accept size, color, and strokeWidth props with identical APIs.

Feather usage:

```jsx
<Home size={24} color="#6366f1" strokeWidth={1.5} />
```

Lucide usage — identical:

```jsx
<Home size={24} color="#6366f1" strokeWidth={1.5} />
```

If you were using className with Tailwind CSS, that also works identically in both libraries.

## Step 4: Find Replacements for Missing Icons

All 287 Feather icons exist in Lucide with the same names. However some Feather icons were renamed in Lucide for consistency. Here are the most common ones:

| Feather Icon | Lucide Equivalent |
|---|---|
| Activity | Activity |
| Airplay | Airplay |
| AlertCircle | AlertCircle |
| AlertOctagon | AlertOctagon |
| AlertTriangle | TriangleAlert |
| ArrowDownCircle | CircleArrowDown |
| ArrowUpCircle | CircleArrowUp |
| CheckCircle | CircleCheck |
| XCircle | CircleX |
| MinusCircle | CircleMinus |
| PlusCircle | CirclePlus |

For the full renamed icons list, check the Lucide migration guide at lucide.dev.

## Step 5: Take Advantage of New Icons

Once migrated you have access to 1,100+ icons that did not exist in Feather. Some commonly needed ones:

```jsx
import {
  ChartBar,        // data visualization
  ShieldCheck,     // security/verification  
  CreditCard,      // payments
  Package,         // shipping/products
  Webhook,         // developer tools
  Database,        // backend/storage
  GitBranch,       // version control
  Terminal,        // developer tools
} from 'lucide-react'
```

## Automating the Migration

If you have a large codebase with hundreds of Feather icon imports, you can automate the package name change with a find and replace:

Find: `from 'react-feather'`
Replace: `from 'lucide-react'`

Run this across your entire src directory. Then manually review any icons that were renamed (the list above covers the most common ones).

## TypeScript Benefits After Migration

Once on Lucide you immediately gain full TypeScript support. In VS Code, typing the opening of an import gives you autocomplete for all 1,400+ icon names:

```tsx
import { Ho // VS Code shows: Home, Hospital, Hotel, Hourglass...
```

You also get typed props — passing an invalid prop name will show a TypeScript error immediately rather than silently failing at runtime.

## Final Checklist

Before deploying your migrated code, verify:

- All react-feather imports changed to lucide-react
- Any renamed icons updated to their Lucide equivalents  
- Props (size, color, strokeWidth, className) working correctly
- No TypeScript errors in your icon usage
- Visual check that icons look as expected (Lucide icons are slightly updated versions of the Feather originals)

## Summary

Migrating from Feather Icons to Lucide Icons takes under 10 minutes for most projects. You get 5x more icons, full TypeScript support, active maintenance, and an identical API. There is no reason to stay on react-feather in 2026.

For a full comparison of Lucide Icons with other alternatives, see our detailed guide at iconshub.netlify.app/icons/lucide-icons.