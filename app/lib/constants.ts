// --- 基础类型 ---
export type ItemType = 'weapon' | 'head' | 'body' | 'legs' | 'feet' | 'accessory' | 'misc' | 'consumable' | 'book';
export type Quality = 'common' | 'rare' | 'epic' | 'legendary';

export type Item = {
  id: string;
  name: string;
  desc: string;
  quality: Quality;
  type: ItemType;
  minLevel: number;
  count: number;
  price: number;
  effect?: string | number;
  power?: number;
};

export type Equipment = {
  weapon: Item | null;
  head: Item | null;
  body: Item | null;
  legs: Item | null;
  feet: Item | null;
  accessory: Item | null;
};

export type Faction = 'stark' | 'lannister' | 'targaryen' | 'baratheon' | 'watch' | 'wildling' | 'citadel' | 'neutral' | 'faith';

// 任务类型：新增 'main' (主线)
export type QuestCategory = 'main' | 'side'; 
export type QuestRank = 1 | 2 | 3 | 4 | 5;
export type QuestStage = 'start' | 'road' | 'climax' | 'end'; 

export type Quest = { 
  id: string;
  name: string; 
  category: QuestCategory; 
  rank: QuestRank;
  faction: Faction;
  script: {
    title: string;
    description: string;
    objective: string;
    antagonist: string;
    twist: string;
    npc?: string; // 关键任务发布人
  };
  desc: string; 
  stage: QuestStage;
  progress: number; 
  total: number;
  reqLevel: number;
  staminaCost: number; 
  rewards: { gold: number; exp: number; item?: Item; };
};

export type SkillType = 'combat' | 'intrigue' | 'survival' | 'knowledge' | 'command';
export type Skill = { name: string; type: SkillType; level: number; exp: number; maxExp: number; desc: string; };

export type MessageType = 'rumor' | 'system';
export type Message = { id: string; type: MessageType; title: string; content: string; time: string; isRead: boolean; };

export type Companion = {
  id: string;
  name: string;
  gender: '男' | '女'; 
  title: string;
  archetype: string;
  personality: string;
  desc: string;
  price: number;
  quality: Quality;
  buff: { type: 'attack' | 'defense' | 'heal' | 'luck' | 'exp'; val: number; };
};

export type Pet = { name: string; type: string; level: number; desc: string; };

export type HeroState = {
  name: string; level: number; gender: '男' | '女'; age: number; personality: string; title: string; motto: string;
  godPower: number; 
  unlockedFeatures: string[]; storyStage: string;
  
  // ⚠️ 核心：主线进度索引
  mainStoryIndex: number; 

  pet: Pet | null;
  attributes: { constitution: number; strength: number; dexterity: number; intelligence: number; luck: number; };
  stamina: number; maxStamina: number;
  hp: number; maxHp: number; exp: number; maxExp: number; gold: number; alignment: number;
  reputation: Record<Faction, number>;
  
  tags: string[]; 
  actionCounts: { kills: number; retreats: number; gambles: number; charity: number; betrayals: number; shopping: number; drinking: number; }; 
  description: string; 
  equipmentDescription: string; 

  currentQuest: Quest | null;
  queuedQuest: Quest | null;
  questBoard: Quest[];
  lastQuestRefresh: number;
  narrativeHistory: string;
  location: string; 
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon' | 'arena';
  logs: LogEntry[]; messages: Message[]; majorEvents: string[];
  inventory: Item[]; equipment: Equipment; martialArts: Skill[]; lifeSkills: Skill[];
  stats: { kills: number; days: number; arenaWins: number; }; 
  tavern: { visitors: Companion[]; lastRefresh: number; };
  companion: Companion | null; companionExpiry: number;
};

