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

export type Faction = 'nature' | 'survivor' | 'savage' | 'ruins' | 'beast' | 'unknown' | 'neutral' | 'faith' | 'watch'; 

export type QuestCategory = 'main' | 'side' | 'auto'; 
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
    npc?: string; 
  };
  desc: string; 
  stage: QuestStage;
  progress: number; 
  total: number;
  reqLevel: number;
  staminaCost: number; 
  isAuto?: boolean; 
  rewards: { gold: number; exp: number; item?: Item; };
};

export type Expedition = {
  id: string;
  name: string;
  desc: string;
  difficulty: QuestRank;
  duration: number; 
  startTime?: number;
  endTime?: number;
  location: string;
  rewards: { gold: number; exp: number; lootChance: number };
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

// ⚠️ 新增：策略状态，用于驱动 AI 逻辑
export type StrategyState = {
    longTermGoal: string; // "逃离荒岛"
    currentFocus: string; // "储备淡水"
    urgency: 'low' | 'medium' | 'high'; // 紧迫感
    narrativePhase: 'survival' | 'exploration' | 'mystery' | 'escape'; // 叙事阶段
};

export type HeroState = {
  name: string; level: number; gender: '男' | '女'; age: number; personality: string; title: string; motto: string;
  godPower: number; 
  unlockedFeatures: string[]; storyStage: string;
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
  
  // ⚠️ 核心：主角的思考模块
  strategy: StrategyState;

  currentQuest: Quest | null;
  queuedQuest: Quest | null;
  questBoard: Quest[];
  lastQuestRefresh: number;

  activeExpedition: Expedition | null;
  expeditionBoard: Expedition[];
  lastExpeditionRefresh: number;

  narrativeHistory: string;
  location: string; 
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon' | 'arena' | 'expedition';
  logs: LogEntry[]; messages: Message[]; majorEvents: string[];
  inventory: Item[]; equipment: Equipment; martialArts: Skill[]; lifeSkills: Skill[];
  stats: { kills: number; days: number; arenaWins: number; }; 
  tavern: { visitors: Companion[]; lastRefresh: number; };
  companion: Companion | null; companionExpiry: number;
};

export type LogEntry = { id: string; text: string; type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai'; time: string; };

export const FLAVOR_TEXTS = {
  environment: ["潮湿的海风", "丛林深处的嘶吼", "暴雨闷响", "火山黑烟", "腐烂气味", "刺骨海风"],
  action: ["磨尖木棍", "清洗伤口", "生吃螃蟹", "警惕四周", "刻下记号", "检查水源"],
  object: ["生锈铁片", "动物白骨", "漂流瓶", "燧石", "干椰子", "塑料碎片"]
};

// ⚠️ 核心升级：主线阶段定义 (The Grand Story)
// 包含每个阶段的“目标”和“推荐自动任务池”
export const MAIN_SAGA = [
  { 
    title: "第一章：苟延残喘", 
    goal: "活过头三天，稳定生命体征。",
    phase: "survival",
    desc: "痛。全身都痛。我必须先解决水和体温的问题。", 
    tasks: ["寻找淡水", "收集干草", "捡拾贝壳", "包扎伤口"],
    location: "荒芜海滩", 
    reqLevel: 1 
  },
  { 
    title: "第二章：建立营地", 
    goal: "搭建一个能遮风挡雨的庇护所。",
    phase: "survival",
    desc: "暴风雨要来了，没有屋顶我会死在晚上。", 
    tasks: ["收集漂流木", "编织藤蔓", "寻找山洞", "搬运石头"],
    location: "椰林边缘", 
    reqLevel: 3 
  },
  { 
    title: "第三章：探索内陆", 
    goal: "查明岛屿深处的怪声来源。",
    phase: "exploration",
    desc: "海滩的资源枯竭了，我必须向深处进发，哪怕那里有野兽。", 
    tasks: ["制作长矛", "绘制地图", "追踪兽径", "采集野果"],
    location: "深邃丛林", 
    reqLevel: 5 
  },
  { 
    title: "第四章：旧日幽灵", 
    goal: "调查二战遗迹，寻找逃生线索。",
    phase: "mystery",
    desc: "我在山顶看到了金属的反光，那是文明的痕迹。", 
    tasks: ["搜寻废墟", "解读日记", "寻找无线电", "拆解零件"],
    location: "坠机山顶", 
    reqLevel: 10 
  },
  { 
    title: "第五章：绝地求生", 
    goal: "建造木筏，在这个雨季结束前离开。",
    phase: "escape",
    desc: "只要风向改变，我就有机会。这是最后的赌博。", 
    tasks: ["伐木", "储备干粮", "加固木筏", "观测星象"],
    location: "荒芜海滩", 
    reqLevel: 15 
  }
];

// 动态事件种子 (复用之前的逻辑)
export const EVENT_SEEDS: Record<string, string[]> = {
  "收集": ["发现完美的弯曲木头", "木头太湿", "手被扎", "发现虫子", "有油漆痕迹", "捆绑树枝", "拖拽浮木", "海浪卷走木材"],
  "寻找": ["扒开蕨类", "查看石缝", "追踪足迹", "发现排泄物", "阳光刺眼", "用棍探路", "闻到异味", "看到闪光"],
  "制作": ["刀口崩了", "绳子勒手", "唾液软化", "零件咔哒声", "材料坚硬", "刮掉树皮", "火烤变硬", "打磨边缘"],
  "休息": ["倒出鞋沙", "清洗伤口", "嚼草根", "盯着火苗", "画地图", "整理破烂", "数食物", "按摩肌肉"],
  "荒芜海滩": ["寄居蟹夹脚", "塑料瓶", "信天翁尸体", "生锈铁罐", "涨潮转移", "风吹沙", "海面背鳍", "白色珊瑚"],
  "深邃丛林": ["藤蔓划脸", "巨大蜘蛛", "踩陷泥土", "猴子叫声", "空气潮湿", "红色果实", "毒蚊", "树根绊倒"]
};

export const SIDE_QUESTS = {
  "荒芜海滩": [{ title: "抓捕沙蟹", desc: "储备食物。", obj: "寻找", antagonist: "螃蟹" }],
  "深邃丛林": [{ title: "寻找草药", desc: "止血草。", obj: "寻找", antagonist: "蛇" }],
  "default": [{ title: "打磨工具", desc: "备战。", obj: "制作", antagonist: "手酸" }]
};

export const AUTO_TASKS: any = {}; // 废弃，由 Main Saga 动态接管

export const WORLD_ARCHIVE = ["【日记】", "【吼声】", "【残骸】", "【图腾】"];
export const WORLD_LORE = "文明已死，唯适者生存。";
export const NPC_ARCHETYPES = { common: [{ job: "流浪者", buff: "luck", desc: "眼神游离。" }], rare: [{ job: "医生", buff: "heal", desc: "幸存医生。" }], epic: [{ job: "特种兵", buff: "attack", desc: "单兵作战。" }], legendary: [{ job: "土著", buff: "luck", desc: "秘密。" }] };
export const SKILL_LIBRARY = { combat: ["矛术"], intrigue: ["潜行"], survival: ["生火"], knowledge: ["地理"], command: ["驯兽"] };
export const PERSONALITIES = ["坚韧", "悲观", "冷静"];
export const NPC_NAMES_MALE = ["阿杰", "老黑"];
export const NPC_NAMES_FEMALE = ["小红", "安娜"];
export const NPC_NAMES_LAST = ["幸存者"];
export const NPC_TRAITS = ["饥饿的", "受伤的"];
export const LOOT_TABLE: Partial<Item>[] = [{ name: "椰子", type: 'consumable', desc: "水。", price: 5, minLevel: 1, quality: 'common', effect: 20 }];
export const MAP_LOCATIONS = { common: ["沙滩"], search: ["残骸"], hunt: ["密林"], challenge: ["火山"], train: ["营地"], life: ["河边"] };
export const WORLD_MAP = [{ name: "荒芜海滩", type: "life", minLv: 1 }, { name: "深邃丛林", type: "hunt", minLv: 5 }, { name: "坠机山顶", type: "search", minLv: 10 }];
export const STORY_STAGES = [{ level: 1, name: "幸存者" }];
export const STATIC_LOGS = { idle: ["海浪拍打礁石。", "擦拭伤口。", "空气有土腥味。", "远处野兽嚎叫。", "盯着铁片发呆。"] };
export const EXPEDITION_LOCATIONS = [{ name: "遗忘掩体", desc: "阴森。", diff: 4, duration: 1800000, rewards: {gold: 100, exp: 200, lootChance: 0.5} }];