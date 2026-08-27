// 设计令牌：全部取自产品源码 app/globals.css :root，只做克制复用。
export const C = {
  paper: "#fffaf4",
  paperSoft: "#fff4ef",
  blush: "#fde7e4",
  blushStrong: "#f8cec9",
  rose: "#f45f75",
  roseDark: "#b72d4d",
  roseDeep: "#99233e",
  wine: "#3a1f2b",
  peach: "#f5b8ad",
  sky: "#cfe8ef",
  butter: "#f7dfa0",
  white: "#fffefd",
  muted: "#75646a",
} as const;

// 字体（macOS 系统字体，与产品一致）
export const FONT_DISPLAY = `"Songti SC","STSong","Noto Serif CJK SC",Georgia,serif`;
export const FONT_SANS = `"PingFang SC","Microsoft YaHei",Arial,sans-serif`;

// 动效性格 token：产品为"亲和/社区 + 活泼社交"混合 → 用亲和友好预设微调
export const EASE_ENTER = [0.25, 0.46, 0.45, 0.94] as const; // 入场缓动（弹 1.04）
