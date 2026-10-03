/*!
 * @name 落雪云更新音源(实测)
 * @description 启动自动拉取服务器最新实测音源配置，桌面端云端换源即时生效，移动端内置兜底+更新提醒
 * @version 2026.10.03
 * @author ql-lx-source
 * @homepage https://github.com/moxi5445/lx-music-cloud
 *
 * 固定导入地址（永久有效）：https://raw.githubusercontent.com/moxi5445/lx-music-cloud/main/lx-cloud.js
 * 运行时配置通道（按序回退）：raw.githubusercontent / cdn.jsdelivr / fastly.jsdelivr / gh-proxy / ghproxy
 *
 * 由 ql-lx-source 1.3.2 于 2026-10-03 23:00:03 自动生成
 * 成员仅收录当轮五平台真实取链成功者（平台:实测最高音质）：
 *   1. 𝖧౿ᥣᥣ𝗈 Ԝ𝗈𝗋ᥣᑯ（实测 酷我:flac24bit/酷狗:flac24bit/QQ音乐:flac/网易云:flac24bit/咪咕:flac，44.8分）
 *   2. HYWmusic_beta_公益测试（实测 酷我:flac24bit/酷狗:flac/QQ音乐:flac24bit/网易云:flac24bit，39.3分）
 *   3. gdstudio音乐源（实测 酷狗:flac24bit/网易云:flac24bit/咪咕:flac24bit，31分）
 *   4. 聚合音源 v5.0 (融合版)（实测 酷我:flac24bit/QQ音乐:128k，15.4分）
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
  var MEMBERS = [{"n":"𝖧౿ᥣᥣ𝗈 Ԝ𝗈𝗋ᥣᑯ","v":"260925","a":"hello world","s":44.8,"caps":{"kw":4,"kg":4,"tx":3,"wy":4,"mg":3}},{"n":"HYWmusic_beta_公益测试","v":"v0.74.0","a":"Ryn","s":39.33,"caps":{"kw":4,"kg":3,"tx":4,"wy":4}},{"n":"gdstudio音乐源","v":"1.0.1","a":"lx-music","s":31.04,"caps":{"kg":4,"wy":4,"mg":4}},{"n":"聚合音源 v5.0 (融合版)","v":"v5.0","a":"融合整理","s":15.44,"caps":{"kw":4,"tx":1}}];
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
  var CLOUD_VERSION = 202610032300;
  var CLOUD_VERSION_TEXT = "2026-10-03 23:00:03";
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
