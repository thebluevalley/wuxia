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

export type QuestCategory = 'main' | 'side' | 'auto'; // 新增 'auto' 类型
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

// ⚠️ 核心重构：微型自动任务 (Auto Filler Tasks)
// 当没有主线和支线时，主角会自动执行这些，确保持续产生有意义的剧情
export const AUTO_TASKS = {
  "荒芜海滩": [
    { title: "捡拾贝壳", desc: "寻找可以当碗用的贝壳。", obj: "搜索沙滩", antagonist: "沙蟹" },
    { title: "清理营地", desc: "把周围的烂叶子扫走，防止毒虫。", obj: "大扫除", antagonist: "蜈蚣" },
    { title: "晾晒海盐", desc: "收集海水晒盐。", obj: "制盐", antagonist: "潮汐" },
    { title: "观察潮汐", desc: "记录涨潮的规律。", obj: "观察", antagonist: "无聊" }
  ],
  "深邃丛林": [
    { title: "采集藤蔓", desc: "需要绳子来捆绑工具。", obj: "采集", antagonist: "带刺植物" },
    { title: "寻找驱虫草", desc: "蚊子太多了。", obj: "采药", antagonist: "毒蚊" },
    { title: "加固陷阱", desc: "检查昨天下的套索。", obj: "检查", antagonist: "空手而归" }
  ],
  "default": [
    { title: "打磨工具", desc: "把石刀磨得更锋利。", obj: "打磨", antagonist: "手酸" },
    { title: "整理物资", desc: "清点剩下的食物。", obj: "盘点", antagonist: "饥饿感" },
    { title: "仰望星空", desc: "确认方位。", obj: "观星", antagonist: "思乡" }
  ]
};

// 主线
export const MAIN_SAGA = [
  {
    title: "第一章：苏醒",
    npc: "无",
    desc: "痛。全身都痛。我被冲上了一个陌生的海滩。第一件事是确认身体状况。",
    obj: "检查伤势",
    antagonist: "剧痛",
    twist: "腿上有一道深深的口子，还在流血。",
    location: "荒芜海滩",
    reqLevel: 1
  },
  {
    title: "第二章：水源",
    npc: "干渴",
    desc: "嘴唇干裂脱皮。如果不尽快找到淡水，我活不过明天。",
    obj: "寻找水源",
    antagonist: "脱水",
    twist: "发现了一个浑浊的水坑，但也发现了野兽的脚印。",
    location: "椰林边缘",
    reqLevel: 2
  },
  {
    title: "第三章：庇护所",
    npc: "暴风雨",
    desc: "天色变暗，气压低得可怕。一场热带风暴即将来临。我必须搭建一个能遮风挡雨的地方。",
    obj: "搭建草棚",
    antagonist: "狂风暴雨",
    twist: "风暴中，海面上似乎有灯光闪过。",
    location: "海边岩洞",
    reqLevel: 3
  },
  {
    title: "第四章：第一团火",
    npc: "原始本能",
    desc: "生肉让我反胃，夜晚的低温让我瑟瑟发抖。我需要火。我要征服这个原始世界。",
    obj: "钻木取火",
    antagonist: "潮湿的木头",
    twist: "烟雾升起，但我担心引来不怀好意的东西。",
    location: "临时营地",
    reqLevel: 5
  },
  {
    title: "第五章：武器",
    npc: "恐惧",
    desc: "丛林深处的吼声越来越近。只靠石头是不够的。我需要一把真正的武器。",
    obj: "制作长矛",
    antagonist: "坚硬的木材",
    twist: "在寻找木材时，发现了一具插着断箭的尸骨。",
    location: "深邃丛林",
    reqLevel: 8
  }
];

// 支线 (扩充)
export const SIDE_QUESTS = {
  "荒芜海滩": [
    { title: "抓捕沙蟹", desc: "它们跑得很快，但肉质鲜美。", obj: "狩猎", antagonist: "灵活的螃蟹" },
    { title: "收集漂流木", desc: "优质的干燥木材。", obj: "采集", antagonist: "沉重" },
    { title: "探索礁石区", desc: "退潮后也许有惊喜。", obj: "探索", antagonist: "滑腻的石头" },
    { title: "制作鱼叉", desc: "为了捕鱼做准备。", obj: "制作", antagonist: "工艺不精" }
  ],
  "深邃丛林": [
    { title: "追踪野猪", desc: "发现了一些新鲜的粪便。", obj: "追踪", antagonist: "凶猛野猪" },
    { title: "采集野果", desc: "红色的果子通常有毒，要小心。", obj: "采集", antagonist: "中毒风险" },
    { title: "寻找草药", desc: "止血草是必备品。", obj: "采药", antagonist: "蛇" },
    { title: "伐木", desc: "储备篝火燃料。", obj: "伐木", antagonist: "劳累" }
  ],
  "default": [
    { title: "巡视领地", desc: "在营地周围做标记。", obj: "巡逻", antagonist: "入侵者" },
    { title: "制作绳索", desc: "用树皮编织。", obj: "手工", antagonist: "枯燥" },
    { title: "练习投掷", desc: "提高命中率。", obj: "训练", antagonist: "脱靶" }
  ]
};

