/*!
 * @name 落雪云更新音源(实测)
 * @description 启动自动拉取服务器最新实测音源配置，桌面端云端换源即时生效，移动端内置兜底+更新提醒
 * @version 2026.09.28
 * @author ql-lx-source
 * @homepage https://github.com/moxi5445/lx-music-cloud
 *
 * 固定导入地址（永久有效）：https://raw.githubusercontent.com/moxi5445/lx-music-cloud/main/lx-cloud.js
 * 运行时配置通道（按序回退）：raw.githubusercontent / cdn.jsdelivr / fastly.jsdelivr / gh-proxy / ghproxy
 *
 * 由 ql-lx-source 1.3.0 于 2026-09-28 13:00:04 自动生成
 * 成员仅收录当轮五平台真实取链成功者（平台:实测最高音质）：
 *   1. 星海音乐源（实测 酷我:flac24bit/酷狗:flac24bit/QQ音乐:flac24bit/网易云:flac24bit/咪咕:flac，48.5分）
 *   2. 星海音乐源（实测 酷我:flac24bit/酷狗:flac24bit/QQ音乐:flac24bit/网易云:flac24bit/咪咕:flac，47分）
 *   3. HYWmusic_beta_公益测试（实测 酷我:flac/酷狗:flac/QQ音乐:flac24bit/网易云:flac24bit，37.1分）
 */
