# IconSearch MCP Server

Search IconSearch from any MCP-compatible client and return production-ready icon snippets.

## Local Development

```bash
cd mcp-server
npm install
npm run build
npm run start
```

## Client Configuration

```json
{
  "mcpServers": {
    "iconsearch": {
      "command": "node",
      "args": ["C:/Users/Sanchit Gupta/icon-hub/mcp-server/dist/index.js"]
    }
  }
}
```

You can also set `ICONSEARCH_TOKEN` in the client environment. Without it, use the `iconsearch_start_sign_in` and `iconsearch_finish_sign_in` tools once; the server stores the revocable token in the local user config directory.

## Tools

- `iconsearch_start_sign_in` starts browser device sign-in.
- `iconsearch_finish_sign_in` completes sign-in and stores the session locally.
- `iconsearch_status` checks whether a token is available.
- `iconsearch_search` searches live icons.
- `iconsearch_snippet` returns React, SVG, Vue, Svelte, Tailwind, or URL output for an icon.

The server writes protocol data only to stdout. Diagnostics go to stderr.
