/*!
 * @name 落雪云更新音源(实测)
 * @description 启动自动拉取服务器最新实测音源配置，桌面端云端换源即时生效，移动端内置兜底+更新提醒
 * @version 2026.11.12
 * @author ql-lx-source
 * @homepage https://github.com/moxi5445/lx-music-cloud
 *
 * 固定导入地址（永久有效）：https://raw.githubusercontent.com/moxi5445/lx-music-cloud/main/lx-cloud.js
 * 运行时配置通道（按序回退）：raw.githubusercontent / cdn.jsdelivr / fastly.jsdelivr / gh-proxy / ghproxy
 *
 * 由 ql-lx-source 1.3.2 于 2026-11-12 07:00:13 自动生成
 * 成员仅收录当轮五平台真实取链成功者（平台:实测最高音质）：
 *   1. 𝖧౿ᥣᥣ𝗈 Ԝ𝗈𝗋ᥣᑯ（实测 酷我:flac24bit/酷狗:flac24bit/QQ音乐:flac24bit/网易云:flac24bit/咪咕:flac，47.1分）
 *   2. HYWmusic_公益版（实测 酷我:flac24bit/酷狗:flac24bit/QQ音乐:flac24bit/网易云:flac24bit/咪咕:320k，45.9分）
 *   3. HYWmusic_公益版_v1.0.3（实测 酷我:flac24bit/酷狗:flac/QQ音乐:flac24bit/网易云:flac24bit/咪咕:320k，43.9分）
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
  var MEMBERS = [{"n":"𝖧౿ᥣᥣ𝗈 Ԝ𝗈𝗋ᥣᑯ","v":"260925","a":"hello world","s":47.06,"caps":{"kw":4,"kg":4,"tx":4,"wy":4,"mg":3}},{"n":"HYWmusic_公益版","v":"v1.2.0","a":"Ryn","s":45.91,"caps":{"kw":4,"kg":4,"tx":4,"wy":4,"mg":2}},{"n":"HYWmusic_公益版_v1.0.3","v":"","a":"","s":43.91,"caps":{"kw":4,"kg":3,"tx":4,"wy":4,"mg":2}}];
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
 * @name 𝖧౿ᥣᥣ𝗈 Ԝ𝗈𝗋ᥣᑯ
 * @author hello world
 * @version 260925
 * @description 每天都要开心哦,无论如何...
 * 1004342496←有bug就说(应该没有🤓)或者催更
 */

