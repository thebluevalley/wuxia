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
  environment: ["海浪拍打礁石", "丛林深处未知的嘶吼", "暴雨打在芭蕉叶上", "远处火山的黑烟", "腐烂植物的气味", "刺骨的海风"],
  action: ["磨尖木棍", "清洗伤口", "生吃螃蟹", "警惕四周", "在树皮刻下记号", "检查水源"],
  object: ["生锈铁片", "动物骨头", "漂流瓶", "燧石", "干椰子", "塑料碎片"]
};

// ⚠️ 核心升级：海量预设事件种子库
// 这里的每一条都是具体的物理事件，AI 负责把它写得好看
export const EVENT_SEEDS: Record<string, string[]> = {
  // 通用动作
  "收集": [
    "发现了一根形状完美的弯曲木头", "木头太湿了，很难搬运", "手被木刺扎了一下", "翻开木头发现下面有虫子", 
    "这块木头上有旧时代的油漆痕迹", "把几根小树枝捆在一起", "用力拖拽一根巨大的浮木", "海浪差点卷走刚收集的木材"
  ],
  "寻找": [
    "扒开茂密的蕨类植物", "在石头缝隙里仔细查看", "顺着动物的足迹追踪", "发现了一些奇怪的排泄物",
    "阳光太刺眼，眯着眼睛观察", "用棍子探路，防止踩空", "闻到了远处飘来的异味", "似乎看到了闪光的东西"
  ],
  "制作": [
    "石刀的刃口崩了一个缺口", "绳子打结时不小心勒到了手", "尝试用唾液软化藤蔓", "零件拼凑在一起发出了咔哒声",
    "这种材料比想象中更坚硬", "刮掉表面的树皮", "用火烤一下让木头变硬", "仔细打磨边缘直到光滑"
  ],
  "休息": [
    "脱下鞋子倒出里面的沙子", "用海水清洗发炎的伤口", "嚼着一根带甜味的草根", "盯着火苗发呆",
    "在沙滩上画出了家乡的地图", "整理背包里的破烂", "数着剩下的食物储备", "按摩酸痛的小腿肌肉"
  ],
  
  // 特定地点事件
  "荒芜海滩": [
    "一只寄居蟹夹住了脚趾", "海浪冲上来一个塑料瓶", "发现了一只死去的信天翁", "沙子里埋着半个生锈的铁罐",
    "涨潮了，不得不往高处移动", "海风把沙子吹进了眼睛", "远处海面上似乎有背鳍划过", "捡到一块漂亮的白色珊瑚"
  ],
  "深邃丛林": [
    "被带刺的藤蔓划破了脸", "一只巨大的蜘蛛落在肩膀上", "踩到了松软的腐殖土，陷了下去", "听到头顶传来猴子的叫声",
    "空气潮湿得让人窒息", "发现了一棵长满红色果实的树", "蚊子多得像轰炸机", "被树根绊了一跤"
  ]
};

export const EXPEDITION_LOCATIONS = [
  { name: "被遗忘的二战掩体", desc: "岛屿深处有一个混凝土入口。", diff: 4 },
  { name: "食人族圣地", desc: "充满危险的图腾林。", diff: 5 },
  { name: "迷雾沼泽", desc: "能见度极低。", diff: 3 },
  { name: "沉船湾", desc: "巨大的货轮残骸。", diff: 4 },
  { name: "蝙蝠岩洞", desc: "巨大的天然洞穴。", diff: 2 },
  { name: "神秘灯塔", desc: "岛的另一端。", diff: 3 }
];

export const AUTO_TASKS = {
  "荒芜海滩": [
    { title: "捡拾贝壳", desc: "寻找容器。", obj: "收集", antagonist: "沙蟹" },
    { title: "清理营地", desc: "防止毒虫。", obj: "整理", antagonist: "蜈蚣" },
    { title: "观察潮汐", desc: "记录规律。", obj: "观察", antagonist: "无聊" }
  ],
  "深邃丛林": [
    { title: "采集藤蔓", desc: "需要绳子。", obj: "收集", antagonist: "带刺植物" },
    { title: "加固陷阱", desc: "检查套索。", obj: "制作", antagonist: "空手而归" }
  ],
  "default": [
    { title: "打磨工具", desc: "磨锋利。", obj: "制作", antagonist: "手酸" },
    { title: "整理物资", desc: "盘点。", obj: "休息", antagonist: "饥饿感" }
  ]
};

