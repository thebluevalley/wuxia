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

// ⚠️ 核心升级：八大势力
export type Faction = 'alliance' | 'freedom' | 'court' | 'sword' | 'healer' | 'cult' | 'invader' | 'neutral';
export const FACTIONS: Record<Faction, string> = {
  alliance: "长生盟 (江南财阀)",
  freedom: "自在门 (绿林豪客)",
  court: "锦衣卫 (皇权鹰犬)",
  sword: "东海剑阁 (隐世剑修)",
  healer: "药王谷 (悬壶济世)",
  cult: "拜火教 (西域异端)",
  invader: "北莽 (草原铁骑)",
  neutral: "市井百态"
};

export type QuestCategory = 'combat' | 'life';
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
  };
  desc: string; 
  stage: QuestStage;
  progress: number; 
  total: number;
  reqLevel: number;
  isAuto?: boolean;
  staminaCost: number; 
  rewards: { gold: number; exp: number; item?: Item; };
};

export type SkillType = 'attack' | 'inner' | 'speed' | 'medical' | 'trade';
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
  godPower: number; unlockedFeatures: string[]; storyStage: string;
  pet: Pet | null;
  attributes: { constitution: number; strength: number; dexterity: number; intelligence: number; luck: number; };
  stamina: number; maxStamina: number;
  hp: number; maxHp: number; exp: number; maxExp: number; gold: number; alignment: number;
  reputation: Record<Faction, number>;
  
  tags: string[]; 
  actionCounts: Record<string, number>; 
  description: string; 

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

// --- 典故系统 (World Archive) ---
// 这是一个巨大的文本库，AI 会从中汲取灵感，让世界显得古老而深邃
export const WORLD_ARCHIVE = [
  "【天机榜】：百晓生所著，记录天下兵器。排名第一的'天问剑'已失踪六十年。",
  "【胭脂泪】：三十年前，魔教圣女爱上了少林方丈，最终在断肠崖自尽。至今每逢雨夜，崖下仍有哭声。",
  "【北拒狼烟】：大将军李牧之死守孤城十三年，城破之日，满城百姓无一人投降。",
  "【药王试毒】：为了研制解药，药王谷谷主以身试毒，变成了一个半人半鬼的怪物，被锁在谷底。",
  "【剑阁闭门】：东海剑阁宣布封岛五十年，传闻是在参悟'无剑之境'。",
  "【长生之谜】：据说皇宫深处藏着半张残卷，记载了长生不老的秘密，但也诅咒了每一个拥有它的皇帝。",
  "【酒神咒】：喝得越醉，剑法越强。这是失传已久的'醉仙望月步'的心法。",
  "【红尘客栈】：江湖中唯一不能动手的地方。老板娘风情万种，但没人见过她出手的样子，因为见过的都死了。"
];

export const NPC_NAMES_MALE = ["苏", "萧", "叶", "顾", "沈", "陆", "江", "楚", "独孤", "西门", "诸葛", "慕容", "李", "王", "张", "刘", "陈"];
export const NPC_NAMES_FEMALE = ["灵儿", "语嫣", "婉清", "盈盈", "莫愁", "芷若", "敏", "蓉", "念慈", "素素", "红药", "师师"];
export const NPC_NAMES_LAST = ["无忌", "一刀", "留香", "不败", "寻欢", "风", "云", "雷", "电", "靖", "康", "峰", "平", "冲"];

export const NPC_ARCHETYPES = {
  common: [
    { job: "茶博士", buff: "luck", desc: "提着长嘴铜壶，听遍了南来北往的故事。" },
    { job: "落魄书生", buff: "exp", desc: "背着书箱，希望能考取功名，或者练成绝世武功。" },
    { job: "卖花姑娘", buff: "heal", desc: "在这乱世中，她是唯一的一抹亮色。" }, 
    { job: "市井泼皮", buff: "attack", desc: "虽然无赖，但却是打探消息的好手。" }
  ],
  rare: [
    { job: "铃医", buff: "heal", desc: "摇着串铃走街串巷，专治疑难杂症。" },
    { job: "退伍老兵", buff: "defense", desc: "一条腿留在了北疆战场，但手里的刀依然锋利。" },
    { job: "算命先生", buff: "luck", desc: "铁口直断，据说曾是钦天监的官员。" },
    { job: "赏金猎人", buff: "attack", desc: "只要给钱，连鬼都敢抓。" }
  ],
  epic: [
    { job: "锦衣卫百户", buff: "attack", desc: "飞鱼服，绣春刀，令人闻风丧胆。" },
    { job: "苗疆蛊女", buff: "attack", desc: "美丽的背后是致命的毒药。" }, 
    { job: "少林武僧", buff: "defense", desc: "铜皮铁骨，慈悲为怀。" }, 
    { job: "丐帮长老", buff: "exp", desc: "身披九袋，通晓天下大事。" }
  ],
  legendary: [
    { job: "白发魔女", buff: "attack", desc: "为情所困，一夜白头，武功深不可测。" },
    { job: "剑圣传人", buff: "attack", desc: "背负着振兴剑阁的重任，剑气冲天。" }, 
    { job: "隐世国师", buff: "exp", desc: "看破红尘，却又放不下苍生。" }
  ]
};