const ENABLE_CACHE = true;
const CACHE_TTL = 20 * 60 * 1000;
const TIMEOUT = 10000;
const RACE_APIS = false;
const CONFIG = {
  kw: {
    name: '酷我音乐',
    apis: [
      {
        api: 'https://musicserver.haitangw.cc/v1/music/resolve-url',
        idField: ['hash', 'songmid', 'rid', 'id'],
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: { source: 'kw', rid: '{id}', level: '{quality}' },
        urlField: ['data.url'],
        quality: {
          atmos: 'atmos',
          atmos_plus: 'atmos_plus',
          master: 'master'
        }
      },
{
  api: 'http://nmobi.kuwo.cn/mobi.s?f=web&user=0&source=kwplayerhd_ar_6.6.6.6_tianbao_T1A_qirui.apk&type=convert_url_with_sign&rid={id}&br={quality}',
  idField: ['rid', 'hash', 'songId', 'id', 'songmid'],
  urlField: ['data.url'],
  quality: {
    '128k': '128kmp3',
    '320k': '320kmp3',
    flac: '2000kflac',
    flac24bit: '4000kflac',
    hires: '4000kflac',
    atmos: '20201kmflac',
    atmos_plus: '20501kmflac',
    master: '20900kmflac'
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android) AppleWebKit/537.36'
        }
      }
    ]
  },
  kg: {
    name: '酷狗音乐',
    apis: [
      {
        api: 'http://103.79.184.97/api/music/url?source=kg&songId={id}&quality={quality}&key=6C1F-53W0-GRKI-EVFG',
        idField: ['hash', 'songmid', 'id', 'rid'],
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'X-Card-Key': '6C1F-53W0-GRKI-EVFG'
        },
        urlField: ['url', 'data.url'],
        quality: {
          '128k': '128k',
          '320k': '320k',
          flac: 'flac'
        }
      },
      {
        api: 'https://yy.zddyr.top/lx/api/?source=kg&quality={quality}&mainHash={id}',
        idField: ['hash', 'songmid', 'id', 'rid'],
        urlField: ['url'],
        quality: {
          '128k': '128k',
          '320k': '320k',
          flac: 'flac',
          hires: 'hires'
        },
        before: (() => {
          let deviceId = '', token = '', tokenTs = 0;
          const SCRIPT = 'YYMusicSource', VER = 'v1.0.0';
          return (params) => {
            if (!deviceId) deviceId = 'lx-online-' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
            if (!token || Date.now() - tokenTs > 5 * 60 * 1000) {
              const payload = { device_id: deviceId, ip: '0.0.0.0', timestamp: Math.floor(Date.now() / 1000), random: Math.random().toString(36).substring(2, 12) };
              try {
                if (globalThis.lx?.utils?.buffer?.from) {
                  const buf = globalThis.lx.utils.buffer.from(JSON.stringify(payload), 'utf-8');
                  token = globalThis.lx.utils.buffer.bufToString(buf, 'base64');
                } else { token = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))); }
              } catch (e) { token = ''; }
              tokenTs = Date.now();
            }
            params.headers = params.headers || {};
            params.headers['X-Token'] = token;
            params.headers['X-Client'] = `${SCRIPT}/${VER} (Android)`;
            return params;
          };
        })()
      },
      {
        api: 'https://musicserver.haitangw.cc/v1/music/resolve-url',
        idField: ['hash', 'songmid', 'id', 'rid'],
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: { source: 'kg', rid: '{id}', level: '{quality}' },
        urlField: ['data.url'],
        quality: {
          '128k': 'standard',
          '320k': 'exhigh',
          flac: 'lossless',
          hires: 'hires',
          atmos: 'atmos',
          master: 'clear'
        }
      }
    ]
  },
  tx: {
    name: 'QQ音乐',
    apis: [
      {
        api: 'http://103.79.184.97/api/music/url?source=tx&songId={id}&quality={quality}&key=6C1F-53W0-GRKI-EVFG',
        idField: ['songmid', 'id', 'hash'],
        headers: { 'User-Agent': 'Mozilla/5.0', 'X-Card-Key': '6C1F-53W0-GRKI-EVFG' },
        urlField: ['url', 'data.url'],
        quality: { '128k': '128k', '320k': '320k', flac: 'flac', flac24bit: 'flac24bit' }
      },
      {
        api: 'https://yy.zddyr.top/lx/api/?source=tx&songmid={id}&quality={quality}',
        idField: ['songmid', 'id', 'hash'],
        urlField: ['url'],
        quality: { '128k': '128k', '320k': '320k', flac: 'flac', hires: 'hires' },
        before: (() => {
          let deviceId = '', token = '', tokenTs = 0;
          const SCRIPT = 'YYMusicSource', VER = 'v1.0.0';
          return (params) => {
            if (!deviceId) deviceId = 'lx-online-' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
            if (!token || Date.now() - tokenTs > 5 * 60 * 1000) {
              const payload = { device_id: deviceId, ip: '0.0.0.0', timestamp: Math.floor(Date.now() / 1000), random: Math.random().toString(36).substring(2, 12) };
              try {
                if (globalThis.lx?.utils?.buffer?.from) {
                  const buf = globalThis.lx.utils.buffer.from(JSON.stringify(payload), 'utf-8');
                  token = globalThis.lx.utils.buffer.bufToString(buf, 'base64');
                } else { token = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))); }
              } catch (e) { token = ''; }
              tokenTs = Date.now();
            }
            params.headers = params.headers || {};
            params.headers['X-Token'] = token;
            params.headers['X-Client'] = `${SCRIPT}/${VER} (Android)`;
            return params;
          };
        })()
      },
{
  api: 'https://tang.api.s01s.cn/music_open_api.php?mid={id}',
  idField: ['songmid', 'id', 'hash'],
  urlField: ['song_play_url_pq', 'song_play_url_sq', 'song_play_url_hq', 'song_play_url_standard', 'song_play_url', 'song_play_url_fq'],
  quality: {
    '128k': 'song_play_url_standard',
    '320k': 'song_play_url_hq',
    flac: 'song_play_url_sq',
    flac24bit: 'song_play_url_pq',
    atmos: 'song_play_url_pq'
  },
  after: (data) => {
    if (!data) throw new Error('tang 无响应');
    const fields = ['song_play_url_pq', 'song_play_url_sq', 'song_play_url_hq', 'song_play_url_standard', 'song_play_url', 'song_play_url_fq'];
    for (const f of fields) {
      if (typeof data[f] === 'string' && data[f].trim()) return data[f].trim();
    }
    throw new Error('tang 无链接');
  }
},
      {
        api: 'https://musicserver.haitangw.cc/v1/music/resolve-url',
        idField: ['songmid', 'id', 'hash'],
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: { source: 'tx', rid: '{id}', level: '{quality}' },
        urlField: ['data.url'],
        quality: {
          '128k': 'standard',
          '320k': 'exhigh',
          flac: 'lossless',
          flac24bit: 'hires',
          hires: 'hires',
          atmos: '1999',
          atmos_plus: '2999',
          master: 'jymaster'
          }
        },
      {
        api: 'https://a.aa.cab/qq.music?msg={keyword}&n=1&type={quality}',
        idField: ['songmid', 'id', 'hash'],
        urlField: ['data.music', 'playUrl', 'url', 'data.url'],
        quality: { '128k': '0', '320k': '1', flac: '4', master: '5' }
      }
    ]
  },
