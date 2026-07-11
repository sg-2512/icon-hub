import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const extensionDir = join(root, 'chrome-extension')
const manifestPath = join(extensionDir, 'manifest.json')

function fail(message) {
  console.error(`Chrome extension check failed: ${message}`)
  process.exit(1)
}

function assertFile(path, label) {
  if (!existsSync(path)) fail(`Missing ${label}: ${path}`)
}

assertFile(manifestPath, 'manifest')

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
if (manifest.manifest_version !== 3) fail('manifest_version must be 3')
if (!manifest.name || !manifest.version) fail('manifest requires name and version')

const popupPath = manifest.side_panel?.default_path || manifest.action?.default_popup
if (!popupPath) fail('manifest needs a side_panel.default_path or action.default_popup')
assertFile(join(extensionDir, popupPath), 'popup HTML')

if (manifest.background?.service_worker) {
  assertFile(join(extensionDir, manifest.background.service_worker), 'background service worker')
}

for (const iconPath of Object.values(manifest.icons || {})) {
  assertFile(join(extensionDir, iconPath), `icon ${iconPath}`)
}

const csp = manifest.content_security_policy?.extension_pages || ''
if (/script-src[^;]*unsafe-inline/i.test(csp)) fail('extension CSP must not allow inline scripts')
if (/script-src[^;]*unsafe-eval/i.test(csp)) fail('extension CSP must not allow eval')
if (!/connect-src[^;]*https:\/\/iconsearch\.info/i.test(csp)) fail('CSP connect-src must allow iconsearch.info')
if (!/img-src[^;]*https:\/\/iconsearch\.info/i.test(csp)) fail('CSP img-src must allow iconsearch.info')
if (!/img-src[^;]*blob:/i.test(csp) || !/img-src[^;]*data:/i.test(csp)) fail('CSP img-src must allow blob: and data:')

for (const script of ['popup.js', manifest.background?.service_worker].filter(Boolean)) {
  const result = spawnSync(process.execPath, ['--check', join(extensionDir, script)], { stdio: 'inherit' })
  if (result.status !== 0) fail(`${script} has a JavaScript syntax error`)
}

console.log(`Chrome extension smoke check passed for ${manifest.name} ${manifest.version}`)
