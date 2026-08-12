# PortPilot

[简体中文](README.zh-CN.md)

PortPilot is a lightweight Google Chrome extension for switching HTTP, HTTPS, SOCKS4, and SOCKS5 proxies. It can import the credential-free `browser-profiles.json` exported by [MultiPort-Proxy](https://github.com/huades/MultiPort-Proxy), check an exit IP and latency, and override the browser User-Agent.

## Install directly from GitHub

1. Click **Code → Download ZIP** on this repository.
2. Extract the downloaded ZIP.
3. Open `chrome://extensions` in Google Chrome.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extracted `PortPilot-main` folder—the folder that contains `manifest.json`.

No build, npm install, or command line is required. Do not select the ZIP itself; Chrome loads the extracted folder.

## Use

- **Add a proxy:** enter a name, protocol, host, and port, then click **Add**.
- **Import profiles:** click **Import JSON** and select a schema-version-1 `browser-profiles.json` file.
- **Paste profiles:** copy JSON, `scheme://host:port`, `host:port`, or one `name,scheme,host,port` entry per line, then click **Paste import**.
- **Copy and edit:** copy a node as standard JSON or edit its name, scheme, host, and port from the node row.
- **Search and collapse:** filter nodes by name, address, scheme, or tag, and collapse the whole node list.
- **Test and clean up:** test results appear inside the matching node card; **Delete all** clears every node after confirmation.
- **Manual collapse:** click **Collapse list** for a compact view that keeps only the active node visible; click **Expand list** to restore all nodes.
- **Enable a proxy:** click a proxy card; the active node stays highlighted and the list remains open.
- **Disable the proxy:** click **No proxy** to clear PortPilot's Chrome proxy setting and use the computer's normal network connection.
- **Disconnect protection:** optionally enable automatic proxy shutdown. The background worker checks two independent endpoints once per minute and switches to the normal network only after both fail for two consecutive rounds.
- **Check a proxy:** click **Test** to display the exit IP, country, and latency.
- **Change User-Agent:** choose a preset or enter a custom value and click **Apply UA**; once enabled, the action changes to **Disable UA**, which restores Chrome's default User-Agent.
- **Preferences:** switch language and choose System, Light, or Dark theme from the top-right controls. Settings are saved locally.

## Notes

- PortPilot stores proxy profiles and preferences only in `chrome.storage.local`.
- Imported profiles must not contain proxy credentials.
- Chrome does not support username/password authentication for SOCKS5 proxies. Use an unauthenticated local loopback listener.
- Proxy checks contact `https://ipwho.is/`; other browsing traffic follows the selected Chrome proxy setting.

## Repository layout

The repository root is the loadable Chrome extension. `manifest.json`, JavaScript, styles, popup markup, and icons are committed directly so a GitHub source download works without a build step. GitHub Actions also produces a `portpilot-extension.zip` artifact for each successful run.
