const RULE_ID = 91001;
async function setProxy(profile) {
    if (!profile) {
        await chrome.proxy.settings.clear({ scope: "regular" });
        await chrome.storage.local.set({ activeProfileId: null });
        return;
    }
    await chrome.proxy.settings.set({ scope: "regular", value: { mode: "fixed_servers", rules: { singleProxy: { scheme: profile.scheme, host: profile.host, port: profile.port }, bypassList: ["localhost", "127.0.0.1", "<local>"] } } });
    await chrome.storage.local.set({ activeProfileId: profile.id });
}
async function setUa(value) {
    const addRules = [];
    if (value)
        addRules.push({ id: RULE_ID, priority: 1, action: { type: "modifyHeaders", requestHeaders: [{ header: "user-agent", operation: "set", value }] }, condition: { urlFilter: "*", resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "script", "image", "stylesheet", "font", "media", "other"] } });
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID], addRules });
    await chrome.storage.local.set({ userAgent: value });
}
chrome.runtime.onMessage.addListener((message, _sender, respond) => { (async () => { if (message.type === "SET_PROXY")
    await setProxy(message.profile); if (message.type === "SET_UA")
    await setUa(message.value); return { ok: true }; })().then(respond).catch(error => respond({ ok: false, error: String(error) })); return true; });
chrome.runtime.onInstalled.addListener(() => chrome.storage.local.get("profiles").then(v => { if (!v.profiles)
    return chrome.storage.local.set({ profiles: [], activeProfileId: null, userAgent: null }); }));
export {};
