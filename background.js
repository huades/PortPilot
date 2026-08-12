const RULE_ID = 91001;
const HEALTH_ALARM = "proxy-health-check";
const HEALTH_URLS = ["https://www.gstatic.com/generate_204", "https://cp.cloudflare.com/generate_204"];
async function setProxy(profile) {
    if (!profile) {
        await chrome.proxy.settings.clear({ scope: "regular" });
        await chrome.storage.local.set({ activeProfileId: null, proxyHealthFailures: 0 });
        return;
    }
    await chrome.proxy.settings.set({ scope: "regular", value: { mode: "fixed_servers", rules: { singleProxy: { scheme: profile.scheme, host: profile.host, port: profile.port }, bypassList: ["localhost", "127.0.0.1", "<local>"] } } });
    await chrome.storage.local.set({ activeProfileId: profile.id, proxyHealthFailures: 0 });
}
async function setUa(value) {
    const addRules = [];
    if (value)
        addRules.push({ id: RULE_ID, priority: 1, action: { type: "modifyHeaders", requestHeaders: [{ header: "user-agent", operation: "set", value }] }, condition: { urlFilter: "*", resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "script", "image", "stylesheet", "font", "media", "other"] } });
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID], addRules });
    await chrome.storage.local.set({ userAgent: value });
}
async function ensureHealthAlarm() {
    const { autoDisconnect } = await chrome.storage.local.get("autoDisconnect");
    if (autoDisconnect) {
        if (!await chrome.alarms.get(HEALTH_ALARM))
            await chrome.alarms.create(HEALTH_ALARM, { periodInMinutes: 1 });
    }
    else
        await chrome.alarms.clear(HEALTH_ALARM);
}
async function endpointReachable(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(`${url}?portpilot=${Date.now()}`, { cache: "no-store", signal: controller.signal });
        return response.ok;
    }
    catch {
        return false;
    }
    finally {
        clearTimeout(timeout);
    }
}
async function checkProxyHealth() {
    const saved = await chrome.storage.local.get(["autoDisconnect", "activeProfileId", "proxyHealthFailures"]);
    if (!saved.autoDisconnect || !saved.activeProfileId) {
        await chrome.storage.local.set({ proxyHealthFailures: 0 });
        return;
    }
    const results = await Promise.all(HEALTH_URLS.map(endpointReachable));
    if (results.some(Boolean)) {
        await chrome.storage.local.set({ proxyHealthFailures: 0 });
        return;
    }
    const failures = Number(saved.proxyHealthFailures || 0) + 1;
    if (failures < 2) {
        await chrome.storage.local.set({ proxyHealthFailures: failures });
        return;
    }
    await setProxy(null);
    await chrome.storage.local.set({ proxyHealthFailures: 0, autoDisconnectEvent: { at: Date.now(), reason: "health-check-failed" } });
}
chrome.runtime.onMessage.addListener((message, _sender, respond) => { (async () => { if (message.type === "SET_PROXY")
    await setProxy(message.profile); if (message.type === "SET_UA")
    await setUa(message.value); if (message.type === "SET_AUTO_DISCONNECT") {
    await chrome.storage.local.set({ autoDisconnect: Boolean(message.value), proxyHealthFailures: 0 });
    await ensureHealthAlarm();
} return { ok: true }; })().then(respond).catch(error => respond({ ok: false, error: String(error) })); return true; });
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === HEALTH_ALARM)
    void checkProxyHealth(); });
chrome.runtime.onInstalled.addListener(async () => { const saved = await chrome.storage.local.get("profiles"); if (!saved.profiles)
    await chrome.storage.local.set({ profiles: [], activeProfileId: null, userAgent: null, autoDisconnect: false, proxyHealthFailures: 0 }); await ensureHealthAlarm(); });
chrome.runtime.onStartup.addListener(() => void ensureHealthAlarm());
void ensureHealthAlarm();
export {};
