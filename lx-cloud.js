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
 * 由 ql-lx-source 1.3.1 于 2026-09-28 19:00:03 自动生成
 * 成员仅收录当轮五平台真实取链成功者（平台:实测最高音质）：
 *   1. 𝖧౿ᥣᥣ𝗈 Ԝ𝗈𝗋ᥣᑯ（实测 酷我:flac24bit/酷狗:flac24bit/QQ音乐:flac24bit/网易云:flac24bit/咪咕:flac，46.9分）
 *   2. 回避聚合V0.0.1（实测 酷我:flac24bit/酷狗:flac24bit/QQ音乐:flac24bit/网易云:flac24bit，39.7分）
 *   3. gdstudio音乐源（实测 酷狗:flac24bit/网易云:flac24bit/咪咕:flac24bit，31分）
 *   4. KuwoDES（实测 酷我:128k，6.6分）
 *   5. 稳定版音源 v1.0.3（实测 QQ音乐:128k，6.6分）
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
  var MEMBERS = [{"n":"𝖧౿ᥣᥣ𝗈 Ԝ𝗈𝗋ᥣᑯ","v":"260925","a":"hello world","s":46.88,"caps":{"kw":4,"kg":4,"tx":4,"wy":4,"mg":3}},{"n":"回避聚合V0.0.1","v":"","a":"","s":39.69,"caps":{"kw":4,"kg":4,"tx":4,"wy":4}},{"n":"gdstudio音乐源","v":"1.0.1","a":"lx-music","s":31.01,"caps":{"kg":4,"wy":4,"mg":4}},{"n":"KuwoDES","v":"1.0.0","a":"不知名纯鹿人","s":6.62,"caps":{"kw":1}},{"n":"稳定版音源 v1.0.3","v":"1.0.3","a":"LX","s":6.61,"caps":{"tx":1}}];
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


const { EVENT_NAMES, request, on, send, utils, env, version, currentScriptInfo } = globalThis.lx;


const USER_CONFIG = {
    kwDecrypt: {
        url: '',
        allowEncryptedLossless: false,
        urlParamName: 'url',
        ekeyParamName: 'ekey',
    },
    chksz: {
        apikey: '',
        enableNetease: true,
        enableQQ: true,
    },
    debug: false,
};


const _u = (str) => str.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 5)).join('');


const currentScript = currentScriptInfo
    ? currentScriptInfo.rawScript
    : (typeof document !== 'undefined' ? document.currentScript?.textContent || '' : '');

const parseHeader = (str) => {
    const comment = /^\/\*!(?:.|\n)+?\*\//.exec(str)?.[0];
    if (!comment) return {};
    const result = {};
    const pairs = [
        { key: 'tx_cookie', regex: /\*\s*@tx_cookie\s+(.+)/ },
        { key: 'wy_cookie', regex: /\*\s*@wy_cookie\s+(.+)/ },
    ];
    for (const { key, regex } of pairs) {
        const match = regex.exec(comment);
        const val = match?.[1]?.trim();
        result[key] = (!val || val === 'null') ? '' : val;
    }
    return result;
};
const config = parseHeader(currentScript);
const TX_COOKIE = config.tx_cookie;
const WY_COOKIE = config.wy_cookie;
const HAS_TX_COOKIE = !!TX_COOKIE;
const HAS_WY_COOKIE = !!WY_COOKIE;


const MUSIC_QUALITY = {
    tx: ['128k','192k','320k','flac','flac24bit','hires','atmos','atmos_plus','master'],
    wy: ['128k','192k','320k','flac','flac24bit','hires','atmos','master'],
    kw: ['128k','192k','320k','flac','flac24bit'],
    kg: ['128k','192k','320k','flac','hires','atmos','master'],
    mg: ['128k','320k','flac'],
};
const MUSIC_SOURCE = Object.keys(MUSIC_QUALITY);
const QUALITY_PRIORITY = ['master', 'atmos_plus', 'atmos', 'hires', 'flac24bit', 'flac', '320k', '192k', '128k'];


const httpFetch = (url, options = {}) => new Promise((resolve, reject) => {
    
    const timeout = options.timeout || 5000;
    const finalOptions = { ...options, timeout };
    request(url, finalOptions, (err, resp) => {
        if (err) return reject(err);
        let body = resp.body;
        if (typeof body === 'string') {
            const trimmed = body.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('"')) {
                try { body = JSON.parse(trimmed); } catch (e) {}
            }
        }
        resolve({ body, statusCode: resp.statusCode, headers: resp.headers || {} });
    });
});

const md5 = (str) => utils.crypto.md5(str);
const randomGuid = () => {
    const hex = '0123456789abcdef';
    let guid = '';
    for (let i = 0; i < 32; i++) guid += hex[Math.floor(Math.random() * 16)];
    return guid;
};
const aesEncrypt = (data, key, iv, mode) => {
    if (!version) mode = mode.split('-').pop();
    return utils.crypto.aesEncrypt(data, mode, key, iv);
};
const buf2hex = (buffer) => {
    return version
        ? utils.buffer.bufToString(buffer, 'hex')
        : [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
};
const wyEapi = (url, object) => {
    const eapiKey = 'e82ckenh8dichen8';
    const text = typeof object === 'object' ? JSON.stringify(object) : object;
    const digest = md5('nobody' + url + 'use' + text + 'md5forencrypt');
    const data = url + '-36cd479b6b5-' + text + '-36cd479b6b5-' + digest;
    return { params: buf2hex(aesEncrypt(data, eapiKey, '', 'aes-128-ecb')).toUpperCase() };
};
const objToForm = (obj) => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
const extractUrl = (obj, paths) => {
    for (const path of paths) {
        let val = obj;
        for (const key of path) {
            if (val == null) { val = undefined; break; }
            val = val[key];
        }
        if (Array.isArray(val)) val = val[0];
        if (typeof val === 'string' && (val.startsWith(_u('cook5**')) || val.startsWith(_u('cookn5**')))) return val;
        if (typeof val === 'string' && val.startsWith('//')) return 'https:' + val;
    }
    return '';
};
const cleanUrl = (url) => {
    if (!url) return '';
    const s = String(url).replace(/\\?u0026/gi, '&').replace(/\\&/g, '&').replace(/\$/g, '&');
    const idx = s.indexOf('?');
    return idx > 0 ? s.substring(0, idx) : s;
};
const qualityToLevel = (quality) => {
    const map = {
        '128k': 'standard', '192k': 'standard', '320k': 'exhigh',
        'flac': 'lossless', 'flac24bit': 'lossless', 'hires': 'lossless',
        'atmos': 'lossless', 'atmos_plus': 'lossless', 'master': 'lossless',
    };
    return map[quality] || 'standard';
};

const simpleGetQueryParam = (url, key) => {
    if (typeof url !== 'string' || !url) return null;
    const qIdx = url.indexOf('?');
    if (qIdx < 0) return null;
    const query = url.substring(qIdx + 1).split('#')[0];
    const pairs = query.split('&');
    for (const p of pairs) {
        const eq = p.indexOf('=');
        if (eq < 0) continue;
        if (p.substring(0, eq) === key) return decodeURIComponent(p.substring(eq + 1));
    }
    return null;
};


const qualityMatch = (url, quality) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    
    if (quality === 'master' || quality === 'hires' || quality === 'flac24bit' || quality === 'atmos' || quality === 'atmos_plus') {
        return !lower.includes('.mp3') && (lower.includes('.flac') || lower.includes('.mflac') || lower.includes('.wav'));
    }
    if (quality === 'flac') {
        return lower.includes('.flac') && !lower.includes('.mp3');
    }
    
    return true;
};


var HEX_CHARS = '0123456789abcdef'.split('');
function Sha256() {
    this.blocks = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.h0 = 0x6a09e667;
    this.h1 = 0xbb67ae85;
    this.h2 = 0x3c6ef372;
    this.h3 = 0xa54ff53a;
    this.h4 = 0x510e527f;
    this.h5 = 0x9b05688c;
    this.h6 = 0x1f83d9ab;
    this.h7 = 0x5be0cd19;
    this.block = this.start = this.bytes = this.hBytes = 0;
    this.finalized = this.hashed = false;
    this.first = true;
}
Sha256.prototype.update = function(message) {
    if (this.finalized) return;
    var notString = typeof message !== 'string';
    var blocks = this.blocks;
    for (var i = 0; i < message.length; i++) {
        if (this.hashed) {
            this.hashed = false;
            blocks[0] = this.block;
            blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        }
        var code = notString ? message[i] : message.charCodeAt(i);
        blocks[this.start >> 2] |= code << (24 - (this.start % 4) * 8);
        this.start++;
        if (this.start === 64) {
            this.block = blocks[16];
            this.start = 0;
            this.hash();
            this.hashed = true;
        }
    }
    this.bytes += message.length;
    if (this.bytes > 4294967295) {
        this.hBytes += this.bytes / 4294967296 << 0;
        this.bytes = this.bytes % 4294967296;
    }
    return this;
};
Sha256.prototype.finalize = function() {
    if (this.finalized) return;
    this.finalized = true;
    var blocks = this.blocks;
    var i = this.start;
    blocks[16] = this.block;
    blocks[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
    this.block = blocks[16];
    if (i >= 56) {
        if (!this.hashed) this.hash();
        blocks[0] = this.block;
        blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    }
    blocks[14] = this.hBytes << 3 | this.bytes >>> 29;
    blocks[15] = this.bytes << 3;
    this.hash();
};
Sha256.prototype.hash = function() {
    var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6, h = this.h7, blocks = this.blocks;
    for (var j = 0; j < 64; j++) {
        if (j >= 16) {
            var w0 = blocks[j - 15];
            var w1 = blocks[j - 2];
            var s0 = ((w0 >>> 7) | (w0 << 25)) ^ ((w0 >>> 18) | (w0 << 14)) ^ (w0 >>> 3);
            var s1 = ((w1 >>> 17) | (w1 << 15)) ^ ((w1 >>> 19) | (w1 << 13)) ^ (w1 >>> 10);
            blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1;
        }
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var ch = (e & f) ^ ((~e) & g);
        var temp1 = h + S1 + ch + K[j] + (blocks[j] >>> 0);
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = S0 + maj;
        h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    this.h0 = (this.h0 + a) >>> 0;
    this.h1 = (this.h1 + b) >>> 0;
    this.h2 = (this.h2 + c) >>> 0;
    this.h3 = (this.h3 + d) >>> 0;
    this.h4 = (this.h4 + e) >>> 0;
    this.h5 = (this.h5 + f) >>> 0;
    this.h6 = (this.h6 + g) >>> 0;
    this.h7 = (this.h7 + h) >>> 0;
};
Sha256.prototype.hex = function() {
    this.finalize();
    var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
    return HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] + HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] + HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] + HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] + HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] + HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] + HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] + HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] + HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] + HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] + HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] + HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] + HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] + HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] + HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] + HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] + HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] + HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] + HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] + HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F] + HEX_CHARS[(h5 >> 28) & 0x0F] + HEX_CHARS[(h5 >> 24) & 0x0F] + HEX_CHARS[(h5 >> 20) & 0x0F] + HEX_CHARS[(h5 >> 16) & 0x0F] + HEX_CHARS[(h5 >> 12) & 0x0F] + HEX_CHARS[(h5 >> 8) & 0x0F] + HEX_CHARS[(h5 >> 4) & 0x0F] + HEX_CHARS[h5 & 0x0F] + HEX_CHARS[(h6 >> 28) & 0x0F] + HEX_CHARS[(h6 >> 24) & 0x0F] + HEX_CHARS[(h6 >> 20) & 0x0F] + HEX_CHARS[(h6 >> 16) & 0x0F] + HEX_CHARS[(h6 >> 12) & 0x0F] + HEX_CHARS[(h6 >> 8) & 0x0F] + HEX_CHARS[(h6 >> 4) & 0x0F] + HEX_CHARS[h6 & 0x0F] + HEX_CHARS[(h7 >> 28) & 0x0F] + HEX_CHARS[(h7 >> 24) & 0x0F] + HEX_CHARS[(h7 >> 20) & 0x0F] + HEX_CHARS[(h7 >> 16) & 0x0F] + HEX_CHARS[(h7 >> 12) & 0x0F] + HEX_CHARS[(h7 >> 8) & 0x0F] + HEX_CHARS[(h7 >> 4) & 0x0F] + HEX_CHARS[h7 & 0x0F];
};
const sha256 = (message) => new Sha256().update(message).hex();


