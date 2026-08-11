# PortPilot

[简体中文](README.zh-CN.md)

PortPilot is a lightweight Chrome extension for switching local HTTP, HTTPS, SOCKS4, and SOCKS5 proxies. It can import the credential-free `browser-profiles.json` exported by [MultiPort-Proxy](https://github.com/huades/MultiPort-Proxy), check an exit IP and latency, and override the browser User-Agent.

## Install

### From a release ZIP

1. Download `portpilot-extension.zip` from GitHub Releases and extract it.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder.
5. Pin PortPilot from Chrome's Extensions menu if you want quick access.

### Build from source

Node.js 22 or later is recommended.

```powershell
npm ci
npm test
npm run typecheck
npm run build
```

Then load `apps/extension/dist` from `chrome://extensions`. To create a distributable ZIP, run:

```powershell
npm run package
```

The ZIP is written to `apps/extension/portpilot-extension.zip`.

## Use

- **Add a proxy:** enter a name, protocol, host, and port, then click **Add**.
- **Import profiles:** click **Import JSON** and select a schema-version-1 `browser-profiles.json` file.
- **Enable a proxy:** click a proxy card. Click **Direct** to restore the direct connection.
- **Check a proxy:** click **Test** to display the exit IP, country, and latency.
- **Change User-Agent:** choose a preset or enter a custom value, then click **Apply User-Agent**. Clear the field and apply it to restore Chrome's default.
- **Preferences:** use the top-right buttons to switch language and light/dark theme. Settings are saved locally.

## Notes

- PortPilot stores proxy profiles and preferences only in `chrome.storage.local`.
- Imported profiles must not contain proxy credentials.
- Chrome does not support username/password authentication for SOCKS5 proxies. Use an unauthenticated local loopback listener.
- The proxy test contacts `https://ipwho.is/`; other browsing traffic follows the selected Chrome proxy setting.

## Repository

This repository contains only the Chrome extension, its build scripts, tests, and GitHub Actions workflow. Generated files (`dist`, ZIP packages, and `node_modules`) are intentionally not committed.
