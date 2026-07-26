# 🚀 How to Publish IconSearch to Official Sketch Plugin Directory

To publish **IconSearch** on Sketch's official public plugins marketplace ([sketch.com/extensions/plugins](https://www.sketch.com/extensions/plugins/)):

---

## 🌐 1. Verified Live URLs
Your plugin assets are live and hosted on Vercel:
- **Download ZIP**: `https://iconsearch.info/sketch/IconSearch.sketchplugin.zip`
- **Plugin Icon**: `https://iconsearch.info/sketch/icon.png`
- **Update JSON**: `https://iconsearch.info/sketch/sketch-plugin.json`
- **Appcast Feed**: `https://iconsearch.info/sketch/appcast.xml`
- **Homepage**: `https://iconsearch.info/sketch`

---

## 📝 2. Submit to Sketch Official GitHub Directory

Sketch indexes plugins from their official open-source GitHub repository:
👉 **[github.com/sketch-plugins/plugin-directory](https://github.com/sketch-plugins/plugin-directory)**

### Step A: Create Pull Request or Issue
Open a Pull Request or Issue on [github.com/sketch-plugins/plugin-directory](https://github.com/sketch-plugins/plugin-directory/issues/new) to add `IconSearch` to `plugins.json`.

### Step B: JSON Entry to Add to `plugins.json`:
```json
{
  "name": "IconSearch",
  "title": "IconSearch - 355,000+ Vector Icons",
  "author": "IconSearch",
  "description": "Search, style, and insert 355,000+ vector SVG icons directly into Sketch.",
  "homepage": "https://iconsearch.info/sketch",
  "appcast": "https://iconsearch.info/sketch/sketch-plugin.json"
}
```

---

## 🎉 Result
Once merged, Sketch will feature **IconSearch** on **[sketch.com/extensions/plugins/](https://www.sketch.com/extensions/plugins/)** for all Mac designers! 🎨✨