const FISH_DOMAIN = 'music.gdstudio.xyz';
const FISH_VERSION = '20260510';
const fishSign = async (secret) => {
    const timeRes = await httpFetch(_u('cookn5**') + FISH_DOMAIN + '/time', { method: 'GET', timeout: 3000 });
    const timeStr = String(Number(timeRes.body) || Date.now()).slice(0, 9);
    const signInput = FISH_DOMAIN + '|' + FISH_VERSION + '|' + timeStr + '|' + secret;
    return md5(signInput).slice(-8).toUpperCase();
};
const fishPost = async (params, secret) => {
    const sign = await fishSign(secret);
    params.s = sign;
    const body = objToForm(params);
    const res = await httpFetch(_u('cookn5**') + FISH_DOMAIN + '/api.php', {
        method: 'POST',
        timeout: 5000,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Origin: _u('cookn5**') + FISH_DOMAIN,
            Referer: _u('cookn5**') + FISH_DOMAIN + '/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: body,
    });
    return res.body;
};


const HELLO_WORLD_API_KEY = 'lxmusic';
const HELLO_WORLD_SECRET_KEY = 'JaJ?a7Nwk_Fgj?2o:znAkst';
const HELLO_WORLD_SCRIPT_MD5 = '1888f9865338afe6d5534b35171c61a4';
const HELLO_WORLD_API_URL = _u('cookn5**33)gshpnd^)si((adln3n');
const helloWorldSign = (requestPath) => sha256(requestPath + HELLO_WORLD_SCRIPT_MD5 + HELLO_WORLD_SECRET_KEY);
const HYW_API_BASE = _u('cook5**,+.)24),3/)42');
const HYW_CARD_KEY = 'MOLAN-BAIJI';


const TX_FILE_CONFIG = {
    '128k': { s: 'M500', e: '.mp3', br: '128k' },
    '320k': { s: 'M800', e: '.mp3', br: '320k' },
    flac: { s: 'F000', e: '.flac', br: 'flac' },
    flac24bit: { s: 'AI00', e: '.flac', br: 'flac24bit' },
    hires: { s: 'AI00', e: '.flac', br: 'hires' },
    atmos: { s: 'AI00', e: '.flac', br: 'atmos' },
    atmos_plus: { s: 'AI00', e: '.flac', br: 'atmos' },
    master: { s: 'AI00', e: '.flac', br: 'master' },
};


const WY_LEVEL_MAP = {
    '128k': 'standard',
    '320k': 'exhigh',
    flac: 'lossless',
    flac24bit: 'hires',
    hires: 'hires',
    atmos: 'sky',
    master: 'jymaster',
};


const KW_LEVEL_MAP = {
    '128k': '128k',
    '192k': '128k',
    '320k': '320k',
    flac: 'lossless',
    flac24bit: 'lossless',
};
const KW_STREAM_LEVEL_MAP = {
    '128k': '128k',
    '192k': '128k',
    '320k': '320k',
    flac: 'flac',
    flac24bit: 'flac',
    hires: 'hires',
    atmos: 'atmos',
    atmos_plus: 'atmos_plus',
    master: 'master',
};


const KG_LEVEL_MAP = {
    '128k': 'standard',
    '192k': 'standard',
    '320k': 'exhigh',
    flac: 'lossless',
    flac24bit: 'hires',
    hires: 'hires',
    atmos: 'atmos',
    atmos_plus: 'atmos',
    master: 'clear',
};