wy: {
  name: '网易云音乐',
  apis: [
    {
      api: 'https://c.wwwweb.top/music/url',
      idField: ['hash', 'songmid'],
      urlField: ['url'],
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'lx-music-desktop/2.10.1'
      },
      body: { source: 'wy', musicId: '{id}', quality: '{quality}' },
      quality: {
        '128k': '128k',
        '320k': '320k',
        flac: 'flac',
        flac24bit: 'flac24bit',
        hires: 'hires',
        atmos: 'atmos',
        master: 'master'
      },
      after: (data) => {
        if (data.code === 200 && data.url) return data.url;
        throw new Error(data.message || '无数据');
        }
      },
    {
  api: 'https://musicserver.haitangw.cc/v1/music/resolve-url',
  idField: ['songmid', 'id', 'hash'],
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
  body: { source: 'wy', rid: '{id}', level: '{quality}' },
  urlField: ['data.url'],
  quality: {
    '128k': 'standard',
    '320k': 'exhigh',
    flac: 'lossless',
    flac24bit: 'hires',
    hires: 'hires',
    atmos: 'jyeffect',
    master: 'jymaster'
        }
      },
    {
      api: 'https://yy.zddyr.top/lx/api/?source=wy&songmid={id}&quality={quality}',
      idField: ['hash', 'songmid', 'id'],
      urlField: ['url', 'data.url'],
      quality: {
        '128k': '128k',
        '320k': '320k',
        flac: 'flac',
        hires: 'hires'
      },
      before: (() => {
        let deviceId = '', token = '', tokenTs = 0;
        const SCRIPT = 'YYMusicSource', VER = 'v1.0.0';
        return (params) => {
          if (!deviceId) deviceId = 'lx-online-' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
          if (!token || Date.now() - tokenTs > 5 * 60 * 1000) {
            const payload = { device_id: deviceId, ip: '0.0.0.0', timestamp: Math.floor(Date.now() / 1000), random: Math.random().toString(36).substring(2, 12) };
            try {
              if (globalThis.lx?.utils?.buffer?.from) {
                const buf = globalThis.lx.utils.buffer.from(JSON.stringify(payload), 'utf-8');
                token = globalThis.lx.utils.buffer.bufToString(buf, 'base64');
              } else { token = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))); }
            } catch (e) { token = ''; }
            tokenTs = Date.now();
          }
          params.headers = params.headers || {};
          params.headers['X-Token'] = token;
          params.headers['X-Client'] = `${SCRIPT}/${VER} (Android)`;
          return params;
        };
      })()
    },
    {
      api: 'https://mcp.nianxinxz.com/share/ceshi/wy.php?id={id}&level={quality}',
      idField: ['hash', 'songmid', 'id'],
      urlField: ['url'],
      quality: {
        '128k': 'standard',
        '320k': 'exhigh',
        flac: 'lossless',
        flac24bit: 'hires',
        hires: 'hires',
        master: 'jymaster',
        atmos: 'jyeffect'
      },
      after: (data) => {
        if (data.code === 200 && data.url) return data.url;
        throw new Error(data.message || 'mcp 无数据');
      }
    },
   {
  api: 'http://103.79.184.97/api/music/url?platform=wy&songId={id}&quality={quality}&key=6C1F-53W0-GRKI-EVFG',
  idField: ['songmid', 'songId', 'id', 'hash'],
  urlField: ['url', 'data.url', 'data'],
  quality: {
    '128k': '128k',
    '320k': '320k',
    flac: 'flac',
    flac24bit: 'flac24bit',
    hires: 'hires'
  },
  headers: {
    'User-Agent': 'lx-music-mobile/2.0.0',
    'X-Card-Key': '6C1F-53W0-GRKI-EVFG'
  }
}
  ]
},
  mg: {
    name: '咪咕音乐',
    apis: [
      {
        api: 'https://yy.zddyr.top/lx/api/?source=migu&songmid={id}&quality={quality}',
        idField: ['songmid', 'id', 'hash'],
        urlField: ['url', 'data.url'],
        quality: { '128k': '128k', '320k': '320k', flac: 'flac', hires: 'hires' },
        before: (() => {
          let deviceId = '', token = '', tokenTs = 0;
          const SCRIPT = 'YYMusicSource', VER = 'v1.0.0';
          return (params) => {
            if (!deviceId) deviceId = 'lx-online-' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
            if (!token || Date.now() - tokenTs > 5 * 60 * 1000) {
              const payload = { device_id: deviceId, ip: '0.0.0.0', timestamp: Math.floor(Date.now() / 1000), random: Math.random().toString(36).substring(2, 12) };
              try {
                if (globalThis.lx?.utils?.buffer?.from) {
                  const buf = globalThis.lx.utils.buffer.from(JSON.stringify(payload), 'utf-8');
                  token = globalThis.lx.utils.buffer.bufToString(buf, 'base64');
                } else { token = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))); }
              } catch (e) { token = ''; }
              tokenTs = Date.now();
            }
            params.headers = params.headers || {};
            params.headers['X-Token'] = token;
            params.headers['X-Client'] = `${SCRIPT}/${VER} (Android)`;
            return params;
          };
        })()
      },
      {
        api: 'https://oiapi.net/api/MiGu_Music?msg={keyword}&br={quality}&n=1',
        idField: ['songmid', 'id', 'hash'],
        urlField: ['data.url', 'url'],
        quality: { '128k': 'LQ', '320k': 'HQ', flac: 'SQ', hires: 'SQ' }
      }
    ]
  }
}
const { EVENT_NAMES, request, on, send } = globalThis.lx;
const cache = Object.create(null);
const sourceKeys = Object.keys(CONFIG);

