export type HeroState = {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  maxExp: number;
  gold: number;
  location: string;
  logs: LogEntry[];
};

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system';
  time: string;
};

// 本地兜底文案（当AI没触发时用这个，保证流畅）
export const STATIC_EVENTS = [
  "微风拂过，路边的狗尾巴草挠得少侠鼻子发痒。",
  "少侠停下脚步，抖了抖鞋里的沙子。",
  "路过一片竹林，少侠试图用剑劈开落叶，结果差点扭了腰。",
  "肚子咕咕叫了一声，少侠摸出半个冷馒头啃了起来。",
  "远处传来几声鸦啼，江湖路远，少侠紧了紧背后的包袱。",
  "遇到一个算命瞎子，非说少侠印堂发黑，少侠没理他。",
  "天色渐暗，路边的野花倒是开得正好。"
];