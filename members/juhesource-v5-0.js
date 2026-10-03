/*!
 * @name 聚合音源 v5.0 (融合版)
 * @description 基于全豆要v4.1框架，修复长青IP直连level参数，清理已死API，新增多层回退
 * @version v5.0
 * @author 融合整理
 * @build 2026-09-21
 */

// ========== 常量 ==========
const CACHE_TTL_MS = 21600000;
const CACHE_MAX_SIZE = 500;
const HTTP_URL_REGEX = /^https?:\/\//i;

// --- 溯音API (已验证可用) ---
const SUYIN_KUWO_API = "https://oiapi.net/api/Kuwo";
const SUYIN_MIGU_API = "https://api.xcvts.cn/api/music/migu";
const SUYIN_163_API = "https://oiapi.net/api/Music_163";

// --- 长青SVIP IP直连模板 (已验证可连，level修复) ---
const CHANGQING_IP_TEMPLATES = {
  tx: "http://175.27.166.236/kgqq/qq.php?type=mp3&id={id}&level={level}",
  wy: "http://175.27.166.236/wy/wy.php?type=mp3&id={id}&level={level}",
  kw: "https://musicapi.haitangw.net/music/kw.php?type=mp3&id={id}&level={level}",
  kg: "https://music.haitangw.cc/kgqq/kg.php?type=mp3&id={id}&level={level}",
  mg: "https://music.haitangw.cc/musicapi/mg.php?type=mp3&id={id}&level={level}"
};

// --- 备选: 星海/聆川/Huibq (可用性不确定) ---
const XINGHAI_MAIN_API = "https://music-api.gdstudio.xyz/api.php?use_xbridge3=true&loader_name=forest&need_sec_link=1&sec_link_scene=im&theme=light";
const XINGHAI_BACKUP_API = "https://music-dl.sayqz.com/api/";
const HUIBQ_API = "https://api.huibq.com";
const HUIBQ_REQUEST_KEY = "";
const LINGCHUAN_API = "https://api.lingchuan.top";

// --- 平台配置 ---
const PLATFORM_QUALITIES = {
  wy: ["128k", "320k", "flac", "flac24bit"],
  tx: ["128k", "320k", "flac", "flac24bit"],
  kw: ["128k", "320k", "flac", "flac24bit"],
  kg: ["128k", "320k", "flac", "flac24bit"],
  mg: ["128k", "320k", "flac", "flac24bit"]
};

const PLATFORM_NAMES = {
  wy: "网易云音乐",
  tx: "QQ音乐",
  kw: "酷我音乐",
  kg: "酷狗音乐",
  mg: "咪咕音乐"
};

const PLATFORM_TO_XINGHAI = { wy: "netease", tx: "tencent", kw: "kuwo", kg: "kugou", mg: "migu" };
const PLATFORM_TO_XINGHAI_BACKUP = { wy: "netease", tx: "qq", kw: "kuwo" };

const QUALITY_TO_BR = {
  "128k": "128", "192k": "192", "320k": "320",
  flac: "740", flac24bit: "999", "24bit": "999"
};

const QUALITY_TO_KUWO_BR = { flac: 1, "320k": 5, "128k": 7, "24bit": 1 };

const HIRES_QUALITY_SET = new Set(["flac24bit", "flac", "hires", "master", "atmos", "24bit"]);

const urlCache = new Map();

const { EVENT_NAMES, request, on, send } = globalThis.lx;

function noop() {}

// ========== 工具函数 ==========
function httpRequest(url, options = { method: "GET" }) {
  return new Promise((resolve, reject) => {
    request(url, { timeout: 2000, ...options }, (err, res) => {
      if (err) return reject(new Error("请求错误: " + err.message));
      let body = res?.body;
      if (typeof body === "string") {
        const trimmed = body.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.startsWith("\"")) {
          try { body = JSON.parse(trimmed); } catch (e) {}
        }
      }
      resolve({ statusCode: res?.statusCode ?? 0, headers: res?.headers || {}, body });
    });
  });
}

