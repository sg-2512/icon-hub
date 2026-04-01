export const bootstrapIconsData = {
  name: "Bootstrap Icons",
  slug: "bootstrap-icons",
  tagline: "Free, high quality icons from the Bootstrap team",
  description: {
    intro: "Bootstrap Icons is the official icon library from the Bootstrap team, offering over 1,800 free SVG icons. While designed to work perfectly with Bootstrap CSS, the library is completely framework-agnostic and works well in any web project.",
    detail: "The library covers an impressive range of categories and is particularly strong in UI-specific icons — form controls, navigation patterns, media controls, and system symbols are all well represented. Both outline and filled variants are available for most icons.",
    technical: "Bootstrap Icons can be used as SVG sprites, individual SVGs, or an icon font. For React projects there are community packages available. The library does not ship with official TypeScript definitions or a dedicated React package, which puts it behind modern alternatives in developer experience.",
    verdict: "Bootstrap Icons is excellent if you are already in the Bootstrap ecosystem or need a large, reliable icon set for a traditional web project. For modern React or Next.js applications, Lucide or Heroicons provide a better developer experience with TypeScript and tree-shaking built in."
  },
  stats: {
    iconCount: 1800,
    stars: 7000,
    weeklyDownloads: 500000,
    license: "MIT",
    firstRelease: "2019",
    latestVersion: "1.11.3",
    bundleSize: "~150kb (font) or ~1kb per SVG",
    openIssues: 67,
  },
  installation: {
    react: {
      package: "bootstrap-icons",
      command: "npm install bootstrap-icons",
      yarn: "yarn add bootstrap-icons",
      pnpm: "pnpm add bootstrap-icons",
    },
    nextjs: {
      package: "bootstrap-icons",
      command: "npm install bootstrap-icons",
      note: "Import the CSS in your root layout. Icons are used as className strings on i elements.",
    },
    vue: {
      package: "bootstrap-icons",
      command: "npm install bootstrap-icons",
    },
    svelte: {
      package: "bootstrap-icons",
      command: "npm install bootstrap-icons",
    },
    vanilla: {
      package: "bootstrap-icons",
      command: "npm install bootstrap-icons",
    }
  },
  codeExamples: {
    basic: `// Import CSS in your layout
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function App() {
  return (
    <div>
      <i className="bi bi-house" />
      <i className="bi bi-gear" />
      <i className="bi bi-person" />
    </div>
  )
}`,
    fillVariant: `import 'bootstrap-icons/font/bootstrap-icons.css'

export default function App() {
  return (
    <div>
      {/* Outline variant */}
      <i className="bi bi-heart text-gray-500" />
      {/* Fill variant */}
      <i className="bi bi-heart-fill text-red-500" />
    </div>
  )
}`,
    svgUsage: `// Use individual SVGs for better performance
import houseSvg from 'bootstrap-icons/icons/house.svg'

export default function App() {
  return <img src={houseSvg} alt="Home" width={24} height={24} />
}`,
  },
  pros: [
    { title: "1800+ icons", detail: "A large and comprehensive icon set with excellent coverage of common UI patterns." },
    { title: "Both outline and filled", detail: "Most icons have both outline and fill variants, accessible by adding -fill to the icon name." },
    { title: "Backed by Bootstrap team", detail: "Long-term maintenance is likely given Bootstrap's massive user base and commercial backing." },
    { title: "Works everywhere", detail: "Framework-agnostic — works in any HTML project, not just Bootstrap applications." },
    { title: "Extensive documentation", detail: "Bootstrap's documentation quality is excellent, and Bootstrap Icons benefit from the same attention." },
  ],
  cons: [
    { title: "No official React package", detail: "There is no official typed React component package. Using it in React requires the CSS font approach." },
    { title: "No TypeScript support", detail: "Icons are className strings with no TypeScript definitions or autocomplete." },
    { title: "Not tree-shakable by default", detail: "The font approach loads all icons. Individual SVG imports require more manual setup." },
    { title: "Associated with Bootstrap", detail: "Some developers avoid Bootstrap Icons simply because of the Bootstrap association, even though it is framework-agnostic." },
  ],
  whoShouldUse: [
    "Projects already using Bootstrap CSS",
    "Traditional web projects using HTML, CSS and minimal JavaScript",
    "Teams that need a large icon set with good documentation",
    "Projects where the Bootstrap design language is already established",
  ],
  whoShouldNot: [
    "Modern React and Next.js projects — use Lucide or Heroicons instead",
    "Projects where TypeScript and tree-shaking are priorities",
    "Teams building performance-critical applications",
  ],
  faqs: [
    {
      q: "Do I need Bootstrap CSS to use Bootstrap Icons?",
      a: "No. Bootstrap Icons is completely independent of Bootstrap CSS. You can use it in any project regardless of what CSS framework you use."
    },
    {
      q: "Is Bootstrap Icons free for commercial use?",
      a: "Yes. Bootstrap Icons uses the MIT license which allows free commercial use without attribution."
    },
    {
      q: "How do I use Bootstrap Icons in React?",
      a: "Import the CSS file in your root component, then use icon class names as className on i elements. For example: import 'bootstrap-icons/font/bootstrap-icons.css' then <i className='bi bi-house' />."
    },
    {
      q: "How many Bootstrap Icons are there?",
      a: "Bootstrap Icons has over 1,800 icons as of version 1.11. New icons are added with each release."
    },
    {
      q: "Can I use Bootstrap Icons with Tailwind CSS?",
      a: "Yes. Since icons are HTML elements you can apply Tailwind text color and sizing utilities directly to them."
    },
  ],
  alternatives: ["lucide-icons", "heroicons", "tabler-icons", "remix-icon"],
  links: {
    github: "https://github.com/twbs/icons",
    website: "https://icons.getbootstrap.com",
    npm: "https://www.npmjs.com/package/bootstrap-icons",
    figma: "https://www.figma.com/community/file/1042482994486402696",
  }
}