const getCache = k => ENABLE_CACHE && cache[k]?.expire > Date.now() ? cache[k].data : (delete cache[k], null);
const setCache = (k, d) => ENABLE_CACHE && (cache[k] = { data: d, expire: Date.now() + CACHE_TTL });

const httpRequest = (url, options = {}) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('请求超时')), options.timeout || TIMEOUT);
  request(url, {
    method: options.method || 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', ...options.headers },
    ...(options.body !== undefined ? { body: options.body } : {})
  }, (err, resp) => {
    clearTimeout(timer);
    if (err) return reject(err instanceof Error ? err : new Error(String(err)));
    if (!resp) return reject(new Error('空响应'));
    resolve({ body: resp.body, statusCode: resp.statusCode || resp.status || 200, url: resp.url });
  });
});

const getField = (obj, path) => path.split('.').reduce((val, p) => val == null ? undefined
  : Array.isArray(val) ? (/^\d+$/.test(p) ? val[+p] : val.map(v => v?.[p]).find(v => v != null && v !== ''))
  : val[p], obj);

const asUrl = v => typeof v === 'string' && /^(https?:)?\/\//.test(v.trim())
  ? (v.trim().startsWith('//') ? 'https:' + v.trim() : v.trim())
  : null;

const findUrl = (data, fields) => data == null ? null : asUrl(data) || fields.map(f => asUrl(getField(data, f))).find(Boolean) || null;

const getSongId = (info, fields) => fields.map(f => getField(info, f)).find(v => v !== undefined && v !== null && v !== '')?.toString() ?? '';

const qualitys = Object.create(null);
const sources = Object.create(null);
const idFieldsBySource = Object.create(null);
sourceKeys.forEach(s => {
  const apiList = CONFIG[s].apis || [];
  const qs = [...new Set(apiList.flatMap(a => Object.keys(a.quality || {})))];
  qualitys[s] = qs.reduce((acc, q) => (acc[q] = q, acc), {});
  sources[s] = { name: CONFIG[s].name, type: 'music', actions: ['musicUrl'], qualitys: qs };
  idFieldsBySource[s] = [...new Set(apiList.flatMap(a => a.idField || []))];
});
qualitys.local = {};
sources.local = { name: '本地音乐', type: 'music', actions: ['musicUrl', 'lyric', 'pic'], qualitys: [] };

