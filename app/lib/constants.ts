export type Item = {
  id: string;
  name: string;
  desc: string;
  quality: 'common' | 'rare' | 'legendary';
  // ⚠️ 修复点：在这里增加了 'accessory'
  type: 'weapon' | 'armor' | 'accessory' | 'misc'; 
};

export type Skill = {
  name: string;
  level: number;
  desc: string;
};

export type Equipment = {
  weapon: Item | null;
  armor: Item | null;
  accessory: Item | null;
};

export type HeroState = {
  name: string;
  level: number;
  gender: '男' | '女';
  age: number;
  cultivation: string;
  
  hp: number;
  maxHp: number;
  exp: number;
  maxExp: number;
  gold: number;
  location: string;
  state: 'idle' | 'fight' | 'sleep';
  
  logs: LogEntry[];
  inventory: Item[];
  equipment: Equipment;
  
  skills: Skill[];
  lifeSkills: Skill[];
  
  stats: {
    kills: number;
    deaths: number;
    days: number;
  };
};

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai';
  time: string;
};

// 掉落物品库
export const LOOT_TABLE: Partial<Item>[] = [
  { name: "半个冷馒头", type: 'misc', desc: "硬得像石头，但能填饱肚子。" },
  { name: "生锈的铁剑", type: 'weapon', desc: "虽然锈迹斑斑，但也勉强能用。" },
  { name: "不知名的野花", type: 'misc', desc: "路边采的，有一股淡淡的幽香。" },
  { name: "粗布麻衣", type: 'armor', desc: "满是补丁，聊胜于无。" },
  { name: "破损的护身符", type: 'accessory', desc: "似乎是某个寺庙求来的，绳子都断了。" },
  { name: "家书", type: 'misc', desc: "不知是谁遗落的，字迹已经模糊。" },
];

export const STATIC_LOGS = {
  idle: [
    "微风拂过，路边的狗尾巴草挠得少侠鼻子发痒。",
    "少侠停下脚步，抖了抖鞋里的沙子，顺便看了一眼远处的青山。",
    "路过一片竹林，少侠试图用剑劈开落叶，结果差点扭了腰。",
    "肚子咕咕叫了一声，少侠摸出半个冷馒头啃了起来。",
    "远处传来几声鸦啼，江湖路远，少侠紧了紧背后的包袱。",
    "遇到一个算命瞎子，非说少侠印堂发黑，少侠没理他。",
    "天色渐暗，路边的野花倒是开得正好。",
    "路过一间破败的山神庙，少侠进去躲了会儿雨。",
  ],
  fight: [
    "那毛贼不知死活，挥舞着生锈的片刀冲了上来。",
    "少侠侧身一闪，脚下使了个绊子，那恶霸便摔了个狗吃屎。",
    "剑光一闪！少侠并未拔剑，仅用剑鞘便点中了对方的麻穴。",
    "对方使出一招'黑虎掏心'，少侠冷笑一声，反手一掌将其击退。",
    "一番缠斗，少侠衣衫虽有些凌乱，但眼神却愈发锐利。",
  ],
  sleep: [
    "夜深了，少侠找了棵避风的老树，和衣而卧。",
    "梦里，少侠似乎又回到了那个桃花盛开的小村庄。",
  ]
};