export const NPC_TRAITS = ["豪爽", "阴险", "痴情", "贪财", "愚忠", "避世", "狂妄", "儒雅", "粗鲁", "神秘"];

export const SKILL_LIBRARY = {
  attack: ["太祖长拳", "降龙十八掌", "独孤九剑", "打狗棒法", "六脉神剑", "辟邪剑法", "七伤拳"],
  inner:  ["易筋经", "九阳神功", "北冥神功", "九阴真经", "葵花宝典", "吸星大法"],
  speed:  ["凌波微步", "梯云纵", "神行百变", "水上漂", "踏雪无痕"],
  medical:["平一指医经", "毒经", "洗髓经", "神农百草诀"],
  trade:  ["富国策", "聚宝盆", "千金方", "鬼谷纵横术"]
};

export const PET_TEMPLATES = [
  { type: "海东青", desc: "万鹰之神，飞得最高，看得最远。" },
  { type: "莽牯朱蛤", desc: "万毒之王，百毒不侵，叫声如牛。" },
  { type: "白猿", desc: "通人性，据说腹中藏有经书。" },
  { type: "汗血马", desc: "日行千里，流汗如血，将士的生死伙伴。" },
  { type: "黑背", desc: "忠诚的猎犬，嗅觉灵敏，不死不休。" }
];

export const ARENA_OPPONENTS = ["长生盟执法长老", "锦衣卫千户", "北莽第一勇士", "西域法王", "东瀛剑豪", "隐居的扫地僧", "疯癫的武痴"];

export const MAP_LOCATIONS = {
  common: ["悦来客栈", "城隍庙", "风波亭", "乱葬岗", "渡口", "集市", "驿站"],
  search: ["楼兰古城", "剑冢", "藏经阁密室", "皇宫大内", "桃花岛"],
  hunt:   ["黑风寨", "野猪林", "北莽大营", "快活林", "五毒教总坛"],
  challenge: ["华山之巅", "紫禁之巅", "雁门关外", "聚贤庄", "侠客岛"],
  train:  ["寒玉床", "思过崖", "达摩洞", "冰火岛", "洗剑池"],
  life:   ["扬州画舫", "汴京夜市", "杏花村", "同福客栈", "醉仙楼"]
};

export const WORLD_MAP = [
  { name: "杏花村", type: "life", minLv: 1 }, { name: "山神庙", type: "common", minLv: 1 }, { name: "后山竹林", type: "train", minLv: 1 }, { name: "野猪林", type: "hunt", minLv: 1 },
  { name: "扬州城", type: "life", minLv: 10 }, { name: "快活林", type: "hunt", minLv: 10 }, { name: "悦来客栈", type: "common", minLv: 10 }, { name: "长生盟分舵", type: "challenge", minLv: 15 },
  { name: "汴京", type: "life", minLv: 30 }, { name: "锦衣卫诏狱", type: "hunt", minLv: 30 }, { name: "皇宫大内", type: "search", minLv: 35 }, { name: "太医院", type: "train", minLv: 35 },
  { name: "雁门关", type: "challenge", minLv: 40 }, { name: "北莽大营", type: "hunt", minLv: 45 }, { name: "大漠龙门", type: "life", minLv: 50 },
  { name: "昆仑山", type: "train", minLv: 60 }, { name: "光明顶", type: "challenge", minLv: 65 }, { name: "西域圣坛", type: "search", minLv: 70 },
  { name: "东海剑阁", type: "train", minLv: 80 }, { name: "侠客岛", type: "search", minLv: 85 }, { name: "剑冢", type: "search", minLv: 90 }, { name: "破碎虚空", type: "common", minLv: 99 }
];

// ⚠️ 核心重构：四个成长阶段 (史诗感)
export const STORY_STAGES = [
  { level: 1, name: "微尘", desc: "在这个巨大的时代里，你只是一粒微不足道的尘埃。" },
  { level: 15, name: "棋子", desc: "你开始有了一些利用价值，各大势力试图掌控你的命运。" },
  { level: 40, name: "破局者", desc: "你不再甘心被摆布，开始用剑为自己杀出一条路。" },
  { level: 70, name: "国士", desc: "你的名字，成了这个摇摇欲坠的国家的最后希望。" },
  { level: 100, name: "传说", desc: "后世的书里，将会用最浓墨重彩的一笔来记录你。" }
];

export const FLAVOR_TEXTS = {
  environment: ["夕阳染红了古道", "江南烟雨迷蒙", "大漠孤烟直", "京城繁华如梦", "边关风雪交加", "竹林幽静深邃"],
  action: ["温了一壶老酒", "擦拭着剑上的血迹", "望着远方出神", "与路人闲聊", "大笑三声", "低头沉思"],
  object: ["半卷残书", "一串铜钱", "断裂的箭头", "胭脂盒", "发黄的信纸", "无主的孤坟"]
};