const FALLBACK = {
  master: ['master', 'atmos_plus', 'atmos', 'hires', 'flac24bit', 'flac', '320k', '128k'],
  atmos_plus: ['atmos_plus', 'atmos', 'hires', 'flac24bit', 'flac', '320k', '128k'],
  atmos: ['atmos', 'hires', 'flac24bit', 'flac', '320k', '128k'],
  hires: ['hires', 'flac24bit', 'flac', '320k', '128k'],
  flac24bit: ['flac24bit', 'flac', '320k', '128k'],
  flac: ['flac', '320k', '128k'],
  '320k': ['320k', '128k'],
  '128k': ['128k'],
};

const substitute = (val, map) => typeof val === 'string'
  ? val.replace(/\{(id|quality|keyword)\}/g, (_, k) => map[k] ?? '')
  : Array.isArray(val) ? val.map(v => substitute(v, map))
  : val && typeof val === 'object' ? Object.fromEntries(Object.entries(val).map(([k, v]) => [k, substitute(v, map)]))
  : val;

const hasPlaceholder = (api, name) => [api.api, api.body, api.headers].some(v => v && JSON.stringify(v).includes(`{${name}}`));

const resolveRedirectUrl = (resp, baseUrl) => resp.url
  ? asUrl(resp.url) || (() => { try { return new URL(resp.url, baseUrl).href; } catch { return null; } })()
  : null;

const buildParams = (api, info, quality, keyword) => {
  const needsId = hasPlaceholder(api, 'id');
  const needsKeyword = hasPlaceholder(api, 'keyword');
  const id = needsId ? getSongId(info, api.idField) : '';
  if (needsId && !id) throw new Error('缺少id字段');
  if (needsKeyword && !keyword) throw new Error('缺少歌曲名');

  const map = { id, keyword, quality: api.quality ? api.quality[quality] : quality };
  let params = {
    url: substitute(api.api, map),
    headers: api.headers ? substitute(api.headers, map) : undefined,
    body: api.body ? substitute(api.body, map) : undefined
  };
  if (typeof api.before === 'function') params = api.before(params) || params;
  if (!params.url || /\{[^}]*\}/.test(params.url)) throw new Error('URL模板未配置');
  return params;
};

const runRaw = async (api, params) => {
  if (api.followRedirect === false) return params.url;
  const tryMethod = async method => {
    const r = await httpRequest(params.url, { method, headers: params.headers, timeout: api.timeout });
    if (r.statusCode >= 400) { const err = new Error(`状态码${r.statusCode}`); err.statusCode = r.statusCode; throw err; }
    return r;
  };
  const firstMethod = api.method || 'HEAD';
  let resp;
  try { resp = await tryMethod(firstMethod); }
  catch (e) { if (firstMethod === 'GET' || e.statusCode !== 405) throw e; resp = await tryMethod('GET'); }
  if ([301, 302, 303, 307, 308].includes(resp.statusCode)) {
    const abs = resolveRedirectUrl(resp, params.url);
    if (abs) return abs;
  }
  return params.url;
};

const runStandard = async (api, params) => {
  const resp = await httpRequest(params.url, {
    method: api.method || 'GET',
    headers: params.headers,
    body: params.body,
    timeout: api.timeout
  });
  if (api.followRedirect !== false && [301, 302, 303, 307, 308].includes(resp.statusCode)) {
    const abs = resolveRedirectUrl(resp, params.url);
    if (abs) return abs;
  }
  const direct = asUrl(resp.body);
  if (direct) return direct;
  const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
  const parsed = typeof api.after === 'function' ? api.after(data) : data;
  if (typeof parsed === 'string') { const u = asUrl(parsed); if (u) return u; }
  const result = findUrl(parsed, api.urlField || ['url', 'data.url', 'playUrl']);
  if (result) return result;
  throw new Error('响应中未找到有效链接');
};

const tryApi = async (s, info, quality) => {
  const apiList = CONFIG[s].apis;
  if (!apiList?.length) throw new Error('无API配置');
  const keyword = encodeURIComponent(info.name || info.songname || '');

  const run = async api => {
    const tag = api.api.split('?')[0].split('/').pop() || 'api';
    if (api.quality && !api.quality[quality]) throw new Error(`${tag}:不支持${quality}`);
    try {
      const params = buildParams(api, info, quality, keyword);
      return await (api.raw ? runRaw(api, params) : runStandard(api, params));
    } catch (e) {
      throw new Error(`${tag}:${e.message}`);
    }
  };

  if (RACE_APIS) {
    try { return await Promise.any(apiList.map(run)); }
    catch (agg) { throw new Error(`所有API均失败(${quality}) [${(agg.errors || [agg]).map(e => e.message || String(e)).join(' | ')}]`); }
  }

  const fails = [];
  for (const api of apiList) {
    try { return await run(api); } catch (e) { fails.push(e.message || String(e)); }
  }
  throw new Error(`所有API均失败(${quality}) [${fails.join(' | ')}]`);
};