async function httpGet(url, params = {}) {
  const queryStr = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null)
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");
  const sep = url.includes("?") ? "&" : "?";
  const fullUrl = "" + url + (queryStr ? sep + queryStr : "");
  const res = await httpRequest(fullUrl, { method: "GET", timeout: 5000 });
  if (res.statusCode >= 400) throw new Error("HTTP " + res.statusCode);
  return res.body;
}

function buildQueryString(params = {}) {
  const parts = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null)
    .map(k => encodeURIComponent(String(k)) + "=" + encodeURIComponent(String(params[k])));
  return parts.length ? "?" + parts.join("&") : "";
}

function getSongId(songInfo) {
  return (songInfo?.id || songInfo?.songmid || songInfo?.songId || songInfo?.hash || songInfo?.rid || songInfo?.mid || "").toString();
}

function getHashOrMid(songInfo) {
  return songInfo?.hash ?? songInfo?.songmid ?? songInfo?.id ?? null;
}

function getQQSongId(songInfo) {
  const mid = songInfo?.meta?.qq?.mid || songInfo?.meta?.mid || songInfo?.songmid ||
    (typeof songInfo?.id === "string" && !/^\d+$/.test(songInfo.id) ? songInfo.id : null);
  if (mid) return { type: "mid", value: mid };
  const songid = songInfo?.meta?.qq?.songid || songInfo?.meta?.songid ||
    (typeof songInfo?.id === "number" ? songInfo.id :
      (typeof songInfo?.id === "string" && /^\d+$/.test(songInfo.id) ? Number(songInfo.id) : null));
  if (songid) return { type: "songid", value: songid };
  return null;
}

function getPlatformSongId(platform, songInfo) {
  if (platform === "kg") {
    return songInfo?.hash || songInfo?.songmid || songInfo?.id || songInfo?.rid || songInfo?.mid || null;
  }
  if (platform === "tx") {
    const qqId = getQQSongId(songInfo);
    if (qqId?.value) return qqId.value;
  }
  return songInfo?.songmid || songInfo?.id || songInfo?.songId || songInfo?.rid || songInfo?.hash || null;
}

// 标准化音质
function selectQuality(requestedQuality, supportedQualities) {
  const qualityList = Array.isArray(supportedQualities) ? supportedQualities : ["128k"];
  const normalized = String(requestedQuality || "128k").toLowerCase();
  if (qualityList.includes(normalized)) return normalized;
  const order = ["flac24bit", "flac", "320k", "192k", "128k"];
  let idx = order.indexOf(normalized);
  if (idx < 0) idx = order.length - 1;
  for (let i = idx; i < order.length; i++) {
    if (qualityList.includes(order[i])) return order[i];
  }
  return qualityList[0] || "128k";
}

// 音质转网易云格式 (修复: 支持更多level)
function qualityToNetease(quality) {
  const q = String(quality || "128k").toLowerCase();
  if (q === "flac" || q === "flac24bit" || q === "hires" || q === "master" || q === "atmos") {
    return "lossless";
  }
  if (q === "320k" || q === "192k") return "exhigh";
  if (q === "128k") return "standard";
  return "standard";
}

// 标准化关键词
function normalizeKeyword(keyword) {
  if (!keyword) return "";
  return String(keyword)
    .replace(/\(\s*Live\s*\)/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, "")
    .replace(/[^\w\u4e00-\u9fa5]/g, "")
    .trim()
    .toLowerCase();
}

function buildSearchKeywords(songInfo) {
  const keywords = [];
  const name = songInfo?.name || "";
  const album = songInfo?.albumName || songInfo?.album || "";
  const singer = songInfo?.singer || "";
  if (name && album) {
    const kw = normalizeKeyword(name + album);
    if (kw) keywords.push({ keyword: kw, strict: true });
  }
  if (name && singer) {
    const kw = normalizeKeyword(name + singer);
    if (kw) keywords.push({ keyword: kw, strict: true });
  }
  if (name) {
    const kw = normalizeKeyword(name);
    if (kw) keywords.push({ keyword: kw, strict: false });
  }
  return keywords;
}

