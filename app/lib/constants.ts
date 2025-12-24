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
  idleUntil?: number; 

  // ⚠️ 新增：剧情缓冲池。存放 AI 提前写好的一整段剧情，等待逐条播放。
  storyBuffer: string[];

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

// ⚠️ 剧本节点结构
export type ScriptNode = {
    id: string;
    chapter: string; 
    summary: string; 
    objective: string; 
    location: string; 
    requirements?: { level?: number; item?: string }; 
    rewards?: { gold: number; exp: number; item?: string };
};

// ⚠️⚠️⚠️ 核心数据：遗落群岛完整剧本 (全10章) ⚠️⚠️⚠️
export const NOVEL_SCRIPT: ScriptNode[] = [
    // --- 第一章：海之囚徒 ---
    {
        id: "1-1",
        chapter: "第一章：海之囚徒",
        location: "起始岛海滩",
        objective: "寻找生命之源",
        summary: "剧烈的头痛如重锤敲击，喉咙干渴得像吞了火炭。你俯卧在湿漉漉的沙滩上，周围是救生舱的残骸。脱水正在吞噬你的体力。必须深入岛屿腹地，寻找可饮用的淡水水源。"
    },
    {
        id: "1-2",
        chapter: "第一章：海之囚徒",
        location: "防风岩壁",
        objective: "升起第一堆篝火",
        summary: "夜幕降临，气温骤降。没有火，你可能会失温而死。你尝试了无数次钻木取火，双手磨出了血泡。必须搜集枯木与椰子绒，引燃火种，并确保火堆整夜不灭。"
    },
    {
        id: "1-3",
        chapter: "第一章：海之囚徒",
        location: "深夜营地",
        objective: "猎杀监视者",
        summary: "深夜，你听到了机械摩擦声。一只半掩在沙土中的机械螃蟹正死死盯着你。这是一场不对等的战斗。利用粗木棍和走位，避开它的金属钳，击碎它的核心电路。"
    },
    {
        id: "1-4",
        chapter: "第一章：海之囚徒",
        location: "黑色礁石区",
        objective: "石器时代的飞跃",
        summary: "徒手无法生存。你利用铁皮和黑曜石，开始制作工具。你的目光望向了远方海平线上的阴影——铁锈岛。你需要制作一把石斧和一支尖锐的长矛。"
    },
    // ... (此处省略后续章节以节省空间，实际代码请保留完整的 NOVEL_SCRIPT) ...
    // 为了代码能跑，我至少保留第2章作为示例
    {
        id: "2-1",
        chapter: "第二章：第一艘筏",
        location: "起始岛沙滩",
        objective: "绘制木筏蓝图",
        summary: "淡水和椰子枯竭。看着远处的铁锈岛，你决定离开。根据浮力原理，在沙滩上画下双层甲板木筏的图纸，计算所需的浮木和泡沫板。"
    }
];

// --- 其他静态配置 ---
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

export const AUTO_TASKS: any = {}; 

export const MAIN_SAGA = [{ title: "遗落群岛", goal: "重启文明", phase: "survival", desc: "活下去。", tasks: [], location: "起始岛", reqLevel: 1 }]; 

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
export const EXPEDITION_LOCATIONS = [{ name: "遗忘掩体", desc: "阴森。", diff: 4, duration: 1800000, rewards: {gold: 100, exp: 200, lootChance: 0.5} }];