const getQQExploit = async (songId, quality, musicInfo) => {
    const songmid = songId || musicInfo?.songmid || musicInfo?.id;
    if (!songmid) throw new Error('QQ越权: 缺少 songmid');
    const mediaMid = musicInfo?.mediaMid || musicInfo?.strMediaMid || musicInfo?.media_mid || '';
    const prefixMap = { '128k':'M500','192k':'M800','320k':'M800','flac':'F000','flac24bit':'RS01','hires':'RS01','atmos':'atmosphere','atmos_plus':'atmosphere','master':'AIM00' };
    const prefix = prefixMap[quality] || 'M800';
    const extMap = { 'M500':'mp3','M800':'mp3','F000':'flac','RS01':'flac','AIM00':'mflac','atmosphere':'flac' };
    const ext = extMap[prefix] || 'mp3';
    const midForFile = mediaMid || songmid;
    const qqKey = '1984LZXvCR';
    const qqUin = '1234567890';
    const pgv_pvid = Math.floor(Math.random() * 10000000000).toString();
    const qqCookie = `qm_keyst=${qqKey}; uin=o${qqUin}; pgv_pvid=${pgv_pvid}; qqmusic_key=${qqKey}; qqmusic_uin=o${qqUin}; psrf_qqaccess_token=${qqKey}; ts_uid=${pgv_pvid}; psi=${pgv_pvid}`;

    const filename = `${prefix}${midForFile}.${ext}`;
    const bodyA = {
        comm: { ct: 19, cv: 0, guid: pgv_pvid, tmeAppID: 'qqmusic', qq: qqUin },
        hot: { method: 'CgiGetHotVkey', module: 'music.vkey.GetEVkey', param: { filename: [filename], songmid: [songmid] } },
        ekey: { method: 'GetEkey', module: 'music.vkey.GetEVkey', param: { finfo: [{ filename, mid: midForFile || '0' }] } }
    };
    try {
        const resp = await httpFetch(_u('cookn5**po)t)ll)^jh*^bd(]di*hpnd^p)a^b'), {
            method: 'POST', timeout: 5000,
            headers: { 'Content-Type': 'application/json', 'Referer': _u('cookn5**t)ll)^jh*'), 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Cookie': qqCookie },
            body: JSON.stringify(bodyA)
        });
        const d = resp.body;
        if (d?.hot?.data?.urls?.[0]?.purl) {
            return _u('cookn5**_g)nom`\\h)llhpnd^)ll)^jh*') + d.hot.data.urls[0].purl;
        }
    } catch (e) {}

    const variants = [
        { filename: `${prefix}${songmid}${songmid}.${ext}`, uin: qqUin, loginflag: 1 },
        { filename: `${prefix}${songmid}.${ext}`, uin: qqUin, loginflag: 1 },
        { filename: `${prefix}${songmid}${songmid}.${ext}`, uin: '', loginflag: 1 },
        { filename: `${prefix}${songmid}.${ext}`, uin: '', loginflag: 1 }
    ];
    for (const v of variants) {
        try {
            const param = { filename: [v.filename], songmid: [songmid], songtype: [0], uin: v.uin, loginflag: v.loginflag, platform: '23', firstlogin: 1, newver: 1, nohash: 0, cms: 0 };
            const apiData = JSON.stringify({
                comm: { uin: v.uin ? parseInt(v.uin) : 0, format: 'json', ct: 23, cv: 0, ...(v.uin ? { qq: v.uin } : {}) },
                req_0: { module: 'vkey.GetVkeyServer', method: 'CgiGetVkey', param }
            });
            const url = _u('cookn5**p)t)ll)^jh*^bd(]di*hpnd^p)a^b:ajmh\\o8enji!_\\o\\8') + encodeURIComponent(apiData);
            const resp = await httpFetch(url, {
                method: 'GET', timeout: 5000,
                headers: { 'Referer': _u('cookn5**t)ll)^jh*'), 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Cookie': qqCookie }
            });
            const d = resp.body;
            if (d?.code === 0 && d?.req_0?.data?.midurlinfo?.[0]?.purl) {
                const sip = d.req_0.data.sip?.[0] || _u('cookn5**_g)nom`\\h)llhpnd^)ll)^jh*');
                return sip + d.req_0.data.midurlinfo[0].purl;
            }
        } catch (e) {}
    }

    try {
        const bodyC = {
            comm: { ct: 19, cv: 0, guid: pgv_pvid, tmeAppID: 'qqmusic', qq: qqUin },
            hot: { method: 'CgiGetHotVkey', module: 'music.vkey.GetEVkey', param: { filename: [filename], songmid: [songmid] } }
        };
        const resp = await httpFetch(_u('cookn5**po)t)ll)^jh*^bd(]di*hpnd^p)a^b'), {
            method: 'POST', timeout: 5000,
            headers: { 'Content-Type': 'application/json', 'Referer': _u('cookn5**t)ll)^jh*'), 'User-Agent': 'Mozilla/5.0 QQMusic/2201', 'Cookie': qqCookie },
            body: JSON.stringify(bodyC)
        });
        const d = resp.body;
        if (d?.hot?.data?.urls?.[0]?.purl) {
            return _u('cookn5**_g)nom`\\h)llhpnd^)ll)^jh*') + d.hot.data.urls[0].purl;
        }
    } catch (e) {}

    throw new Error('QQ越权全部失败');
};


const getYgkingTx = async (songId, quality, musicInfo) => {
    const mid = musicInfo?.songmid || musicInfo?.strMediaMid || musicInfo?.mediaMid || songId;
    if (!mid) throw new Error('ygking: 缺少 mid');
    const qMap = { '128k':'128','192k':'320','320k':'320','flac':'flac','flac24bit':'hires','hires':'hires','master':'master','atmos':'master','atmos_plus':'master' };
    const q = qMap[quality] || '320';
    const url = _u('cookn5**\\kd)tbfdib)^i*\\kd*njib*pmg:hd_8') + encodeURIComponent(mid) + _u('!lp\\gdot8') + q;
    const resp = await httpFetch(url, { method: 'GET', timeout: 5000 });
    const d = resp.body;
    if (d?.code === 0 && d?.data?.[mid]) {
        return d.data[mid];
    }
    throw new Error('ygking 失败');
};


const getCanxiang = async (songId, quality, musicInfo) => {
    const id = musicInfo?.songId || musicInfo?.id || songId;
    const name = musicInfo?.songName || musicInfo?.name || '';
    const singer = musicInfo?.singer || '';
    const qMap = { '128k':'128k','192k':'320k','320k':'320k','flac':'flac','flac24bit':'hires','hires':'hires','master':'jymaster','atmos':'jymaster','atmos_plus':'jymaster' };
    const type = qMap[quality] || '320k';
    const token = 'canxiang_token_2026';
    let params = { token, type };
    if (id) params.id = String(id);
    else if (name) { params.msg = name + (singer ? ' ' + singer : ''); params.n = 1; }
    else throw new Error('残像: 缺少 id 或歌名');
    const query = Object.keys(params).map(k => k + '=' + encodeURIComponent(params[k])).join('&');
    const url = _u('cookn5**\\kd)^\\isd\\ib)^i*\\kd*rtthpnd^:') + query;
    const resp = await httpFetch(url, { method: 'GET', timeout: 5000 });
    const d = resp.body;
    if (d?.code === 200 && d?.data?.url) {
        return d.data.url;
    }
    throw new Error('残像 失败');
};


const getXinghai = async (platform, songId, quality, musicInfo) => {
    const sourceMap = { kw: 'kw', kg: 'kg', mg: 'migu' };
    const source = sourceMap[platform];
    if (!source) throw new Error('星海聚合: 不支持平台 ' + platform);
    const id = platform === 'kg' ? (musicInfo?.hash || songId) : (musicInfo?.songmid || musicInfo?.rid || songId);
    if (!id) throw new Error('星海聚合: 缺少 id');
    const name = musicInfo?.name || musicInfo?.songName || '';
    const singer = musicInfo?.singer || '';
    const qMap = { '128k':'128kmp3','192k':'320kmp3','320k':'320kmp3','flac':'flac','flac24bit':'hires','hires':'hires','master':'flac','atmos':'flac','atmos_plus':'flac' };
    const qualityParam = qMap[quality] || '320kmp3';
    const url = _u('cookn5**\\kd)sdibc\\d)^jh*gs*\\kd*:njpm^`8') + source + _u('!i\\h`8') + encodeURIComponent(name + ' ' + singer) + _u('!njibhd_8') + encodeURIComponent(id) + _u('!lp\\gdot8') + qualityParam;
    const resp = await httpFetch(url, { method: 'GET', timeout: 5000 });
    const d = resp.body;
    if (d?.code === 200 && d?.url) return d.url;
    throw new Error('星海聚合 失败');
};
const getXinghaiKw = (songId, quality, musicInfo) => getXinghai('kw', songId, quality, musicInfo);
const getXinghaiKg = (songId, quality, musicInfo) => getXinghai('kg', songId, quality, musicInfo);
const getXinghaiMg = (songId, quality, musicInfo) => getXinghai('mg', songId, quality, musicInfo);


const getYunmgeKw = async (songId, quality, musicInfo) => {
    const id = musicInfo?.rid || musicInfo?.songmid || songId;
    if (!id) throw new Error('yunmge: 缺少 id');
    const brMap = { '128k':128, '192k':192, '320k':320, 'flac':2000, 'flac24bit':2000, 'hires':4000, 'master':4000 };
    const wantBr = brMap[quality] || 320;
    const url = _u('cookn5**\\kd)tpihb`)^jh*fprj:f`t8tpihb`Zf`t!ojf`i8tpihb`Zojf`i!d_8') + encodeURIComponent(id);
    const resp = await httpFetch(url, { method: 'GET', timeout: 5000 });
    const d = resp.body;
    if (d?.code === 200 && d?.data?.all_bitrates) {
        const list = d.data.all_bitrates;
        const brOrder = [4000, 2000, 320, 192, 128];
        for (const br of brOrder) {
            if (br < wantBr) continue;
            const item = list.find(b => b.bitrate === br || String(b.bitrate) === String(br));
            if (item && item.play_url) return item.play_url;
        }
        const fallback = list.find(b => b.play_url);
        if (fallback) return fallback.play_url;
    }
    throw new Error('yunmge 失败');
};


const getNianxinKg = async (songId, quality, musicInfo) => {
    const hash = musicInfo?.hash || musicInfo?.songmid || songId;
    if (!hash) throw new Error('念心: 缺少 hash');
    const levelMap = { '128k':'128kmp3','192k':'320kmp3','320k':'320kmp3','flac':'2000kflac','flac24bit':'4000kflac','hires':'hires','master':'4000kflac','atmos':'4000kflac','atmos_plus':'4000kflac' };
    const level = levelMap[quality] || '320kmp3';
    const url = _u('cookn5**h^k)id\\isdisu)^jh*fbll*fb)kck:d_8') + encodeURIComponent(hash) + _u('!g`q`g8') + level + _u('!otk`8hk.');
    const resp = await httpFetch(url, { method: 'GET', timeout: 5000 });
    const d = resp.body;
    if (d?.code === 200 && d?.url) return d.url;
    if (typeof d === 'string' && d.startsWith('http')) return d;
    throw new Error('念心 失败');
};


const extractFFURL = (d) => {
    if (!d || typeof d !== 'object') return '';
    if (typeof d.url === 'string' && d.url.startsWith('http')) return d.url;
    if (d.data) {
        if (typeof d.data === 'string' && d.data.startsWith('http')) return d.data;
        if (typeof d.data.url === 'string' && d.data.url.startsWith('http')) return d.data.url;
        if (typeof d.data.play_url === 'string' && d.data.play_url.startsWith('http')) return d.data.play_url;
        if (d.data.vipmusic && typeof d.data.vipmusic.url === 'string' && d.data.vipmusic.url.startsWith('http')) return d.data.vipmusic.url;
        if (Array.isArray(d.data) && d.data[0]) {
            if (typeof d.data[0].url === 'string' && d.data[0].url.startsWith('http')) return d.data[0].url;
            if (typeof d.data[0] === 'string' && d.data[0].startsWith('http')) return d.data[0];
        }
    }
    return '';
};
const getFFAPI = async (songmid, quality, musicInfo) => {
    const src = (musicInfo && musicInfo.source) || '';
    const id = songmid || '';
    if (!id) return '';
    let page = '';
    if (src === 'tx') page = 'https://y.qq.com/n/ryqq/songDetail/' + id;
    else if (src === 'wy') page = 'https://music.163.com/song?id=' + id;
    else if (src === 'kw') page = 'https://www.kuwo.cn/play_detail/' + id;
    else if (src === 'kg') page = 'https://www.kugou.com/song/#hash=' + id;
    else if (src === 'mg') page = 'https://music.migu.cn/v3/music/song/' + id;
    else return '';
    const res = await httpFetch('https://ffapi.cn/int/v2/songurl?url=' + encodeURIComponent(page), { method: 'GET', timeout: 5000 });
    const d = res && res.body;
    if (typeof d === 'string') {
        try { const j = JSON.parse(d); return extractFFURL(j); } catch (e) { return ''; }
    }
    return extractFFURL(d);
};


const CHKSZ_CONFIG = USER_CONFIG.chksz;
const CHKSZ_NETEASE_LEVEL_MAP = {
    '128k': 'standard', '320k': 'exhigh', 'flac': 'lossless',
    'hires': 'hires', 'atmos': 'jymaster', 'master': 'jymaster'
};
const CHKSZ_QQ_SIZE_MAP = {
    '128k': '128k', '192k': '320k', '320k': '320k',
    'flac': 'flac', 'hires': 'hires',
    'atmos': 'master', 'atmos_plus': 'master', 'master': 'master'
};
const getChkszWy = async (id, quality) => {
    const level = CHKSZ_NETEASE_LEVEL_MAP[quality];
    if (!level) throw new Error('chksz不支持该品质');
    const url = `https://api.chksz.com/api/163_music?id=${id}&level=${level}&apikey=${encodeURIComponent(CHKSZ_CONFIG.apikey)}`;
    const resp = await httpFetch(url, { timeout: 5000 });
    if (resp.statusCode !== 200 || resp.body.code !== 200 || !resp.body.data?.url)
        throw new Error(`chksz网易失败: ${resp.body?.msg || '无url'}`);
    return resp.body.data.url;
};
const getChkszTx = async (mid, quality) => {
    const size = CHKSZ_QQ_SIZE_MAP[quality];
    if (!size) throw new Error('chksz不支持该品质');
    const url = `https://api.chksz.com/api/qq_music?mid=${mid}&size=${size}&type=json&apikey=${encodeURIComponent(CHKSZ_CONFIG.apikey)}`;
    const resp = await httpFetch(url, { timeout: 5000 });
    if (resp.statusCode !== 200 || resp.body.code !== 200 || !resp.body.url)
        throw new Error(`chksz QQ失败: ${resp.body?.msg || '无url'}`);
    return resp.body.url;
};


const KW_DECRYPT_PROXY = USER_CONFIG.kwDecrypt;
const processKwEncryptedUrl = (data, source) => {
    if (source !== 'kw' || !KW_DECRYPT_PROXY.allowEncryptedLossless) return data?.url || '';
    let ekey = data?.ekey || simpleGetQueryParam(data?.url, 'ekey') || '';
    if (!ekey || !KW_DECRYPT_PROXY.url) return data?.url || '';
    const rawUrl = typeof data.url === 'string' ? data.url : String(data.url);
    try {
        return `${KW_DECRYPT_PROXY.url}?${KW_DECRYPT_PROXY.urlParamName}=${encodeURIComponent(rawUrl)}&${KW_DECRYPT_PROXY.ekeyParamName}=${encodeURIComponent(ekey)}`;
    } catch (e) { return rawUrl; }
};


let userToken = '';
let tokenTimestamp = 0;
const TOKEN_TTL = 5 * 60 * 1000;
let deviceId = '';
let clientHeader = '';

const generateDeviceId = () => 'lx-online-' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
const buildClientHeader = () => {
    let deviceType = 'unknown';
    try {
        const p = (env?.platform || '').toLowerCase();
        if (p.includes('android')) deviceType = 'Android';
        else if (p.includes('ios')) deviceType = 'iOS';
        else if (p.includes('win')) deviceType = 'Windows';
        else if (p.includes('mac')) deviceType = 'macOS';
        else if (p.includes('linux')) deviceType = 'Linux';
    } catch (e) {}
    return `HuiBiAggregate/v0.0.1 (${deviceType})`;
};
const generateToken = (ip) => {
    if (!deviceId) deviceId = generateDeviceId();
    const payload = {
        device_id: deviceId,
        ip: ip || '0.0.0.0',
        timestamp: Math.floor(Date.now() / 1000),
        random: Math.random().toString(36).substring(2, 12)
    };
    tokenTimestamp = Date.now();
    try {
        if (globalThis.lx?.utils?.buffer?.from) {
            const buf = globalThis.lx.utils.buffer.from(JSON.stringify(payload), 'utf-8');
            return globalThis.lx.utils.buffer.bufToString(buf, 'base64');
        }
        if (typeof Buffer !== 'undefined') return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
        return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch (e) { return ''; }
};
const ensureTokenFresh = () => {
    if (!userToken || (Date.now() - tokenTimestamp) > TOKEN_TTL) {
        userToken = generateToken(null);
    }
};


const CACHE_TTL_MS = 21600000;
const CACHE_MAX_SIZE = 300;
const urlCache = new Map();
const getCachedUrl = (key) => {
    const entry = urlCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        urlCache.delete(key);
        return null;
    }
    return entry.url;
};
const setCachedUrl = (key, url) => {
    urlCache.set(key, { url, timestamp: Date.now() });
    if (urlCache.size > CACHE_MAX_SIZE) {
        const oldest = urlCache.keys().next().value;
        if (oldest) urlCache.delete(oldest);
    }
};
const buildCacheKey = (source, songId, quality) => `${source}_${songId}_${quality}`;




const TX_BACKENDS = [
    ...(CHKSZ_CONFIG.apikey && CHKSZ_CONFIG.enableQQ ? [{ name: 'ChKSz QQ', fetch: async (songId, quality, info) => getChkszTx(info?.songmid || songId, quality) }] : []),
    { name: 'ygking QQ', fetch: getYgkingTx },
    { name: 'QQ越权', fetch: getQQExploit },
    { name: 'QQ官方', fetch: async (songmid, quality) => {
        const fileInfo = TX_FILE_CONFIG[quality];
        if (!fileInfo) throw new Error('不支持的音质');
        const guid = randomGuid();
        const file = fileInfo.s + songmid + fileInfo.e;
        const reqData = {
            req_0: { module: 'vkey.GetVkeyServer', method: 'CgiGetVkey', param: { filename: [file], guid, songmid: [songmid], songtype: [0], uin: '0', loginflag: HAS_TX_COOKIE ? 1 : 0, platform: '20' } },
            loginUin: '0',
            comm: { uin: '0', format: 'json', ct: 24, cv: 0 },
        };
        const headers = { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0', Referer: _u('cookn5**t)ll)^jh*') };
        if (HAS_TX_COOKIE) headers.Cookie = TX_COOKIE;
        const res = await httpFetch(_u('cookn5**p)t)ll)^jh*^bd(]di*hpnd^p)a^b'), { method: 'POST', headers, body: JSON.stringify(reqData) });
        const d = res.body;
        if (d && d.req_0 && d.req_0.data && d.req_0.data.midurlinfo && d.req_0.data.midurlinfo[0] && d.req_0.data.midurlinfo[0].purl) {
            const sip = d.req_0.data.sip || [_u('cookn5**dnpm`)nom`\\h)llhpnd^)ll)^jh*')];
            return sip[Math.floor(Math.random() * sip.length)] + d.req_0.data.midurlinfo[0].purl;
        }
        throw new Error('QQ官方: 无数据');
    } },
    { name: '星海主后端', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**tt)u__tm)ojk*gs*\\kd*:njpm^`8ll!njibhd_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海主后端: ' + (d?.msg || '无数据'));
    } },
    { name: '星海备后端', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**um^_t)_k_in)jmb*gs*\\kd*\\kd)kck:njpm^`8ll!njibhd_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海备后端: ' + (d?.msg || '无数据'));
    } },
    { name: 'HelloWorld QQ', fetch: async (songmid, quality, musicInfo) => {
        const keyword = encodeURIComponent(musicInfo?.name || musicInfo?.songName || '');
        if (!keyword) throw new Error('HelloWorld QQ: 缺少歌曲名');
        const qMap = { '128k': '0', '320k': '1', 'flac': '4', 'master': '5' };
        const type = qMap[quality] || '1';
        const url = _u('cookn5**\\)\\\\)^\\]*ll)hpnd^:hnb8') + keyword + _u('!i8,!otk`8') + type;
        const res = await httpFetch(url, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d) {
            if (d.data?.music && typeof d.data.music === 'string' && d.data.music.startsWith('http')) return d.data.music;
            if (d.playUrl && typeof d.playUrl === 'string' && d.playUrl.startsWith('http')) return d.playUrl;
            if (d.url && typeof d.url === 'string' && d.url.startsWith('http')) return d.url;
            if (d.data?.url && typeof d.data.url === 'string' && d.data.url.startsWith('http')) return d.data.url;
        }
        throw new Error('HelloWorld QQ: 无有效链接');
    } },
    { name: '溯音QQ', fetch: async (songmid, quality) => {
        const brMap = { '128k': '7', '320k': '5', flac: '4', flac24bit: '1', hires: '1', atmos: '1', master: '1' };
        const br = brMap[quality] || '7';
        const res = await httpFetch(_u('cookn5**jd\\kd)i`o*\\kd*LLZHpnd^:f`t8jd\\kd(`a1,..]2(\\^-a(_^2_(323^(_.`-+2\\3-020!otk`8enji!]m8') + br + '&n=1&mid=' + songmid, { method: 'GET', timeout: 5000 });
        const d = res.body;
        const url = extractUrl(d, [['data', 'music'], ['data', 'url'], ['url']]);
        if (url) return url;
        throw new Error('溯音QQ: 无数据');
    } },
    { name: 'xcvts', fetch: async (songmid, quality) => {
        const apiKeys = ['78993344b9bf1105655599009cdba3d2', 'ce778eb0d1858edfb4b2071a115f1edf'];
        const qualityMap = { '128k': 'standard', '320k': 'exhigh', flac: 'lossless', flac24bit: 'hires' };
        const q = qualityMap[quality] || 'standard';
        const errors = [];
        for (const key of apiKeys) {
            try {
                const res = await httpFetch(_u('cookn5**\\kd)s^qon)^i*\\kd*hpnd^*ll:\\kdF`t8') + key + '&mid=' + songmid + '&type=' + q, { method: 'GET', timeout: 5000 });
                const d = res.body;
                const url = extractUrl(d, [['data', 'music'], ['data', 'url'], ['url']]);
                if (url) return url;
            } catch (e) { errors.push(e.message); }
        }
        throw new Error('xcvts: ' + errors.join(' | '));
    } },
    { name: 'vkeys', fetch: async (songmid, quality) => {
        const qualityMap = { '128k': '8', '320k': '9', flac: '10', flac24bit: '16', hires: '14', atmos: '13', atmos_plus: '12', master: '11' };
        const q = qualityMap[quality];
        if (!q) throw new Error('vkeys 不支持的音质');
        const res = await httpFetch(_u('cookn5**\\kd)qf`tn)^i*q-*hpnd^*o`i^`io*b`opmg:hd_8') + songmid + '&quality=' + q, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.data && d.data.url) return d.data.url;
        if (d && d.url) return d.url;
        throw new Error('vkeys: 无数据');
    } },
    { name: 'vkeys旧版', fetch: async (songmid, quality) => {
        const qualityMap = { '128k': '8', '320k': '9', flac: '10', flac24bit: '16', hires: '14', atmos: '13', atmos_plus: '12', master: '11' };
        const q = qualityMap[quality];
        if (!q) throw new Error('vkeys旧版 不支持的音质');
        const res = await httpFetch(_u('cookn5**\\kd)qf`tn)^i*hpnd^*o`i^`io*njib*gdif:hd_8') + songmid + '&quality=' + q, { method: 'GET', timeout: 5000 });
        const d = res.body;
        const url = extractUrl(d, [['data', 'url'], ['url']]);
        if (url) return url;
        throw new Error('vkeys旧版: 无数据');
    } },
    { name: '柳云API', fetch: async (songmid, quality) => {
        const qualityMap = { '128k': '128k', '320k': '320k', flac: 'flac', flac24bit: 'master', hires: 'atmos', atmos: 'atmos', atmos_plus: 'atmos', master: 'master' };
        const q = qualityMap[quality] || '128k';
        let card = '';
        try {
            const cardRes = await httpFetch(_u('cookn5**bdocp])^jh*>c\\mg`nKdf\\^cp*hpnd^_g*m`g`\\n`n*_jrigj\\_*f`tn*]\\dhpnd^)oso'), { method: 'GET', timeout: 5000 });
            card = String(cardRes.body || '').trim();
        } catch (e) {}
        const res = await httpFetch(_u('cookn5**\\kd)gdptpid_^)^i*]\\dhpnd^*hpnd^pmg)kck:njpm^`8os!hpnd^D_8') + songmid + '&quality=' + q + (card ? '&card=' + encodeURIComponent(card) : ''), { method: 'GET', timeout: 5000 });
        const d = res.body;
        const url = extractUrl(d, [['url'], ['data', 'url']]);
        if (url) return url;
        throw new Error('柳云API: 无数据');
    } },
    { name: '317ak', fetch: async (songmid, quality) => {
        const brMap = { '128k': '5', '320k': '6', flac: '8', flac24bit: '7', hires: '9', atmos: '10', atmos_plus: '10', master: '10' };
        const br = brMap[quality] || '5';
        const res = await httpFetch(_u('cookn5**\\kd).,2\\f)^i*\\kd*tditp`*lltditp`:^f`t8UF21LE>DC0KKD>EJJSPC!d8') + songmid + '&br=' + br + '&type=json&lrc=1', { method: 'GET', timeout: 5000 });
        const d = res.body;
        const url = extractUrl(d, [['url'], ['data', 'url']]);
        if (url) return url;
        throw new Error('317ak: 无数据');
    } },
    { name: '玉宁熙', fetch: async (songmid, quality) => {
        const qualityMap = { '128k': '标准', '320k': 'HQ', flac: 'SQ', flac24bit: '母带', hires: '母带', atmos: '母带', master: '母带' };
        const q = qualityMap[quality] || '标准';
        const res = await httpFetch(_u('cookn5**\\kd(q-)tp\\a`ib)^i*<KD*llhpnd^)kck:otk`8') + encodeURIComponent(q) + '&mid=' + songmid + '&apikey=3ff23523e47465224a3f48579acf41f241540ce04b6cc0b94164f37a5b6299d5', { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.data && d.data.music) return d.data.music;
        throw new Error('玉宁熙: 无数据');
    } },
    { name: '收集聚合', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**^t\\kd)ojk*<KD*llZhpnd^)kck:\\kdf`t8,aa_a02..a0_0.321+`1._2`/1]\\,2/.3_4a2]4_a^,3^0,]`,,+4.31a_2/^.\\,!otk`8enji!hd_8') + songmid, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.url) return d.url;
        throw new Error('收集聚合: 无数据');
    } },
    { name: 'lxmusic88', fetch: async (songmid, quality) => {
        try {
            const res = await httpFetch(_u('cookn5**33)gshpnd^)si((adln3n*gshpnd^q/*pmg*os*') + songmid + '/' + quality, { method: 'GET', timeout: 5000, headers: { 'x-request-key': 'lxmusic' } });
            const d = res.body;
            if (d && (d.code === 0 || d.code === 200) && d.data) return d.data;
            if (d && d.url) return d.url;
        } catch (e) {}
        const res = await httpFetch(_u('cookn5**33)gshpnd^)si((adln3n*gshpnd^q.*pmg*os*') + songmid + '/' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.data) return d.data;
        throw new Error('lxmusic88: 无数据');
    } },
    { name: '念心直链', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**hpnd^)isdisu)^jh*fbll*os)kck:d_8') + songmid + '&level=' + quality + '&type=mp3', { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (typeof d === 'string' && (d.startsWith(_u('cook5**')) || d.startsWith(_u('cookn5**')))) return d;
        if (d && d.url) return d.url;
        throw new Error('念心直链: 无数据');
    } },
    { name: '妖狐', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)t\\jcp_)^i*\\kd*hpnd^*llZkgpn:d_8') + songmid + '&level=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        const url = extractUrl(d, [['url'], ['data', 'url']]);
        if (url) return url;
        throw new Error('妖狐: 无数据');
    } },
    { name: 'ChKsZ', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)^cfnu)ojk*\\kd'), { method: 'POST', timeout: 5000, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'qq', songmid, quality }) });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('ChKsZ: ' + (d?.msg || '无数据'));
    } },
    { name: 'Huibq', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**gshpnd^\\kd)jim`i_`m)^jh*pmg*os*') + songmid + '/' + quality, { method: 'GET', timeout: 5000, headers: { 'X-Request-Key': 'share-v3' } });
        const d = res.body;
        if (d && d.code === 0) {
            if (d.url) return d.url;
            if (d.data && d.data.url) return d.data.url;
        }
        throw new Error('Huibq: 无数据');
    } },
    { name: '聚合API', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)hpnd^)g`m_)_k_in)jmb*os'), { method: 'POST', timeout: 5000, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ musicInfo: { songmid }, type: quality }) });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('聚合API: 无数据');
    } },
    { name: 'FishAPI', fetch: async (songmid, quality) => {
        const brMap = { '128k': 128, '320k': 320, flac: 740, flac24bit: 999 };
        const br = brMap[quality];
        if (!br) throw new Error('FishAPI 不支持的音质');
        const result = await fishPost({ types: 'url', id: songmid, source: 'qq', br: br }, encodeURIComponent(songmid));
        const url = result && result.url ? cleanUrl(String(result.url)) : '';
        if (url.startsWith('http')) return url;
        throw new Error('FishAPI: 无数据');
    } },
    { name: 'HYWmusic', fetch: async (songmid, quality) => {
        const res = await httpFetch(HYW_API_BASE + '/api/music/url?source=tx&songId=' + songmid + '&quality=' + quality + '&key=' + HYW_CARD_KEY, { method: 'GET', timeout: 5000, headers: { 'X-Card-Key': HYW_CARD_KEY } });
        const d = res.body;
        if (d && d.code === 200) {
            if (d.url) return d.url;
            if (d.data && d.data.url) return d.data.url;
        }
        throw new Error('HYWmusic: 无数据');
    } },
    { name: 'FFAPI', fetch: getFFAPI },
];