// ⚠️ 核心重构：巨著级剧本 (多重反转，人性深度)
export const QUEST_SCRIPTS = {
  "微尘": [
    { title: "那碗阳春面", desc: "这世道，一碗热面能救一条命。但那个小乞丐盯着你的面很久了。", obj: "分享食物", antagonist: "冷漠的店小二", twist: "小乞丐吃完面，在桌上画了一张藏宝图，那是前朝皇宫的密道。", faction: 'neutral' },
    { title: "替死鬼", desc: "长生盟的少爷杀了人，管家给你十两银子，让你去顶罪。", obj: "抉择", antagonist: "长生盟管家", twist: "在牢里，你遇到了被关押二十年的“前任武林盟主”。", faction: 'alliance' }
  ],
  "棋子": [
    { title: "押运生辰纲", desc: "锦衣卫委托你押送给当朝太师的寿礼。", obj: "护送镖车", antagonist: "自在门劫匪", twist: "箱子里装的不是金银，而是从民间搜刮的三千童男童女。", faction: 'court' },
    { title: "刺杀清官", desc: "悲酥清风下单，要买扬州知府的人头。", obj: "执行刺杀", antagonist: "知府的护卫", twist: "知府是唯一在开仓放粮的好官，买凶的人是粮商。", faction: 'hidden' }
  ],
  "破局者": [
    { title: "血染金銮殿", desc: "皇帝昏庸，听信谗言要割让燕云十六州。", obj: "夜闯皇宫", antagonist: "大内总管", twist: "皇帝也是傀儡，真正的幕后黑手是长生盟。", faction: 'invader' },
    { title: "剑阁问剑", desc: "为了对抗北莽，你需要借东海剑阁的镇阁之宝。", obj: "挑战剑圣", antagonist: "剑圣", twist: "剑圣已经老死了，守剑的是他的一道执念。", faction: 'sword' }
  ],
  "国士": [
    { title: "死守襄阳", desc: "北莽四十万大军压境，朝廷已弃城。", obj: "守城三日", antagonist: "北莽狼主", twist: "城内粮草已尽，你用自己的血唤醒了全城百姓的血性。", faction: 'invader' }
  ],
  "default": [
    { title: "江湖夜话", desc: "雨夜，破庙，两人，一壶酒。", obj: "聆听", antagonist: "无", twist: "他对面的那个人，其实是他自己。", faction: 'neutral' }
  ]
};

export const WORLD_LORE = `
背景：王朝末年，内忧外患。北莽扣关，朝廷腐败，长生盟垄断江湖资源。
核心冲突：救国还是救己？守规矩还是破规矩？
基调：既有“落霞与孤鹜齐飞”的诗意，也有“白骨露于野”的残酷。
`;

export const QUEST_SOURCES = {
  search: ["寻找失传的《武穆遗书》"], hunt: ["追捕江洋大盗"], challenge: ["华山论剑"], train: ["闭关修炼"], life: ["游历红尘"]
};

export const LOOT_TABLE: Partial<Item>[] = [
  // ... (保留之前的物品，可继续增加特色物品)
  { name: "女儿红(二十年)", type: 'consumable', desc: "埋在地下二十年的好酒，喝一口少一口。", price: 100, minLevel: 20, quality: 'rare', effect: 200 },
  { name: "叫花鸡", type: 'consumable', desc: "荷叶包着的美味，香飘十里。", price: 50, minLevel: 10, quality: 'common', effect: 80 },
  { name: "《广陵散》残谱", type: 'book', desc: "嵇康绝响，曲意高古。", price: 2000, minLevel: 40, quality: 'epic', effect: "音波功" },
];

export const STATIC_LOGS = {
  idle: [
    "雨打芭蕉，点点滴滴，勾起了对故人的思念。",
    "集市上，卖糖葫芦的老汉吆喝声依旧，仿佛这乱世与他无关。",
    "路过书院，听到郎朗读书声：'为天地立心，为生民立命'。",
    "在酒馆角落，看到一个断臂刀客在用左手艰难地夹花生米。",
    "天边的云彩像极了那年离开家乡时看到的晚霞。",
  ],
  fight: [
    "这一剑，不为杀人，只为问道。",
    "刀光剑影中，你仿佛看到了对手眼中的无奈。",
    "胜负只在一念之间，生死往往身不由己。",
    "周围的空气仿佛凝固，只有心跳声清晰可闻。",
  ],
  town: [
    "青楼楚馆依然歌舞升平，商女不知亡国恨。",
    "米店门口的施粥棚前排起了长龙，都是逃难来的流民。",
    "几个锦衣卫骑马冲过街道，撞翻了路边的小摊，无人敢言。",
  ],
  arena: [
    "擂台上，两位成名已久的高手正在比拼内力，头顶冒出白烟。",
    "台下有人在开盘口，押注谁能站到最后。",
    "虽是比武，亦是搏命，江湖路远，谁也不想就在这里倒下。",
  ]
};