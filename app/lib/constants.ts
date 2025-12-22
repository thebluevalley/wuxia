export type ItemType = 'weapon' | 'head' | 'body' | 'legs' | 'feet' | 'accessory' | 'misc';

export type Item = {
  id: string;
  name: string;
  desc: string;
  quality: 'common' | 'rare' | 'legendary';
  type: ItemType;
  count: number; // 新增：堆叠数量
  price: number; // 新增：物品价值
};

export type Equipment = {
  weapon: Item | null;
  head: Item | null;    // 新增：头饰
  body: Item | null;    // 原 armor
  legs: Item | null;    // 新增：护腿
  feet: Item | null;    // 新增：鞋靴
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
  state: 'idle' | 'fight' | 'sleep' | 'town'; // 新增 town 状态
  
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

export type Skill = {
  name: string;
  level: number;
  desc: string;
};

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai';
  time: string;
};

// 扩充后的掉落表
export const LOOT_TABLE: Partial<Item>[] = [
  // 杂物
  { name: "半个冷馒头", type: 'misc', desc: "硬得像石头，但能填饱肚子。", price: 1 },
  { name: "不知名的野花", type: 'misc', desc: "路边采的，有一股淡淡的幽香。", price: 2 },
  { name: "狼皮", type: 'misc', desc: "虽然破损了，但还能卖几个钱。", price: 15 },
  { name: "金疮药", type: 'misc', desc: "江湖救急必备良药。", price: 50 },
  
  // 装备
  { name: "生锈的铁剑", type: 'weapon', desc: "虽然锈迹斑斑，但也勉强能用。", price: 30 },
  { name: "青竹杖", type: 'weapon', desc: "一根坚韧的竹子，打狗专用。", price: 25 },
  { name: "粗布头巾", type: 'head', desc: "甚至不能挡雨，只能束发。", price: 10 },
  { name: "破旧皮甲", type: 'body', desc: "猎户穿过的旧皮甲，有股汗味。", price: 40 },
  { name: "麻布裤", type: 'legs', desc: "非常宽松，方便踢腿。", price: 15 },
  { name: "草鞋", type: 'feet', desc: "行侠仗义，千里之行始于足下。", price: 5 },
  { name: "平安符", type: 'accessory', desc: "庙里求来的，希望能保平安。", price: 88 },
];

export const STATIC_LOGS = {
  idle: [
    "微风拂过，路边的狗尾巴草挠得少侠鼻子发痒。",
    "少侠停下脚步，抖了抖鞋里的沙子。",
    "路过一片竹林，少侠试图用剑劈开落叶。",
    "肚子咕咕叫了一声，少侠摸出半个冷馒头啃了起来。",
    "远处传来几声鸦啼，江湖路远，少侠紧了紧背后的包袱。",
    "遇到一个算命瞎子，非说少侠印堂发黑。",
    "天色渐暗，路边的野花倒是开得正好。",
  ],
  fight: [
    "那毛贼不知死活，挥舞着生锈的片刀冲了上来。",
    "少侠侧身一闪，脚下使了个绊子，那恶霸便摔了个狗吃屎。",
    "剑光一闪！少侠并未拔剑，仅用剑鞘便点中了对方的麻穴。",
    "对方使出一招'黑虎掏心'，少侠冷笑一声，反手一掌将其击退。",
  ],
  town: [
    "路过一个小镇，少侠决定去集市把背包里的垃圾卖掉。",
    "酒馆里人声鼎沸，少侠进去叫了一斤熟牛肉。",
    "在当铺里，掌柜的拿着放大镜仔细端详少侠捡来的破烂。",
  ]
};