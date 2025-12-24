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

// 阵营改为：自然、幸存者、野蛮人、旧文明遗迹
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
  godPower: number; // 这里的 GodPower 改名为 "意志力/San值" 的概念（在UI上显示不变，逻辑上理解为意志）
  unlockedFeatures: string[]; storyStage: string;
  mainStoryIndex: number; 
  pet: Pet | null;
  attributes: { constitution: number; strength: number; dexterity: number; intelligence: number; luck: number; };
  stamina: number; maxStamina: number;
  hp: number; maxHp: number; exp: number; maxExp: number; 
  gold: number; // 这里的 Gold 理解为 "资源点"
  alignment: number;
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

// ⚠️ 核心重构：生存氛围文本
export const FLAVOR_TEXTS = {
  environment: ["海浪拍打礁石的轰鸣", "丛林深处未知的嘶吼", "暴雨打在芭蕉叶上的声音", "远处火山的黑烟", "腐烂植物的气味", "刺骨的海风"],
  action: ["磨尖手中的木棍", "用雨水清洗伤口", "生吃了一只螃蟹", "警惕地环顾四周", "在树皮上刻下记号", "整理破烂的行囊"],
  object: ["生锈的铁片", "奇怪的动物骨头", "被冲上岸的漂流瓶", "燧石", "干枯的椰子", "半截旧时代的塑料"]
};

// ⚠️ 核心重构：进化史诗 (The Evolution Saga)
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

// ⚠️ 支线任务：生存委托
export const SIDE_QUESTS = {
  "荒芜海滩": [
    { title: "收集淡水", desc: "没有水，我活不过三天。", obj: "寻找水源", antagonist: "干渴" },
    { title: "捡拾海货", desc: "退潮了，去礁石区看看有什么吃的。", obj: "赶海", antagonist: "海蛇" }
  ],
  "深邃丛林": [
    { title: "采集草药", desc: "伤口开始发炎了，我需要止血草。", obj: "采药", antagonist: "毒虫" },
    { title: "伐木", desc: "需要更坚固的庇护所。", obj: "伐木", antagonist: "劳累" }
  ],
  "default": [
    { title: "探索周边", desc: "绘制这片区域的地图。", obj: "探索", antagonist: "迷路" },
    { title: "制作陷阱", desc: "希望能抓到兔子或者老鼠。", obj: "狩猎", antagonist: "狡猾的动物" }
  ]
};

export const WORLD_ARCHIVE = [
  "【大崩坏】：旧文明在一夜之间毁灭，原因至今不明。",
  "【变异生物】：辐射还是病毒？动物们变得巨大且狂暴。",
  "【幸存者】：并不是所有人类都友善，在这个世界，他人即地狱。",
  "【遗迹】：旧时代的城市废墟，埋藏着科技和危险。",
  "【黑石】：一种神秘的矿物，似乎能赋予人特殊的力量。"
];

export const WORLD_LORE = "文明已死，唯适者生存。";

// 幸存者伙伴
export const NPC_ARCHETYPES = {
  common: [
    { job: "迷失者", buff: "luck", desc: "眼神空洞，只会机械地收集树枝。" },
    { job: "野狗", buff: "attack", desc: "它看起来很饿，但似乎愿意跟着你。" },
    { job: "逃兵", buff: "defense", desc: "穿着破烂的迷彩服，紧紧抱着一把没子弹的枪。" }
  ],
  rare: [
    { job: "医生", buff: "heal", desc: "他的急救包里只剩下一卷绷带了。" },
    { job: "工匠", buff: "exp", desc: "他能用废铁片磨出一把好刀。" }
  ],
  epic: [
    { job: "特种兵", buff: "attack", desc: "旧时代的杀人机器，沉默寡言。" },
    { job: "植物学家", buff: "luck", desc: "她知道哪些蘑菇能吃，哪些能毒死一头象。" }
  ],
  legendary: [
    { job: "先知", buff: "luck", desc: "那个疯疯癫癫的老头，他说他见过世界毁灭的样子。" }
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

// 生存物资 Loot
export const LOOT_TABLE: Partial<Item>[] = [
  { name: "椰子", type: 'consumable', desc: "甘甜的椰汁，救命的物资。", price: 5, minLevel: 1, quality: 'common', effect: 20 },
  { name: "绷带", type: 'consumable', desc: "破布条消毒后制成。", price: 10, minLevel: 1, quality: 'common', effect: 50 },
  { name: "抗生素", type: 'consumable', desc: "旧世界的遗物，比黄金还珍贵。", price: 500, minLevel: 10, quality: 'epic', effect: 100 },
  { name: "压缩饼干", type: 'consumable', desc: "硬得像砖头，但能提供大量热量。", price: 50, minLevel: 5, quality: 'rare', effect: 80 },
  { name: "《野外生存指南》", type: 'book', desc: "虽然缺了几页，但依然很有用。", price: 100, minLevel: 1, quality: 'rare', effect: "生存知识" },
  { name: "黑曜石匕首", type: 'weapon', desc: "极其锋利，甚至能切开岩石。", price: 200, minLevel: 5, quality: 'rare', power: 30 },
  { name: "消防斧", type: 'weapon', desc: "红色的油漆已经剥落，刃口依然寒光闪闪。", price: 500, minLevel: 10, quality: 'epic', power: 60 },
  { name: "骨矛", type: 'weapon', desc: "野兽的大腿骨磨制而成。", price: 20, minLevel: 1, quality: 'common', power: 15 },
  { name: "兽皮衣", type: 'body', desc: "散发着腥味，但很暖和。", price: 50, minLevel: 5, quality: 'common', power: 10 },
  { name: "战术背心", type: 'body', desc: "不知道从哪个尸体上扒下来的。", price: 1000, minLevel: 20, quality: 'legendary', power: 50 }
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

export const STATIC_LOGS = {
  idle: [
    "肚子咕咕叫了，得找点吃的。",
    "伤口有点痒，希望没有感染。",
    "望着无尽的大海，心里一阵绝望。",
    "篝火快灭了，得加点柴。",
    "整理了一下背包里的物资，每一件都至关重要。"
  ]
};