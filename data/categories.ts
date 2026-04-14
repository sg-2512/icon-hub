export type IconCategory = {
  slug: string
  name: string
  description: string
  longDescription: string
  keywords: string[]
  recommendedLibraries: string[]
  useCases: string[]
  popularIcons: string[]
}

export const categories: IconCategory[] = [
  {
    slug: 'ui-icons',
    name: 'UI Icons',
    description: 'Free SVG icons for user interfaces — buttons, forms, navigation, and controls.',
    longDescription: 'UI icons are the backbone of any digital product. They communicate actions, states, and navigation patterns without words. The best UI icon libraries offer consistent stroke widths, optical balance at small sizes, and coverage of all standard interface patterns from search and settings to close and expand.',
    keywords: ['ui icons', 'user interface icons', 'free ui icons', 'svg ui icons', 'react ui icons'],
    recommendedLibraries: ['lucide-icons', 'heroicons', 'radix-icons'],
    useCases: ['Buttons and controls', 'Navigation menus', 'Form fields', 'Status indicators', 'Toolbars and action bars'],
    popularIcons: ['search', 'settings', 'home', 'user', 'close', 'menu', 'edit', 'delete', 'save', 'filter'],
  },
  {
    slug: 'social-media-icons',
    name: 'Social Media Icons',
    description: 'Free SVG social media icons for web projects — Twitter, GitHub, LinkedIn and more.',
    longDescription: 'Social media icons are among the most searched icon types because every website needs them for share buttons, profile links, and social proof sections. The best libraries for social icons include Lucide, Tabler, and Remix Icon which all carry popular platform icons as part of their standard sets.',
    keywords: ['social media icons', 'free social icons', 'svg social icons', 'twitter icon react', 'github icon react'],
    recommendedLibraries: ['lucide-icons', 'tabler-icons', 'remix-icon'],
    useCases: ['Social share buttons', 'Footer social links', 'Author profiles', 'Contact pages', 'Portfolio sites'],
    popularIcons: ['twitter', 'github', 'linkedin', 'instagram', 'youtube', 'facebook', 'discord', 'slack'],
  },
  {
    slug: 'dashboard-icons',
    name: 'Dashboard Icons',
    description: 'Free SVG icons for dashboards and admin panels — charts, data, analytics and navigation.',
    longDescription: 'Dashboard interfaces demand a very specific type of icon — small, precise, visually neutral, and dense-friendly. Icons in dashboards live inside tables, sidebars, stat cards, and toolbars where space is limited and clarity is everything. Radix Icons at 15x15 and Lucide Icons at 24x24 are the two most popular choices for dashboard UIs.',
    keywords: ['dashboard icons', 'admin panel icons', 'analytics icons', 'chart icons', 'data icons react'],
    recommendedLibraries: ['lucide-icons', 'radix-icons', 'tabler-icons'],
    useCases: ['Sidebar navigation', 'Data tables', 'Stat cards', 'Filter controls', 'Chart labels'],
    popularIcons: ['chart', 'bar-chart', 'trending-up', 'users', 'dollar', 'activity', 'filter', 'download'],
  },
  {
    slug: 'arrow-icons',
    name: 'Arrow Icons',
    description: 'Free SVG arrow icons for React and web — directional, chevrons, and navigation arrows.',
    longDescription: 'Arrow icons are among the most used icon types in any UI library. From pagination controls and breadcrumbs to accordions, carousels, and directional indicators, arrows serve dozens of interface patterns. Every major icon library includes a comprehensive arrow set — the difference is in stroke weight, corner radius, and whether filled variants are available.',
    keywords: ['arrow icons', 'chevron icons', 'directional icons', 'free arrow svg', 'react arrow icons'],
    recommendedLibraries: ['lucide-icons', 'heroicons', 'phosphor-icons'],
    useCases: ['Pagination controls', 'Accordion toggles', 'Breadcrumb navigation', 'Carousel controls', 'Dropdown indicators'],
    popularIcons: ['arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'chevron-right', 'chevron-down', 'arrow-up-right', 'corner-down-right'],
  },
  {
    slug: 'file-icons',
    name: 'File & Document Icons',
    description: 'Free SVG file and document icons — PDF, folder, upload, download and file type icons.',
    longDescription: 'File and document icons are essential for any application that handles uploads, downloads, attachments, or file management. This category includes icons for generic files, specific file types like PDF and image, folder structures, upload and download actions, and document management operations.',
    keywords: ['file icons', 'document icons', 'folder icons', 'upload icon react', 'download icon svg'],
    recommendedLibraries: ['lucide-icons', 'tabler-icons', 'phosphor-icons'],
    useCases: ['File upload areas', 'Document managers', 'Attachment lists', 'Download buttons', 'File type indicators'],
    popularIcons: ['file', 'file-text', 'folder', 'folder-open', 'upload', 'download', 'paperclip', 'file-pdf'],
  },
  {
    slug: 'communication-icons',
    name: 'Communication Icons',
    description: 'Free SVG communication icons — email, chat, message, phone and notification icons.',
    longDescription: 'Communication icons cover messaging, email, notifications, phone calls, and real-time chat. These are high-frequency icons in any application with user interaction — inbox badges, chat interfaces, notification bells, and contact forms all rely on a good communication icon set.',
    keywords: ['communication icons', 'email icons', 'chat icons', 'message icons react', 'notification icons svg'],
    recommendedLibraries: ['lucide-icons', 'heroicons', 'tabler-icons'],
    useCases: ['Email clients', 'Chat interfaces', 'Notification systems', 'Contact forms', 'Messaging apps'],
    popularIcons: ['mail', 'message', 'phone', 'bell', 'send', 'inbox', 'chat', 'at-sign'],
  },
  {
    slug: 'ecommerce-icons',
    name: 'Ecommerce Icons',
    description: 'Free SVG ecommerce icons — cart, bag, payment, shipping and product icons.',
    longDescription: 'Ecommerce interfaces need a specific set of icons for shopping flows — cart and bag icons, payment and card icons, shipping and delivery icons, wishlist hearts, and product rating stars. These icons appear across product pages, checkout flows, order management, and account sections.',
    keywords: ['ecommerce icons', 'shopping cart icon', 'payment icons react', 'shop icons svg', 'cart icon react'],
    recommendedLibraries: ['lucide-icons', 'tabler-icons', 'phosphor-icons'],
    useCases: ['Shopping cart', 'Product pages', 'Checkout flows', 'Order tracking', 'Payment forms'],
    popularIcons: ['shopping-cart', 'bag', 'credit-card', 'package', 'truck', 'star', 'heart', 'tag'],
  },
  {
    slug: 'weather-icons',
    name: 'Weather Icons',
    description: 'Free SVG weather icons — sun, cloud, rain, snow and temperature icons for web apps.',
    longDescription: 'Weather icons are a niche but high-search category used in weather applications, travel sites, agriculture platforms, and any app that displays environmental conditions. Tabler Icons has one of the best free weather icon sets with over 40 weather-specific icons covering all major conditions and atmospheric phenomena.',
    keywords: ['weather icons', 'free weather svg icons', 'sun icon react', 'cloud icon svg', 'weather icons react'],
    recommendedLibraries: ['tabler-icons', 'lucide-icons', 'phosphor-icons'],
    useCases: ['Weather apps', 'Travel sites', 'Outdoor activity apps', 'Agriculture platforms', 'Smart home dashboards'],
    popularIcons: ['sun', 'cloud', 'cloud-rain', 'snow', 'wind', 'thermometer', 'umbrella', 'cloud-lightning'],
  },
  {
    slug: 'medical-icons',
    name: 'Medical & Health Icons',
    description: 'Free SVG medical and health icons — hospital, heart, pill, stethoscope and health icons.',
    longDescription: 'Medical and health icons serve healthcare platforms, fitness apps, wellness products, and telemedicine services. This is a specialized category where Tabler Icons leads with comprehensive medical coverage. When using medical icons, accessibility is especially important — never rely on icons alone to convey critical health information.',
    keywords: ['medical icons', 'health icons', 'hospital icons react', 'healthcare svg icons', 'medicine icons'],
    recommendedLibraries: ['tabler-icons', 'lucide-icons', 'remix-icon'],
    useCases: ['Healthcare portals', 'Fitness apps', 'Telemedicine platforms', 'Wellness dashboards', 'Medical records'],
    popularIcons: ['heart', 'activity', 'pill', 'stethoscope', 'hospital', 'cross', 'thermometer', 'eye'],
  },
  {
    slug: 'finance-icons',
    name: 'Finance & Banking Icons',
    description: 'Free SVG finance icons — money, bank, chart, wallet and investment icons for React.',
    longDescription: 'Finance and banking interfaces require icons that convey trust, precision, and clarity. Currency symbols, transaction types, account management, investment charts, and payment methods all need dedicated icons. Lucide and Tabler both have strong finance icon coverage and are widely used in fintech applications.',
    keywords: ['finance icons', 'banking icons react', 'money icons svg', 'wallet icon react', 'investment icons'],
    recommendedLibraries: ['lucide-icons', 'tabler-icons', 'remix-icon'],
    useCases: ['Banking dashboards', 'Investment platforms', 'Payment apps', 'Budget trackers', 'Fintech products'],
    popularIcons: ['dollar-sign', 'credit-card', 'wallet', 'trending-up', 'bar-chart', 'coins', 'bank', 'receipt'],
  },
]