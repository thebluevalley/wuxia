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

export type QuestCategory = 'main' | 'side'; 
export type QuestRank = 1 | 2 | 3 | 4 | 5;
export type QuestStage = 'start' | 'road' | 'climax' | 'end'; 
export type QuestType = 'search' | 'hunt' | 'challenge' | 'train' | 'life';

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

export const FLAVOR_TEXTS = {
  environment: ["海浪拍打礁石", "丛林深处未知的嘶吼", "暴雨打在芭蕉叶上", "远处火山的黑烟", "腐烂植物的气味", "刺骨的海风"],
  action: ["磨尖木棍", "清洗伤口", "生吃螃蟹", "警惕四周", "在树皮刻下记号", "检查水源"],
  object: ["生锈铁片", "动物骨头", "漂流瓶", "燧石", "干椰子", "塑料碎片"]
};

// 兼容旧逻辑
export const QUEST_SCRIPTS = {
  "default": [
    { title: "探索", desc: "探索周边。", obj: "探索", antagonist: "无", twist: "无" }
  ]
};

export const MAIN_SAGA = [
  {
    title: "第一章：搁浅",
    npc: "无",
    desc: "我在冰冷的海水中醒来，肺部像火烧一样。四周是陌生的沙滩和茂密的丛林。我必须先检查身体状况，确认自己还活着。",
    obj: "确认存活",
    antagonist: "失温与脱水",
    twist: "沙滩上有一串巨大的、不像人类的脚印。",
    location: "荒芜海滩",
    reqLevel: 1
  },
  {
    title: "第二章：第一团火",
    npc: "求生本能",
    desc: "夜幕降临，丛林里的声音让人毛骨悚然。我需要光和热。我需要火。我的双手已经磨出了血泡。",
    obj: "钻木取火",
    antagonist: "黑暗与恐惧",
    twist: "火光引来了一些不该来的东西。",
    location: "海边岩洞",
    reqLevel: 3
  },
  {
    title: "第三章：猎杀时刻",
    npc: "丛林法则",
    desc: "椰子和贝壳已经无法满足身体的消耗。我必须制作武器，进入丛林深处。要么狩猎，要么被猎。",
    obj: "狩猎野猪",
    antagonist: "丛林野猪王",
    twist: "这只野猪身上插着一支断箭，这里还有其他人！",
    location: "深邃丛林",
    reqLevel: 5
  },
  {
    title: "第四章：神秘信号",
    npc: "无线电噪音",
    desc: "我在山顶发现了一架坠毁的老式飞机残骸。无线电里似乎传出断断续续的人声。我必须修复它。",
    obj: "修复无线电",
    antagonist: "守护残骸的豹子",
    twist: "信号不是求救，而是警告：'不要靠近'。",
    location: "坠机山顶",
    reqLevel: 10
  },
  {
    title: "第五章：野蛮接触",
    npc: "被俘的探险家",
    desc: "我发现了一个野人部落的营地，笼子里关着一个现代装束的人。是救他，还是看着他被吃掉？",
    obj: "劫营",
    antagonist: "食人族酋长",
    twist: "那个探险家竟然知道我的名字。",
    location: "食人族营地",
    reqLevel: 20
  },
  {
    title: "第六章：造船",
    npc: "季风",
    desc: "这个岛是个监狱。我收集了足够的木材和藤蔓。是时候离开这里，去寻找大陆了。",
    obj: "建造木筏",
    antagonist: "海洋风暴",
    twist: "海平线下，一座巨大的黑色金字塔缓缓升起。",
    location: "离岛港湾",
    reqLevel: 30
  }
];

export const SIDE_QUESTS = {
  "荒芜海滩": [
    { title: "收集淡水", desc: "寻找可饮用的水源。", obj: "找水", antagonist: "干渴" },
    { title: "捡拾海货", desc: "去礁石区找吃的。", obj: "赶海", antagonist: "海蛇" }
  ],
  "深邃丛林": [
    { title: "采集草药", desc: "寻找止血草。", obj: "采药", antagonist: "毒虫" },
    { title: "伐木", desc: "收集木材。", obj: "伐木", antagonist: "劳累" }
  ],
  "default": [
    { title: "探索周边", desc: "绘制地图。", obj: "探索", antagonist: "迷路" },
    { title: "制作陷阱", desc: "抓点小动物。", obj: "狩猎", antagonist: "狡猾的动物" }
  ]
};

export const WORLD_ARCHIVE = [
  "【大崩坏】：旧文明毁灭，原因不明。",
  "【变异】：动物变得巨大且狂暴。",
  "【幸存者】：他人即地狱。",
  "【遗迹】：废墟中埋藏着科技。",
  "【黑石】：神秘的矿物，能赋予力量。"
];

export const WORLD_LORE = "文明已死，唯适者生存。";

export const NPC_ARCHETYPES = {
  common: [
    { job: "迷失者", buff: "luck", desc: "只会机械地收集树枝。" },
    { job: "野狗", buff: "attack", desc: "很饿，但愿意跟着你。" },
    { job: "逃兵", buff: "defense", desc: "抱着一把没子弹的枪。" }
  ],
  rare: [
    { job: "医生", buff: "heal", desc: "急救包里只剩绷带。" },
    { job: "工匠", buff: "exp", desc: "能用废铁磨出好刀。" }
  ],
  epic: [
    { job: "特种兵", buff: "attack", desc: "沉默的杀人机器。" },
    { job: "植物学家", buff: "luck", desc: "知道哪些蘑菇能吃。" }
  ],
  legendary: [
    { job: "先知", buff: "luck", desc: "见过世界毁灭的样子。" }
  ]
};