export type LogEntry = { id: string; text: string; type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai'; time: string; };

// ⚠️ 核心设定：主线史诗 (Main Saga)
// 这里的每一个任务都是原著的一个关键节点
export const MAIN_SAGA = [
  {
    title: "序章：凛冬将至",
    npc: "艾德·史塔克",
    desc: "劳勃国王的车队即将抵达临冬城。公爵大人命令你协助罗德利克爵士加强城防，并准备迎接皇室。",
    obj: "迎接国王",
    antagonist: "严寒与忙碌",
    twist: "你在神木林看到了瑟曦王后和詹姆爵士在争吵，但你不敢出声。",
    location: "临冬城",
    reqLevel: 1
  },
  {
    title: "国王大道",
    npc: "琼恩·雪诺",
    desc: "艾德公爵决定南下担任首相，而琼恩将前往长城。你决定护送雪诺一程，直到国王大道的分岔口。",
    obj: "护送雪诺",
    antagonist: "路上的强盗",
    twist: "临别时，雪诺把他的冰原狼白灵托付给你照看了一晚。",
    location: "国王大道",
    reqLevel: 3
  },
  {
    title: "狮狼之争",
    npc: "凯特琳·徒利",
    desc: "在十字路口客栈，凯特琳夫人认出了“小恶魔”提利昂。她命令在场的所有封臣协助她逮捕这个兰尼斯特。",
    obj: "逮捕小恶魔",
    antagonist: "兰尼斯特卫兵",
    twist: "提利昂即使被绑着，嘴巴也像刀子一样锋利。",
    location: "十字路口客栈",
    reqLevel: 5
  },
  {
    title: "首相的比武大会",
    npc: "培提尔·贝里席",
    desc: "君临城正在举办盛大的比武大会。小指头暗示你，如果能在比武中制造一点“意外”，会有丰厚的回报。",
    obj: "参加比武",
    antagonist: "魔山格雷果",
    twist: "魔山一剑砍下了他坐骑的头，鲜血溅了你一身。",
    location: "君临城",
    reqLevel: 10
  },
  {
    title: "权力的游戏",
    npc: "瓦里斯",
    desc: "劳勃国王狩猎归来身受重伤。八爪蜘蛛瓦里斯在深夜找到了你，让你把一封密信送给史坦尼斯。",
    obj: "送信",
    antagonist: "金袍子",
    twist: "当你回来时，艾德·史塔克已经被捕了。",
    location: "红堡",
    reqLevel: 15
  },
  {
    title: "黑水河之战",
    npc: "提利昂·兰尼斯特",
    desc: "史坦尼斯的舰队逼近君临。作为代理首相，提利昂命令你负责点燃野火。",
    obj: "守卫泥门",
    antagonist: "史坦尼斯的大军",
    twist: "绿色的火焰吞噬了一切，包括你的战友。",
    location: "君临城墙",
    reqLevel: 25
  },
  {
    title: "血色婚礼",
    npc: "罗柏·史塔克",
    desc: "少狼主将在孪河城参加婚礼。虽然是不祥之地，但他必须去。你是护卫之一。",
    obj: "参加婚宴",
    antagonist: "弗雷家族的弩手",
    twist: "卡斯特梅的雨季响起，你拼死杀出重围，但国王死了。",
    location: "孪河城",
    reqLevel: 40
  },
  {
    title: "长夜守望",
    npc: "守夜人总司令",
    desc: "绝境长城告急。野人王曼斯·雷德集结了十万大军。不论之前的恩怨，你必须北上支援。",
    obj: "死守长城",
    antagonist: "野人与猛犸象",
    twist: "野人只是在逃命，真正的威胁在他们身后——异鬼。",
    location: "黑城堡",
    reqLevel: 60
  }
];

// ⚠️ 支线任务池 (Side Quests) - 填充世界
export const SIDE_QUESTS = {
  "临冬城": [
    { title: "清理狼林", desc: "狼林里的强盗最近越来越猖狂了。", obj: "剿匪", antagonist: "强盗首领" },
    { title: "铁匠的委托", desc: "微肯师傅需要一些上好的铁矿石。", obj: "采集", antagonist: "严寒" }
  ],
  "君临城": [
    { title: "跳蚤窝的讨债人", desc: "小指头的妓院有一笔烂账要收。", obj: "讨债", antagonist: "赖账的佣兵" },
    { title: "下水道的秘密", desc: "有人说在下水道看到了坦格利安的旧物。", obj: "探索", antagonist: "食人鼠" }
  ],
  "绝境长城": [
    { title: "鬼影森林巡逻", desc: "游骑兵需要人手去先民拳峰侦查。", obj: "巡逻", antagonist: "尸鬼" },
    { title: "修缮长城", desc: "东海望的城墙塌了一角。", obj: "苦力", antagonist: "高空坠落" }
  ],
  "default": [
    { title: "护送商队", desc: "一队来自自由贸易城邦的商人需要护卫。", obj: "护送", antagonist: "多斯拉克强盗" },
    { title: "比武招亲", desc: "某个小领主为了嫁女儿举办的比武。", obj: "决斗", antagonist: "流浪骑士" }
  ]
};

export const WORLD_ARCHIVE = [
  "【疯王之死】：詹姆·兰尼斯特在铁王座下刺杀了疯王伊里斯。",
  "【五王之战】：维斯特洛陷入了四分五裂，铁王座、北境、铁群岛都在流血。",
  "【守夜人誓言】：长夜将至，我从今开始守望，至死方休。",
  "【凡人皆有一死】：Valar Morghulis，这是布拉佛斯无面者的箴言。",
  "【兰尼斯特有债必偿】：这不仅是关于金钱，更是关于复仇。",
  "【龙之母】：在狭海对岸，最后的真龙孵化了三颗龙蛋。"
];

export const NPC_ARCHETYPES = {
  common: [
    { job: "酒馆老板", buff: "luck", desc: "消息灵通，但贪财。" },
    { job: "雇佣兵", buff: "attack", desc: "只认钱，不认主。" },
    { job: "吟游诗人", buff: "exp", desc: "会唱《卡斯特梅的雨季》。" }
  ],
  rare: [
    { job: "学士", buff: "exp", desc: "精通医术和毒药。" },
    { job: "守夜人游骑兵", buff: "defense", desc: "在长城外活下来的老兵。" }
  ],
  epic: [
    { job: "御林铁卫", buff: "defense", desc: "剑术超群，誓死效忠。" },
    { job: "红袍女祭司", buff: "luck", desc: "信仰光之王，能在火中看到未来。" }
  ],
  legendary: [
    { job: "无面者", buff: "attack", desc: "顶级的刺客，没有名字。" }
  ]
};

export const PERSONALITIES = ["荣誉", "狡诈", "残忍", "忠诚", "贪婪", "虔诚", "疯癫"];
export const NPC_NAMES_MALE = ["琼恩", "詹姆", "提利昂", "艾德", "罗柏", "泰温", "培提尔", "瓦里斯", "山姆", "布兰"];
export const NPC_NAMES_FEMALE = ["丹妮莉丝", "瑟曦", "珊莎", "艾莉亚", "凯特琳", "玛格丽", "布蕾妮", "耶哥蕊特"];
export const NPC_NAMES_LAST = ["史塔克", "兰尼斯特", "拜拉席恩", "坦格利安", "徒利", "提利尔", "雪诺", "佛雷", "波顿"];
export const NPC_TRAITS = ["私生子", "侏儒", "弑亲者", "骑士", "野人", "学士"];

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "青亭岛红酒", type: 'consumable', desc: "贵族享用的美酒。", price: 100, minLevel: 1, quality: 'common', effect: 50 },
  { name: "罂粟花奶", type: 'consumable', desc: "强效止痛药。", price: 50, minLevel: 10, quality: 'rare', effect: 100 },
  { name: "瓦雷利亚钢匕首", type: 'weapon', desc: "龙骨柄，锋利无比。", price: 5000, minLevel: 50, quality: 'legendary', power: 150 },
  { name: "劳勃的战锤", type: 'weapon', desc: "曾经击碎雷加胸甲的武器。", price: 4000, minLevel: 40, quality: 'epic', power: 120 },
  { name: "守夜人黑衣", type: 'body', desc: "不仅保暖，也是誓言的象征。", price: 50, minLevel: 5, quality: 'common', power: 20 },
  { name: "兰尼斯特金甲", type: 'body', desc: "华丽且防御力极高。", price: 3000, minLevel: 30, quality: 'legendary', power: 100 }
];

