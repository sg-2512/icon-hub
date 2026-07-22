# IconSearch for JetBrains IDEs

Search IconSearch from IntelliJ IDEA and other JetBrains IDEs, then copy or insert production-ready icon snippets.

## Local Development

Requires Gradle 9+ and Java 17+ for the IntelliJ Platform Gradle Plugin 2.x.

```bash
cd jetbrains-plugin
gradle runIde
```

The plugin uses IconSearch browser device sign-in and stores only the revocable product token in JetBrains Password Safe.

## Features

- Tool window: `View -> Tool Windows -> IconSearch`
- Secure browser sign-in for the `jetbrains` product
- Live icon search against `https://iconsearch.info/api/extension/icon-search`
- Copy or insert React, SVG, Vue, Svelte, Tailwind mask, or URL output
- Text-first result list to keep scrolling fast in large result sets

Before sign-in works in production, deploy the backend product migration for `jetbrains`.