function titleMatch(a, b) {
  const na = normalizeKeyword(a), nb = normalizeKeyword(b);
  if (!na || !nb) return true;
  return na.includes(nb) || nb.includes(na);
}

function songInfoMatch(responseData, songInfo) {
  const song = responseData?.song || responseData?.data?.song || "";
  const singer = responseData?.singer || responseData?.data?.singer || "";
  const album = responseData?.album || responseData?.data?.album || "";
  if (!titleMatch(song, songInfo?.name || "")) return false;
  if (songInfo?.singer && singer && !titleMatch(singer, songInfo.singer)) return false;
  if ((songInfo?.albumName || songInfo?.album) && album && !titleMatch(album, songInfo.albumName || songInfo.album)) return false;
  return true;
}

function songTitleMatch(responseData, songInfo) {
  if (!titleMatch(responseData?.title || "", songInfo?.name || "")) return false;
  if (songInfo?.singer && responseData?.artist && !titleMatch(responseData.artist, songInfo.singer)) return false;
  if ((songInfo?.albumName || songInfo?.album) && responseData?.album && !titleMatch(responseData.album, songInfo.albumName || songInfo.album)) return false;
  return true;
}

function parseMessageSongInfo(message) {
  if (!message) return null;
  const result = {};
  for (const line of String(message).split("\n")) {
    if (line.startsWith("歌名：")) result.song = line.replace("歌名：", "").trim();
    if (line.startsWith("歌手：")) result.singer = line.replace("歌手：", "").trim();
    if (line.startsWith("专辑：")) result.album = line.replace("专辑：", "").trim();
  }
  return result.song ? result : null;
}

// 构建模板URL
function buildTemplateUrl(platform, quality, songInfo, templates, sourceName) {
  const template = templates[platform];
  if (!template) throw new Error(sourceName + "不支持该平台");
  const songId = getPlatformSongId(platform, songInfo);
  if (!songId) throw new Error(sourceName + "缺少songId");
  const level = qualityToNetease(quality);
  return template
    .replace("{id}", encodeURIComponent(String(songId)))
    .replace("{level}", encodeURIComponent(level));
}

// 缓存
function buildCacheKey(prefix, songInfo, quality = "") {
  return prefix + "_" + (songInfo?.name || "") + "_" + (songInfo?.singer || "") + "_" + (songInfo?.albumName || songInfo?.album || "") + "_" + quality;
}
function getCachedUrl(cacheKey) {
  const entry = urlCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp >= CACHE_TTL_MS) { urlCache.delete(cacheKey); return null; }
  return entry.url;
}
function setCachedUrl(cacheKey, url) {
  urlCache.set(cacheKey, { url, timestamp: Date.now() });
  if (urlCache.size > CACHE_MAX_SIZE) {
    const oldestKey = urlCache.keys().next().value;
    if (oldestKey !== undefined) urlCache.delete(oldestKey);
  }
}

function validateUrl(url, sourceName) {
  if (!url || typeof url !== "string") throw new Error(sourceName + "返回空URL");
  if (!HTTP_URL_REGEX.test(url.trim())) throw new Error(sourceName + "非法URL格式");
  return url;
}

function getMobileUserAgent() {
  return "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";
}

// ========== 各音源处理器 ==========

// --- 溯音酷我 (已验证: 可用) ---
async function suyinKuwoSearch(keyword, br, songInfo = null) {
  const res = await httpGet(SUYIN_KUWO_API, { msg: keyword, n: 1, br });
  if (res?.data?.url) {
    if (songInfo && !songInfoMatch(res, songInfo)) throw new Error("溯音酷我歌曲信息不匹配");
    return res.data.url;
  }
  if (res?.message) {
    const match = String(res.message).match(/音乐链接[：:](\S+)/);
    if (match?.[1]) {
      if (songInfo) {
        const parsed = parseMessageSongInfo(res.message);
        if (parsed && !songInfoMatch(parsed, songInfo)) throw new Error("溯音酷我歌曲信息不匹配");
      }
      return match[1];
    }
  }
  throw new Error("溯音酷我未找到链接: " + (res?.message || "无响应"));
}