const inflight = Object.create(null);

const apis = sourceKeys.reduce((acc, s) => {
  acc[s] = {
    async musicUrl(info, quality) {
      if (!info) throw new Error('缺少musicInfo');
      const identity = getSongId(info, idFieldsBySource[s]) || [info.name, info.singer || info.artist].filter(Boolean).join('-');
      const key = `${s}_${identity || `anon${Math.random().toString(36).slice(2)}`}_${quality}`;
      const cached = getCache(key);
      if (cached) return cached;
      if (inflight[key]) return inflight[key];

      const run = (async () => {
        const fails = [];
        for (const q of FALLBACK[quality] || [quality]) {
          if (!qualitys[s].hasOwnProperty(q)) continue;
          try {
            const result = await tryApi(s, info, q);
            if (result) { setCache(key, result); return result; }
          } catch (e) { fails.push(e.message || String(e)); }
        }
        throw new Error(fails.length ? fails.join(' || ') : '所有音质均失败');
      })();

      inflight[key] = run;
      try { return await run; } finally { delete inflight[key]; }
    }
  };
  return acc;
}, {});

on(EVENT_NAMES.request, ({ source, action, info } = {}) => {
  if (!apis[source] || action !== 'musicUrl') return Promise.reject('不支持');
  if (!qualitys[source]?.[info?.type]) return Promise.reject(`不支持的音质: ${info?.type}`);
  return apis[source].musicUrl(info.musicInfo, info.type).catch(e => Promise.reject(e.message));
});

send(EVENT_NAMES.inited, { openDevTools: false, sources });
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
/**
 * @name HYWmusic_公益版
 * @version v1.2.0
 * @author Ryn
 * @description qq群：1094095648；965503129
 * @homepage https://github.com/Macrohard0001/HYWmusic_source
 * @license MIT
 * @updateUrl https://103.79.184.97/api/releases?script=HYWmusic_%E5%85%AC%E7%9B%8A%E7%89%88&scriptType=free&releaseType=lx&version=v1.2.0
 *
 * 支持平台: kw、tx、wy、mg、qs、bili、ytb、xm、kg
 * 支持音质: 128k、320k、flac、flac24bit
 * 生成时间: 2026-10-08T11:39:01.047Z
 *
 * 协议参考：ikun-music-source.js + lxmusic.toside.cn/desktop/custom-source
 *   - MUSIC_QUALITY 每平台独立音质（收敛到规范标准集，高音质可直接请求由服务端解析）
 *   - actions 固定 ['musicUrl']（官方桌面/移动规范：非 local 源仅支持 musicUrl）
 *   - on handler 纯 Promise 风格：({action, source, info}) => Promise
 *   - inited 发送 status:true + sources
 *   - API_BASE 必须注入，禁止回退 localhost
 */

'use strict'

const DEV_ENABLE = false
const UPDATE_ENABLE = true

const { EVENT_NAMES, request, on, send, env, version: LX_VERSION } = globalThis.lx

// ====== 每平台独立音质（参考 ikun） ======
const MUSIC_QUALITY = JSON.parse('{"kw":["128k","320k","flac","flac24bit"],"tx":["128k","320k","flac","flac24bit"],"wy":["128k","320k","flac","flac24bit"],"mg":["128k","320k"],"qs":["128k","320k"],"bili":["128k","320k"],"ytb":["128k"],"xm":["128k","320k"],"kg":["128k","320k","flac","flac24bit"]}')
const MUSIC_SOURCE = Object.keys(MUSIC_QUALITY)

