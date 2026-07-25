# IconSearch JetBrains Plugin

Official JetBrains IDE plugin for **IconSearch** (IntelliJ IDEA, WebStorm, PyCharm, PhpStorm, GoLand, CLion).

## 🚀 Features

- **355,000+ Vector SVG Icons**: Access Lucide, Heroicons, Tabler, Phosphor, Feather, Remix, Bootstrap, and Iconify collections.
- **1-Click Editor Insertion**: Insert React JSX (`<LucideSearch className="w-5 h-5" />`), Raw SVG markup, Vue, Svelte, or Tailwind CSS masks into your code.
- **Device Authentication**: Secure 1-click device authorization saved in JetBrains `PasswordSafe`.
- **Keyboard Shortcut**: `Ctrl + Alt + I` (or `Cmd + Option + I` on macOS) to instantly open the IconSearch sidebar.

## 📦 Build Instructions

Requirements:
- JDK 21+

To build the plugin distribution zip:

```bash
cd jetbrains-plugin
./gradlew buildPlugin
```

The compiled plugin package will be generated at:
`jetbrains-plugin/build/distributions/info.iconsearch.jetbrains-1.0.0.zip`

## 🛠️ How to Install in JetBrains IDE

1. Open IntelliJ IDEA / WebStorm / PyCharm / PhpStorm.
2. Go to **Settings / Preferences** (`Ctrl + Alt + S` / `Cmd + ,`).
3. Select **Plugins** → Click the ⚙️ gear icon → **Install Plugin from Disk...**.
4. Select `info.iconsearch.jetbrains-1.0.0.zip`.
5. Restart your IDE.
6. Click the **IconSearch** tab on the right sidebar!
