export const remixIconData = {
  name: "Remix Icon",
  slug: "remix-icon",
  tagline: "Open-source neutral-style icons for designers and developers",
  description: {
    intro: "Remix Icon is a comprehensive open-source icon library with over 2,800 icons available in both line and fill styles. It was designed with a neutral, system-level aesthetic that works well across a wide range of application types.",
    detail: "The library covers an impressive range of categories including editor tools, media controls, maps, finance, health, and more. Icons are organized into clear categories making it easy to browse and find what you need. The neutral style means icons don't feel tied to any particular design trend.",
    technical: "Remix Icon can be used as an icon font, SVG sprites, or individual SVG files. For React projects there is a community package available. The library does not have official TypeScript support or tree-shaking out of the box, which is its main technical limitation compared to modern alternatives.",
    verdict: "Remix Icon is a solid choice when you need a large, diverse icon set with both line and fill variants and don't need TypeScript or advanced tree-shaking. It is particularly popular in Vue and non-framework projects where its CSS font approach works well."
  },
  stats: {
    iconCount: 2800,
    stars: 6000,
    weeklyDownloads: 250000,
    license: "Apache 2.0",
    firstRelease: "2019",
    latestVersion: "4.2.0",
    bundleSize: "~200kb (font) or ~1kb per SVG",
    openIssues: 56,
  },
  installation: {
    react: {
      package: "remixicon",
      command: "npm install remixicon",
      yarn: "yarn add remixicon",
      pnpm: "pnpm add remixicon",
    },
    nextjs: {
      package: "remixicon",
      command: "npm install remixicon",
      note: "Import the CSS in your layout file. Icons are used as className strings rather than React components.",
    },
    vue: {
      package: "remixicon",
      command: "npm install remixicon",
    },
    svelte: {
      package: "remixicon",
      command: "npm install remixicon",
    },
    vanilla: {
      package: "remixicon",
      command: "npm install remixicon",
    }
  },
  codeExamples: {
    basic: `// First import the CSS in your layout or _app file
import 'remixicon/fonts/remixicon.css'

export default function App() {
  return (
    <div>
      <i className="ri-home-line" />
      <i className="ri-settings-line" />
      <i className="ri-user-line" />
    </div>
  )
}`,
    fillVariant: `import 'remixicon/fonts/remixicon.css'

export default function App() {
  return (
    <div>
      {/* Line variant */}
      <i className="ri-heart-line text-gray-500" />
      {/* Fill variant */}
      <i className="ri-heart-fill text-red-500" />
    </div>
  )
}`,
    withSize: `import 'remixicon/fonts/remixicon.css'

export default function App() {
  return (
    <i
      className="ri-star-fill"
      style={{ fontSize: '24px', color: '#f59e0b' }}
    />
  )
}`,
  },
  pros: [
    { title: "2800+ icons", detail: "One of the largest free icon libraries with excellent coverage of specialized categories." },
    { title: "Line and fill variants", detail: "Every icon comes in both line and fill styles, giving you flexibility for different UI contexts." },
    { title: "Works everywhere", detail: "CSS font approach means it works in any HTML/CSS context without framework-specific packages." },
    { title: "Free for commercial use", detail: "Apache 2.0 license is permissive and allows commercial use without attribution." },
    { title: "Large category coverage", detail: "Covers editor, media, map, finance, health, communication and many more specialized categories." },
  ],
  cons: [
    { title: "No TypeScript support", detail: "Icons are className strings not typed components. You get no autocomplete or type safety." },
    { title: "Not tree-shakable", detail: "The font approach loads all 2,800 icons regardless of how many you use, adding ~200kb to your bundle." },
    { title: "CSS font approach feels outdated", detail: "Modern icon libraries use SVG components. The className string approach is less developer-friendly than typed React components." },
    { title: "No official React package", detail: "Using Remix Icon in React requires workarounds compared to purpose-built React libraries like Lucide or Heroicons." },
  ],
  whoShouldUse: [
    "Vue projects where the CSS font approach works naturally",
    "Projects that need a very large and diverse icon set",
    "Non-framework HTML/CSS projects",
    "Teams that prioritize icon variety over TypeScript support",
    "Projects already familiar with icon font workflows",
  ],
  whoShouldNot: [
    "React and Next.js projects where TypeScript and tree-shaking matter",
    "Performance-critical applications where 200kb font loading is unacceptable",
    "Teams that want typed icon components with autocomplete",
  ],
  faqs: [
    {
      q: "Is Remix Icon free for commercial use?",
      a: "Yes. Remix Icon uses the Apache 2.0 license which allows free commercial use. Unlike MIT, Apache 2.0 also provides explicit patent rights."
    },
    {
      q: "How do I use Remix Icon in React?",
      a: "Import the CSS file in your root layout or App component, then use icon class names as className on i elements. For example: <i className='ri-home-line' />."
    },
    {
      q: "Does Remix Icon support tree-shaking?",
      a: "No. The standard installation loads all icons as a font. For better performance, you can download individual SVG files from the website and import them manually."
    },
    {
      q: "How is Remix Icon different from Lucide Icons?",
      a: "Remix Icon has more icons (2,800 vs 1,400) and offers fill variants. However Lucide provides typed React components with tree-shaking while Remix Icon uses a CSS font approach with no TypeScript support."
    },
    {
      q: "Can I use Remix Icon with Tailwind CSS?",
      a: "Yes. Since icons are HTML elements with className, you can apply Tailwind text color utilities directly. Use text-{color} for color and text-{size} or a fixed font-size style for sizing."
    },
  ],
  alternatives: ["lucide-icons", "tabler-icons", "heroicons", "bootstrap-icons"],
  links: {
    github: "https://github.com/Remix-Design/RemixIcon",
    website: "https://remixicon.com",
    npm: "https://www.npmjs.com/package/remixicon",
    figma: "",
  }
}