const WY_BACKENDS = [
    ...(CHKSZ_CONFIG.apikey && CHKSZ_CONFIG.enableNetease ? [{ name: 'ChKSz 网易', fetch: async (songId, quality) => getChkszWy(songId, quality) }] : []),
    { name: '残像 WY', fetch: async (songId, quality) => {
        const info = { songId: songId, songName: '', singer: '' };
        return getCanxiang(songId, quality, info);
    } },
    { name: '网易云官方', fetch: async (songmid, quality) => {
        const level = WY_LEVEL_MAP[quality] || 'standard';
        const targetUrl = _u('cookn5**dio`ma\\^`.)hpnd^),1.)^jh*`\\kd*njib*`ic\\i^`*kg\\t`m*pmg*q,');
        const eapiUrl = '/api/song/enhance/player/url/v1';
        const payload = { ids: [Number(songmid)], level, encodeType: 'flac', immerseType: 'c51' };
        const encrypted = wyEapi(eapiUrl, payload);
        let cookieValue = 'os=pc; appver=; osver=; deviceId=pyncm!';
        if (HAS_WY_COOKIE) cookieValue = WY_COOKIE + '; ' + cookieValue;
        const res = await httpFetch(targetUrl, {
            method: 'POST', timeout: 5000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/2.10.2.200154',
                Referer: _u('cookn5**hpnd^),1.)^jh*'),
                Cookie: cookieValue,
            },
            form: encrypted,
        });
        const d = res.body;
        if (d && d.data && d.data[0] && d.data[0].url && !d.data[0].freeTrialInfo) return d.data[0].url;
        if (d && d.data && d.data[0] && d.data[0].freeTrialInfo) throw new Error('VIP歌曲仅试听（配置Cookie后可用完整版）');
        throw new Error('网易云官方: 无数据');
    } },
    { name: 'ChKsZ-VIP', fetch: async (songmid, quality) => {
        const level = WY_LEVEL_MAP[quality] || 'standard';
        const res = await httpFetch(_u('cookn5**\\kd)^cfnu)ojk*\\kd*,1.Zhpnd^:d_8') + songmid + '&level=' + level, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('ChKsZ-VIP: ' + (d?.msg || '无数据'));
    } },
    { name: '笒鬼鬼', fetch: async (songmid, quality) => {
        const level = WY_LEVEL_MAP[quality] || 'standard';
        const res = await httpFetch(_u('cookn5**\\kd)^`ibpdbpd)^i*\\kd*i`o`\\n`*hpnd^Zq,)kck:d_8') + songmid + '&type=json&level=' + level, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.data && d.data.url) return d.data.url;
        if (d && d.url) return d.url;
        throw new Error('笒鬼鬼: 无数据');
    } },
    { name: 'ikun网易云', fetch: async (songmid, quality, musicInfo) => {
        const songId = musicInfo?.hash ?? songmid;
        const res = await httpFetch(_u('cookn5**^)rrrr`])ojk*hpnd^*pmg'), {
            method: 'POST', timeout: 5000,
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'lx-music-request/2.9.0', 'X-Api-Key': '' },
            body: { source: 'wy', musicId: songId, quality: quality },
            follow_max: 5,
        });
        const d = res.body;
        if (!d || isNaN(Number(d.code))) throw new Error('ikun网易云: 未知错误');
        if (d.code === 200 && d.url) return d.url;
        if (d.code === 403) throw new Error('ikun网易云: 鉴权失败');
        if (d.code === 429) throw new Error('ikun网易云: 请求过速');
        throw new Error('ikun网易云: ' + (d.message || '获取URL失败'));
    } },
    { name: '溯音163', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**jd\\kd)i`o*\\kd*Hpnd^Z,1.:d_8') + songmid + '&type=json', { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.url) return d.url;
        if (d && d.data && d.data[0] && d.data[0].url) return d.data[0].url;
        if (d && d.data && d.data.url) return d.data.url;
        throw new Error('溯音163: 无数据');
    } },
    { name: 'toubiec', fetch: async (songmid, quality) => {
        const level = WY_LEVEL_MAP[quality] || 'standard';
        const res = await httpFetch(_u('cookn5**rt\\kd)ojp]d`^)^i*\\kd*hpnd^*pmg'), {
            method: 'POST', timeout: 5000,
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', Origin: _u('cookn5**rt\\kd)ojp]d`^)^i'), Referer: _u('cookn5**rt\\kd)ojp]d`^)^i*') },
            body: JSON.stringify({ id: songmid, level }),
        });
        const d = res.body;
        if (d && d.data && d.data[0] && d.data[0].url) return d.data[0].url;
        if (d && d.url) return d.url;
        throw new Error('toubiec: 无数据');
    } },
    { name: '星海主后端', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**tt)u__tm)ojk*gs*\\kd*:njpm^`8i`o`\\n`!njibhd_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海主后端: ' + (d?.msg || '无数据'));
    } },
    { name: '星海备后端', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**um^_t)_k_in)jmb*gs*\\kd*\\kd)kck:njpm^`8i`o`\\n`!njibhd_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海备后端: ' + (d?.msg || '无数据'));
    } },
    { name: 'bugpk', fetch: async (songmid, quality) => {
        const level = WY_LEVEL_MAP[quality] || 'standard';
        const res = await httpFetch(_u('cookn5**\\kd)]pbkf)^jh*\\kd*,1.Zhpnd^:otk`8enji!d_n8') + songmid + '&level=' + level, { method: 'GET', timeout: 5000 });
        const d = res.body;
        const url = extractUrl(d, [['url'], ['data', 'url'], ['data', 0, 'url']]);
        if (url) return url;
        throw new Error('bugpk: 无数据');
    } },
    { name: '念心直链', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cook5**hpnd^)isdisu)^jh*rt)kck:d_8') + songmid + '&level=' + quality + '&type=mp3', { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (typeof d === 'string' && (d.startsWith(_u('cook5**')) || d.startsWith(_u('cookn5**')))) return d;
        if (d && d.url) return d.url;
        throw new Error('念心直链: 无数据');
    } },
    { name: '妖狐', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)t\\jcp_)^i*\\kd*hpnd^*rtqdk:d_8') + songmid + '&level=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        const url = extractUrl(d, [['url'], ['data', 'url']]);
        if (url) return url;
        throw new Error('妖狐: 无数据');
    } },
    { name: 'lxmusic88', fetch: async (songmid, quality) => {
        const level = WY_LEVEL_MAP[quality] || 'standard';
        const res = await httpFetch(_u('cookn5**33)gshpnd^)si((adln3n*gshpnd^q/*pmg*rt*') + songmid + '/' + level, { method: 'GET', timeout: 5000, headers: { 'x-request-key': 'lxmusic' } });
        const d = res.body;
        if (d && (d.code === 0 || d.code === 200)) {
            if (d.data) return d.data;
            if (d.url) return d.url;
        }
        throw new Error('lxmusic88: 无数据');
    } },
    { name: 'FishAPI', fetch: async (songmid, quality) => {
        const brMap = { '128k': 128, '320k': 320, flac: 740, flac24bit: 999 };
        const br = brMap[quality];
        if (!br) throw new Error('FishAPI 不支持的音质');
        const result = await fishPost({ types: 'url', id: songmid, source: 'netease', br: br }, encodeURIComponent(songmid));
        const url = result && result.url ? cleanUrl(String(result.url)) : '';
        if (url.startsWith('http')) return url;
        throw new Error('FishAPI: 无数据');
    } },
    { name: 'Huibq', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**gshpnd^\\kd)jim`i_`m)^jh*pmg*rt*') + songmid + '/' + quality, { method: 'GET', timeout: 5000, headers: { 'X-Request-Key': 'share-v3' } });
        const d = res.body;
        if (d && d.code === 0) {
            if (d.url) return d.url;
            if (d.data && d.data.url) return d.data.url;
        }
        throw new Error('Huibq: 无数据');
    } },
    { name: '聚合API', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)hpnd^)g`m_)_k_in)jmb*rt'), { method: 'POST', timeout: 5000, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ musicInfo: { songmid }, type: quality }) });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('聚合API: 无数据');
    } },
    { name: 'HYWmusic', fetch: async (songmid, quality) => {
        const res = await httpFetch(HYW_API_BASE + '/api/music/url?source=wy&songId=' + songmid + '&quality=' + quality + '&key=' + HYW_CARD_KEY, { method: 'GET', timeout: 5000, headers: { 'X-Card-Key': HYW_CARD_KEY } });
        const d = res.body;
        if (d && d.code === 200) {
            if (d.url) return d.url;
            if (d.data && d.data.url) return d.data.url;
        }
        throw new Error('HYWmusic: 无数据');
    } },
    { name: 'FFAPI', fetch: getFFAPI },
];


const KW_BACKENDS = [
    { name: '酷我官方', fetch: async (songmid, quality, musicInfo) => {
        const brMap = { '128k': '128kmp3', '192k': '128kmp3', '320k': '320kmp3', flac: '2000kflac', flac24bit: '4000kflac' };
        const br = brMap[quality];
        if (!br) throw new Error('酷我官方 不支持的音质');
        let rid = musicInfo?.rid || '';
        if (!rid && musicInfo?.musicrid) rid = String(musicInfo.musicrid).replace(/^MUSIC_/, '');
        if (!rid) rid = songmid;
        const res = await httpFetch(_u('cookn5**hj]d)fprj)^i*hj]d)n:a8r`]!md_8') + rid + '&br=' + br + '&source=jiakong&type=convert_url_with_sign&surl=1', { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.surl) return d.data.surl;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('酷我官方: 无数据');
    } },
    { name: 'yunmge酷我', fetch: getYunmgeKw },
    { name: '星海主后端', fetch: async (songmid, quality, musicInfo) => {
        const name = musicInfo?.name || '';
        const singer = musicInfo?.singer || '';
        const interval = musicInfo?.interval || '';
        const albumName = musicInfo?.albumName || musicInfo?.album || '';
        const res = await httpFetch(_u('cookn5**tt)u__tm)ojk*gs*\\kd*:njpm^`8fr!i\\h`8') + encodeURIComponent(name) + '&singer=' + encodeURIComponent(singer) + '&songmid=' + encodeURIComponent(songmid) + '&interval=' + encodeURIComponent(interval) + '&albumName=' + encodeURIComponent(albumName) + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海主后端: ' + (d?.msg || '无数据'));
    } },
    { name: '星海备后端', fetch: async (songmid, quality, musicInfo) => {
        const name = musicInfo?.name || '';
        const singer = musicInfo?.singer || '';
        const interval = musicInfo?.interval || '';
        const albumName = musicInfo?.albumName || musicInfo?.album || '';
        const res = await httpFetch(_u('cookn5**um^_t)_k_in)jmb*gs*\\kd*\\kd)kck:njpm^`8fr!i\\h`8') + encodeURIComponent(name) + '&singer=' + encodeURIComponent(singer) + '&songmid=' + encodeURIComponent(songmid) + '&interval=' + encodeURIComponent(interval) + '&albumName=' + encodeURIComponent(albumName) + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海备后端: ' + (d?.msg || '无数据'));
    } },
    { name: '酷我流媒体', fetch: async (songmid, quality, musicInfo) => {
        const level = KW_STREAM_LEVEL_MAP[quality] || 'master';
        const songIdTmp = musicInfo?.songmid || musicInfo?.id || musicInfo?.hash || musicInfo?.songId || musicInfo?.musicId || songmid;
        if (!songIdTmp) throw new Error('酷我流媒体: 找不到歌曲ID');
        const songId = String(songIdTmp).trim();
        return _u('cook5**,20)-2),11)-.1534-3*frnom`\\h:d_8') + encodeURIComponent(songId) + '&level=' + level + '&stream=1';
    } },
    { name: '念心直链', fetch: async (songmid, quality) => {
        const level = qualityToLevel(quality);
        const res = await httpFetch(_u('cookn5**hpnd^)isdisu)^jh*fbll*fr)kck:d_8') + songmid + '&level=' + level + '&type=mp3', { method: 'GET', timeout: 5000 });
        if (typeof res.body === 'string' && res.body.startsWith('http')) return res.body;
        if (res.body?.url) return res.body.url;
        throw new Error('念心直链: 无数据');
    } },
    { name: '笒鬼鬼', fetch: async (songmid, quality) => {
        const level = KW_LEVEL_MAP[quality] || '128k';
        const res = await httpFetch(_u('cookn5**\\kd)^`ibpdbpd)^i*\\kd*fprj*hpnd^Zq,)kck:d_8') + songmid + '&type=song&format=json&level=' + level, { method: 'GET', timeout: 5000 });
        const d = res.body;
        const url = extractUrl(d, [['data', 'url'], ['url']]);
        if (url) return url;
        throw new Error('笒鬼鬼: 无数据');
    } },
    { name: '妖狐', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)t\\jcp_)^i*\\kd*hpnd^*frqdk:d_8') + songmid + '&level=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        const url = extractUrl(d, [['url'], ['data', 'url']]);
        if (url) return url;
        throw new Error('妖狐: 无数据');
    } },
    { name: '聚合API', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)hpnd^)g`m_)_k_in)jmb*fr'), { method: 'POST', timeout: 5000, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ musicInfo: { songmid }, type: quality }) });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('聚合API: 无数据');
    } },
    { name: '酷我手机版', fetch: async (songmid, quality) => {
        const brMap = { '128k': '128kmp3', '192k': '128kmp3', '320k': '320kmp3', flac: '2000kflac', flac24bit: '4000kflac' };
        const br = brMap[quality];
        if (!br) throw new Error('酷我手机版 不支持的音质');
        const res = await httpFetch(_u('cookn5**ihj]d)fprj)^i*hj]d)n:a8r`]!pn`m8+!njpm^`8frkg\\t`mc_Z\\mZ/).)+)3Zod\\i]\\jZO,<Zldmpd)\\kf!otk`8^jiq`moZpmgZrdocZndbi!md_8') + songmid + '&br=' + br, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        if (d && d.code === 200 && d.data && d.data.surl) return d.data.surl;
        throw new Error('酷我手机版: 无数据');
    } },
    { name: '酷我车机版', fetch: async (songmid, quality) => {
        const brMap = { '128k': '128kmp3', '192k': '128kmp3', '320k': '320kmp3', flac: '2000kflac', flac24bit: '4000kflac' };
        const br = brMap[quality];
        if (!br) throw new Error('酷我车机版 不支持的音质');
        const res = await httpFetch(_u('cookn5**hj]d)fprj)^i*hj]d)n:a8r`]!pn`m8+!njpm^`8frkg\\t`m^\\mZ\\mZ1)+)+)4Z=Zed\\fjibZqc)\\kf!otk`8^jiq`moZpmgZrdocZndbi!]m8') + br + '&sig=0&rid=' + songmid, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        if (d && d.code === 200 && d.data && d.data.surl) return d.data.surl;
        throw new Error('酷我车机版: 无数据');
    } },
    { name: '聆澜', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**njpm^`)ncdld\\ied\\ib)^i*\\kd*hpnd^*pmg:njpm^`8fr!njibD_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        if (d && d.data && d.data.url) return d.data.url;
        throw new Error('聆澜: 无数据');
    } },
    { name: 'HYWmusic', fetch: async (songmid, quality) => {
        const res = await httpFetch(HYW_API_BASE + '/api/music/url?source=kw&songId=' + songmid + '&quality=' + quality + '&key=' + HYW_CARD_KEY, { method: 'GET', timeout: 5000, headers: { 'X-Card-Key': HYW_CARD_KEY } });
        const d = res.body;
        if (d && d.code === 200) {
            if (d.url) return d.url;
            if (d.data && d.data.url) return d.data.url;
        }
        throw new Error('HYWmusic: 无数据');
    } },
    { name: '溯音酷我', fetch: async (songmid, quality, musicInfo) => {
        const brMap = { '128k': '7', '192k': '5', '320k': '5', flac: '1', flac24bit: '1' };
        const br = brMap[quality] || '7';
        const name = musicInfo?.name || '';
        const singer = musicInfo?.singer || '';
        const keyword = name + (singer ? ' ' + singer : '');
        if (!keyword) throw new Error('溯音酷我: 缺少歌曲名');
        const res = await httpFetch(_u('cookn5**jd\\kd)i`o*\\kd*Fprj:hnb8') + encodeURIComponent(keyword) + '&n=1&br=' + br, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.data && d.data.url) return d.data.url;
        if (d && d.url) return d.url;
        throw new Error('溯音酷我: 无数据');
    } },
    { name: 'HelloWorld', fetch: async (songmid, quality, musicInfo) => {
        const songId = musicInfo?.rid || musicInfo?.hash || musicInfo?.songmid || musicInfo?.id || songmid;
        if (!songId) throw new Error('HelloWorld: 找不到歌曲ID');
        const requestPath = '/lxmusicv4/url/kw/' + songId + '/' + quality;
        const sign = helloWorldSign(requestPath);
        const url = HELLO_WORLD_API_URL + requestPath + '?sign=' + sign;
        const res = await httpFetch(url, { method: 'GET', timeout: 5000, headers: { 'accept': 'application/json', 'x-request-key': HELLO_WORLD_API_KEY } });
        const d = res.body;
        if (d && (d.code === 0 || d.code === 200)) {
            const musicUrl = d.data || d.url;
            if (musicUrl) return musicUrl;
        }
        throw new Error('HelloWorld: ' + (d?.msg || '无数据'));
    } },
    { name: '星海酷我', fetch: getXinghaiKw },
    { name: 'FFAPI', fetch: getFFAPI },
];