export const WORLD_ARCHIVE = [
  "【日记残页】：前人留下的记录，提到岛中心有'神庙'。",
  "【奇怪的吼声】：昨晚的声音不像是地球上的生物。",
  "【飞机残骸】：山顶闪光的金属物体。",
  "【部落图腾】：树上刻着眼睛形状的符号。"
];

export const WORLD_LORE = "这是一个被文明遗忘的角落。";

export const NPC_ARCHETYPES = {
  common: [
    { job: "流浪者", buff: "luck", desc: "眼神游离，似乎受了很大刺激。" },
    { job: "野狗", buff: "attack", desc: "忠诚的伙伴，只要给口吃的。" }
  ],
  rare: [
    { job: "医生", buff: "heal", desc: "幸存的战地医生，随身带着手术刀。" },
    { job: "猎人", buff: "exp", desc: "擅长设置陷阱。" }
  ],
  epic: [
    { job: "特种兵", buff: "attack", desc: "单兵作战能力极强。" }
  ],
  legendary: [
    { job: "神秘土著", buff: "luck", desc: "懂得岛屿的秘密。" }
  ]
};

export const SKILL_LIBRARY = {
  combat: ["矛术", "弓箭", "陷阱"],
  intrigue: ["潜行", "伪装"],
  survival: ["生火", "净水", "急救", "采集"],
  knowledge: ["地理", "生物", "机械"],
  command: ["驯兽"]
};

export const PERSONALITIES = ["坚韧", "悲观", "冷静", "狂躁", "谨慎"];
export const NPC_NAMES_MALE = ["阿杰", "老黑", "山姆", "骨头"];
export const NPC_NAMES_FEMALE = ["小红", "安娜", "野花", "毒藤"];
export const NPC_NAMES_LAST = ["幸存者", "流浪者", "野人"];
export const NPC_TRAITS = ["饥饿的", "受伤的", "强壮的"];

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "椰子", type: 'consumable', desc: "补充水分。", price: 5, minLevel: 1, quality: 'common', effect: 20 },
  { name: "海龟蛋", type: 'consumable', desc: "高蛋白。", price: 10, minLevel: 1, quality: 'rare', effect: 50 },
  { name: "打火机", type: 'misc', desc: "虽然没油了，但还能打火花。", price: 50, minLevel: 1, quality: 'epic', power: 0 },
  { name: "锋利石片", type: 'weapon', desc: "原始的刀具。", price: 10, minLevel: 1, quality: 'common', power: 10 },
  { name: "工兵铲", type: 'weapon', desc: "锈迹斑斑，但很有用。", price: 200, minLevel: 5, quality: 'epic', power: 40 },
  { name: "登山靴", type: 'feet', desc: "保护脚底。", price: 100, minLevel: 3, quality: 'rare', power: 5 }
];

export const MAP_LOCATIONS = {
  common: ["沙滩", "椰林"],
  search: ["残骸", "山洞"],
  hunt: ["密林", "沼泽"],
  challenge: ["火山", "祭坛"],
  train: ["营地"],
  life: ["河边"]
};

export const WORLD_MAP = [
  { name: "荒芜海滩", type: "life", minLv: 1 }, 
  { name: "椰林边缘", type: "common", minLv: 1 },
  { name: "深邃丛林", type: "hunt", minLv: 5 },
  { name: "坠机山顶", type: "search", minLv: 10 }
];

export const STORY_STAGES = [
  { level: 1, name: "幸存者" },
  { level: 10, name: "猎人" },
  { level: 30, name: "岛主" }
];

// 兜底文本（仅在断网时使用）
export const STATIC_LOGS = {
  idle: [
    "用沙子擦掉匕首上的锈迹。",
    "检查了一遍陷阱，一无所获。",
    "海风有些冷，裹紧了衣服。",
    "听到远处传来雷声。",
    "一只螃蟹钻进了沙子里。"
  ]
};