async function suyinKuwoGetUrl(platform, songId, quality, songInfo) {
  if (!songInfo?.name) throw new Error("溯音酷我需要歌曲名");
  const cacheKey = buildCacheKey("kw", songInfo, quality);
  const cached = getCachedUrl(cacheKey);
  if (cached) return cached;
  const selectedQuality = selectQuality(quality, ["flac", "320k", "128k"]);
  const br = QUALITY_TO_KUWO_BR[selectedQuality] || 1;
  const keywords = buildSearchKeywords(songInfo);
  let lastError = null;
  for (const item of keywords) {
    try {
      const url = await suyinKuwoSearch(item.keyword, br, item.strict ? songInfo : null);
      if (url) { setCachedUrl(cacheKey, url); return validateUrl(url, "溯音酷我"); }
    } catch (e) { lastError = e; }
  }
  throw new Error("溯音酷我失败: " + (lastError?.message || "unknown"));
}

// --- 溯音咪咕 (已验证: 连接正常，咪咕服务端可能限流) ---
async function suyinMiguGetUrl(platform, songId, quality, songInfo) {
  if (!songInfo?.name) throw new Error("溯音咪咕需要歌曲名");
  const cacheKey = buildCacheKey("mg", songInfo);
  const cached = getCachedUrl(cacheKey);
  if (cached) return cached;
  const keywords = buildSearchKeywords(songInfo);
  let lastError = null;
  for (const item of keywords) {
    try {
      const res = await httpGet(SUYIN_MIGU_API, { gm: item.keyword, n: 1, num: 1, type: "json" });
      if (res?.code === 200 && res?.musicInfo) {
        if (item.strict && !songTitleMatch(res, songInfo)) throw new Error("溯音咪咕歌曲信息不匹配");
        setCachedUrl(cacheKey, res.musicInfo);
        return validateUrl(res.musicInfo, "溯音咪咕");
      }
    } catch (e) { lastError = e; }
  }
  throw new Error("溯音咪咕失败: " + (lastError?.message || "unknown"));
}

// --- 溯音163 (已验证: 连接正常，可能无直链) ---
async function suyin163GetUrl(platform, songId, quality, songInfo) {
  const id = songInfo?.songmid || songInfo?.id;
  if (!id) throw new Error("溯音163缺少songmid/id");
  const res = await httpGet(SUYIN_163_API, { id });
  if (res?.code === 0 && res?.data) {
    const item = Array.isArray(res.data) ? res.data[0] : res.data;
    if (item?.url) return validateUrl(item.url, "溯音163");
  }
  throw new Error("溯音163获取失败: " + (res?.message || "无URL"));
}

// --- 溯音统一入口 ---
async function suyinGetUrl(platform, songId, quality, songInfo) {
  switch (platform) {
    case "tx": return suyinKuwoGetUrl(platform, songId, quality, songInfo);
    case "wy": return suyin163GetUrl(platform, songId, quality, songInfo);
    case "kw": return suyinKuwoGetUrl(platform, songId, quality, songInfo);
    case "kg": return suyinKuwoGetUrl(platform, songId, quality, songInfo);
    case "mg": return suyinMiguGetUrl(platform, songId, quality, songInfo);
    default: throw new Error("溯音不支持该平台: " + platform);
  }
}

// --- 长青SVIP IP直连 (level已修复) ---
async function changqingGetUrl(platform, songId, quality, songInfo) {
  return buildTemplateUrl(platform, quality, songInfo, CHANGQING_IP_TEMPLATES, "长青SVIP");
}

