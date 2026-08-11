# PortPilot Chrome 代理扩展

[English](README.md)

PortPilot 是一个轻量级 Google Chrome 扩展，用于切换本地 HTTP、HTTPS、SOCKS4 和 SOCKS5 代理。它可以导入 [MultiPort-Proxy](https://github.com/huades/MultiPort-Proxy) 导出的无凭据 `browser-profiles.json`，检测出口 IP 与延迟，并单独设置浏览器 User-Agent。

## 安装

### 使用 Release 压缩包

1. 从 GitHub Releases 下载 `portpilot-extension.zip` 并解压。
2. 在 Google Chrome 地址栏打开 `chrome://extensions`。
3. 开启右上角的“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择刚才解压的文件夹。
5. 如需快速使用，可在 Chrome 扩展程序菜单中固定 PortPilot。

### 从源码构建

建议使用 Node.js 22 或更高版本。

```powershell
npm ci
npm test
npm run typecheck
npm run build
```

构建完成后，在 `chrome://extensions` 中加载 `apps/extension/dist`。如需生成便于发布的 ZIP：

```powershell
npm run package
```

压缩包输出到 `apps/extension/portpilot-extension.zip`。

## 使用方法

- **添加代理：**填写名称、协议、主机和端口，然后点击“添加”。
- **导入节点：**点击“导入 JSON”，选择 schema version 为 1 的 `browser-profiles.json`。
- **启用代理：**点击对应代理卡片；点击“直连”可恢复不使用代理。
- **检测代理：**点击“测试”，查看出口 IP、国家/地区和连接延迟。
- **修改 User-Agent：**选择预设或填写自定义值，再点击“应用 User-Agent”；清空内容后应用即可恢复 Chrome 默认值。
- **偏好设置：**右上角可切换中英文和明暗主题，设置会保存在本机。

## 注意事项

- PortPilot 仅通过 `chrome.storage.local` 在本机保存代理节点和偏好设置。
- 导入的节点文件不应包含代理账号、密码或其他凭据。
- Chrome 不支持需要用户名和密码认证的 SOCKS5 代理，请使用无需认证的本地回环监听端口。
- 代理检测会访问 `https://ipwho.is/`；其他浏览流量遵循当前选择的 Chrome 代理设置。

## 仓库说明

本仓库仅保留 Chrome 扩展源码、构建脚本、测试和 GitHub Actions 工作流。生成的 `dist`、ZIP 压缩包和 `node_modules` 不提交到 Git。