const KG_BACKENDS = [
    
    { name: '星海主后端', fetch: async (songmid, quality, musicInfo) => {
        const hash = musicInfo?.hash || (musicInfo?._types?.[quality]?.hash) || songmid;
        const albumId = musicInfo?.albumId || '';
        const mainHash = hash;
        const res = await httpFetch(_u('cookn5**tt)u__tm)ojk*gs*\\kd*:njpm^`8fb!lp\\gdot8') + quality + '&songmid=' + (musicInfo?.songmid || songmid) + '&albumId=' + albumId + '&mainHash=' + mainHash + '&hash=' + hash, { method: 'GET', timeout: 8000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海主后端: ' + (d?.msg || '无数据'));
    } },
    { name: '念心KG', fetch: getNianxinKg },
    { name: '长青海棠', fetch: async (songmid, quality, musicInfo) => {
        const level = KG_LEVEL_MAP[quality] || 'standard';
        const hash = musicInfo?.hash || musicInfo?.songmid || songmid;
        const res = await httpFetch(_u('cookn5**hpnd^n`mq`m)c\\do\\ibr)^^*q,*hpnd^*m`njgq`(pmg'), {
            method: 'POST', timeout: 8000,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'kg', rid: hash, level: level }),
        });
        const d = res.body;
        if (d && d.code === 0 && d.data && d.data.url) return d.data.url;
        throw new Error('长青海棠: ' + (d?.msg || '无数据'));
    } },
    { name: 'HelloWorld', fetch: async (songmid, quality, musicInfo) => {
        const songId = musicInfo?.hash || musicInfo?.songmid || musicInfo?.id || songmid;
        if (!songId) throw new Error('HelloWorld: 找不到歌曲ID');
        const requestPath = '/lxmusicv4/url/kg/' + songId + '/' + quality;
        const sign = helloWorldSign(requestPath);
        const url = HELLO_WORLD_API_URL + requestPath + '?sign=' + sign;
        const res = await httpFetch(url, { method: 'GET', timeout: 8000, headers: { 'accept': 'application/json', 'x-request-key': HELLO_WORLD_API_KEY } });
        const d = res.body;
        if (d && (d.code === 0 || d.code === 200)) {
            const musicUrl = d.data || d.url;
            if (musicUrl) return musicUrl;
        }
        throw new Error('HelloWorld: ' + (d?.msg || '无数据'));
    } },
    { name: 'ChKsZ', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)^cfnu)ojk*\\kd'), {
            method: 'POST', timeout: 8000,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'kg', songmid, quality }),
        });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('ChKsZ: ' + (d?.msg || '无数据'));
    } },
    
    { name: '星海备后端', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**um^_t)_k_in)jmb*gs*\\kd*\\kd)kck:njpm^`8fb!njibhd_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 3000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海备后端: ' + (d?.msg || '无数据'));
    } },
    { name: '妖狐', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)t\\jcp_)^i*\\kd*hpnd^*fbqdk:d_8') + songmid + '&level=' + quality, { method: 'GET', timeout: 3000 });
        const d = res.body;
        const url = extractUrl(d, [['url'], ['data', 'url']]);
        if (url) return url;
        throw new Error('妖狐: 无数据');
    } },
    { name: '酷狗官方', fetch: async (songmid, quality, musicInfo) => {
        const hash = musicInfo?.hash || songmid;
        const albumId = musicInfo?.albumId || '';
        const res = await httpFetch(_u('cookn5**rrr\\kd)fpbjp)^jh*tt*di_`s)kck:m8kg\\t*b`o_\\o\\!c\\nc8') + hash + '&platid=4&album_id=' + albumId + '&mid=00000000000000000000000000000000', { method: 'GET', timeout: 3000 });
        const d = res.body;
        if (d && d.status === 1 && d.data && d.data.play_backup_url) return d.data.play_backup_url;
        if (d && d.status === 1 && d.data && d.data.play_url) return d.data.play_url;
        throw new Error('酷狗官方: 无数据');
    } },
    { name: '长青SVIP直链', fetch: async (songmid, quality, musicInfo) => {
        const level = KG_LEVEL_MAP[quality] || 'standard';
        const hash = musicInfo?.hash || musicInfo?.songmid || songmid;
        const url = _u('cookn5**hpnd^)c\\do\\ibr)^^*fbll,*fb)kck:otk`8hk.!d_8') + hash + '&level=' + level;
        const res = await httpFetch(url, { method: 'GET', timeout: 3000 });
        const d = res.body;
        if (typeof d === 'string' && d.startsWith('http')) return d;
        if (d && d.url) return d.url;
        throw new Error('长青SVIP直链: 无数据');
    } },
    { name: '长青POST', fetch: async (songmid, quality, musicInfo) => {
        const level = KG_LEVEL_MAP[quality] || 'standard';
        const hash = musicInfo?.hash || songmid;
        const res = await httpFetch(_u('cook5**,20)-2),11)-.1*fbll,*fb)kck'), {
            method: 'POST', timeout: 3000,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'kg', id: hash, level: level }),
        });
        const d = res.body;
        if (typeof d === 'string' && d.startsWith('http')) return d;
        if (d && d.url) return d.url;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('长青POST: 无数据');
    } },
    { name: '聚合API', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)hpnd^)g`m_)_k_in)jmb*fb'), { method: 'POST', timeout: 3000, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ musicInfo: { songmid }, type: quality }) });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('聚合API: 无数据');
    } },
    { name: '海棠API', fetch: async (songmid, quality, musicInfo) => {
        const level = KG_LEVEL_MAP[quality] || 'standard';
        const hash = musicInfo?.hash || (musicInfo?._types?.[quality]?.hash) || songmid;
        const res = await httpFetch(_u('cookn5**hpnd^\\kd)c\\do\\ibr)i`o*fbll*fb)kck:otk`8enji!d_8') + hash + '&level=' + level, { method: 'GET', timeout: 3000 });
        const d = res.body;
        const url = extractUrl(d, [['url'], ['data', 'url']]);
        if (url) return url;
        throw new Error('海棠API: 无数据');
    } },
    { name: '聆澜', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**njpm^`)ncdld\\ied\\ib)^i*\\kd*hpnd^*pmg:njpm^`8fb!njibD_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 3000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        if (d && d.data && d.data.url) return d.data.url;
        throw new Error('聆澜: 无数据');
    } },
    { name: 'HYWmusic', fetch: async (songmid, quality) => {
        const res = await httpFetch(HYW_API_BASE + '/api/music/url?source=kg&songId=' + songmid + '&quality=' + quality + '&key=' + HYW_CARD_KEY, { method: 'GET', timeout: 3000, headers: { 'X-Card-Key': HYW_CARD_KEY } });
        const d = res.body;
        if (d && d.code === 200) {
            if (d.url) return d.url;
            if (d.data && d.data.url) return d.data.url;
        }
        throw new Error('HYWmusic: 无数据');
    } },
    { name: '星海酷狗', fetch: getXinghaiKg },
    { name: 'FFAPI', fetch: getFFAPI },
];


const MG_BACKENDS = [
    { name: '星海咪咕', fetch: getXinghaiMg },
    { name: 'Migu直接源', fetch: async (songmid, quality) => {
        const level = qualityToLevel(quality);
        const res = await httpFetch(_u('cookn5**hpnd^)hdbp)^i*q.*\\kd*hpnd^*\\p_djKg\\t`m*b`oKg\\tDiaj:^jktmdbcoD_8') + encodeURIComponent(String(songmid)) + '&level=' + level, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.data && d.data.playUrl) return d.data.playUrl;
        if (d && d.url) return d.url;
        if (d && d.playUrl) return d.playUrl;
        throw new Error('Migu直接源: 无数据');
    } },
    { name: 'Migu API', fetch: async (songmid, quality) => {
        const levelMap = { '128k': 'PQ', '320k': 'HQ', flac: 'SQ' };
        const level = levelMap[quality] || 'HQ';
        const res = await httpFetch(_u('cookn5**\\kk)^)ia)hdbp)^i*HDBPH-)+*nom\\o`bt*gdno`i(pmg*q-)-:^jktmdbcoD_8') + encodeURIComponent(String(songmid)) + '&quality=' + level, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.data && d.data.url) return d.data.url;
        if (d && d.url) return d.url;
        if (d && d.data && d.data.playUrl) return d.data.playUrl;
        throw new Error('Migu API: 无数据');
    } },
    { name: '星海主后端', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**tt)u__tm)ojk*gs*\\kd*:njpm^`8hdbp!njibhd_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海主后端: ' + (d?.msg || '无数据'));
    } },
    { name: '星海备后端', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**um^_t)_k_in)jmb*gs*\\kd*\\kd)kck:njpm^`8hdbp!njibhd_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        throw new Error('星海备后端: ' + (d?.msg || '无数据'));
    } },
    { name: '聚合API', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**\\kd)hpnd^)g`m_)_k_in)jmb*hb'), { method: 'POST', timeout: 5000, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ musicInfo: { songmid }, type: quality }) });
        const d = res.body;
        if (d && d.code === 200 && d.data && d.data.url) return d.data.url;
        throw new Error('聚合API: 无数据');
    } },
    { name: '念心直链', fetch: async (songmid, quality) => {
        const level = qualityToLevel(quality);
        const res = await httpFetch(_u('cook5**hpnd^)isdisu)^jh*hb)kck:d_8') + encodeURIComponent(String(songmid)) + '&level=' + level + '&type=mp3', { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (typeof d === 'string' && d.startsWith('http')) return d;
        if (d && d.url) return d.url;
        throw new Error('念心直链: 无数据');
    } },
    { name: '聆澜', fetch: async (songmid, quality) => {
        const res = await httpFetch(_u('cookn5**njpm^`)ncdld\\ied\\ib)^i*\\kd*hpnd^*pmg:njpm^`8hb!njibD_8') + songmid + '&quality=' + quality, { method: 'GET', timeout: 5000 });
        const d = res.body;
        if (d && d.code === 200 && d.url) return d.url;
        if (d && d.data && d.data.url) return d.data.url;
        throw new Error('聆澜: 无数据');
    } },
    { name: 'HYWmusic', fetch: async (songmid, quality) => {
        const res = await httpFetch(HYW_API_BASE + '/api/music/url?source=mg&songId=' + songmid + '&quality=' + quality + '&key=' + HYW_CARD_KEY, { method: 'GET', timeout: 5000, headers: { 'X-Card-Key': HYW_CARD_KEY } });
        const d = res.body;
        if (d && d.code === 200) {
            if (d.url) return d.url;
            if (d.data && d.data.url) return d.data.url;
        }
        throw new Error('HYWmusic: 无数据');
    } },
    { name: 'FFAPI', fetch: getFFAPI },
];


const handleGetMusicUrl = async (source, musicInfo, userQuality) => {
    const songId = musicInfo.hash ?? musicInfo.songmid ?? musicInfo.id;
    if (!songId) throw new Error('无法获取歌曲ID');

    const supportedQualities = MUSIC_QUALITY[source] || ['128k'];
    let startIndex = QUALITY_PRIORITY.indexOf(userQuality);
    if (startIndex === -1) startIndex = QUALITY_PRIORITY.length - 1;

    const backends = {
        tx: TX_BACKENDS,
        wy: WY_BACKENDS,
        kw: KW_BACKENDS,
        kg: KG_BACKENDS,
        mg: MG_BACKENDS,
    }[source];
    if (!backends) throw new Error('未知音源: ' + source);

    const startTime = Date.now();

    for (let i = startIndex; i < QUALITY_PRIORITY.length; i++) {
        const quality = QUALITY_PRIORITY[i];
        if (!supportedQualities.includes(quality)) continue;

        const cacheKey = buildCacheKey(source, songId, quality);
        const cached = getCachedUrl(cacheKey);
        if (cached) {
            console.log(`[回避聚合] 缓存命中: ${source} ${quality}`);
            if (quality !== userQuality) console.warn(`[回避聚合] 用户请求 ${userQuality}，已降级至 ${quality}`);
            return cached;
        }

        console.log(`[回避聚合] 尝试音质: ${quality} (用户请求: ${userQuality})`);

        
        let firstTierCount = 5;
        if (quality === 'master' || quality === 'hires' || quality === 'flac24bit' || quality === 'atmos' || quality === 'atmos_plus') {
            firstTierCount = 8; 
        }
        const firstTier = backends.slice(0, firstTierCount);
        let finalUrl = null;
        const errors = [];

        try {
            const result = await Promise.any(firstTier.map(async (backend) => {
                let url = await backend.fetch(songId, quality, musicInfo);
                
                if (!qualityMatch(url, quality)) {
                    throw new Error(`音质不匹配: 请求 ${quality}，但返回链接不符合高音质格式`);
                }
                if (source === 'kw' && typeof url === 'string' && url.includes('ekey')) {
                    url = processKwEncryptedUrl({ url, ekey: simpleGetQueryParam(url, 'ekey') }, source) || url;
                }
                if (url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                    return url;
                }
                throw new Error(`${backend.name} 返回无效URL`);
            }));
            finalUrl = result;
        } catch (err) {
            if (err.errors) err.errors.forEach(e => errors.push(e.message || e));
            else errors.push(err.message);
        }

        if (!finalUrl) {
            
            for (const backend of backends.slice(firstTierCount)) {
                try {
                    let url = await backend.fetch(songId, quality, musicInfo);
                    if (!qualityMatch(url, quality)) {
                        throw new Error(`音质不匹配: 请求 ${quality}，但返回链接不符合`);
                    }
                    if (source === 'kw') url = processKwEncryptedUrl({ url, ekey: simpleGetQueryParam(url, 'ekey') }, source) || url;
                    if (url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                        finalUrl = url;
                        break;
                    }
                    errors.push(`${backend.name}: 返回无效URL`);
                } catch (e) {
                    errors.push(`${backend.name}: ${e.message}`);
                }
            }
        }

        if (finalUrl) {
            setCachedUrl(cacheKey, finalUrl);
            const elapsed = Date.now() - startTime;
            console.log(`[回避聚合] ✅ 成功获取 ${source} ${quality} (${elapsed}ms)`);
            if (quality !== userQuality) console.warn(`[回避聚合] ⚠️ 用户请求 ${userQuality}，已降级至 ${quality}`);
            return finalUrl;
        }

        console.warn(`[回避聚合] ❌ 音质 ${quality} 全部失败，尝试降级`);
    }

    throw new Error(`所有音质尝试失败（从 ${userQuality} 降至最低）`);
};


on(EVENT_NAMES.request, ({ action, source, info }) => {
    if (action === 'musicUrl') {
        return handleGetMusicUrl(source, info.musicInfo, info.type);
    }
    return Promise.reject('action not support: ' + action);
});


deviceId = generateDeviceId();
clientHeader = buildClientHeader();
userToken = generateToken(null);

const sources = {};
MUSIC_SOURCE.forEach(item => {
    const nameMap = { tx: 'QQ音乐', wy: '网易云音乐', kw: '酷我音乐', kg: '酷狗音乐', mg: '咪咕音乐' };
    sources[item] = {
        name: nameMap[item] || item,
        type: 'music',
        actions: ['musicUrl'],
        qualitys: MUSIC_QUALITY[item],
    };
});

send(EVENT_NAMES.inited, {
    status: true,
    openDevTools: false,
    sources: sources,
});

console.log('[回避聚合] v0.0.1 已加载');
console.log('[回避聚合] 平台: ' + MUSIC_SOURCE.join(', '));
console.log('[回避聚合] 缓存 TTL: ' + (CACHE_TTL_MS / 3600000) + ' 小时');
if (CHKSZ_CONFIG.apikey) console.log('[回避聚合] ChKSz API 已启用');
if (KW_DECRYPT_PROXY.allowEncryptedLossless && KW_DECRYPT_PROXY.url) console.log('[回避聚合] 酷我代理解密已启用');
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
 * @name gdstudio音乐源
 * @description 通过 music-api.gdstudio.xyz 提供音乐播放链接
 * @version 1.0.1
 * @author lx-music
 * @homepage https://github.com/lyswhut/lx-music-desktop
 */

/* =========================== 配置 =========================== */
var DEV_ENABLE = false
var API_BASE = 'https://music-api.gdstudio.xyz/api.php'
var SEARCH_COUNT = 5
var CACHE_TTL = 30 * 60 * 1000
var REQUEST_TIMEOUT = 15000

/* ======================= 音质映射 =========================== */
var QUALITY_MAP = {
  '128k': 128,
  '320k': 320,
  flac: 740,
  flac24bit: 999,
}
var QUALITY_FALLBACKS = {
  999: [740, 320, 128],
  740: [320, 128],
  320: [128],
  128: [],
}

/* ======================= 音源映射 =========================== */
var SOURCE_MAP = {
  wy: 'netease',
  kw: 'kuwo',
  tx: 'tencent',
  kg: 'netease',
  mg: 'netease',
}

var SUPPORTED_SOURCES = ['wy', 'kw', 'tx', 'kg', 'mg']
var MUSIC_QUALITY = {
  wy: ['128k', '320k', 'flac', 'flac24bit'],
  kw: ['128k', '320k', 'flac', 'flac24bit'],
  tx: ['128k', '320k', 'flac', 'flac24bit'],
  kg: ['128k', '320k', 'flac', 'flac24bit'],
  mg: ['128k', '320k', 'flac', 'flac24bit'],
}

/* ===================== LX 环境变量 ========================== */
var EVENT_NAMES = globalThis.lx.EVENT_NAMES
var request = globalThis.lx.request
var on = globalThis.lx.on
var send = globalThis.lx.send
var env = globalThis.lx.env
var version = globalThis.lx.version

/* ======================= 工具函数 =========================== */

var httpFetch = function (url, options) {
  options = options || { method: 'GET' }
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      reject(new Error('Request timeout'))
    }, REQUEST_TIMEOUT)
    request(url, options, function (err, resp) {
      clearTimeout(timer)
      if (err) return reject(err)
      resolve(resp)
    })
  })
}