// ====== 运行参数 ======
const API_BASE = 'https://103.79.184.97'
const CARD_KEY = '6C1F-53W0-GRKI-EVFG'

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
    // Node http 拒绝非 Latin1 header 值：中文卡密会 ERR_INVALID_CHAR（请求未发出即失败，
    // LX 客户端表现 Invalid character in header content ["x-card-key"]）。
    // 服务端优先读 query key（本脚本已在 query 携带 key=卡密），header 仅在 ASCII 安全时附带。
    if (CARD_KEY && /^[\x20-\x7E]*$/.test(CARD_KEY)) headers['X-Card-Key'] = CARD_KEY
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
  if (CARD_KEY) params.key = CARD_KEY
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
  if (CARD_KEY) params.key = CARD_KEY
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
// v1.5.16：actions 固定 ['musicUrl'] —— 官方桌面/移动规范均规定非 local 源仅支持
// musicUrl；声明 lyric/pic 会被官方客户端过滤，且可能导致严格第三方客户端初始化失败。
const musicSources = {}
MUSIC_SOURCE.forEach((item) => {
  musicSources[item] = {
    name: item,
    type: 'music',
    actions: ['musicUrl'],
    qualitys: MUSIC_QUALITY[item],
  }
})

// ====== 发送 inited（参考 ikun：status: true + openDevTools） ======
send(EVENT_NAMES.inited, {
  status: true,
  openDevTools: DEV_ENABLE,
  sources: musicSources,
})

// ====== 更新检查（v1.3.5+：inited 后异步调用，发现新版本发 updateAlert） ======
const SCRIPT_VERSION = 'v1.2.0'
const UPDATE_URL = 'https://103.79.184.97/api/releases?script=HYWmusic_%E5%85%AC%E7%9B%8A%E7%89%88&scriptType=free&releaseType=lx&version=' + SCRIPT_VERSION

const parseVer = (s) => {
  const m = String(s || '').match(/\d+(?:\.\d+)+/)
  if (!m) return null
  return m[0].split('.').map((n) => parseInt(n, 10))
}

const cmpVer = (a, b) => {
  const va = parseVer(a)
  const vb = parseVer(b)
  if (!va || !vb) return 0
  const len = Math.max(va.length, vb.length)
  for (let i = 0; i < len; i++) {
    const x = va[i] || 0
    const y = vb[i] || 0
    if (x > y) return 1
    if (x < y) return -1
  }
  return 0
}

const checkUpdate = async () => {
  try {
    if (!UPDATE_ENABLE) return
    log.info('检查更新: ' + UPDATE_URL)
    // v1.4.14 修复：httpFetch resolve 的是 { statusCode, headers, body } 包装对象，
    // 旧模板误将包装对象整体 JSON.parse（等价于 parse "[object Object]"），
    // 必然抛 SyntaxError 静默 return —— 导致所有脚本更新检查永远失效、
    // 用户端永远收不到新版本提示（旧脚本用户长期滞留旧版）。
    const resp = await httpFetch(UPDATE_URL, { method: 'GET' })
    if (!resp || resp.statusCode !== 200) return
    let respBody = resp.body
    if (typeof respBody === 'string') {
      try { respBody = JSON.parse(respBody) } catch (e) { return }
    }
    if (!respBody || typeof respBody !== 'object') return
    if (respBody.code !== 200 || !respBody.data || !respBody.data.version) return
    const latestVersion = respBody.data.version
    if (cmpVer(latestVersion, SCRIPT_VERSION) > 0) {
      // 服务端返回相对路径，需补全为绝对 URL
      const absUrl = respBody.data.url && String(respBody.data.url).indexOf('http') === 0
        ? respBody.data.url
        : API_BASE + (respBody.data.url || '')
      log.info('发现新版本 ' + latestVersion + ' -> ' + absUrl)
      send(EVENT_NAMES.updateAlert, {
        log: respBody.data.updateLog || ('发现新版本 ' + latestVersion),
        updateUrl: absUrl,
      })
    } else {
      log.info('当前已是最新版本: ' + SCRIPT_VERSION)
    }
  } catch (e) {
    log.warn('更新检查失败: ' + (e && e.message))
  }
}

// 异步调用（不阻塞 inited；失败静默，不影响正常音源功能）
checkUpdate()

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


'use strict'

const DEV_ENABLE = false
const UPDATE_ENABLE = true

const { EVENT_NAMES, request, on, send, env, version: LX_VERSION } = globalThis.lx


const MUSIC_QUALITY = JSON.parse('{"kw":["128k","320k","flac","flac24bit","hires"],"kg":["128k","320k","flac"],"tx":["128k","320k","flac","flac24bit","hires"],"wy":["128k","320k","flac","flac24bit","hires"],"mg":["128k","320k"]}')
const MUSIC_SOURCE = Object.keys(MUSIC_QUALITY)


const API_BASE = 'http://103.79.184.97'
const CARD_KEY = '6C1F-53W0-GRKI-EVFG'


