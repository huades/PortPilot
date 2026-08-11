const $ = (s) => document.querySelector(s);
const browserMajor = navigator.userAgent.match(/(?:Chrome|Chromium)\/(\d+)/)?.[1] || "140";
const UA_PRESETS = [
    { id: "chromeWindows", value: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserMajor}.0.0.0 Safari/537.36` },
    { id: "edgeWindows", value: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserMajor}.0.0.0 Safari/537.36 Edg/${browserMajor}.0.0.0` },
    { id: "chromeMac", value: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserMajor}.0.0.0 Safari/537.36` },
    { id: "chromeAndroid", value: `Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserMajor}.0.0.0 Mobile Safari/537.36` },
    { id: "safariIphone", value: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1" }
];
const TEXT = {
    zh: { direct: "直连", profiles: "代理节点", import: "导入 JSON", pasteImport: "粘贴导入", searchPlaceholder: "搜索名称、地址、协议或标签", collapseList: "折叠列表", expandList: "展开列表", profileName: "节点名称", add: "添加", save: "保存修改", cancel: "取消编辑", edit: "编辑", copy: "复制", copied: "已复制节点 {name}", noResults: "没有匹配的节点", rotateUa: "换一个 UA", applyUa: "应用 User-Agent", uaPlaceholder: "留空以恢复浏览器默认 UA", empty: "导入 PortPilot JSON 文件<br>或添加第一个本地代理节点。", test: "测试", delete: "删除", expand: "展开节点信息", collapse: "折叠节点信息", checking: "检测中…", failed: "失败", unknown: "未知", imported: "已导入 {count} 个节点", importFailed: "导入失败", uaEnabled: "User-Agent 已启用", uaRestored: "已恢复浏览器默认 User-Agent", uaRotated: "已自动更换为 {name}", directStatus: "直连", proxyStatus: "代理已启用", hint: "Chrome 不支持需要账号密码认证的 SOCKS5。", defaultUa: "自定义 / 浏览器默认", chromeWindows: "Chrome / Windows", edgeWindows: "Edge / Windows", chromeMac: "Chrome / macOS", chromeAndroid: "Chrome / Android", safariIphone: "Safari / iPhone" },
    en: { direct: "Direct", profiles: "Proxy nodes", import: "Import JSON", pasteImport: "Paste import", searchPlaceholder: "Search name, address, scheme, or tag", collapseList: "Collapse list", expandList: "Expand list", profileName: "Node name", add: "Add", save: "Save changes", cancel: "Cancel edit", edit: "Edit", copy: "Copy", copied: "Copied node {name}", noResults: "No matching nodes", rotateUa: "Change UA", applyUa: "Apply User-Agent", uaPlaceholder: "Leave empty to restore the browser default UA", empty: "Import a PortPilot JSON file<br>or add your first local proxy.", test: "Test", delete: "Delete", expand: "Expand node details", collapse: "Collapse node details", checking: "Checking…", failed: "Failed", unknown: "Unknown", imported: "Imported {count} nodes", importFailed: "Import failed", uaEnabled: "User-Agent enabled", uaRestored: "Browser default User-Agent restored", uaRotated: "Changed automatically to {name}", directStatus: "Direct", proxyStatus: "Proxy active", hint: "Chrome does not support authenticated SOCKS5 proxies.", defaultUa: "Custom / browser default", chromeWindows: "Chrome / Windows", edgeWindows: "Edge / Windows", chromeMac: "Chrome / macOS", chromeAndroid: "Chrome / Android", safariIphone: "Safari / iPhone" }
};
let state = { profiles: [], activeProfileId: null, userAgent: null, language: "zh", theme: "light", listCollapsed: false, searchQuery: "", editingId: null };
const t = (key, vars = {}) => Object.entries(vars).reduce((value, [name, replacement]) => value.replace(`{${name}}`, String(replacement)), TEXT[state.language][key]);
function esc(value) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }
async function persistProfiles() { await chrome.storage.local.set({ profiles: state.profiles }); }
async function persistPreferences() { await chrome.storage.local.set({ language: state.language, theme: state.theme, profileListCollapsed: state.listCollapsed }); }
async function activate(profile) { const result = await chrome.runtime.sendMessage({ type: "SET_PROXY", profile }); if (!result?.ok)
    throw new Error(result?.error || "Proxy update failed"); state.activeProfileId = profile?.id ?? null; renderProfiles(); }
function renderPresets() { const select = $("#uaPreset"); const current = UA_PRESETS.find(item => item.value === $("#ua").value); select.innerHTML = `<option value="">${t("defaultUa")}</option>${UA_PRESETS.map(item => `<option value="${item.id}">${t(item.id)}</option>`).join("")}`; select.value = current?.id || ""; }
function renderProfiles() {
    const list = $("#profiles");
    const query = state.searchQuery.trim().toLowerCase();
    const visible = query ? state.profiles.filter(profile => [profile.name, profile.host, profile.scheme, ...(profile.tags || [])].some(value => String(value).toLowerCase().includes(query))) : state.profiles;
    list.innerHTML = visible.length ? visible.map(profile => {
        return `<article class="profile ${profile.id === state.activeProfileId ? "active" : ""}" data-id="${esc(profile.id)}"><div class="profile-row"><div class="profile-name"><strong>${esc(profile.name)}</strong></div><button class="action" data-action="copy">${t("copy")}</button><button class="action" data-action="edit">${t("edit")}</button><button class="action" data-action="test">${t("test")}</button><button class="action" data-action="delete" aria-label="${t("delete")}" title="${t("delete")}">×</button></div><div class="profile-detail"><span>${profile.scheme.toUpperCase()} · ${esc(profile.host)}:${profile.port}</span>${profile.tags?.length ? `<br><span>${profile.tags.map(esc).join(" · ")}</span>` : ""}</div></article>`;
    }).join("") : `<div class="empty">${state.profiles.length ? t("noResults") : t("empty")}</div>`;
    $("#profileArea").classList.toggle("list-collapsed", state.listCollapsed);
    $("#toggleList").textContent = t(state.listCollapsed ? "expandList" : "collapseList");
    $("#status").textContent = t(state.activeProfileId ? "proxyStatus" : "directStatus").toUpperCase();
    $("#direct").classList.toggle("active", !state.activeProfileId);
}
function renderLanguage() { document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en"; document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); }); document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); }); $("#language").textContent = state.language === "zh" ? "EN" : "中文"; renderPresets(); renderProfiles(); if (state.editingId) $("#saveProfile").textContent = t("save"); if (!$("#checkResult").dataset.message)
    $("#checkResult").textContent = t("hint"); }
function renderTheme() { document.documentElement.dataset.theme = state.theme; $("#theme").textContent = state.theme === "light" ? "☾" : "☀"; }
function showMessage(key, vars = {}) { const output = $("#checkResult"); output.dataset.message = key; output.textContent = t(key, vars); }
async function check(profile) { showMessage("checking"); const old = state.profiles.find(p => p.id === state.activeProfileId) || null; const started = performance.now(); try {
    await activate(profile);
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);
    const response = await fetch("https://ipwho.is/", { cache: "no-store", signal: controller.signal });
    const data = await response.json();
    if (!response.ok || data.success === false)
        throw new Error(data.message || `HTTP ${response.status}`);
    $("#checkResult").textContent = `${data.ip} / ${data.country || t("unknown")} / ${Math.round(performance.now() - started)} ms`;
}
catch (error) {
    await activate(old);
    $("#checkResult").textContent = `${t("failed")} / ${error instanceof Error ? error.message : String(error)}`;
} }
async function applyUa(value, message) { const result = await chrome.runtime.sendMessage({ type: "SET_UA", value }); if (!result?.ok)
    throw new Error(result?.error || "User-Agent update failed"); state.userAgent = value; $("#ua").value = value || ""; renderPresets(); message?.(); }
function normalizeProfiles(text) {
    const trimmed = text.trim();
    if (!trimmed)
        throw new Error("Clipboard is empty");
    let profiles;
    try {
        const data = JSON.parse(trimmed);
        profiles = Array.isArray(data) ? data : Array.isArray(data.profiles) ? data.profiles : [data];
    }
    catch {
        profiles = trimmed.split(/\r?\n/).filter(Boolean).map((line, index) => {
            const url = line.match(/^(https?|socks4|socks5):\/\/([^:]+):(\d+)$/i);
            if (url)
                return { name: `${url[1].toUpperCase()} ${url[2]}:${url[3]}`, scheme: url[1].toLowerCase(), host: url[2], port: Number(url[3]) };
            const parts = line.split(/[\t,]/).map(value => value.trim());
            if (parts.length >= 4)
                return { name: parts[0], scheme: parts[1].toLowerCase(), host: parts[2], port: Number(parts[3]) };
            const hostPort = line.match(/^([^:]+):(\d+)$/);
            if (hostPort)
                return { name: `Node ${index + 1}`, scheme: "http", host: hostPort[1], port: Number(hostPort[2]) };
            throw new Error("Unsupported text format");
        });
    }
    const valid = profiles.every(profile => profile.name && ["http", "https", "socks4", "socks5"].includes(String(profile.scheme).toLowerCase()) && profile.host && Number.isInteger(Number(profile.port)) && Number(profile.port) > 0 && Number(profile.port) < 65536);
    if (!valid)
        throw new Error("Invalid profile");
    return profiles.map((profile, index) => ({ ...profile, id: profile.id || `import-${Date.now().toString(36)}-${index}`, scheme: String(profile.scheme).toLowerCase(), port: Number(profile.port) }));
}
async function importProfiles(text) {
    const profiles = normalizeProfiles(text);
    state.profiles = profiles;
    await persistProfiles();
    renderProfiles();
    showMessage("imported", { count: profiles.length });
}
function stopEditing() {
    state.editingId = null;
    $("#addForm").reset();
    $("#saveProfile").textContent = t("add");
    $("#cancelEdit").hidden = true;
}
function editProfile(profile) {
    const form = $("#addForm");
    form.elements.name.value = profile.name;
    form.elements.scheme.value = profile.scheme;
    form.elements.host.value = profile.host;
    form.elements.port.value = profile.port;
    state.editingId = profile.id;
    $("#saveProfile").textContent = t("save");
    $("#cancelEdit").hidden = false;
    form.elements.name.focus();
}
async function init() { const saved = await chrome.storage.local.get(["profiles", "activeProfileId", "userAgent", "language", "theme", "profileListCollapsed"]); state = { profiles: saved.profiles || [], activeProfileId: saved.activeProfileId || null, userAgent: saved.userAgent || null, language: saved.language || "zh", theme: saved.theme || "light", listCollapsed: Boolean(saved.profileListCollapsed), searchQuery: "", editingId: null }; $("#ua").value = state.userAgent || ""; renderTheme(); renderLanguage(); }
$("#profiles").addEventListener("click", async (event) => { const target = event.target, button = target.closest("button"), card = target.closest(".profile"); if (!card)
    return; const profile = state.profiles.find(item => item.id === card.dataset.id); if (!profile)
    return; if (button?.dataset.action === "delete") {
    state.profiles = state.profiles.filter(item => item.id !== profile.id);
    if (state.activeProfileId === profile.id)
        await activate(null);
    await Promise.all([persistProfiles(), persistPreferences()]);
    renderProfiles();
}
else if (button?.dataset.action === "edit")
    editProfile(profile);
else if (button?.dataset.action === "copy") {
    await navigator.clipboard.writeText(JSON.stringify({ schemaVersion: 1, profiles: [profile] }, null, 2));
    showMessage("copied", { name: profile.name });
}
else if (button?.dataset.action === "test")
    await check(profile);
else if (!button)
    await activate(profile); });
$("#direct").addEventListener("click", () => void activate(null));
$("#language").addEventListener("click", async () => { state.language = state.language === "zh" ? "en" : "zh"; await persistPreferences(); renderLanguage(); });
$("#theme").addEventListener("click", async () => { state.theme = state.theme === "light" ? "dark" : "light"; await persistPreferences(); renderTheme(); });
$("#profileSearch").addEventListener("input", event => { state.searchQuery = event.target.value; renderProfiles(); });
$("#toggleList").addEventListener("click", async () => { state.listCollapsed = !state.listCollapsed; await persistPreferences(); renderProfiles(); });
$("#pasteImport").addEventListener("click", async () => { try {
    await importProfiles(await navigator.clipboard.readText());
}
catch (error) {
    $("#checkResult").textContent = `${t("importFailed")} / ${error instanceof Error ? error.message : String(error)}`;
} });
$("#import").addEventListener("change", async (event) => { const input = event.target, file = input.files?.[0]; if (!file)
    return; try {
    await importProfiles(await file.text());
}
catch (error) {
    $("#checkResult").textContent = `${t("importFailed")} / ${error instanceof Error ? error.message : String(error)}`;
}
finally {
    input.value = "";
} });
$("#addForm").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.target, data = new FormData(form), port = Number(data.get("port")); if (port < 1 || port > 65535)
    return; const profile = { id: state.editingId || `manual-${Date.now().toString(36)}`, name: String(data.get("name")), scheme: String(data.get("scheme")), host: String(data.get("host")), port }; if (state.editingId) {
    const index = state.profiles.findIndex(item => item.id === state.editingId);
    const old = state.profiles[index];
    state.profiles[index] = { ...old, ...profile };
    if (state.activeProfileId === profile.id)
        await activate(state.profiles[index]);
}
else
    state.profiles.push(profile); await persistProfiles(); stopEditing(); renderProfiles(); });
$("#cancelEdit").addEventListener("click", stopEditing);
$("#uaPreset").addEventListener("change", event => { const preset = UA_PRESETS.find(item => item.id === event.target.value); $("#ua").value = preset?.value || ""; });
$("#rotateUa").addEventListener("click", async () => { const candidates = UA_PRESETS.filter(item => item.value !== state.userAgent); const selected = candidates[Math.floor(Math.random() * candidates.length)] || UA_PRESETS[0]; await applyUa(selected.value, () => showMessage("uaRotated", { name: t(selected.id) })); });
$("#applyUa").addEventListener("click", async () => { const value = $("#ua").value.trim() || null; await applyUa(value, () => showMessage(value ? "uaEnabled" : "uaRestored")); });
void init();
export {};