var buildSearchUrl = function (source, keyword) {
  return API_BASE + '?types=search&source=' + source + '&name=' + encodeURIComponent(keyword) + '&count=' + SEARCH_COUNT
}

var buildUrlApi = function (source, trackId, br) {
  return API_BASE + '?types=url&source=' + source + '&id=' + trackId + '&br=' + br
}

/* ======================= 歌手名拆分 ========================= */

// 分隔符：、 & ; / , | （半角和全角）
var SINGER_SPLIT_RXP = /、|&|;|；|\/|,|，|\|/

// 将 artist 字段转为字符串（gdstudio 返回的是数组）
var normalizeArtist = function (artist) {
  if (!artist) return ''
  if (Array.isArray(artist)) {
    // 清理每个歌手名末尾的 - . 等符号，再拼接
    var cleaned = artist.map(function (a) {
      return String(a).replace(/[-.]+$/g, '').trim()
    })
    return cleaned.join('、')
  }
  return String(artist)
}

var getFirstSinger = function (artist) {
  if (!artist) return ''
  var str = normalizeArtist(artist)
  return str.split(SINGER_SPLIT_RXP)[0].toLowerCase()
}

/* ======================= 相似度匹配 ========================= */

var calcSimilarity = function (a, b) {
  if (!a || !b) return 0
  var sa = a.toLowerCase().replace(/\s+/g, '')
  var sb = b.toLowerCase().replace(/\s+/g, '')
  if (sa === sb) return 100
  if (sa.includes(sb) || sb.includes(sa)) return 80
  var minLen = Math.min(sa.length, sb.length)
  var match = 0
  for (var i = 0; i < minLen; i++) {
    if (sa[i] === sb[i]) match++
    else break
  }
  return (match / Math.max(sa.length, sb.length)) * 60
}