export const MAIN_SAGA = [
  { title: "第一章：苏醒", npc: "无", desc: "痛。全身都痛。我被冲上了一个陌生的海滩。", obj: "检查伤势", antagonist: "剧痛", twist: "腿上有一道深深的口子。", location: "荒芜海滩", reqLevel: 1 },
  { title: "第二章：水源", npc: "干渴", desc: "如果不尽快找到淡水，我活不过明天。", obj: "寻找", antagonist: "脱水", twist: "发现了一个浑浊的水坑。", location: "椰林边缘", reqLevel: 2 },
  { title: "第三章：庇护所", npc: "暴风雨", desc: "一场热带风暴即将来临。", obj: "制作", antagonist: "狂风", twist: "风暴中，海面上似乎有灯光。", location: "海边岩洞", reqLevel: 3 },
  { title: "第四章：第一团火", npc: "原始本能", desc: "我需要火。我要征服这个原始世界。", obj: "制作", antagonist: "潮湿", twist: "烟雾升起。", location: "临时营地", reqLevel: 5 },
  { title: "第五章：武器", npc: "恐惧", desc: "丛林深处的吼声越来越近。", obj: "制作", antagonist: "坚硬木材", twist: "发现了一具插着断箭的尸骨。", location: "深邃丛林", reqLevel: 8 }
];

export const SIDE_QUESTS = {
  "荒芜海滩": [
    { title: "抓捕沙蟹", desc: "跑得很快。", obj: "寻找", antagonist: "螃蟹" },
    { title: "收集漂流木", desc: "优质木材。", obj: "收集", antagonist: "沉重" }
  ],
  "深邃丛林": [
    { title: "采集野果", desc: "小心有毒。", obj: "收集", antagonist: "中毒" },
    { title: "寻找草药", desc: "止血草。", obj: "寻找", antagonist: "蛇" }
  ],
  "default": [
    { title: "制作绳索", desc: "编织。", obj: "制作", antagonist: "枯燥" },
    { title: "练习投掷", desc: "提高命中。", obj: "制作", antagonist: "脱靶" }
  ]
};

export const WORLD_ARCHIVE = ["【日记残页】", "【奇怪的吼声】", "【飞机残骸】", "【部落图腾】"];
export const WORLD_LORE = "文明已死，唯适者生存。";

export const NPC_ARCHETYPES = {
  common: [{ job: "流浪者", buff: "luck", desc: "眼神游离。" }, { job: "野狗", buff: "attack", desc: "忠诚。" }],
  rare: [{ job: "医生", buff: "heal", desc: "幸存的战地医生。" }, { job: "猎人", buff: "exp", desc: "擅长陷阱。" }],
  epic: [{ job: "特种兵", buff: "attack", desc: "单兵作战强。" }],
  legendary: [{ job: "神秘土著", buff: "luck", desc: "懂得秘密。" }]
};

export const SKILL_LIBRARY = { combat: ["矛术", "弓箭"], intrigue: ["潜行"], survival: ["生火", "采集"], knowledge: ["地理"], command: ["驯兽"] };
export const PERSONALITIES = ["坚韧", "悲观", "冷静", "狂躁", "谨慎"];
export const NPC_NAMES_MALE = ["阿杰", "老黑", "山姆", "骨头"];
export const NPC_NAMES_FEMALE = ["小红", "安娜", "野花", "毒藤"];
export const NPC_NAMES_LAST = ["幸存者", "流浪者", "野人"];
export const NPC_TRAITS = ["饥饿的", "受伤的", "强壮的"];

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "椰子", type: 'consumable', desc: "补充水分。", price: 5, minLevel: 1, quality: 'common', effect: 20 },
  { name: "海龟蛋", type: 'consumable', desc: "高蛋白。", price: 10, minLevel: 1, quality: 'rare', effect: 50 },
  { name: "打火机", type: 'misc', desc: "还能打火花。", price: 50, minLevel: 1, quality: 'epic', power: 0 },
  { name: "锋利石片", type: 'weapon', desc: "原始刀具。", price: 10, minLevel: 1, quality: 'common', power: 10 },
  { name: "工兵铲", type: 'weapon', desc: "锈迹斑斑。", price: 200, minLevel: 5, quality: 'epic', power: 40 },
  { name: "登山靴", type: 'feet', desc: "保护脚底。", price: 100, minLevel: 3, quality: 'rare', power: 5 }
];

export const MAP_LOCATIONS = { common: ["沙滩"], search: ["残骸"], hunt: ["密林"], challenge: ["火山"], train: ["营地"], life: ["河边"] };
export const WORLD_MAP = [{ name: "荒芜海滩", type: "life", minLv: 1 }, { name: "深邃丛林", type: "hunt", minLv: 5 }, { name: "坠机山顶", type: "search", minLv: 10 }];
export const STORY_STAGES = [{ level: 1, name: "幸存者" }, { level: 10, name: "猎人" }, { level: 30, name: "岛主" }];

export const STATIC_LOGS = {
  idle: [
    "捡起一块锋利的石头。",
    "检查了一遍陷阱。",
    "海风有些冷。",
    "远处传来雷声。",
    "整理了一下头发。",
    "观察蚂蚁搬家。"
  ]
};