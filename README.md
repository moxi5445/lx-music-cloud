# 落雪云更新音源（实测）

> 本仓库由 **ql-lx-source** 每轮巡检自动更新 · 最近构建 2026-10-05 23:00:03

## 导入（一次导入，永久自动更新）

洛雪音乐 → 设置 → 自定义源管理 → 在线导入，粘贴：

```
https://raw.githubusercontent.com/moxi5445/lx-music-cloud/main/lx-cloud.js
```

GitHub 直连失败时可用镜像地址导入：

- `https://cdn.jsdelivr.net/gh/moxi5445/lx-music-cloud@main/lx-cloud.js`
- `https://fastly.jsdelivr.net/gh/moxi5445/lx-music-cloud@main/lx-cloud.js`
- `https://gh-proxy.com/https://raw.githubusercontent.com/moxi5445/lx-music-cloud/main/lx-cloud.js`

## 工作方式

- **桌面端**：音源启动时自动拉取 `manifest.json` 获取最新实测成员清单，动态加载当日可用音源；
  服务器换源后下次启动自动生效，无需重新导入。网络异常时使用内置的最近一轮实测成员兜底。
- **移动端**：使用内置成员直接服务；服务器有新版本时弹窗提醒，点「更新」重新导入固定地址即可。
- 配置与成员拉取均走多通道回退（GitHub raw → jsDelivr → fastly → gh-proxy → ghproxy）。
- 成员脚本 md5 校验，防止传输损坏或内容被篡改。

## 当前内置成员（5 个）

- 𝖧౿ᥣᥣ𝗈 Ԝ𝗈𝗋ᥣᑯ（酷我:flac24bit/酷狗:flac24bit/QQ音乐:flac24bit/网易云:flac24bit/咪咕:flac）
- HYWmusic_公益版_v1.0.3（酷我:flac24bit/酷狗:flac24bit/QQ音乐:flac24bit/网易云:flac24bit）
- gdstudio音乐源（酷狗:flac24bit/网易云:flac24bit/咪咕:flac24bit）
- 稳定版音源 v1.0.3（QQ音乐:128k）
- KuwoDES（酷我:128k）

> 音源脚本均来自公开社区，仅收录当轮五平台真实取链校验成功者；脚本版权归原作者所有。