'use strict';
(function () {
  var LX = globalThis.lx;
  if (!LX || !LX.EVENT_NAMES || typeof LX.on !== 'function' || typeof LX.send !== 'function') return;
  var E = LX.EVENT_NAMES;
  var QORDER = ['128k', '320k', 'flac', 'flac24bit'];
  var QRANK = { '128k': 1, '320k': 2, 'flac': 3, 'flac24bit': 4 };
  var P_ALIAS = { git: 'kg', kgdb: 'kg' };
  var Q_ALIAS = { hires: 'flac24bit', master: 'flac24bit', zida: 'flac', atmos: 'flac', dolby: 'flac' };
  var PNAME = { kw: '酷我音乐', kg: '酷狗音乐', tx: 'QQ音乐', wy: '网易云音乐', mg: '咪咕音乐' };
  var URL_RE = new RegExp('^https?://', 'i');
  var MEMBERS = [{"n":"星海音乐源","v":"v3.2.11","a":"万去了了","s":48.5,"caps":{"kw":4,"kg":4,"tx":4,"wy":4,"mg":3}},{"n":"星海音乐源","v":"v3.2.13","a":"万去了了","s":46.95,"caps":{"kw":4,"kg":4,"tx":4,"wy":4,"mg":3}},{"n":"HYWmusic_beta_公益测试","v":"v0.74.0","a":"Ryn","s":37.14,"caps":{"kw":3,"kg":3,"tx":4,"wy":4}}];
  var REAL_GLOBAL = globalThis;
  var states = [];

  // 成员脚本产生的未处理异常不得影响聚合本体（typeof 探测，避免宿主无此 API 时引用报错）
  if (typeof addEventListener === 'function') {
    try {
      addEventListener('unhandledrejection', function (ev) { try { if (ev && ev.preventDefault) ev.preventDefault(); } catch (e) {} });
      addEventListener('error', function (ev) { try { if (ev && ev.preventDefault) ev.preventDefault(); } catch (e) {} }, true);
    } catch (e) {}
  }

  function canonQ(q) {
    if (QRANK[q]) return q;
    var c = Q_ALIAS[String(q).toLowerCase()];
    return c || null;
  }
  function canonP(k) {
    if (k === 'kw' || k === 'kg' || k === 'tx' || k === 'wy' || k === 'mg') return k;
    return P_ALIAS[k] || null;
  }

  var NOOP = function () {};
  var CONSOLE_KEYS = ['log', 'info', 'warn', 'error', 'debug', 'group', 'groupEnd', 'groupCollapsed', 'time', 'timeEnd', 'table', 'trace', 'count', 'assert', 'dir'];

  // 注入给成员的 lx 外观：事件与请求全部走真实宿主，但 on/send 被成员私用拦截
  function makeFacade(st) {
    return {
      EVENT_NAMES: E,
      version: LX.version,
      env: LX.env,
      currentScriptInfo: { name: st.m.n, description: '', version: st.m.v, author: st.m.a, homepage: '', rawScript: '' },
      request: function () { return LX.request.apply(LX, arguments); },
      on: function (ev, cb) { if (ev === E.request && typeof cb === 'function') st.handler = cb; },
      send: function (ev, data) {
        if (ev === E.inited && data) st.sources = data.sources || data;
        return Promise.resolve();
      },
      utils: LX.utils,
    };
  }

  // 成员私有沙箱：原型委托真实全局（setTimeout/Promise 等照常可用），
  // 自有属性注入 lx/globalThis/window/self/global/console，隔离污染与反调试改写
  function makeSandbox(lx) {
    var sb;
    try { sb = Object.create(REAL_GLOBAL); } catch (e) { sb = {}; }
    var quiet = {};
    for (var i = 0; i < CONSOLE_KEYS.length; i++) quiet[CONSOLE_KEYS[i]] = NOOP;
    function def(name, value) {
      try {
        Object.defineProperty(sb, name, { value: value, writable: true, configurable: true, enumerable: true });
      } catch (e) { try { sb[name] = value; } catch (e2) {} }
    }
    def('console', quiet);
    def('lx', lx);
    def('globalThis', sb);
    def('window', sb);
    def('self', sb);
    def('global', sb);
    sb.console = quiet;
    return sb;
  }

    (function () {
    var st = { m: MEMBERS[0], handler: null, sources: null };
    states.push(st);
    var lx = makeFacade(st);
    var sb = makeSandbox(lx);
    try {
      (function (lx, window, self, global, globalThis, console) {
/*!
 * @name 星海音乐源
 * @description GDAPI | 聚合 | ChKSz API | 全平台支持24FLAC，网易、酷狗、QQ最高支持母带
 * @version v3.2.11
 * @Update  小优化：修复GD接口URL拼接错误；适配后端；优化初始化速度
 * @author 万去了了
 * @homepage https://zrcdy.dpdns.org/
 * @lastUpdate 2026-08-06
 * @md5 
 */

const { EVENT_NAMES, request, on, send, env } = globalThis.lx;
const URL_CONFIG = {
    domains: {
        primary: 'yy.zddyr.top',
        fallback: 'zrcdy.dpdns.org',
        gdStudio: 'music-api.gdstudio.xyz',
        vip: 'api.chksz.top'
    },
    paths: {
        backend: '/lx/api/',
        version: '/lx/versionh2.php',
        update: '/lx/vers.php',
        ip: '/ip.php',
        gdApi: '/api.php',
        vipApi: '/api/163_music'
    },
    gdParams: 'use_xbridge3=true&loader_name=forest&need_sec_link=1&sec_link_scene=im&theme=light'
};

const buildUrl = (domainKey, pathKey, extraQuery = '') => {
    const domain = URL_CONFIG.domains[domainKey];
    const path = URL_CONFIG.paths[pathKey];
    if (!domain || !path) throw new Error(`URL配置错误: ${domainKey} / ${pathKey}`);
    let url = `https://${domain}${path}`;
    if (extraQuery) {
        if (extraQuery.startsWith('&') && !path.includes('?')) {
            url += '?' + extraQuery.substring(1);
        } else {
            url += extraQuery;
        }
    }
    return url;
};

const SCRIPT_VERSION = 'v3.2.11';
const SCRIPT_NAME = 'XingHaiMusicSource';
const SOURCE_MAP = { tx: 'qq', mg: 'migu', kw: 'kw', kg: 'kg' };
const PLATFORM_NAMES = { wy: '网易云音乐', tx: 'QQ音乐', kw: '酷我音乐', kg: '酷狗音乐', mg: '咪咕音乐' };
const MUSIC_QUALITIES = {
    wy: ['128k','192k','320k','flac','flac24bit','hires','jyeffect','sky','jymaster'],
    tx: ['128k','192k','320k','flac','hires','atmos','atmos_plus','master'],
    kw: ['128k','192k','320k','flac','flac24bit'],
    kg: ['128k','320k','flac','hires','atmos','master'],
    mg: ['128k','320k','flac']
};
const NETEASE_VIP_LEVEL_MAP = { flac: 'lossless', flac24bit: 'hires', hires: 'hires', jyeffect: 'jyeffect', sky: 'sky', jymaster: 'jymaster' };
const NETEASE_VIP_QUALITY_SET = new Set(Object.keys(NETEASE_VIP_LEVEL_MAP));

let userIp = null;
let userToken = '';
let clientHeader = '';
let deviceId = '';
let availablePlatforms = [];
const extraCache = new Map();

// -------------------- 工具函数 --------------------
function isBuffer(obj) {
    return obj && typeof obj === 'object' &&
        ((typeof Buffer !== 'undefined' && Buffer.isBuffer(obj)) ||
        (typeof obj.constructor === 'function' && obj.constructor.name === 'Buffer'));
}

function safeParseBody(body) {
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (/^[{["]/.test(trimmed)) { try { return JSON.parse(trimmed); } catch (e) {} }
        return body;
    }
    if (typeof body === 'object' && body !== null) {
        try { if (typeof body.toString === 'function' && body.toString() !== '[object Object]') body = body.toString('utf-8'); } catch (e) {}
        if (typeof body === 'object' && !isBuffer(body)) return body;
    }
    try {
        if (isBuffer(body)) {
            if (globalThis.lx?.utils?.buffer?.bufToString) body = globalThis.lx.utils.buffer.bufToString(body, 'utf-8');
            else if (typeof Buffer !== 'undefined') body = Buffer.from(body).toString('utf-8');
            else body = String(body);
        }
    } catch (e) {}
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (/^[{["]/.test(trimmed)) { try { return JSON.parse(trimmed); } catch (e) {} }
    }
    return body;
}

function safeBase64Encode(str) {
    try {
        if (globalThis.lx?.utils?.buffer?.from) {
            const buf = globalThis.lx.utils.buffer.from(str, 'utf-8');
            return globalThis.lx.utils.buffer.bufToString(buf, 'base64');
        }
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(str, 'utf-8').toString('base64');
        }
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        return str;
    }
}

function generateDeviceId() {
    const prefix = 'lx-online-';
    const randomChars = Math.random().toString(36).substring(2, 8);
    const timestampPart = Date.now().toString(36).slice(-4);
    return prefix + randomChars + timestampPart;
}

function buildClientHeader() {
    let deviceType = 'unknown';
    try {
        const p = (env?.platform || '').toLowerCase();
        if (p.includes('android')) deviceType = 'Android';
        else if (p.includes('ios')) deviceType = 'iOS';
        else if (p.includes('win')) deviceType = 'Windows';
        else if (p.includes('mac')) deviceType = 'macOS';
        else if (p.includes('linux')) deviceType = 'Linux';
    } catch (e) {}
    return `${SCRIPT_NAME}/${SCRIPT_VERSION} (${deviceType})`;
}

function generateToken(ip) {
    if (!deviceId) deviceId = generateDeviceId();
    const payload = {
        device_id: deviceId,
        ip: ip || '0.0.0.0',
        timestamp: Math.floor(Date.now() / 1000),
        random: Math.random().toString(36).substring(2, 12)
    };
    return safeBase64Encode(JSON.stringify(payload));
}

const httpFetch = (url, options = {}) => new Promise((resolve, reject) => {
    const headers = { ...(options.headers || {}) };
    if (!options.noAuth) {
        if (userToken) headers['X-Token'] = userToken;
        if (clientHeader) headers['X-Client'] = clientHeader;
    }
    if (!headers['User-Agent']) {
        headers['User-Agent'] = 'lx-music';
    }
    const finalOptions = { ...options, headers };
    request(url, finalOptions, (err, resp) => {
        if (err) return reject(err);
        const body = safeParseBody(resp.body);
        resolve({ body, statusCode: resp.statusCode, headers: resp.headers || {} });
    });
});

// -------------------- 音质映射 --------------------
function mapQuality(target, avail) {
    const pm = { '臻品母带': 'jymaster', '臻品音质2.0': 'sky', '臻品音质AI': 'jyeffect', '臻品音质': 'jyeffect', 'Hires 无损24-Bit': 'hires', 'Hi-Res': 'hires', 'FLAC': 'flac', '320k': '320k', '192k': '192k', '128k': '128k' };
    if (avail.includes(target)) return target;
    const m = pm[target]; if (m && avail.includes(m)) return m;
    const order = ['jymaster', 'sky', 'jyeffect', 'hires', 'flac24bit', 'flac', '320k', '192k', '128k'];
    for (const q of order) if (avail.includes(q)) return q;
    return avail[0] || '128k';
}

// -------------------- 网络接口 --------------------
async function fetchIp() {
    try {
        const r = await httpFetch(buildUrl('primary', 'ip'), { timeout: 3000 });
        if (r.body?.ip) {
            userIp = r.body.ip;
            userToken = generateToken(userIp);
        }
    } catch (e) {}
}

async function getWyGDUrl(id, q) {
    const brMap = { '128k':'128','192k':'192','320k':'320','flac':'740','flac24bit':'999' };
    const url = buildUrl('gdStudio', 'gdApi', `&${URL_CONFIG.gdParams}&types=url&source=netease&id=${id}&br=${brMap[q]||'320'}`);
    const resp = await httpFetch(url, { 
        headers: { 'User-Agent': 'LX-Music-Mobile' }, 
        timeout: 8000,
        noAuth: true
    });
    if (resp.statusCode !== 200 || !resp.body.url) {
        const status = resp.statusCode;
        throw new Error(`GD接口状态${status}，未返回音频`);
    }
    return { url: resp.body.url, lyric: null, cover: null };
}

async function getWyVipUrl(id, q) {
    const level = NETEASE_VIP_LEVEL_MAP[q];
    if (!level) throw new Error('不支持该品质');
    const url = buildUrl('vip', 'vipApi', `?id=${id}&level=${level}`);
    const resp = await httpFetch(url, { 
        headers: { 'User-Agent': 'LX-Music-Mobile' }, 
        timeout: 8000,
        noAuth: true
    });
    if (resp.statusCode !== 200 || resp.body.code !== 200 || !resp.body.data?.url) {
        const status = resp.statusCode;
        throw new Error(`VIP接口状态${status}，未返回音频`);
    }
    return { url: resp.body.data.url, lyric: null, cover: null };
}

async function getUrlFromBackend(source, musicInfo, quality) {
    const backendSource = SOURCE_MAP[source] || source;
    const baseUrl = buildUrl('primary', 'backend');
    const params = {};
    if (backendSource === 'kg') {
        const types = musicInfo._types || {};
        params.source = 'kg';
        params.quality = quality || '';
        params.songmid = musicInfo.songmid || musicInfo.id || '';
        params.albumId = musicInfo.albumId || '';
        params.mainHash = musicInfo.hash || '';
        if (types[quality]?.hash) params.hash = types[quality].hash;
    } else {
        params.source = backendSource;
        params.name = musicInfo.name || '';
        params.singer = musicInfo.singer || '';
        params.songmid = musicInfo.songmid || musicInfo.id || '';
        params.interval = musicInfo.interval || '';
        params.albumName = musicInfo.albumName || musicInfo.album || '';
        params.quality = quality || '';
    }
    const query = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const url = `${baseUrl}?${query}`;
    const resp = await httpFetch(url, { method: 'GET', timeout: 8000 });
    if (resp.statusCode !== 200) throw new Error(`后端接口状态${resp.statusCode}`);
    const data = resp.body;
    if (data.code !== 200 || !data.url) throw new Error(data.msg || '后端无可用链接');
    return { url: data.url, lyric: data.lrc || null, cover: data.picture || null };
}

async function fetchMusicUrl(source, musicInfo, quality) {
    const id = musicInfo.hash ?? musicInfo.songmid ?? musicInfo.id;
    if (!id) throw new Error('缺少 songId');
    const actualQuality = mapQuality(quality, MUSIC_QUALITIES[source] || ['128k','320k','flac']);
    let result = { url: '', lyric: null, cover: null };
    if (source === 'wy') {
        if (NETEASE_VIP_QUALITY_SET.has(actualQuality)) {
            try { result = await getWyVipUrl(id, actualQuality); } catch (e) {}
        }
        if (!result.url) result = await getWyGDUrl(id, actualQuality);
    } else {
        result = await getUrlFromBackend(source, musicInfo, actualQuality);
    }
    extraCache.set(id, { lyric: result.lyric, cover: result.cover });
    return result.url;
}

// -------------------- 初始化逻辑 --------------------
async function checkUpdate() {
    const versionUrls = [
        buildUrl('primary', 'version') + '?ver=' + encodeURIComponent(SCRIPT_VERSION),
        buildUrl('fallback', 'version') + '?ver=' + encodeURIComponent(SCRIPT_VERSION)
    ];
    try {
        const resp = await Promise.any(versionUrls.map(u => httpFetch(u, { timeout: 5000 })));
        if (resp.statusCode === 200 && resp.body && resp.body.update_url) {
            send(EVENT_NAMES.updateAlert, {
                log: resp.body.message || `发现新版本 ${resp.body.version || ''}`,
                updateUrl: resp.body.update_url
            });
        }
    } catch (e) {}
}

// -------------------- 事件处理 --------------------
on(EVENT_NAMES.request, async ({ action, source, info }) => {
    if (!source || !MUSIC_QUALITIES[source]) throw new Error(`不支持的音乐源: ${source}`);
    if (action === 'musicUrl') {
        if (!info?.musicInfo || !info.type) throw new Error('参数不完整');
        return fetchMusicUrl(source, info.musicInfo, info.type);
    }
    const id = info?.musicInfo?.hash ?? info?.musicInfo?.songmid ?? info?.musicInfo?.id;
    const cached = extraCache.get(id);
    if (action === 'lyric') return cached?.lyric ? { lyric: cached.lyric, tlyric: '' } : null;
    if (action === 'pic') return cached?.cover || null;
    throw new Error(`不支持的操作: ${action}`);
});

// -------------------- 启动 --------------------
(async () => {
    deviceId = generateDeviceId();
    clientHeader = buildClientHeader();
    userToken = generateToken(null);
    
    availablePlatforms = ['wy', 'tx', 'kg', 'kw', 'mg'];
    const sources = {};
    availablePlatforms.forEach(p => { sources[p] = { name: PLATFORM_NAMES[p], type: 'music', actions: ['musicUrl', 'lyric', 'pic'], qualitys: MUSIC_QUALITIES[p] }; });
    send(EVENT_NAMES.inited, { status: true, sources });

    fetchIp();
    checkUpdate();
})();
      }).call(sb, lx, sb, sb, sb, sb, sb.console);
    } catch (e) { st.handler = null; }
  })();
  (function () {
    var st = { m: MEMBERS[1], handler: null, sources: null };
    states.push(st);
    var lx = makeFacade(st);
    var sb = makeSandbox(lx);
    try {
      (function (lx, window, self, global, globalThis, console) {
/*!
 * @name 星海音乐源
 * @description GDAPI | 聚合 | ChKSz API | 全平台支持24FLAC，网易、酷狗、QQ最高支持母带
 * @version v3.2.13
 * @Update  优化wy，可以不使用ChKSz API获取母带；出现调试/开发者也可以通过更新关闭；注意ChKSz API，代理解密地址自行填写
 * @author 万去了了
 * @homepage https://zrcdy.dpdns.org/
 * @lastUpdate 2026-08-18
 * @md5 
 */

const { EVENT_NAMES, request, on, send, env } = globalThis.lx;

// ==================== 用户配置区域 ====================
// https://github.com/cdyUuu/kuwo-music-relay
// 酷我代理解密配置（用于解密酷我加密无损格式，如 mflac/mgg）
// 填入你自行部署的代理解密地址，留空则不启用代理解密
const KW_DECRYPT_PROXY = {
    url: '',                 // 在此填入代理解密地址（如 https://your-domain.com/decrypt.php），留空则不启用
    allowEncryptedLossless: false, // 设为 true 启用代理解密
    urlParamName: 'url',
    ekeyParamName: 'ekey',
};

// ChKSz API 配置（网易SVIP接口 + QQ音乐接口，需要 apikey）
// 启用且 apikey 不为空时，对应平台优先使用 chksz 接口
const CHKSZ_CONFIG = {
    apikey: '',              // 在此填入 chksz 的 apikey，留空则不启用 chksz 接口
    enableNetease: true,     // 启用 chksz 网易云 SVIP 接口（支持到母带）
    enableQQ: true,          // 启用 chksz QQ 音乐接口（支持到 master）
};
// ====================================================

const URL_CONFIG = {
    domains: {
        primary: 'yy.zddyr.top',
        fallback: 'zrcdy.dpdns.org',
        gdStudio: 'music-api.gdstudio.xyz',
        chkszNew: 'api.chksz.com'
    },
    paths: {
        backend: '/lx/api/',
        version: '/lx/versionh2.php',
        update: '/lx/vers.php',
        ip: '/ip.php',
        gdApi: '/api.php',
        chkszNetease: '/api/163_music',
        chkszQQ: '/api/qq_music'
    },
    gdParams: 'use_xbridge3=true&loader_name=forest&need_sec_link=1&sec_link_scene=im&theme=light'
};

const buildUrl = (domainKey, pathKey, extraQuery = '') => {
    const domain = URL_CONFIG.domains[domainKey];
    const path = URL_CONFIG.paths[pathKey];
    if (!domain || !path) throw new Error(`URL配置错误: ${domainKey} / ${pathKey}`);
    let url = `https://${domain}${path}`;
    if (extraQuery) {
        if (extraQuery.startsWith('&') && !path.includes('?')) {
            url += '?' + extraQuery.substring(1);
        } else {
            url += extraQuery;
        }
    }
    return url;
};

const SCRIPT_VERSION = 'v3.2.13';
const SCRIPT_NAME = 'XingHaiMusicSource';
const SOURCE_MAP = { tx: 'qq', mg: 'migu', kw: 'kw', kg: 'kg' };
const PLATFORM_NAMES = { wy: '网易云音乐', tx: 'QQ音乐', kw: '酷我音乐', kg: '酷狗音乐', mg: '咪咕音乐' };
const MUSIC_QUALITIES = {
    wy: ['128k','320k','flac','hires','atmos','master'],
    tx: ['128k','192k','320k','flac','hires','atmos','atmos_plus','master'],
    kw: ['128k','320k','flac','hires','atmos','master'],
    kg: ['128k','320k','flac','hires','atmos','master'],
    mg: ['128k','320k','flac']
};

// ChKSz 网易云 level 映射（需将插件音质转换为 chksz 的 level 值）
const CHKSZ_NETEASE_LEVEL_MAP = {
    '128k': 'standard',
    '320k': 'exhigh',
    'flac': 'lossless',
    'hires': 'hires',
    'atmos': 'jymaster',
    'master': 'jymaster'
};

// ChKSz QQ 音质 size 映射
const CHKSZ_QQ_SIZE_MAP = {
    '128k': '128k', '192k': '320k', '320k': '320k',
    'flac': 'flac', 'hires': 'hires',
    'atmos': 'master', 'atmos_plus': 'master', 'master': 'master'
};

// GD API 音质映射（hires 用 999，失败降级 740）
// GD 不支持 atmos/master，这些音质不会走 GD
const GD_BR_MAP = { '128k':'128', '320k':'320', 'flac':'740', 'hires':'999' };

// GD 支持的音质集合（atmos/master 不在 GD 支持范围）
const GD_SUPPORTED_QUALITIES = new Set(['128k','320k','flac','hires']);

const TOKEN_TTL = 5 * 60 * 1000;

let userIp = null;
let userToken = '';
let tokenTimestamp = 0;
let clientHeader = '';
let deviceId = '';
let availablePlatforms = [];
let backendAggBlocked = false; // 后端聚合接口 403 屏蔽标志（403后不再请求，除非脚本重启）
const extraCache = new Map();

// -------------------- 工具函数 --------------------
function isBuffer(obj) {
    return obj && typeof obj === 'object' &&
        ((typeof Buffer !== 'undefined' && Buffer.isBuffer(obj)) ||
        (typeof obj.constructor === 'function' && obj.constructor.name === 'Buffer'));
}

function safeParseBody(body) {
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (/^[{["]/.test(trimmed)) { try { return JSON.parse(trimmed); } catch (e) {} }
        return body;
    }
    if (typeof body === 'object' && body !== null) {
        try { if (typeof body.toString === 'function' && body.toString() !== '[object Object]') body = body.toString('utf-8'); } catch (e) {}
        if (typeof body === 'object' && !isBuffer(body)) return body;
    }
    try {
        if (isBuffer(body)) {
            if (globalThis.lx?.utils?.buffer?.bufToString) body = globalThis.lx.utils.buffer.bufToString(body, 'utf-8');
            else if (typeof Buffer !== 'undefined') body = Buffer.from(body).toString('utf-8');
            else body = String(body);
        }
    } catch (e) {}
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (/^[{["]/.test(trimmed)) { try { return JSON.parse(trimmed); } catch (e) {} }
    }
    return body;
}

function safeBase64Encode(str) {
    try {
        if (globalThis.lx?.utils?.buffer?.from) {
            const buf = globalThis.lx.utils.buffer.from(str, 'utf-8');
            return globalThis.lx.utils.buffer.bufToString(buf, 'base64');
        }
        if (typeof Buffer !== 'undefined') return Buffer.from(str, 'utf-8').toString('base64');
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        return str;
    }
}

function simpleGetQueryParam(url, key) {
    if (typeof url !== 'string' || !url) return null;
    const qIdx = url.indexOf('?');
    if (qIdx < 0) return null;
    let query = url.substring(qIdx + 1);
    const hashIdx = query.indexOf('#');
    if (hashIdx >= 0) query = query.substring(0, hashIdx);
    const pairs = query.split('&');
    for (const p of pairs) {
        const eq = p.indexOf('=');
        if (eq < 0) continue;
        if (p.substring(0, eq) === key) {
            try { return decodeURIComponent(p.substring(eq + 1)); } catch (e) { return p.substring(eq + 1); }
        }
    }
    return null;
}

function generateDeviceId() {
    return 'lx-online-' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
}

function buildClientHeader() {
    let deviceType = 'unknown';
    try {
        const p = (env?.platform || '').toLowerCase();
        if (p.includes('android')) deviceType = 'Android';
        else if (p.includes('ios')) deviceType = 'iOS';
        else if (p.includes('win')) deviceType = 'Windows';
        else if (p.includes('mac')) deviceType = 'macOS';
        else if (p.includes('linux')) deviceType = 'Linux';
    } catch (e) {}
    return `${SCRIPT_NAME}/${SCRIPT_VERSION} (${deviceType})`;
}

function generateToken(ip) {
    if (!deviceId) deviceId = generateDeviceId();
    const payload = {
        device_id: deviceId,
        ip: ip || '0.0.0.0',
        timestamp: Math.floor(Date.now() / 1000),
        random: Math.random().toString(36).substring(2, 12)
    };
    tokenTimestamp = Date.now();
    return safeBase64Encode(JSON.stringify(payload));
}

function ensureTokenFresh() {
    if (!userToken || (Date.now() - tokenTimestamp) > TOKEN_TTL) {
        userToken = generateToken(userIp);
    }
}

const httpFetch = (url, options = {}) => new Promise((resolve, reject) => {
    if (!options.noAuth) ensureTokenFresh();
    const headers = { ...(options.headers || {}) };
    if (!options.noAuth) {
        if (userToken) headers['X-Token'] = userToken;
        if (clientHeader) headers['X-Client'] = clientHeader;
    }
    if (!headers['User-Agent']) headers['User-Agent'] = 'lx-music';
    request(url, { ...options, headers }, (err, resp) => {
        if (err) return reject(err);
        resolve({ body: safeParseBody(resp.body), statusCode: resp.statusCode, headers: resp.headers || {} });
    });
});

function mapQuality(target, avail) {
    const pm = { '臻品母带': 'jymaster', '臻品音质2.0': 'sky', '臻品音质AI': 'jyeffect', '臻品音质': 'jyeffect', 'Hires 无损24-Bit': 'hires', 'Hi-Res': 'hires', 'FLAC': 'flac', '320k': '320k', '192k': '192k', '128k': '128k' };
    if (avail.includes(target)) return target;
    const m = pm[target]; if (m && avail.includes(m)) return m;
    const order = ['jymaster', 'sky', 'jyeffect', 'hires', 'flac24bit', 'master', 'flac', '320k', '192k', '128k'];
    for (const q of order) if (avail.includes(q)) return q;
    return avail[0] || '128k';
}

// -------------------- 酷我加密链接处理 --------------------
function processKwEncryptedUrl(data, source) {
    if (source !== 'kw' || !KW_DECRYPT_PROXY.allowEncryptedLossless) {
        return data?.url || '';
    }
    let ekey = null;
    if (data?.ekey) {
        ekey = typeof data.ekey === 'string' ? data.ekey.trim() : String(data.ekey).trim();
    }
    if (!ekey && data?.url && typeof data.url === 'string') {
        ekey = simpleGetQueryParam(data.url, 'ekey');
    }
    if (!ekey || !KW_DECRYPT_PROXY.url) {
        return data?.url || '';
    }
    const rawUrl = typeof data.url === 'string' ? data.url : String(data.url);
    try {
        return `${KW_DECRYPT_PROXY.url}?${KW_DECRYPT_PROXY.urlParamName}=${encodeURIComponent(rawUrl)}&${KW_DECRYPT_PROXY.ekeyParamName}=${encodeURIComponent(ekey)}`;
    } catch (e) {
        return rawUrl;
    }
}

// -------------------- 网络接口 --------------------
async function fetchIp() {
    try {
        const r = await httpFetch(buildUrl('primary', 'ip'), { timeout: 3000 });
        if (r.body?.ip) {
            userIp = r.body.ip;
            userToken = generateToken(userIp);
        }
    } catch (e) {}
}

// ChKSz 网易云 SVIP 接口（需 apikey）
async function getWyChkszUrl(id, quality) {
    const level = CHKSZ_NETEASE_LEVEL_MAP[quality];
    if (!level) throw new Error('chksz不支持该品质');
    const url = `https://${URL_CONFIG.domains.chkszNew}${URL_CONFIG.paths.chkszNetease}?id=${id}&level=${level}&apikey=${encodeURIComponent(CHKSZ_CONFIG.apikey)}`;
    const resp = await httpFetch(url, { headers: { 'User-Agent': 'LX-Music-Mobile' }, timeout: 8000, noAuth: true });
    if (resp.statusCode !== 200 || resp.body.code !== 200 || !resp.body.data?.url) {
        throw new Error(`chksz网易失败(${resp.statusCode}): ${resp.body?.msg || '未返回url'}`);
    }
    return { url: resp.body.data.url, lyric: null, cover: resp.body.data.picUrl || null };
}

// ChKSz QQ 音乐接口（需 apikey）
async function getTxChkszUrl(musicInfo, quality) {
    const size = CHKSZ_QQ_SIZE_MAP[quality];
    if (!size) throw new Error('chksz不支持该品质');
    const mid = musicInfo.songmid || musicInfo.id;
    if (!mid) throw new Error('缺少QQ mid');
    const url = `https://${URL_CONFIG.domains.chkszNew}${URL_CONFIG.paths.chkszQQ}?mid=${mid}&size=${size}&type=json&apikey=${encodeURIComponent(CHKSZ_CONFIG.apikey)}`;
    const resp = await httpFetch(url, { headers: { 'User-Agent': 'LX-Music-Mobile' }, timeout: 8000, noAuth: true });
    if (resp.statusCode !== 200 || resp.body.code !== 200 || !resp.body.url) {
        throw new Error(`chksz QQ失败(${resp.statusCode}): ${resp.body?.msg || '未返回url'}`);
    }
    return { url: resp.body.url, lyric: resp.body.lrc || null, cover: resp.body.cover || null };
}

// 网易 GD 接口（hires 用 br=999，失败降级 740）
async function getWyGDUrl(id, q) {
    const br = GD_BR_MAP[q] || '320';
    const url = buildUrl('gdStudio', 'gdApi', `&${URL_CONFIG.gdParams}&types=url&source=netease&id=${id}&br=${br}`);
    let resp = await httpFetch(url, { headers: { 'User-Agent': 'LX-Music-Mobile' }, timeout: 8000, noAuth: true });
    // hires 请求失败或无url，降级到标准无损 flac
    if (q === 'hires' && (resp.statusCode !== 200 || !resp.body.url)) {
        const fallbackUrl = buildUrl('gdStudio', 'gdApi', `&${URL_CONFIG.gdParams}&types=url&source=netease&id=${id}&br=740`);
        resp = await httpFetch(fallbackUrl, { headers: { 'User-Agent': 'LX-Music-Mobile' }, timeout: 8000, noAuth: true });
    }
    if (resp.statusCode !== 200 || !resp.body.url) {
        throw new Error(`GD接口状态${resp.statusCode}，未返回音频`);
    }
    return { url: resp.body.url, lyric: null, cover: null };
}

// 自建后端接口（通用）
async function getUrlFromBackend(source, musicInfo, quality) {
    const backendSource = SOURCE_MAP[source] || source;
    const baseUrl = buildUrl('primary', 'backend');
    const params = {};
    if (backendSource === 'kg') {
        const types = musicInfo._types || {};
        params.source = 'kg';
        params.quality = quality || '';
        params.songmid = musicInfo.songmid || musicInfo.id || '';
        params.albumId = musicInfo.albumId || '';
        params.mainHash = musicInfo.hash || '';
        if (types[quality]?.hash) params.hash = types[quality].hash;
    } else {
        params.source = backendSource;
        params.name = musicInfo.name || '';
        params.singer = musicInfo.singer || '';
        params.songmid = musicInfo.songmid || musicInfo.id || '';
        params.interval = musicInfo.interval || '';
        params.albumName = musicInfo.albumName || musicInfo.album || '';
        params.quality = quality || '';
    }
    const query = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
    const url = `${baseUrl}?${query}`;
    const resp = await httpFetch(url, { method: 'GET', timeout: 8000 });

    // 403 检测：标记屏蔽，后续不再请求此接口（除非脚本重启）
    if (resp.statusCode === 403) {
        backendAggBlocked = true;
        throw new Error('后端聚合接口返回403，已屏蔽');
    }

    if (resp.statusCode !== 200) throw new Error(`后端接口状态${resp.statusCode}`);
    const data = resp.body;
    if (data.code !== 200 || !data.url) throw new Error(data.msg || '后端无可用链接');
    const finalUrl = processKwEncryptedUrl(data, backendSource);
    return { url: finalUrl, lyric: data.lrc || null, cover: data.picture || null };
}

// -------------------- 核心：获取音乐URL --------------------
async function fetchMusicUrl(source, musicInfo, quality) {
    const id = musicInfo.hash ?? musicInfo.songmid ?? musicInfo.id;
    if (!id) throw new Error('缺少 songId');
    let actualQuality = mapQuality(quality, MUSIC_QUALITIES[source] || ['128k','320k','flac']);

    if (source === 'kw' && !KW_DECRYPT_PROXY.allowEncryptedLossless) {
        actualQuality = mapQuality(quality, ['128k','320k','flac']);
    }

    let result = { url: '', lyric: null, cover: null };
    let lastError = '';
    const chkszEnabled = !!(CHKSZ_CONFIG.apikey && CHKSZ_CONFIG.apikey.trim());
    
    // --- 网易云音乐 ---
    // 链路: chksz(有key优先) → 后端聚合(403屏蔽) → GD API
    if (source === 'wy') {
        // 1. 优先 chksz SVIP 接口（需启用且有 apikey）
        if (chkszEnabled && CHKSZ_CONFIG.enableNetease) {
            try {
                result = await getWyChkszUrl(id, actualQuality);
            } catch (e) {
                lastError = `chksz网易失败: ${e.message}`;
            }
        }

        // 2. chksz 失败/未启用 → 后端聚合接口（403屏蔽后跳过）
        //    后端聚合支持音质与主音质一致: 128k, 320k, flac, hires, atmos, master
        //    无需转换，直接透传
        if (!result.url && !backendAggBlocked) {
            try {
                result = await getUrlFromBackend('wy', musicInfo, actualQuality);
            } catch (e) {
                lastError = `后端聚合失败: ${e.message}`;
            }
        }

        // 3. 后端聚合失败/屏蔽 → GD 接口
        if (!result.url && GD_SUPPORTED_QUALITIES.has(actualQuality)) {
            try {
                result = await getWyGDUrl(id, actualQuality);
            } catch (e) {
                lastError = `GD接口失败: ${e.message}`;
            }
        }
    } 
    // --- QQ 音乐 ---
    else if (source === 'tx') {
        // 1. 优先 chksz QQ 接口
        if (chkszEnabled && CHKSZ_CONFIG.enableQQ) {
            try {
                result = await getTxChkszUrl(musicInfo, actualQuality);
            } catch (e) { lastError = `chksz QQ失败: ${e.message}`; }
        }
        
        // 2. 回退：自建后端
        if (!result.url) {
            try {
                result = await getUrlFromBackend(source, musicInfo, actualQuality);
            } catch (e) { lastError = `后端失败: ${e.message}`; }
        }
    }
    // --- 其他平台：自建后端 ---
    else {
        try {
            result = await getUrlFromBackend(source, musicInfo, actualQuality);
        } catch (e) { lastError = `后端失败: ${e.message}`; }
    }
    
    extraCache.set(id, { lyric: result.lyric, cover: result.cover });

    // 返回守卫：允许 http（含本地IP，如 127.0.0.1）与 https 链接
    const trimmedUrl = typeof result.url === 'string' ? result.url.trim() : '';
    if (typeof result.url !== 'string' || trimmedUrl.length < 1 || !trimmedUrl.match(/^https?:\/\//i)) {
        throw new Error(lastError || '获取播放链接失败');
    }

    return trimmedUrl;
}

// -------------------- 更新检查 --------------------
async function checkUpdate() {
    const versionUrls = [
        buildUrl('primary', 'version') + '?ver=' + encodeURIComponent(SCRIPT_VERSION),
        buildUrl('fallback', 'version') + '?ver=' + encodeURIComponent(SCRIPT_VERSION)
    ];
    try {
        const resp = await Promise.any(versionUrls.map(u => httpFetch(u, { timeout: 5000 })));
        if (resp.statusCode === 200 && resp.body && resp.body.update_url) {
            send(EVENT_NAMES.updateAlert, {
                log: resp.body.changelog || resp.body.message || `发现新版本 ${resp.body.version || ''}`,
                updateUrl: resp.body.update_url
            });
        }
    } catch (e) {}
}

// -------------------- 事件处理 --------------------
on(EVENT_NAMES.request, async ({ action, source, info }) => {
    if (!source || !MUSIC_QUALITIES[source]) throw new Error(`不支持的音乐源: ${source}`);
    
    if (action === 'musicUrl') {
        if (!info?.musicInfo || !info.type) throw new Error('参数不完整');
        return fetchMusicUrl(source, info.musicInfo, info.type);
    }
    
    const id = info?.musicInfo?.hash ?? info?.musicInfo?.songmid ?? info?.musicInfo?.id;
    const cached = extraCache.get(id);
    if (action === 'lyric') return cached?.lyric ? { lyric: cached.lyric, tlyric: '' } : null;
    if (action === 'pic') return cached?.cover || null;
    throw new Error(`不支持的操作: ${action}`);
});

// -------------------- 启动 --------------------
(async () => {
    deviceId = generateDeviceId();
    clientHeader = buildClientHeader();
    userToken = generateToken(null);
    availablePlatforms = ['wy', 'tx', 'kg', 'kw', 'mg'];
    const sources = {};
    availablePlatforms.forEach(p => { sources[p] = { name: PLATFORM_NAMES[p], type: 'music', actions: ['musicUrl', 'lyric', 'pic'], qualitys: MUSIC_QUALITIES[p] }; });
    send(EVENT_NAMES.inited, { openDevTools: false, status: true, sources });
    fetchIp();
    checkUpdate();
})();

      }).call(sb, lx, sb, sb, sb, sb, sb.console);
    } catch (e) { st.handler = null; }
  })();
  (function () {
    var st = { m: MEMBERS[2], handler: null, sources: null };
    states.push(st);
    var lx = makeFacade(st);
    var sb = makeSandbox(lx);
    try {
      (function (lx, window, self, global, globalThis, console) {
/**
 * @name HYWmusic_beta_公益测试
 * @version v0.74.0
 * @author Ryn
 * @description 你知道吗我的trae积分用完了……我想要赞助喵……
一群（满了）1094095648
二群（可入）965503129
 * @homepage https://github.com/Macrohard0001/HYWmusic_source
 * @license MIT
 * @updateUrl http://103.79.184.97/api/releases?script=HYWmusic_beta_%E5%85%AC%E7%9B%8A%E6%B5%8B%E8%AF%95&scriptType=free&releaseType=lx&version=v0.74.0
 *
 * 支持平台: kw、kg、tx、wy、mg
 * 支持音质: 128k、320k、flac、flac24bit、master、atmos_plus、atmos、hires
 * 生成时间: 2026-08-06T07:52:23.078Z
 *
 * 协议参考：ikun-music-source.js + lxmusic.toside.cn/desktop/custom-source
 *   - MUSIC_QUALITY 每平台独立音质（按后端勾选写入）
 *   - on handler 纯 Promise 风格：({action, source, info}) => Promise
 *   - inited 发送 status:true + sources
 *   - API_BASE 必须注入，禁止回退 localhost
 */

'use strict'

const DEV_ENABLE = false
const UPDATE_ENABLE = true

const { EVENT_NAMES, request, on, send, env, version: LX_VERSION } = globalThis.lx

// ====== 每平台独立音质（参考 ikun） ======
const MUSIC_QUALITY = JSON.parse('{"kw":["128k","320k","flac","flac24bit","master","atmos_plus","atmos","hires"],"kg":["128k","320k","flac","flac24bit","master","atmos_plus","atmos","hires"],"tx":["128k","320k","flac","flac24bit","master","atmos_plus","atmos","hires"],"wy":["128k","320k","flac","flac24bit","master","atmos_plus","atmos","hires"],"mg":["128k"]}')
const MUSIC_SOURCE = Object.keys(MUSIC_QUALITY)

// ====== 运行参数 ======
const API_BASE = 'http://103.79.184.97'
const CARD_KEY = 'PYPW-QFRL-3DBF-95O6'

// ====== 日志 ======
const log = {
  info: (...args) => { try { console.log('[HYWmusic]', ...args) } catch(e) {} },
  error: (...args) => { try { console.error('[HYWmusic ERROR]', ...args) } catch(e) {} },
  warn: (...args) => { try { console.warn('[HYWmusic WARN]', ...args) } catch(e) {} },
}

// ====== API_BASE 检查：禁止回退 localhost ======
if (!API_BASE || !/^https?:\/\//.test(API_BASE)) {
  log.error('API_BASE 未配置或格式非法: "' + API_BASE + '"，所有请求都将失败')
  log.error('请联系发行版管理员在创建发行版时设置 metadata.apiUrl')
}

// ====== HTTP 请求（严格对齐 ikun：仅 callback 风格 request） ======
const httpFetch = (url, options = { method: 'GET' }) => {
  return new Promise((resolve, reject) => {
    if (!API_BASE || !/^https?:\/\//.test(API_BASE)) {
      return reject(new Error('API_BASE 未配置或格式非法'))
    }
    const headers = {
      ...(options.headers || {}),
      'User-Agent': env ? `lx-music-${env}/${LX_VERSION}` : `lx-music-request/${LX_VERSION || '1.0.0'}`,
    }
    if (CARD_KEY) headers['X-Card-Key'] = CARD_KEY
    const reqOptions = { ...options, headers }
    if (!reqOptions.method) reqOptions.method = 'GET'
    // 兼容 LX 沙箱 request 的两种 callback 签名：
    //   2 参数: (err, resp)       — resp.body 包含响应体
    //   3 参数: (err, resp, body) — body 是独立解析的响应体（needle 风格）
    // 部分版本 resp.body 为 undefined，body 在第三个参数；两者都取以兜底
    request(url, reqOptions, (err, resp, body) => {
      if (err) return reject(err)
      const respBody = (resp && resp.body !== undefined && resp.body !== null)
        ? resp.body
        : body
      resolve({
        statusCode: resp ? resp.statusCode : undefined,
        headers: resp ? resp.headers : undefined,
        body: respBody,
      })
    })
  })
}

// ====== 超时保护（保留但默认不使用，脚本内部调用） ======
// const withTimeout = (promise, ms) => Promise.race([
//   promise,
//   new Promise((_, reject) => setTimeout(() => reject(new Error('请求超时(' + ms + 'ms)')), ms))
// ])

// ====== musicInfo 字段收集：透传完整字段 ======
const collectMusicInfoParams = (musicInfo, platform) => {
  if (!musicInfo) return {}
  const params = {}
  const songId = musicInfo.songmid || musicInfo.songId || musicInfo.id || musicInfo.hash
    || musicInfo.rid || musicInfo.musicId || musicInfo.copyrightId || musicInfo.songid || ''
  if (songId) params.songId = songId
  if (musicInfo.songmid) params.songmid = musicInfo.songmid
  if (musicInfo.hash) params.hash = musicInfo.hash

  const fields = ['albumAudioId', 'strMediaMid', 'mediaMid', 'copyrightId', 'rid', 'musicId',
    'albumId', 'albumName', 'albumMid', 'songname', 'songName', 'name', 'singer', 'singers', 'artist']
  for (const f of fields) {
    if (musicInfo[f] !== undefined && musicInfo[f] !== null && musicInfo[f] !== '') params[f] = musicInfo[f]
    if (musicInfo.meta && musicInfo.meta[f] !== undefined && musicInfo.meta[f] !== null && musicInfo.meta[f] !== '') params[f] = musicInfo.meta[f]
  }
  params.platform = platform
  params.source = platform  // 兼容 /api/music/info（仅读 source，不读 platform）
  return params
}

// ====== 获取音乐 URL（GET + query 参数，服务端仅支持 GET） ======
const handleGetMusicUrl = async (source, musicInfo, quality) => {
  const params = collectMusicInfoParams(musicInfo, source)
  if (quality) params.quality = quality
  if (CARD_KEY) params.key = CARD_KEY

  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => k + '=' + encodeURIComponent(String(v)))
    .join('&')
  const url = API_BASE + '/api/music/url' + (query ? '?' + query : '')

  const resp = await httpFetch(url, { method: 'GET' })
  let respBody = resp && resp.body
  if (typeof respBody === 'string') {
    try { respBody = JSON.parse(respBody) } catch (e) {
      throw new Error('服务端返回非 JSON 数据')
    }
  }
  if (!respBody || typeof respBody !== 'object') {
    throw new Error('空响应')
  }
  switch (respBody.code) {
    case 200:
      return respBody.url || respBody.data || respBody
    case 401:
    case 403:
      throw new Error(respBody.message || '鉴权失败')
    case 429:
      throw new Error('请求过速')
    case 500:
      throw new Error(respBody.message || '服务器错误')
    default:
      throw new Error(respBody.message || ('未知错误 code=' + respBody.code))
  }
}

// ====== 获取歌词 ======
const handleGetLyric = async (source, musicInfo) => {
  const params = collectMusicInfoParams(musicInfo, source)
  params.action = 'lyric'
  try {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => k + '=' + encodeURIComponent(String(v)))
      .join('&')
    const url = API_BASE + '/api/music/info' + (query ? '?' + query : '')
    const resp = await httpFetch(url, { method: 'GET' })
    let respBody = resp && resp.body
    if (typeof respBody === 'string') {
      try { respBody = JSON.parse(respBody) } catch (e) { respBody = null }
    }
    if (!respBody || respBody.code !== 200) return { lyric: '', tlyric: null, rlyric: null, lxlyric: null }
    const data = respBody.data || respBody
    return {
      lyric: data.lyric || '',
      tlyric: data.tlyric || null,
      rlyric: data.rlyric || null,
      lxlyric: data.lxlyric || null,
    }
  } catch (e) {
    return { lyric: '', tlyric: null, rlyric: null, lxlyric: null }
  }
}

// ====== 获取封面 ======
const handleGetPic = async (source, musicInfo) => {
  const params = collectMusicInfoParams(musicInfo, source)
  params.action = 'pic'
  try {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => k + '=' + encodeURIComponent(String(v)))
      .join('&')
    const url = API_BASE + '/api/music/info' + (query ? '?' + query : '')
    const resp = await httpFetch(url, { method: 'GET' })
    let respBody = resp && resp.body
    if (typeof respBody === 'string') {
      try { respBody = JSON.parse(respBody) } catch (e) { return '' }
    }
    if (!respBody || respBody.code !== 200) return ''
    const data = respBody.data || respBody
    return data.pic || data.url || ''
  } catch (e) { return '' }
}

// ====== on request（严格对齐 ikun：纯 Promise 风格，无 withTimeout） ======
on(EVENT_NAMES.request, ({ action, source, info }) => {
  switch (action) {
    case 'musicUrl':
      return handleGetMusicUrl(source, info.musicInfo, info.type)
    case 'lyric':
      return handleGetLyric(source, info.musicInfo)
    case 'pic':
      return handleGetPic(source, info.musicInfo)
    default:
      return Promise.reject('action not support: ' + action)
  }
})

// ====== 构建 sources（每平台独立 qualitys，参考 ikun） ======
const musicSources = {}
MUSIC_SOURCE.forEach((item) => {
  musicSources[item] = {
    name: item,
    type: 'music',
    actions: ['musicUrl', 'lyric', 'pic'],
    qualitys: MUSIC_QUALITY[item],
  }
})

// ====== 发送 inited（参考 ikun：status: true + openDevTools） ======
send(EVENT_NAMES.inited, {
  status: true,
  openDevTools: DEV_ENABLE,
  sources: musicSources,
})

      }).call(sb, lx, sb, sb, sb, sb, sb.console);
    } catch (e) { st.handler = null; }
  })();

  // 在成员自报 sources 中解析 标准平台+标准音质 -> 成员原始 key/音质名；找不到则按标准名直传兜底
  function resolveRaw(st, p, stdQ) {
    var ss = st.sources;
    var fallback = null;
    if (ss) {
      for (var k in ss) {
        if (canonP(k) !== p || !ss[k] || !ss[k].qualitys) continue;
        var qs = ss[k].qualitys;
        for (var i = 0; i < qs.length; i++) {
          var raw = qs[i];
          if (raw === stdQ) return { key: k, raw: raw };
          var cq = canonQ(raw);
          if (cq === stdQ) return { key: k, raw: raw };
          if (cq && QRANK[cq] <= QRANK[stdQ] && (!fallback || QRANK[canonQ(fallback.raw) || '128k'] < QRANK[cq])) {
            fallback = { key: k, raw: raw };
          }
        }
      }
    }
    return fallback || { key: p, raw: stdQ };
  }

  // 对外只声明实测通过且成功注册的平台；音质从 128k 连续到该平台实测最高档，不虚标
  function buildSources() {
    var maxRank = {};
    for (var i = 0; i < states.length; i++) {
      var st = states[i];
      if (!st.handler) continue;
      for (var p in st.m.caps) {
        if (maxRank[p] == null || st.m.caps[p] > maxRank[p]) maxRank[p] = st.m.caps[p];
      }
    }
    var out = {};
    for (var plat in maxRank) {
      var qs = [];
      for (var r = 1; r <= maxRank[plat]; r++) qs.push(QORDER[r - 1]);
      out[plat] = { name: PNAME[plat] || plat, type: 'music', actions: ['musicUrl'], qualitys: qs };
    }
    return out;
  }
  var sources = buildSources();

  function invoke(st, p, stdQ, musicInfo) {
    var hit = resolveRaw(st, p, stdQ);
    var ret;
    try {
      ret = st.handler({ source: hit.key, action: 'musicUrl', info: { type: hit.raw, musicInfo: musicInfo } });
    } catch (e) { return Promise.reject(e); }
    return Promise.resolve(ret).then(function (v) {
      if (v && typeof v === 'object') v = v.url || v.playUrl || v.data;
      if (typeof v === 'string' && URL_RE.test(v)) return v;
      return Promise.reject(new Error('bad url'));
    });
  }

  // 单源内音质逐级降级：高档音质可能因 Key 权限/版权临时失效而低档仍可用，
  // 从期望档（不超过该源实测档）向下重试，确保能拿到可播放地址
  function invokeCascade(st, p, startRank, musicInfo) {
    var rank = startRank;
    function step() {
      if (rank < 1) return Promise.reject(new Error('quality exhausted'));
      return invoke(st, p, QORDER[rank - 1], musicInfo).catch(function (e) {
        rank--;
        return step();
      });
    }
    return step();
  }

  // 竞速：最强源立即发起，1.5s 未决依次放行；任一成功即采用，全部落定失败才判负
  LX.on(E.request, function (req) {
    return new Promise(function (resolve, reject) {
      if (!req || !req.info || req.action !== 'musicUrl') return reject(new Error('unsupported action'));
      var p = req.source;
      var pool = states.filter(function (st) { return !!st.handler && !!st.m.caps[p]; })
        .sort(function (a, b) { return (b.m.s || 0) - (a.m.s || 0); });
      if (!pool.length) return reject(new Error('source unavailable'));
      var wantRank = QRANK[req.info.type] || 4;
      var done = false, launched = 0, failures = 0;
      var timers = [];
      function clearTimers() { for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); timers = []; }
      function failAll() { if (done) return; done = true; clearTimers(); reject(new Error('all sources failed')); }
      function launch() {
        if (done || launched >= pool.length) return;
        var st = pool[launched++];
        var rank = Math.min(wantRank, st.m.caps[p]);
        invokeCascade(st, p, rank, req.info.musicInfo).then(function (url) {
          if (done) return;
          done = true; clearTimers(); resolve(url);
        }, function () {
          failures++;
          if (done) return;
          if (launched < pool.length) launch();
          else if (failures >= pool.length) failAll();
        });
      }
      launch();
      // 阶梯放行：每 1.5s 多放一个源，数量按候选池动态生成
      for (var i = 1; i < pool.length; i++) timers.push(setTimeout(launch, i * 1500));
    });
  });

  // 成员的 on(request) 均为同步注册，执行完毕即可上报；用 setTimeout(0) 兼容要求异步初始化的宿主
  setTimeout(function () {
    try { LX.send(E.inited, { status: true, openDevTools: false, sources: sources }); } catch (e) {}
  }, 0);

  // ==================== 云更新（构建期注入） ====================
  var CLOUD_CHANNELS = ["https://raw.githubusercontent.com/moxi5445/lx-music-cloud/main/","https://cdn.jsdelivr.net/gh/moxi5445/lx-music-cloud@main/","https://fastly.jsdelivr.net/gh/moxi5445/lx-music-cloud@main/","https://gh-proxy.com/https://raw.githubusercontent.com/moxi5445/lx-music-cloud/main/","https://ghproxy.net/https://raw.githubusercontent.com/moxi5445/lx-music-cloud/main/"];
  var CLOUD_VERSION = 202609281300;
  var CLOUD_VERSION_TEXT = "2026-09-28 13:00:04";
  var CLOUD_UPDATE_URL = "https://raw.githubusercontent.com/moxi5445/lx-music-cloud/main/lx-cloud.js";

  function cloudHttpGet(u, ms) {
    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = setTimeout(function () {
        if (!settled) { settled = true; reject(new Error('timeout')); }
      }, ms);
      try {
        LX.request(u, { method: 'GET' }, function (err, resp, body) {
          if (settled) return;
          settled = true; clearTimeout(timer);
          if (err) return reject(err);
          var sc = resp && (resp.statusCode != null ? resp.statusCode : resp.status);
          if (sc !== 200) return reject(new Error('http ' + sc));
          resolve(body);
        });
      } catch (e) {
        if (!settled) { settled = true; clearTimeout(timer); reject(e); }
      }
    });
  }
  // 多通道按序回退：任一通道成功且内容合法即返回，HTTP 失败/内容非法均尝试下一通道
  function cloudFetch(rel, isJson, ms) {
    var i = 0;
    function handle(b) {
      if (!isJson) return typeof b === 'string' ? b : (b && b.toString ? b.toString() : '');
      var j = typeof b === 'string' ? JSON.parse(b) : b;
      if (!j || typeof j !== 'object') throw new Error('bad manifest');
      return j;
    }
    function attempt() {
      if (i >= CLOUD_CHANNELS.length) return Promise.reject(new Error('all channels failed'));
      var u = CLOUD_CHANNELS[i++] + rel;
      return cloudHttpGet(u, ms).then(handle).catch(attempt);
    }
    return attempt();
  }
  // 宿主动态执行能力探测：桌面 Electron 为 true；移动端 Hermes 等精简引擎为 false
  function cloudCanDyn() {
    try { return (new Function('return true'))() === true; } catch (e) { return false; }
  }
  function cloudMd5(s) {
    try {
      return LX.utils && LX.utils.crypto && LX.utils.crypto.md5 ? LX.utils.crypto.md5(s) : '';
    } catch (e) { return ''; }
  }
  // 动态执行单个远程成员：加载瞬间用成员专属 facade 替换全局 lx/window/self/global，执行完恢复
  function cloudBoot(code, m) {
    var st = { m: m, handler: null, sources: null };
    var facade = makeFacade(st);
    var sb = makeSandbox(facade);
    var g = REAL_GLOBAL;
    var saved = {};
    function swap(name, val) { try { saved[name] = g[name]; g[name] = val; } catch (e) {} }
    function restore(name) { try { g[name] = saved[name]; } catch (e) {} }
    swap('lx', facade); swap('window', sb); swap('self', sb); swap('global', sb);
    try { (new Function('"use strict";\n' + code))(); } catch (e) { st.handler = null; }
    restore('lx'); restore('window'); restore('self'); restore('global');
    return st;
  }
  function cloudCover(list) {
    var o = {};
    for (var i = 0; i < list.length; i++) {
      var st = list[i];
      if (!st.handler) continue;
      for (var p in st.m.caps) {
        if (o[p] == null || st.m.caps[p] > o[p]) o[p] = st.m.caps[p];
      }
    }
    return o;
  }
  function cloudSourcesEqual(a, b) {
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (var i = 0; i < ka.length; i++) {
      var p = ka[i];
      if (!b[p] || (a[p].qualitys || []).join(',') !== (b[p].qualitys || []).join(',')) return false;
    }
    return true;
  }
  function cloudRefresh() {
    var bust = Date.now ? Date.now() : new Date().getTime();
    cloudFetch('manifest.json?t=' + bust, true, 6000).then(function (manifest) {
      if (!manifest || !manifest.sources || !manifest.sources.length) return;
      if (!cloudCanDyn()) {
        // 移动端：无法动态执行远程脚本，版本不一致时走官方 updateAlert 引导重新导入固定地址
        if (String(manifest.v) !== String(CLOUD_VERSION) && E.updateAlert) {
          try {
            LX.send(E.updateAlert, {
              log: '云更新音源发现新版本\n服务器构建：' + (manifest.updated || manifest.v)
                + '\n当前内置：' + CLOUD_VERSION_TEXT
                + '\n点击「更新」获取最新实测音源（导入地址永久有效）',
              updateUrl: CLOUD_UPDATE_URL,
            });
          } catch (e) {}
        }
        return;
      }
      // 桌面端：并发拉取成员（按通道回退），md5 防损坏/劫持，启动串行化在下载完成后顺序执行
      var jobs = manifest.sources.map(function (s) {
        return cloudFetch(s.f + '?svn=' + encodeURIComponent(manifest.v), false, 12000).then(function (code) {
          if (!code || code.length < 32) throw new Error('empty');
          if (s.md5 && cloudMd5(code) !== s.md5) throw new Error('md5 mismatch');
          var st = cloudBoot(code, { n: s.n, v: s.v || '', a: s.a || '', s: s.s || 0, caps: s.caps || {} });
          if (!st.handler) throw new Error('no handler');
          return st;
        }).catch(function () { return null; });
      });
      Promise.all(jobs).then(function (rs) {
        var ok = [];
        for (var i = 0; i < rs.length; i++) if (rs[i]) ok.push(rs[i]);
        if (!ok.length) return; // 远程全部失败：内联成员继续服务
        var oldC = cloudCover(states), newC = cloudCover(ok);
        // 远程平台覆盖窄于内置（部分失败/接口漂移）时保留内置，等待下轮
        if (Object.keys(newC).length < Object.keys(oldC).length) return;
        var oldSources = buildSources();
        states.splice(0, states.length);
        for (var j = 0; j < ok.length; j++) states.push(ok[j]);
        var newSources = buildSources();
        if (!cloudSourcesEqual(oldSources, newSources)) {
          try { LX.send(E.inited, { status: true, openDevTools: false, sources: newSources }); } catch (e) {}
        }
      });
    }).catch(function () { /* 配置不可达时静默：内置成员为最近一轮实测快照，可独立服务 */ });
  }
  setTimeout(cloudRefresh, 250);
})();