// --- 星海主API (可用性不确定) ---
async function xinghaiMainGetUrl(platform, songId, quality, songInfo) {
  const source = PLATFORM_TO_XINGHAI[platform];
  if (!source) throw new Error("星海主API不支持该平台");
  const id = songId ?? getHashOrMid(songInfo);
  if (!id) throw new Error("缺少songId");
  const selectedQuality = selectQuality(quality, ["128k", "192k", "320k", "flac", "flac24bit"]);
  const br = QUALITY_TO_BR[selectedQuality];
  if (!br) throw new Error("星海主API音质映射失败");
  const url = XINGHAI_MAIN_API + "&types=url&source=" + source + "&id=" + encodeURIComponent(id) + "&br=" + br;
  const res = await httpRequest(url, { method: "GET", headers: { "User-Agent": "LX-Music-Mobile", Accept: "application/json" } });
  const body = res.body;
  if (!body || typeof body !== "object" || !body.url) {
    throw new Error(body?.message || "星海主API未返回可用URL");
  }
  return validateUrl(body.url, "星海主");
}

// --- 星海备API (可用性不确定) ---
async function xinghaiBackupGetUrl(platform, songId, quality, songInfo) {
  const source = PLATFORM_TO_XINGHAI_BACKUP[platform];
  if (!source) throw new Error("星海备API不支持该平台");
  const id = songId ?? getHashOrMid(songInfo);
  if (!id) throw new Error("缺少songId");
  const selectedQuality = selectQuality(quality, ["128k", "192k", "320k", "flac", "flac24bit"]);
  return validateUrl(
    XINGHAI_BACKUP_API + "?source=" + encodeURIComponent(source) + "&id=" + encodeURIComponent(id) + "&type=url&br=" + encodeURIComponent(selectedQuality),
    "星海备"
  );
}

// --- Huibq (未验证, key为空时跳过) ---
async function huibqGetUrl(platform, songId, quality, songInfo) {
  if (!HUIBQ_REQUEST_KEY) throw new Error("Huibq未配置Key");
  const hashOrMid = songInfo?.hash ?? songInfo?.songmid;
  if (!hashOrMid) throw new Error("Huibq缺少hash/songmid");
  const selectedQuality = selectQuality(quality, ["320k", "128k"]);
  const url = HUIBQ_API + "/url/" + platform + "/" + encodeURIComponent(hashOrMid) + "/" + encodeURIComponent(selectedQuality);
  const res = await httpRequest(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", "User-Agent": getMobileUserAgent(), "X-Request-Key": HUIBQ_REQUEST_KEY }
  });
  const body = res.body;
  if (!body || typeof body !== "object" || Number.isNaN(Number(body.code))) throw new Error("Huibq返回无效");
  if (Number(body.code) === 0 && body.url) return validateUrl(body.url, "Huibq");
  throw new Error("Huibq错误: " + (body.message || "code=" + body.code));
}

// --- 聆川 (未验证) ---
async function lingchuanGetUrl(platform, songId, quality, songInfo) {
  const hashOrMid = songInfo?.hash ?? songInfo?.songmid;
  if (!hashOrMid) throw new Error("聆川缺少hash/songmid");
  const selectedQuality = selectQuality(quality, ["320k", "128k"]);
  const url = LINGCHUAN_API + "/url?source=" + encodeURIComponent(platform) + "&songId=" + encodeURIComponent(hashOrMid) + "&quality=" + encodeURIComponent(selectedQuality);
  const res = await httpRequest(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", "User-Agent": getMobileUserAgent() },
    follow_max: 5
  });
  const body = res.body;
  if (!body || typeof body !== "object" || Number.isNaN(Number(body.code))) throw new Error("聆川返回无效");
  if (Number(body.code) === 200 && body.url) return validateUrl(body.url, "聆川");
  throw new Error("聆川错误: " + (body.message || "code=" + body.code));
}

