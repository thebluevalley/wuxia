export type HeroState = {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  maxExp: number;
  gold: number;
  location: string;
  state: 'idle' | 'fight' | 'sleep'; // 状态机
  logs: LogEntry[];
};

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai';
  time: string;
};

// 静态兜底文案 (当AI未触发时)
export const STATIC_LOGS = {
  idle: [
    "微风拂过，路边的狗尾巴草挠得少侠鼻子发痒。",
    "少侠停下脚步，抖了抖鞋里的沙子。",
    "路过一片竹林，少侠试图用剑劈开落叶，结果差点扭了腰。",
    "肚子咕咕叫了一声，少侠摸出半个冷馒头啃了起来。",
    "远处传来几声鸦啼，江湖路远，少侠紧了紧背后的包袱。",
  ],
  fight: [
    "少侠与拦路的小毛贼扭打在一起。",
    "对方使出一招黑虎掏心，少侠侧身闪过。",
    "少侠胡乱挥舞着手中的铁剑，居然吓退了野狗。",
  ]
};