

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