// ========== 音源处理器注册表 ==========
const SOURCE_HANDLERS = {
  // 第一梯队: 已验证可用
  suyinKuwo: { name: "溯音酷我", fn: suyinKuwoGetUrl },
  suyinMigu: { name: "溯音咪咕", fn: suyinMiguGetUrl },
  suyin163: { name: "溯音163", fn: suyin163GetUrl },
  // 第二梯队: IP直连/模板
  changqingVip: { name: "长青SVIP", fn: changqingGetUrl },
  // 第三梯队: 可用性不确定
  xinghai: { name: "星海主", fn: xinghaiMainGetUrl },
  xinghaiBackup: { name: "星海备", fn: xinghaiBackupGetUrl },
  lingchuan: { name: "聆川", fn: lingchuanGetUrl },
  huibq: { name: "Huibq", fn: huibqGetUrl }
};

// ========== 音源链构建 ==========
function buildSourceChain(platform, quality) {
  const chain = [];
  // 第一梯队: 溯音系列优先
  if (platform === "kw" || platform === "kg" || platform === "tx") {
    chain.push(SOURCE_HANDLERS.suyinKuwo);
  }
  if (platform === "mg") chain.push(SOURCE_HANDLERS.suyinMigu);
  if (platform === "wy") chain.push(SOURCE_HANDLERS.suyin163);
  // 第二梯队: 长青IP直连
  chain.push(SOURCE_HANDLERS.changqingVip);
  // 第三梯队: 备选
  chain.push(SOURCE_HANDLERS.xinghai);
  chain.push(SOURCE_HANDLERS.xinghaiBackup);
  chain.push(SOURCE_HANDLERS.lingchuan);
  chain.push(SOURCE_HANDLERS.huibq);
  // 去重
  return chain.filter((h, i, arr) => arr.indexOf(h) === i);
}

// ========== 带fallback的URL获取 ==========
async function getUrlWithFallback(platform, songInfo, quality) {
  if (!platform || typeof platform !== "string" || !PLATFORM_QUALITIES[platform]) {
    throw new Error("无效的平台参数: " + platform);
  }
  if (!songInfo || typeof songInfo !== "object") throw new Error("无效的歌曲信息");
  const resolvedQuality = quality || "128k";
  const selectedQuality = selectQuality(resolvedQuality, PLATFORM_QUALITIES[platform]);
  const songId = getHashOrMid(songInfo);
  const chain = buildSourceChain(platform, selectedQuality);
  if (!chain.length) throw new Error("未找到可用音源链");

  const errors = [];
  // 前3个并发尝试
  try {
    const url = await Promise.any(chain.slice(0, 3).map(async handler => {
      const result = await handler.fn(platform, songId, selectedQuality, songInfo);
      return validateUrl(result, handler.name);
    }));
    if (url) return url;
  } catch (e) {
    if (e.errors) e.errors.forEach(err => errors.push(err.message));
  }
  // 剩余顺序尝试
  for (const handler of chain.slice(3)) {
    try {
      const result = await handler.fn(platform, songId, selectedQuality, songInfo);
      return validateUrl(result, handler.name);
    } catch (e) {
      errors.push(handler.name + ": " + e.message);
    }
  }
  throw new Error("所有源均失败: " + errors.join("; "));
}

// ========== 音源配置 ==========
const sourceConfig = {};
Object.keys(PLATFORM_QUALITIES).forEach(platform => {
  sourceConfig[platform] = {
    name: PLATFORM_NAMES[platform],
    type: "music",
    actions: ["musicUrl"],
    qualitys: PLATFORM_QUALITIES[platform]
  };
});

// ========== 事件监听 ==========
on(EVENT_NAMES.request, ({ action, source, info }) => {
  if (action !== "musicUrl") return Promise.reject(new Error("action not support: " + action));
  if (!info?.musicInfo) return Promise.reject(new Error("请求参数不完整"));
  return getUrlWithFallback(source, info.musicInfo, info.type || "128k")
    .then(url => Promise.resolve(url))
    .catch(err => Promise.reject(err));
});

send(EVENT_NAMES.inited, {
  openDevTools: false,
  sources: sourceConfig
});

noop("聚合音源v5.0 初始化完成 | 溯音酷我+溯音咪咕+溯音163+长青IP直连+星海+聆川+Huibq 多层回退");