var selectBestMatch = function (list, targetName, targetSinger) {
  if (!list || !list.length) return null
  if (list.length === 1) return list[0]

  var tName = (targetName || '').toLowerCase().trim()
  var tSinger = getFirstSinger(targetSinger)

  var scored = list.map(function (item) {
    var iName = (item.name || '').toLowerCase().trim()
    var iArtistStr = normalizeArtist(item.artist).toLowerCase()
    var iArtistFirst = getFirstSinger(item.artist)

    var score = 0
    if (iName === tName) {
      score += 50
    } else if (iName.includes(tName) || tName.includes(iName)) {
      score += 35
    } else {
      score += calcSimilarity(tName, iName) * 0.3
    }

    if (tSinger && (iArtistStr.indexOf(tSinger) >= 0 || iArtistFirst === tSinger)) {
      score += 40
    } else if (tSinger) {
      score += calcSimilarity(tSinger, iArtistFirst) * 0.2
    }

    return { item: item, score: score }
  })

  scored.sort(function (a, b) { return b.score - a.score })
  if (scored[0].score < 20) return null
  return scored[0].item
}

/* ======================= 缓存系统 =========================== */

var pendingCache = {}
var resultCache = {}

var makeCacheKey = function (lxSource, name, singer) {
  var sname = (name || '').toLowerCase().replace(/\s+/g, '')
  var ssinger = getFirstSinger(singer || '')
  return lxSource + ':' + sname + ':' + ssinger
}

var cacheGet = function (key) {
  var entry = resultCache[key]
  if (!entry) return null
  if (Date.now() > entry.expireTime) {
    delete resultCache[key]
    return null
  }
  return entry.data
}

var cacheSet = function (key, data) {
  var keys = Object.keys(resultCache)
  if (keys.length > 500) {
    delete resultCache[keys[0]]
  }
  resultCache[key] = {
    data: data,
    expireTime: Date.now() + CACHE_TTL,
  }
}

/* ====================== API 封装 =========================== */

var searchSong = async function (lxSource, targetSource, name, singer) {
  var cacheKey = makeCacheKey(lxSource, name, singer)

  var cached = cacheGet(cacheKey)
  if (cached) return cached

  if (pendingCache[cacheKey]) return pendingCache[cacheKey]

  var keyword = (name || '') + ' ' + (singer || '')
  keyword = keyword.trim()
  if (!keyword) throw new Error('Search keyword is empty')

  var promise = (async function () {
    try {
      var resp = await httpFetch(buildSearchUrl(targetSource, keyword))
      var body = resp.body
      if (!body || !Array.isArray(body)) {
        throw new Error('Invalid search response')
      }
      if (!body.length) {
        throw new Error('No search results')
      }

      var matched = selectBestMatch(body, name, singer)
      if (!matched) {
        throw new Error('No matching song found')
      }

      var result = {
        trackId: matched.id,
        lyricId: matched.lyric_id || matched.id,
        picId: matched.pic_id || '',
        matchedName: matched.name,
        matchedArtist: matched.artist,
        gdSource: matched.source || targetSource,
      }
      cacheSet(cacheKey, result)
      return result
    } finally {
      delete pendingCache[cacheKey]
    }
  })()

  pendingCache[cacheKey] = promise
  return promise
}

/* ====================== Action 处理 ========================= */

var handleMusicUrl = async function (lxSource, musicInfo, quality) {
  var targetSource = SOURCE_MAP[lxSource]
  if (!targetSource) throw new Error('Unsupported source: ' + lxSource)

  var requestedBr = QUALITY_MAP[quality] || 320
  var fallbacks = QUALITY_FALLBACKS[requestedBr] || [320, 128]
  var brsToTry = [requestedBr].concat(fallbacks)

  var searchResult = await searchSong(lxSource, targetSource, musicInfo.name, musicInfo.singer)

  for (var i = 0; i < brsToTry.length; i++) {
    var br = brsToTry[i]
    try {
      var resp = await httpFetch(buildUrlApi(searchResult.gdSource, searchResult.trackId, br))
      var body = resp.body
      if (body && body.url) {
        if (br !== requestedBr) {
          console.log('[gdstudio] quality fallback: ' + quality + '(' + requestedBr + ') -> br=' + br)
        }
        return body.url
      }
    } catch (_) {}
  }

  throw new Error('Failed to get audio URL at all quality levels')
}

/* ====================== 事件注册 =========================== */

on(EVENT_NAMES.request, function (data) {
  var action = data.action
  var source = data.source
  var info = data.info

  switch (action) {
    case 'musicUrl':
      if (env !== 'mobile') {
        console.group('[gdstudio] musicUrl')
        console.log('source:', source)
        console.log('quality:', info.type)
        console.log('name:', info.musicInfo && info.musicInfo.name)
        console.log('singer:', info.musicInfo && info.musicInfo.singer)
        console.groupEnd()
      }
      return handleMusicUrl(source, info.musicInfo, info.type)
    default:
      return Promise.reject(new Error('Unsupported action: ' + action))
  }
})

