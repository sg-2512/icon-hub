# Publishing Checklist

Publishing a public npm package is free. Private packages require a paid plan, but this package must remain public.

## First-Time Account Setup

1. Create an npm account at `https://www.npmjs.com/signup`.
2. Use the npm username `iconsearch`, or create an npm organization named `iconsearch`. The package name `@iconsearch/tailwind` can only be published by that user or organization.
3. Enable two-factor authentication for both authorization and publishing.
4. Sign in from this machine:

```bash
npm adduser
npm whoami
```

Do not create or commit an `.npmrc` containing an authentication token.

## Release Checks

Run these commands from the `tailwind-plugin` directory:

```bash
npm ci
npm test
npm audit --omit=dev
npm run pack:dry
```

The dry-run archive must contain only `LICENSE`, `README.md`, `auth.cjs`, `cli.cjs`, `index.cjs`, `index.d.ts`, and `package.json`.

## First Public Release

```bash
npm publish --access public
```

The `prepublishOnly` script reruns all tests before npm uploads anything. Confirm the package at `https://www.npmjs.com/package/@iconsearch/tailwind` after publishing.

## Future Releases

After the package exists on npm, configure npm trusted publishing for the public `sg-2512/iconsearch` GitHub repository. Trusted publishing uses short-lived OIDC credentials and automatically creates provenance for public packages, so no long-lived npm token or forced local provenance setting is needed.

Increment the version before each later release. npm does not allow a published name and version combination to be reused.