export const SKILL_LIBRARY = {
  combat: ["矛术", "弓箭", "投石", "陷阱", "近身格斗"],
  intrigue: ["伪装", "潜行", "恐吓", "谈判"],
  survival: ["生火", "净水", "急救", "辨识植物", "剥皮"],
  knowledge: ["旧时代知识", "地理", "机械维修", "生物学"],
  command: ["营地管理", "驯兽", "战术指挥"]
};

export const PERSONALITIES = ["坚韧", "偏执", "冷静", "疯狂", "乐观", "冷血", "谨慎"];
export const NPC_NAMES_MALE = ["杰克", "罗伊", "汤姆", "黑石", "老骨头", "刀疤", "阿强", "独眼"];
export const NPC_NAMES_FEMALE = ["安娜", "劳拉", "小红", "野花", "萨拉", "毒藤", "麻雀"];
export const NPC_NAMES_LAST = ["无名氏", "幸存者", "流浪者", "野人", "博士", "猎手"];
export const NPC_TRAITS = ["受伤的", "饥饿的", "强壮的", "聪明的", "疯狂的"];

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "椰子", type: 'consumable', desc: "甘甜的椰汁。", price: 5, minLevel: 1, quality: 'common', effect: 20 },
  { name: "绷带", type: 'consumable', desc: "消毒过的布条。", price: 10, minLevel: 1, quality: 'common', effect: 50 },
  { name: "抗生素", type: 'consumable', desc: "比黄金珍贵。", price: 500, minLevel: 10, quality: 'epic', effect: 100 },
  { name: "压缩饼干", type: 'consumable', desc: "硬得像砖头。", price: 50, minLevel: 5, quality: 'rare', effect: 80 },
  { name: "《生存指南》", type: 'book', desc: "缺了几页。", price: 100, minLevel: 1, quality: 'rare', effect: "生存知识" },
  { name: "黑曜石匕首", type: 'weapon', desc: "极锋利。", price: 200, minLevel: 5, quality: 'rare', power: 30 },
  { name: "消防斧", type: 'weapon', desc: "刃口寒光闪闪。", price: 500, minLevel: 10, quality: 'epic', power: 60 },
  { name: "骨矛", type: 'weapon', desc: "兽骨磨制。", price: 20, minLevel: 1, quality: 'common', power: 15 },
  { name: "兽皮衣", type: 'body', desc: "暖和但有腥味。", price: 50, minLevel: 5, quality: 'common', power: 10 },
  { name: "战术背心", type: 'body', desc: "从尸体上扒下来的。", price: 1000, minLevel: 20, quality: 'legendary', power: 50 }
];

export const MAP_LOCATIONS = {
  common: ["沙滩", "浅海", "椰林"],
  search: ["坠机点", "废弃营地", "神秘山洞"],
  hunt: ["野猪林", "沼泽", "深海"],
  challenge: ["火山", "食人族祭坛", "地下设施"],
  train: ["安全屋", "瀑布下"],
  life: ["临时营地", "篝火旁"]
};

export const WORLD_MAP = [
  { name: "荒芜海滩", type: "life", minLv: 1 }, 
  { name: "椰林边缘", type: "common", minLv: 1 },
  { name: "深邃丛林", type: "hunt", minLv: 5 },
  { name: "坠机山顶", type: "search", minLv: 10 },
  { name: "食人族营地", type: "challenge", minLv: 20 },
  { name: "地下遗迹", type: "dungeon", minLv: 40 }
];

export const STORY_STAGES = [
  { level: 1, name: "幸存者" },
  { level: 10, name: "狩猎者" },
  { level: 30, name: "开拓者" },
  { level: 60, name: "征服者" },
  { level: 90, name: "世界之王" }
];

// ⚠️ 核心修复：海量扩充兜底文本，防止重复
export const STATIC_LOGS = {
  idle: [
    "捡起一块锋利的石头，或许能做个刮刀。",
    "海风带来了咸腥味，暴风雨可能要来了。",
    "远处丛林里传来树枝折断的声音，我握紧了武器。",
    "在沙滩上画出了目前的地图，希望能找到出路。",
    "收集了一些干枯的棕榈叶，用来加固庇护所。",
    "发现了一些不知名的脚印，看起来不像是野兽。",
    "肚子饿得难受，必须尽快找到食物。",
    "伤口有点发炎，用海水清洗了一下，钻心的疼。",
    "望着无尽的大海，想起了以前的世界。",
    "把背包里的物资重新整理了一遍，确认没有受潮。",
    "尝试钻木取火，手掌都磨破了，终于冒出了一缕烟。",
    "看到一只海鸥飞过，它的方向可能有陆地。",
    "鞋底磨穿了，得想办法用兽皮补一补。",
    "听到了类似无线电的杂音，是幻觉吗？",
    "在岩石缝里找到了几只螃蟹，今晚有饭吃了。",
    "把生锈的铁片磨亮，做成了一把简易匕首。",
    "太阳太毒了，躲在树荫下喘口气。",
    "在树上刻下了生存的天数：第 5 天。",
    "发现了淡水水源，虽然有点浑浊，但能救命。",
    "一只蜥蜴从脚边爬过，动作极快。"
  ]
};