/* ====================== 初始化 =========================== */

var musicSources = {}
SUPPORTED_SOURCES.forEach(function (s) {
  musicSources[s] = {
    name: s,
    type: 'music',
    actions: ['musicUrl'],
    qualitys: MUSIC_QUALITY[s],
  }
})

send(EVENT_NAMES.inited, {
  openDevTools: DEV_ENABLE,
  sources: musicSources,
})

      }).call(sb, lx, sb, sb, sb, sb, sb.console);
    } catch (e) { st.handler = null; }
  })();
  (function () {
    var st = { m: MEMBERS[3], handler: null, sources: null };
    states.push(st);
    var lx = makeFacade(st);
    var sb = makeSandbox(lx);
    try {
      (function (lx, window, self, global, globalThis, console) {
/*!
 * @name KuwoDES
 * @version 1.0.0
 * @author 不知名纯鹿人
 */

const l=O;function F(){const K=['action(','search','while\x20(true)\x20{}','input','mobile','1093815OQJXkY','128k','244185xrWCps','group',')\x20success,\x20URL:\x20','init','API\x20Response:\x20','then','128kmp3','4000kflac','{}.constructor(\x22return\x20this\x22)(\x20)','(((.+)+)+)+

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
  var CLOUD_VERSION = 202609281900;
  var CLOUD_VERSION_TEXT = "2026-09-28 19:00:03";
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
,'456828HYoGrs','function\x20*\x5c(\x20*\x5c)','未知错误','warn','chain','error','prototype','2987313yqMBmM',')\x20failed','---\x20start\x20---\x20','https://mobi.kuwo.cn/mobi.s?f=web&rid=','flac','lx-music-request/','application/json','test','songmid','stateObject','request','80HQHEwo','reject','Handle\x20Action(musicUrl)','code','apply','keys','toString','musicInfo','3945880mKFhiA','return\x20(function()\x20','hires','action\x20not\x20support','101259yhtwZl','quality','debu','action','bind','counter','log','string','length','hash','source','forEach','1678196UkliCJ','console','resolve','exception','type','760BfvnIa','table','surl','\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)','320k','gger','GET','&source=jiakong&type=convert_url_with_sign&surl=1','flac24bit','2lavVbq','handleGetMusicUrl(','call','&br=','inited','trace','constructor','data'];F=function(){return K;};return F();}(function(W,w){const b=O,G=W();while(!![]){try{const h=parseInt(b(0x1bb))/0x1*(parseInt(b(0x1fd))/0x2)+parseInt(b(0x1b9))/0x3+-parseInt(b(0x1ef))/0x4+-parseInt(b(0x1d7))/0x5*(parseInt(b(0x1c5))/0x6)+parseInt(b(0x1cc))/0x7+parseInt(b(0x1df))/0x8+parseInt(b(0x1e3))/0x9*(parseInt(b(0x1f4))/0xa);if(h===w)break;else G['push'](G['shift']());}catch(A){G['push'](G['shift']());}}}(F,0xb6277));const c=(function(){let W=!![];return function(w,G){const h=W?function(){const k=O;if(G){const A=G[k(0x1db)](w,arguments);return G=null,A;}}:function(){};return W=![],h;};}()),j=c(this,function(){const H=O;return j[H(0x1dd)]()[H(0x1b5)](H(0x1c4))[H(0x1dd)]()[H(0x1b2)](j)[H(0x1b5)](H(0x1c4));});j();const X=(function(){let W=!![];return function(w,G){const h=W?function(){const C=O;if(G){const A=G[C(0x1db)](w,arguments);return G=null,A;}}:function(){};return W=![],h;};}());(function(){X(this,function(){const a=O,W=new RegExp(a(0x1c6)),w=new RegExp(a(0x1f7),'i'),G=Q(a(0x1be));!W[a(0x1d3)](G+a(0x1c9))||!w['test'](G+a(0x1b7))?G('0'):Q();})();}());const d=(function(){let W=!![];return function(w,G){const h=W?function(){const I=O;if(G){const A=G[I(0x1db)](w,arguments);return G=null,A;}}:function(){};return W=![],h;};}()),R=d(this,function(){const V=O;let W;try{const h=Function(V(0x1e0)+V(0x1c3)+');');W=h();}catch(A){W=window;}const w=W['console']=W[V(0x1f0)]||{},G=['log',V(0x1c8),'info',V(0x1ca),V(0x1f2),V(0x1f5),V(0x1b1)];for(let r=0x0;r<G[V(0x1eb)];r++){const E=d[V(0x1b2)][V(0x1cb)][V(0x1e7)](d),s=G[r],J=w[s]||E;E['__proto__']=d['bind'](d),E['toString']=J[V(0x1dd)][V(0x1e7)](J),w[s]=E;}});R();const MUSIC_QUALITY={'kw':[l(0x1ba),l(0x1f8),l(0x1d0),l(0x1fc),l(0x1e1)]},MUSIC_SOURCE=Object[l(0x1dc)](MUSIC_QUALITY),QUALITY_MAP={'128k':l(0x1c1),'320k':'320kmp3','flac':'2000kflac','flac24bit':l(0x1c2),'hires':l(0x1c2)},{EVENT_NAMES,request,on,send,env,version}=globalThis['lx'],httpFetch=(W,w={'method':l(0x1fa)})=>{return new Promise((G,h)=>{const M=O;console['log'](M(0x1ce)+W),request(W,w,(A,r)=>{const Z=M;if(A)return h(A);console[Z(0x1e9)](Z(0x1bf),r),G(r);});});},handleGetMusicUrl=async(W,w,G)=>{const q=l,h=w[q(0x1ec)]??w['songmid'],A=await httpFetch(q(0x1cf)+h+q(0x1af)+QUALITY_MAP[G]+q(0x1fb),{'method':'GET','headers':{'Content-Type':q(0x1d2),'User-Agent':''+(env?'lx-music-'+env+'/'+version:q(0x1d1)+version)},'follow_max':0x5}),{body:r}=A;if(!r||isNaN(Number(r[q(0x1da)])))throw new Error('unknow\x20error');if(env!=q(0x1b8))console['groupEnd']();switch(r[q(0x1da)]){case 0xc8:console['log']('handleGetMusicUrl('+W+'_'+w[q(0x1d4)]+',\x20'+G+q(0x1bd)+r['data'][q(0x1f6)]);return r[q(0x1b3)][q(0x1f6)];default:console[q(0x1e9)](q(0x1ad)+W+'_'+w[q(0x1d4)]+',\x20'+G+q(0x1cd));throw new Error(q(0x1c7));}},musicSources={};function O(R,d){const Q=F();return O=function(X,j){X=X-0x1ad;let c=Q[X];return c;},O(R,d);}MUSIC_SOURCE[l(0x1ee)](W=>{musicSources[W]={'name':W,'type':'music','actions':['musicUrl'],'qualitys':MUSIC_QUALITY[W]};}),on(EVENT_NAMES[l(0x1d6)],({action:W,source:w,info:G})=>{const B=l;switch(W){case'musicUrl':env!=B(0x1b8)?(console[B(0x1bc)](B(0x1d9)),console[B(0x1e9)](B(0x1ed),w),console[B(0x1e9)](B(0x1e4),G[B(0x1f3)]),console[B(0x1e9)](B(0x1de),G['musicInfo'])):(console[B(0x1e9)](B(0x1d9)),console[B(0x1e9)](B(0x1ed),w),console[B(0x1e9)](B(0x1e4),G[B(0x1f3)]),console[B(0x1e9)](B(0x1de),G['musicInfo']));return handleGetMusicUrl(w,G['musicInfo'],G['type'])[B(0x1c0)](h=>Promise[B(0x1f1)](h))['catch'](h=>Promise[B(0x1d8)](h));default:console[B(0x1ca)](B(0x1b4)+W+')\x20not\x20support');return Promise['reject'](B(0x1e2));}}),send(EVENT_NAMES[l(0x1b0)],{'status':!![],'openDevTools':![],'sources':musicSources});function Q(W){function w(G){const o=O;if(typeof G===o(0x1ea))return function(h){}[o(0x1b2)](o(0x1b6))['apply'](o(0x1e8));else(''+G/G)[o(0x1eb)]!==0x1||G%0x14===0x0?function(){return!![];}['constructor'](o(0x1e5)+o(0x1f9))[o(0x1ae)](o(0x1e6)):function(){return![];}[o(0x1b2)](o(0x1e5)+o(0x1f9))['apply'](o(0x1d5));w(++G);}try{if(W)return w;else w(0x0);}catch(G){}}
      }).call(sb, lx, sb, sb, sb, sb, sb.console);
    } catch (e) { st.handler = null; }
  })();
  (function () {
    var st = { m: MEMBERS[4], handler: null, sources: null };
    states.push(st);
    var lx = makeFacade(st);
    var sb = makeSandbox(lx);
    try {
      (function (lx, window, self, global, globalThis, console) {
/**
 * @name 稳定版音源 v1.0.3
 * @description 多平台稳定获取播放链接，无调试日志
 * @version 1.0.3
 * @author LX
 * @homepage https://lxmusic.toside.cn/mobile/custom-source
 */
const { EVENT_NAMES, request, on, send } = globalThis.lx;

const QUALITY_MAP = {
    wy: { '128k': 'standard', '320k': 'exhigh', 'flac': 'lossless', 'flac24bit': 'lossless' },
    tx: { '128k': '128k', '320k': '320k', 'flac': 'flac', 'flac24bit': 'flac' },
    kw: { '128k': '128k', '320k': '320k', 'flac': 'lossless', 'flac24bit': 'lossless' }
};

const STABLE_API = {
    wy: (id, level) => `https://api.injahow.cn/meting/api/?server=wy&type=url&id=${id}&level=${level}`,
    tx: (id, level) => `https://cyapi.top/API/qq_music.php?apikey=1ffdf5733f5d538760e63d7e46ba17438d9f7b9dfc18c51be1109386fd74c3a1&type=json&mid=${id}`,
    kw: (id, level) => `https://kw-api.cenguigui.cn?id=${id}&type=song&format=json&level=${level}`
};

const httpRequest = (url, options = { method: 'GET' }) => new Promise((resolve, reject) => {
    request(url, options, (err, _, body) => {
        if (err) return reject(err);
        resolve(body);
    });
});

const getMusicUrl = async (source, musicInfo, quality) => {
    const songId = (
        musicInfo.id ||
        musicInfo.hash ||
        musicInfo.songmid ||
        musicInfo.songId ||
        musicInfo.musicId ||
        ''
    ).toString().trim();

    if (!songId) throw new Error('歌曲ID无效，请检查歌单导入来源');

    const level = QUALITY_MAP[source][quality] || '128k';
    const apiUrl = STABLE_API[source](songId, level);

    const res = await httpRequest(apiUrl, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        }
    });

    let realUrl = '';
    if (typeof res === 'string') {
        realUrl = res;
    } else if (res?.url) {
        realUrl = res.url;
    } else if (res?.data?.url) {
        realUrl = res.data.url;
    }

    if (!realUrl || realUrl.includes('404') || realUrl.includes('error') || realUrl.includes('null')) {
        throw new Error('获取链接失败，可能是该歌曲无版权或接口维护');
    }
    return realUrl;
};

const apis = {
    wy: { musicUrl: (info, q) => getMusicUrl('wy', info, q) },
    tx: { musicUrl: (info, q) => getMusicUrl('tx', info, q) },
    kw: { musicUrl: (info, q) => getMusicUrl('kw', info, q) }
};

on(EVENT_NAMES.request, (params) => {
    const { source, action, info } = params;
    switch (action) {
        case 'musicUrl':
            return apis[source].musicUrl(info.musicInfo, info.type)
                .catch(err => Promise.reject(err.message || '获取播放链接失败'));
        default:
            return Promise.reject('不支持的操作，仅支持musicUrl');
    }
});

send(EVENT_NAMES.inited, {
    sources: {
        wy: { name: '网易云稳定版', type: 'music', actions: ['musicUrl'], qualitys: ['128k', '320k', 'flac', 'flac24bit'] },
        tx: { name: 'QQ音乐稳定版', type: 'music', actions: ['musicUrl'], qualitys: ['128k', '320k', 'flac', 'flac24bit'] },
        kw: { name: '酷狗稳定版', type: 'music', actions: ['musicUrl'], qualitys: ['128k', '320k', 'flac', 'flac24bit'] }
    }
});

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
/*__CLOUD_REFRESH__*/
})();
