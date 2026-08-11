# PortPilot Chrome 代理扩展

[English](README.md)

PortPilot 是一个轻量级 Google Chrome 扩展，用于切换 HTTP、HTTPS、SOCKS4 和 SOCKS5 代理。它可以导入 [MultiPort-Proxy](https://github.com/huades/MultiPort-Proxy) 导出的无凭据 `browser-profiles.json`，检测出口 IP 与延迟，并单独设置浏览器 User-Agent。

## 从 GitHub 直接安装

1. 在本仓库页面点击 **Code → Download ZIP**。
2. 解压下载的 ZIP 文件。
3. 在 Google Chrome 地址栏打开 `chrome://extensions`。
4. 开启右上角的“开发者模式”。
5. 点击“加载已解压的扩展程序”。
6. 选择解压后的 `PortPilot-main` 文件夹，也就是直接包含 `manifest.json` 的文件夹。

不需要安装 npm、运行构建命令或使用命令行。Chrome 不能直接加载 ZIP，请先解压，再选择整个文件夹。

## 使用方法

- **添加代理：**填写名称、协议、主机和端口，然后点击“添加”。
- **导入节点：**点击“导入 JSON”，选择 schema version 为 1 的 `browser-profiles.json`。
- **粘贴导入：**复制 JSON、`协议://主机:端口`、`主机:端口`，或每行一个 `名称,协议,主机,端口`，再点击“粘贴导入”。
- **复制与编辑：**节点右侧可复制标准 JSON 或进入编辑状态修改名称、协议、主机和端口。
- **搜索与折叠：**可按名称、地址、协议或标签筛选节点，也可折叠整个节点列表。
- **测速与清理：**测速结果直接显示在对应节点卡片内；“删除全部”可在确认后清空所有节点。
- **快速展开：**折叠后双击当前节点卡片，可立即展开完整列表。
- **启用代理：**点击对应代理卡片后，列表会自动折叠并保留当前节点；点击“展开列表”可查看全部节点。
- **关闭代理：**点击“关闭代理”后，Chrome 不再使用 PortPilot 代理，恢复通过本机网络直接访问网站。
- **检测代理：**点击“测试”，查看出口 IP、国家/地区和连接延迟。
- **修改 User-Agent：**选择预设或填写自定义值并点击“应用 UA”；启用后按钮会变为“关闭 UA”，点击即可恢复 Chrome 默认 User-Agent。
- **偏好设置：**右上角可切换中英文，并选择跟随系统、浅色或深色主题；设置会保存在本机。

## 注意事项

- PortPilot 仅通过 `chrome.storage.local` 在本机保存代理节点和偏好设置。
- 导入的节点文件不应包含代理账号、密码或其他凭据。
- Chrome 不支持需要用户名和密码认证的 SOCKS5 代理，请使用无需认证的本地回环监听端口。
- 代理检测会访问 `https://ipwho.is/`；其他浏览流量遵循当前选择的 Chrome 代理设置。

## 仓库结构

仓库根目录本身就是可以加载的 Chrome 扩展。`manifest.json`、JavaScript、样式、弹窗页面和图标均直接提交，因此从 GitHub 下载源码后无需构建。每次 GitHub Actions 成功运行时，也会生成 `portpilot-extension.zip` 构建产物。
