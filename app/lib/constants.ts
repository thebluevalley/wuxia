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

export type Faction = 'alliance' | 'freedom' | 'court' | 'sword' | 'healer' | 'cult' | 'invader' | 'hidden' | 'neutral';
export const FACTIONS: Record<Faction, string> = {
  alliance: "长生盟",
  freedom: "自在门",
  court: "锦衣卫",
  sword: "东海剑阁",
  healer: "药王谷",
  cult: "拜火教",
  invader: "北莽",
  hidden: "悲酥清风",
  neutral: "市井"
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
  // ⚠️ 隐性计数器：用于分析玩家性格
  actionCounts: {
    kills: number;        // 杀敌数
    retreats: number;     // 逃跑/撤退数
    gambles: number;      // 赌博/冒险次数
    charity: number;      // 施舍/助人次数
    betrayals: number;    // 背叛/行恶次数
    shopping: number;     // 购物次数
    drinking: number;     // 饮酒次数
  }; 
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
  stats: { kills: number; days: number; arenaWins: number; }; // 基础统计
  tavern: { visitors: Companion[]; lastRefresh: number; };
  companion: Companion | null; companionExpiry: number;
};

export type LogEntry = { id: string; text: string; type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai'; time: string; };

// --- 典故系统 ---
export const WORLD_ARCHIVE = [
  "【天机榜】：百晓生所著，记录天下兵器。排名第一的'天问剑'已失踪六十年。",
  "【胭脂泪】：三十年前，魔教圣女爱上了少林方丈，最终在断肠崖自尽。",
  "【北拒狼烟】：大将军李牧之死守孤城十三年，城破之日，满城百姓无一人投降。",
  "【药王试毒】：为了研制解药，药王谷谷主以身试毒，变成了一个半人半鬼的怪物。",
  "【剑阁闭门】：东海剑阁宣布封岛五十年，传闻是在参悟'无剑之境'。",
  "【长生之谜】：据说皇宫深处藏着半张残卷，记载了长生不老的秘密。",
  "【酒神咒】：喝得越醉，剑法越强。这是失传已久的'醉仙望月步'的心法。",
  "【红尘客栈】：江湖中唯一不能动手的地方。老板娘风情万种，但没人见过她出手。"
];

export const PERSONALITIES = ["侠义", "乐天", "狂放", "儒雅", "贪财", "痴情", "机灵", "中庸", "逍遥", "阴狠", "慈悲"];
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

export const QUEST_SCRIPTS = {
  "微尘": [
    { title: "那碗阳春面", desc: "这世道，一碗热面能救一条命。", obj: "分享食物", antagonist: "冷漠的店小二", twist: "小乞丐吃完面，在桌上画了一张前朝皇宫的密道图。", faction: 'neutral' },
    { title: "替死鬼", desc: "长生盟的少爷杀了人，管家让你去顶罪。", obj: "抉择", antagonist: "长生盟管家", twist: "在牢里，你遇到了被关押二十年的“前任武林盟主”。", faction: 'alliance' }
  ],
  "棋子": [
    { title: "押运生辰纲", desc: "锦衣卫委托你押送给当朝太师的寿礼。", obj: "护送镖车", antagonist: "自在门劫匪", twist: "箱子里装的不是金银，而是三千童男童女。", faction: 'court' },
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
背景：王朝末年，内忧外患。北莽扣关，朝廷腐败。
核心：从微尘到国士的成长之路。
`;

export const QUEST_SOURCES = {
  search: ["寻找失传的《武穆遗书》"], hunt: ["追捕江洋大盗"], challenge: ["华山论剑"], train: ["闭关修炼"], life: ["游历红尘"]
};

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "女儿红(二十年)", type: 'consumable', desc: "埋在地下二十年的好酒，喝一口少一口。", price: 100, minLevel: 20, quality: 'rare', effect: 200 },
  { name: "叫花鸡", type: 'consumable', desc: "荷叶包着的美味，香飘十里。", price: 50, minLevel: 10, quality: 'common', effect: 80 },
  { name: "《广陵散》残谱", type: 'book', desc: "嵇康绝响，曲意高古。", price: 2000, minLevel: 40, quality: 'epic', effect: "音波功" },
  { name: "半个冷馒头", type: 'consumable', desc: "干硬难咽，聊胜于无。", price: 1, minLevel: 1, quality: 'common', effect: 10 }, 
  { name: "金疮药", type: 'consumable', desc: "江湖常备跌打药。", price: 50, minLevel: 15, quality: 'common', effect: 100 },
  { name: "清心丹", type: 'consumable', desc: "压制心魔，恢复神智。", price: 100, minLevel: 10, quality: 'rare', effect: 150 }, 
  { name: "九花玉露丸", type: 'consumable', desc: "桃花岛秘药，清香袭人。", price: 300, minLevel: 30, quality: 'rare', effect: 300 },
  { name: "黑玉断续膏", type: 'consumable', desc: "西域灵药，可续断骨。", price: 500, minLevel: 40, quality: 'rare', effect: 500 },
  { name: "天山雪莲", type: 'consumable', desc: "生于绝壁，不仅回血还能精进修为。", price: 1000, minLevel: 50, quality: 'epic', effect: 1000 },
  { name: "血菩提", type: 'consumable', desc: "生长在火麒麟洞内，传说能起死回生。", price: 2000, minLevel: 60, quality: 'epic', effect: 2000 },
  { name: "《长拳图解》", type: 'book', desc: "太祖长拳的入门图谱。", price: 50, minLevel: 1, quality: 'common', effect: "太祖长拳" },
  { name: "《吐纳心法》", type: 'book', desc: "道家基础呼吸法门。", price: 100, minLevel: 5, quality: 'common', effect: "吐纳法" },
  { name: "《草上飞秘籍》", type: 'book', desc: "轻功入门，身轻如燕。", price: 200, minLevel: 10, quality: 'common', effect: "草上飞" },
  { name: "《打狗棒法残卷》", type: 'book', desc: "丐帮绝学，虽然残缺但精妙无比。", price: 800, minLevel: 20, quality: 'rare', effect: "打狗棒法" },
  { name: "《落英神剑掌谱》", type: 'book', desc: "姿态优美，虚实难测。", price: 1000, minLevel: 25, quality: 'rare', effect: "落英神剑掌" },
  { name: "《易筋经》", type: 'book', desc: "少林至宝，改易筋骨。", price: 5000, minLevel: 50, quality: 'legendary', effect: "易筋经" },
  { name: "《独孤剑意》", type: 'book', desc: "无招胜有招，只有剑意传承。", price: 6000, minLevel: 60, quality: 'legendary', effect: "独孤九剑" },
  { name: "《疯魔录》", type: 'book', desc: "记载了禁忌武学的邪书，读之令人心神不宁。", price: 4000, minLevel: 45, quality: 'epic', effect: "逆转经脉" },
  { name: "生锈的铁剑", type: 'weapon', desc: "勉强能砍东西。", price: 10, minLevel: 1, quality: 'common', power: 5 },
  { name: "哨棒", type: 'weapon', desc: "结实的木棒。", price: 5, minLevel: 1, quality: 'common', power: 3 },
  { name: "精钢剑", type: 'weapon', desc: "百炼精钢打造。", price: 150, minLevel: 10, quality: 'common', power: 20 },
  { name: "百炼钢刀", type: 'weapon', desc: "刀背厚实，利于劈砍。", price: 180, minLevel: 12, quality: 'rare', power: 35 },
  { name: "判官笔", type: 'weapon', desc: "精铁所制，专点穴道。", price: 300, minLevel: 20, quality: 'rare', power: 50 },
  { name: "玄铁重剑(仿)", type: 'weapon', desc: "重剑无锋，大巧不工。", price: 1000, minLevel: 40, quality: 'epic', power: 120 },
  { name: "倚天剑", type: 'weapon', desc: "安得倚天抽宝剑，跨海斩长鲸。", price: 5000, minLevel: 60, quality: 'legendary', power: 300 },
  { name: "屠龙刀", type: 'weapon', desc: "武林至尊，宝刀屠龙。", price: 5500, minLevel: 65, quality: 'legendary', power: 320 },
  { name: "打狗棒", type: 'weapon', desc: "通体碧绿，坚韧无比。", price: 4500, minLevel: 55, quality: 'epic', power: 250 },
  { name: "粗布头巾", type: 'head', desc: "遮风挡雨。", price: 5, minLevel: 1, quality: 'common', power: 2 },
  { name: "麻布衣", type: 'body', desc: "寻常百姓的衣物。", price: 10, minLevel: 1, quality: 'common', power: 5 },
  { name: "草鞋", type: 'feet', desc: "走久了脚会磨泡。", price: 2, minLevel: 1, quality: 'common', power: 1 },
  { name: "皮甲", type: 'body', desc: "硬皮硝制，有一定防御力。", price: 80, minLevel: 10, quality: 'common', power: 15 },
  { name: "虎皮裙", type: 'legs', desc: "看起来很威风。", price: 150, minLevel: 15, quality: 'rare', power: 20 },
  { name: "神行太保靴", type: 'feet', desc: "穿上后健步如飞。", price: 300, minLevel: 20, quality: 'rare', power: 25 },
  { name: "金丝软甲", type: 'body', desc: "刀枪不入，轻便贴身。", price: 4000, minLevel: 55, quality: 'legendary', power: 150 },
  { name: "软猬甲", type: 'body', desc: "桃花岛至宝，满布倒刺。", price: 4200, minLevel: 58, quality: 'legendary', power: 160 },
  { name: "平安符", type: 'accessory', desc: "庙里求来的，保平安。", price: 20, minLevel: 1, quality: 'common', power: 5 },
  { name: "精铁护腕", type: 'accessory', desc: "保护手腕，增加臂力。", price: 100, minLevel: 10, quality: 'rare', power: 15 },
  { name: "温玉佩", type: 'accessory', desc: "冬暖夏凉，凝神静气。", price: 500, minLevel: 30, quality: 'epic', power: 40 },
  { name: "通灵宝玉", type: 'accessory', desc: "似乎蕴含着某种灵性。", price: 2000, minLevel: 50, quality: 'legendary', power: 100 },
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