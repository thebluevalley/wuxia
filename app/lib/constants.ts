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

export type StrategyState = {
    longTermGoal: string; 
    currentFocus: string; 
    urgency: 'low' | 'medium' | 'high'; 
    narrativePhase: 'survival' | 'exploration' | 'mystery' | 'escape'; 
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
  
  strategy: StrategyState;
  currentSeed?: string;
  
  // ⚠️ 新增：休息倒计时。如果当前时间小于此值，说明正在长休息
  idleUntil?: number; 

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
  environment: ["潮湿的海风带着盐粒", "丛林深处未知的嘶吼", "暴雨打在芭蕉叶上的闷响", "远处火山腾起的黑烟", "腐烂植物的刺鼻气味", "刺骨的海风像刀割一样"],
  action: ["用力磨尖手中的木棍", "用浑浊的雨水清洗伤口", "强忍恶心生吃螃蟹", "警惕地环顾四周动静", "在树皮上刻下生存天数", "检查水源是否被污染"],
  object: ["生锈的锋利铁片", "不知名动物的白骨", "半个破碎的漂流瓶", "几块干燥的燧石", "干枯长毛的椰子", "旧时代的塑料碎片"]
};

export const EVENT_SEEDS: Record<string, string[]> = {
  "收集": ["拖拽一根吸饱水的浮木，肩膀被粗糙的树皮磨破了皮。", "翻开腐烂的圆木，几只肥硕的白色幼虫在蠕动。", "在灌木丛中收集这种坚韧的纤维，手指被荆棘划出几道血痕。", "这块石头边缘锋利如刀，正好可以用来切割猎物。", "收集了一些干燥的苔藓作为引火物，它们闻起来有股霉味。"],
  "寻找": ["趴在地上观察兽径，泥土里保留着清晰的蹄印。", "拨开茂密的蕨类植物，一只惊恐的蜥蜴窜了出去。", "空气中弥漫着淡淡的硫磺味。", "阳光穿过树冠投下斑驳的光影。", "顺着海鸟盘旋的方向走去。"],
  "制作": ["石刀一次次刮过木杆，木屑纷飞。", "用牙齿咬紧藤蔓打结，咸涩的汗水流进眼睛里。", "尝试把骨头磨成针，指尖因为长时间用力而发白。", "将两块石头互相敲击，火星四溅。", "编织这该死的草绳需要极大的耐心。"],
  "休息": ["脱下湿透的靴子，脚底已经被海水泡得发白起皱。", "靠在岩石上喘息，每一口呼吸都带着血腥味。", "用指甲一点点剔除伤口里的沙砾。", "盯着跳动的火苗出神。", "嚼着苦涩的草根，试图欺骗痉挛的胃袋。"],
  "荒芜海滩": ["涨潮了，冰冷的海水漫过脚踝。", "一只巨大的信天翁尸体躺在沙滩上。", "海风卷起细沙打在脸上。", "发现了一串巨大且奇怪的脚印延伸向大海。"],
  "深邃丛林": ["头顶传来树枝折断的脆响。", "这该死的湿度，衣服紧紧贴在身上。", "误触了一种带刺的植物，半条手臂瞬间麻木。", "在树根下发现了一个废弃的土著图腾。"]
};

export const EXPEDITION_LOCATIONS = [
  { name: "被遗忘的二战掩体", desc: "混凝土裂缝中透出阴森的风。", diff: 4 },
  { name: "食人族圣地", desc: "空气中弥漫着腐肉的气味。", diff: 5 },
  { name: "迷雾沼泽", desc: "每一步都可能陷入致命的泥潭。", diff: 3 },
  { name: "沉船湾", desc: "生锈的钢铁巨兽发出悲鸣。", diff: 4 },
  { name: "蝙蝠岩洞", desc: "黑暗中无数红色的眼睛。", diff: 2 },
  { name: "神秘灯塔", desc: "塔顶似乎还在闪烁微光。", diff: 3 }
];

export const AUTO_TASKS: any = {}; 

export const MAIN_SAGA = [
  { title: "第一章：苏醒", goal: "活过头三天，稳定生命体征。", phase: "survival", desc: "痛。全身都痛。", tasks: ["寻找淡水", "收集干草", "捡拾贝壳", "包扎伤口"], location: "荒芜海滩", reqLevel: 1 },
  { title: "第二章：建立营地", goal: "搭建一个能遮风挡雨的庇护所。", phase: "survival", desc: "暴风雨要来了。", tasks: ["收集漂流木", "编织藤蔓", "寻找山洞", "搬运石头"], location: "椰林边缘", reqLevel: 3 },
  { title: "第三章：探索内陆", goal: "查明岛屿深处的怪声来源。", phase: "exploration", desc: "海滩的资源枯竭了。", tasks: ["制作长矛", "绘制地图", "追踪兽径", "采集野果"], location: "深邃丛林", reqLevel: 5 },
  { title: "第四章：旧日幽灵", goal: "调查二战遗迹，寻找逃生线索。", phase: "mystery", desc: "我在山顶看到了金属的反光。", tasks: ["搜寻废墟", "解读日记", "寻找无线电", "拆解零件"], location: "坠机山顶", reqLevel: 10 },
  { title: "第五章：绝地求生", goal: "建造木筏，在这个雨季结束前离开。", phase: "escape", desc: "只要风向改变，我就有机会。", tasks: ["伐木", "储备干粮", "加固木筏", "观测星象"], location: "荒芜海滩", reqLevel: 15 }
];

export const SIDE_QUESTS = {
  "荒芜海滩": [{ title: "抓捕沙蟹", desc: "储备食物。", obj: "寻找", antagonist: "螃蟹" }, { title: "收集漂流木", desc: "优质木材。", obj: "收集", antagonist: "沉重" }],
  "深邃丛林": [{ title: "采集野果", desc: "小心有毒。", obj: "收集", antagonist: "中毒" }, { title: "寻找草药", desc: "止血草。", obj: "寻找", antagonist: "蛇" }],
  "default": [{ title: "制作绳索", desc: "编织。", obj: "制作", antagonist: "枯燥" }, { title: "练习投掷", desc: "提高命中。", obj: "制作", antagonist: "脱靶" }]
};

export const WORLD_ARCHIVE = ["【日记残页】", "【奇怪的吼声】", "【飞机残骸】", "【部落图腾】"];
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