const log = {
  info: (...args) => { try { console.log('[HYWmusic]', ...args) } catch(e) {} },
  error: (...args) => { try { console.error('[HYWmusic ERROR]', ...args) } catch(e) {} },
  warn: (...args) => { try { console.warn('[HYWmusic WARN]', ...args) } catch(e) {} },
}


if (!API_BASE || !/^https?:\/\//.test(API_BASE)) {
  log.error('API_BASE 未配置或格式非法: "' + API_BASE + '"，所有请求都将失败')
  log.error('请联系发行版管理员在创建发行版时设置 metadata.apiUrl')
}


const httpFetch = (url, options = { method: 'GET' }) => {
  return new Promise((resolve, reject) => {
    if (!API_BASE || !/^https?:\/\//.test(API_BASE)) {
      return reject(new Error('API_BASE 未配置或格式非法'))
    }
    const headers = {
      ...(options.headers || {}),
      'User-Agent': env ? `lx-music-${env}/${LX_VERSION}` : `lx-music-request/${LX_VERSION || '1.0.0'}`,
    }
    
    
    
    if (CARD_KEY && /^[\x20-\x7E]*$/.test(CARD_KEY)) headers['X-Card-Key'] = CARD_KEY
    const reqOptions = { ...options, headers }
    if (!reqOptions.method) reqOptions.method = 'GET'
    
    
    
    
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
  params.source = platform  
  return params
}


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


const handleGetLyric = async (source, musicInfo) => {
  const params = collectMusicInfoParams(musicInfo, source)
  params.action = 'lyric'
  if (CARD_KEY) params.key = CARD_KEY
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


const handleGetPic = async (source, musicInfo) => {
  const params = collectMusicInfoParams(musicInfo, source)
  params.action = 'pic'
  if (CARD_KEY) params.key = CARD_KEY
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


const musicSources = {}
MUSIC_SOURCE.forEach((item) => {
  musicSources[item] = {
    name: item,
    type: 'music',
    actions: ['musicUrl', 'lyric', 'pic'],
    qualitys: MUSIC_QUALITY[item],
  }
})


send(EVENT_NAMES.inited, {
  status: true,
  openDevTools: DEV_ENABLE,
  sources: musicSources,
})


const SCRIPT_VERSION = 'v1.0.3'
const UPDATE_URL = 'http://103.79.184.97/api/releases?script=HYWmusic_%E5%85%AC%E7%9B%8A%E7%89%88&scriptType=free&releaseType=lx&version=' + SCRIPT_VERSION

const parseVer = (s) => {
  const m = String(s || '').match(/\d+(?:\.\d+)+/)
  if (!m) return null
  return m[0].split('.').map((n) => parseInt(n, 10))
}

const cmpVer = (a, b) => {
  const va = parseVer(a)
  const vb = parseVer(b)
  if (!va || !vb) return 0
  const len = Math.max(va.length, vb.length)
  for (let i = 0; i < len; i++) {
    const x = va[i] || 0
    const y = vb[i] || 0
    if (x > y) return 1
    if (x < y) return -1
  }
  return 0
}

const checkUpdate = async () => {
  try {
    if (!UPDATE_ENABLE) return
    log.info('检查更新: ' + UPDATE_URL)
    
    
    
    
    const resp = await httpFetch(UPDATE_URL, { method: 'GET' })
    if (!resp || resp.statusCode !== 200) return
    let respBody = resp.body
    if (typeof respBody === 'string') {
      try { respBody = JSON.parse(respBody) } catch (e) { return }
    }
    if (!respBody || typeof respBody !== 'object') return
    if (respBody.code !== 200 || !respBody.data || !respBody.data.version) return
    const latestVersion = respBody.data.version
    if (cmpVer(latestVersion, SCRIPT_VERSION) > 0) {
      
      const absUrl = respBody.data.url && String(respBody.data.url).indexOf('http') === 0
        ? respBody.data.url
        : API_BASE + (respBody.data.url || '')
      log.info('发现新版本 ' + latestVersion + ' -> ' + absUrl)
      send(EVENT_NAMES.updateAlert, {
        log: respBody.data.updateLog || ('发现新版本 ' + latestVersion),
        updateUrl: absUrl,
      })
    } else {
      log.info('当前已是最新版本: ' + SCRIPT_VERSION)
    }
  } catch (e) {
    log.warn('更新检查失败: ' + (e && e.message))
  }
}


checkUpdate()

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
  var CLOUD_VERSION = 202611120700;
  var CLOUD_VERSION_TEXT = "2026-11-12 07:00:13";
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
