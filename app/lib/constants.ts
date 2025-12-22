export type ItemType = 'weapon' | 'head' | 'body' | 'legs' | 'feet' | 'accessory' | 'misc';

export type Item = {
  id: string;
  name: string;
  desc: string;
  quality: 'common' | 'rare' | 'legendary';
  type: ItemType;
  count: number;
  price: number;
};

export type Equipment = {
  weapon: Item | null;
  head: Item | null;
  body: Item | null;
  legs: Item | null;
  feet: Item | null;
  accessory: Item | null;
};

// 任务类型
export type QuestType = 'search' | 'hunt' | 'challenge' | 'train' | 'life';

export type Quest = {
  name: string;
  type: QuestType;
  desc: string;
  progress: number;
  total: number;
};

export type HeroState = {
  name: string;
  level: number;
  gender: '男' | '女';
  age: number;
  personality: string; // 新增：性格
  title: string;       // 新增：江湖称号
  
  // 五维属性
  attributes: {
    constitution: number; // 体魄 (血量)
    strength: number;     // 臂力 (战斗)
    dexterity: number;    // 身法 (闪避)
    intelligence: number; // 悟性 (学技能)
    luck: number;         // 福源 (掉落)
  };

  hp: number; maxHp: number;
  exp: number; maxExp: number;
  gold: number;
  alignment: number; // 善恶

  currentQuest: Quest; // 升级为对象
  
  location: string;
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon';
  
  logs: LogEntry[];
  majorEvents: string[]; // 新增：大事记
  
  inventory: Item[];
  equipment: Equipment;
  skills: Skill[];
  lifeSkills: Skill[];
  
  stats: {
    kills: number;
    days: number;
  };
};

export type Skill = {
  name: string;
  level: number;
  type: 'martial' | 'life';
  desc: string;
};

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai';
  time: string;
};

// 性格库
export const PERSONALITIES = [
  "热血", "懒散", "狡诈", "木讷", "贪财", "好色", "高冷", "中二", "社恐"
];

// 任务模板生成器
export const QUEST_SOURCES = {
  search: ["寻找失传的《菊花宝典》", "探寻前朝宝藏的线索", "搜集打造神兵的玄铁", "寻找传说中的不老泉"],
  hunt:   ["讨伐盘踞山头的土匪", "清理后山的野猪王", "追捕采花大盗", "消灭变异的史莱姆"],
  challenge: ["挑战华山派大弟子", "去少林寺踢馆", "与丐帮长老比拼酒量", "参加武林大会预选赛"],
  train:  ["在瀑布下练习抗击打", "每天挥剑一万次", "练习用筷子夹苍蝇", "背诵武功心法口诀"],
  life:   ["帮隔壁王大妈带孩子", "去集市摆摊卖艺", "帮村长修补屋顶", "为心上人写一首情诗"]
};

// 掉落表保持不变...
export const LOOT_TABLE: Partial<Item>[] = [
  { name: "半个冷馒头", type: 'misc', desc: "硬得像石头。", price: 1 },
  { name: "金疮药", type: 'misc', desc: "救急良药。", price: 50 },
  { name: "生锈的铁剑", type: 'weapon', desc: "勉强能用。", price: 30 },
  { name: "粗布头巾", type: 'head', desc: "只能束发。", price: 10 },
  { name: "破旧皮甲", type: 'body', desc: "有股汗味。", price: 40 },
  { name: "草鞋", type: 'feet', desc: "千里之行始于足下。", price: 5 },
  { name: "平安符", type: 'accessory', desc: "保平安。", price: 88 },
];

export const STATIC_LOGS = {
  idle: ["微风拂过。", "发了一会儿呆。", "整理了一下衣角。", "打了个哈欠。"],
  fight: ["你来我往。", "刀光剑影。", "险象环生。"],
  town: ["集市热闹非凡。", "闻到了酒香。", "路人行色匆匆。"],
};