export const MAP_LOCATIONS = {
  common: ["跳蚤窝", "十字路口客栈", "鼹鼠村"],
  search: ["龙石岛", "旧镇学城", "赫伦堡"],
  hunt: ["御林", "鬼影森林", "颈泽"],
  challenge: ["比武审判场", "绝境长城", "弥林竞技场"],
  train: ["红堡教头场", "黑城堡演武场"],
  life: ["高庭花园", "临冬城大厅", "君临集市"]
};

export const WORLD_MAP = [
  { name: "临冬城", type: "life", minLv: 1 }, 
  { name: "国王大道", type: "common", minLv: 5 },
  { name: "君临城", type: "life", minLv: 10 },
  { name: "绝境长城", type: "train", minLv: 20 },
  { name: "铁王座", type: "challenge", minLv: 50 }
];

export const STORY_STAGES = [
  { level: 1, name: "无名之辈" },
  { level: 20, name: "风云人物" },
  { level: 50, name: "一方诸侯" },
  { level: 80, name: "维斯特洛传说" }
];

export const STATIC_LOGS = {
  idle: [
    "你擦拭着剑上的锈迹，在这乱世，这是你唯一的朋友。",
    "远处传来乌鸦的叫声，仿佛在预示着什么。",
    "寒风凛冽，你裹紧了破旧的斗篷。"
  ]
};