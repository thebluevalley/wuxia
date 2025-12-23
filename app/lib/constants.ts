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

// ⚠️ 核心新增：势力体系
export type Faction = 'throne' | 'sect' | 'underworld' | 'cult' | 'neutral';
export const FACTIONS: Record<Faction, string> = {
  throne: "朝廷六扇门",
  sect: "名门正派",
  underworld: "绿林好汉",
  cult: "魔教异端",
  neutral: "市井江湖"
};

// ⚠️ 核心新增：剧本结构
export type QuestCategory = 'combat' | 'life';
export type QuestRank = 1 | 2 | 3 | 4 | 5;
export type QuestStage = 'start' | 'road' | 'climax' | 'end'; // 任务的四个叙事阶段

export type Quest = { 
  id: string;
  name: string; 
  category: QuestCategory; 
  rank: QuestRank;
  faction: Faction; // 委托势力
  
  // 剧本上下文 (AI 依据此生成)
  script: {
    title: string;       // 剧本名，如《风雪山神庙》
    description: string; // 悬赏榜显示的文案
    objective: string;   // 核心目标
    antagonist: string;  // 对立面 (人或环境)
    twist: string;       // 转折点/高潮事件
  };

  stage: QuestStage; // 当前所处阶段
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
  
  // 势力声望
  reputation: Record<Faction, number>;

  currentQuest: Quest | null;
  queuedQuest: Quest | null;
  questBoard: Quest[];
  lastQuestRefresh: number;
  
  // ⚠️ 记忆链：记录上一段剧情摘要，用于保持连贯性
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

// --- 静态数据 ---

export const PERSONALITIES = ["侠义", "孤僻", "狂放", "儒雅", "贪财", "痴情", "阴狠", "中庸", "避世"];
export const NPC_NAMES_MALE = ["啸天", "无忌", "一刀", "寻欢", "留香", "不败", "求败", "铁手", "无情", "冷血", "小宝", "大侠", "三少", "风", "云", "雷", "电", "靖", "康", "峰", "平", "冲", "过", "伯光", "志平"];
export const NPC_NAMES_FEMALE = ["语嫣", "灵珊", "盈盈", "莫愁", "芷若", "敏", "蓉", "念慈", "双", "素素", "药师", "凤凰", "不悔", "襄", "芙", "龙女", "铁心", "无双", "红药", "师师"];
export const NPC_NAMES_LAST = ["独孤", "西门", "欧阳", "诸葛", "慕容", "李", "王", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "马", "朱", "胡", "林", "郭", "何", "高", "罗", "郑", "梁", "谢", "宋", "唐", "许", "韩", "冯", "邓", "曹", "彭", "曾", "萧", "田", "董"];

export const NPC_ARCHETYPES = {
  common: [
    { job: "店小二", buff: "luck", desc: "消息灵通，跑腿勤快。" },
    { job: "落魄书生", buff: "exp", desc: "虽手无缚鸡之力，但满腹经纶。" },
    { job: "卖花女", buff: "heal", desc: "笑容甜美，令人忘忧。" }, 
    { job: "泼皮", buff: "attack", desc: "市井无赖，打架全靠一股狠劲。" }
  ],
  rare: [
    { job: "游方郎中", buff: "heal", desc: "医术精湛，悬壶济世。" },
    { job: "镖师", buff: "defense", desc: "走南闯北，经验丰富。" },
    { job: "算命先生", buff: "luck", desc: "铁口直断，趋吉避凶。" },
    { job: "猎户", buff: "attack", desc: "擅长追踪，箭术精准。" }
  ],
  epic: [
    { job: "独臂刀客", buff: "attack", desc: "刀法刚猛，力劈华山。" },
    { job: "峨眉女侠", buff: "attack", desc: "剑法轻灵，身法飘逸。" }, 
    { job: "少林武僧", buff: "defense", desc: "金钟罩铁布衫，刀枪不入。" }, 
    { job: "丐帮长老", buff: "exp", desc: "通晓天下秘闻。" }
  ],
  legendary: [
    { job: "扫地僧", buff: "exp", desc: "深不可测，一花一世界。" },
    { job: "魔教圣女", buff: "attack", desc: "行事乖张，武功诡异。" }, 
    { job: "剑圣", buff: "attack", desc: "人剑合一，万剑归宗。" }
  ]
};

export const NPC_TRAITS = ["嗜酒", "贪财", "刚正", "寡言", "聒噪", "阴鸷", "胆怯", "豪迈", "多愁", "洁癖", "迷途", "毒舌", "狂妄", "避世", "贪食"];

export const SKILL_LIBRARY = {
  attack: ["太祖长拳", "落英神剑掌", "降龙十八掌", "独孤九剑", "打狗棒法", "六脉神剑", "弹指神通", "黯然销魂掌"],
  inner:  ["吐纳法", "易筋经", "九阳神功", "北冥神功", "小无相功", "洗髓经", "九阴真经", "神照经"],
  speed:  ["草上飞", "凌波微步", "梯云纵", "神行百变", "水上漂", "踏雪无痕", "筋斗云(伪)"],
  medical:["包扎", "推拿", "针灸", "炼丹术", "神农尝百草", "平一指医经"],
  trade:  ["讨价还价", "鉴宝", "巧舌如簧", "市井智慧", "聚宝盆之术"]
};

export const PET_TEMPLATES = [
  { type: "神雕", desc: "羽毛如铁，曾陪伴独臂大侠。" },
  { type: "闪电貂", desc: "动作如电，专咬手指，剧毒。" },
  { type: "昆仑白猿", desc: "腹藏经书，会使越女剑法。" },
  { type: "汗血宝马", desc: "日行千里，流汗如血。" },
  { type: "莽牯朱蛤", desc: "万毒之王，百毒不侵。" },
  { type: "九尾灵狐", desc: "通体雪白，极具灵性。" },
  { type: "玉蜂", desc: "古墓派驯养，酿造玉蜂浆。" },
  { type: "大黄", desc: "忠诚的中华田园犬，眼神坚毅。" }
];

export const MAP_LOCATIONS = {
  common: ["荒野古道", "龙门客栈", "风陵渡口", "乱葬岗", "悦来客栈"],
  search: ["楼兰废墟", "剑冢", "绝情谷底", "桃花岛", "大漠深处"],
  hunt:   ["黑风寨", "万兽山庄", "五毒教总坛", "快活林", "阴风谷"],
  challenge: ["光明顶", "紫禁之巅", "华山栈道", "聚贤庄", "侠客岛"],
  train:  ["少林藏经阁", "寒玉床", "思过崖", "达摩洞", "冰火岛"],
  life:   ["扬州丽春院", "汴京御街", "牛家村", "七侠镇", "同福客栈"]
};

export const WORLD_MAP = [
  { name: "牛家村", type: "life", minLv: 1 }, { name: "破庙", type: "common", minLv: 1 }, { name: "乱葬岗", type: "hunt", minLv: 1 }, { name: "荒野古道", type: "common", minLv: 1 }, { name: "十里坡", type: "train", minLv: 1 },
  { name: "扬州城", type: "life", minLv: 10 }, { name: "快活林", type: "hunt", minLv: 10 }, { name: "悦来客栈", type: "common", minLv: 10 }, { name: "丐帮分舵", type: "challenge", minLv: 15 }, { name: "黑风寨", type: "hunt", minLv: 15 }, { name: "无量山", type: "search", minLv: 20 },
  { name: "汴京御街", type: "life", minLv: 30 }, { name: "五毒教总坛", type: "hunt", minLv: 30 }, { name: "绝情谷", type: "search", minLv: 35 }, { name: "桃花岛", type: "train", minLv: 35 }, { name: "终南山", type: "challenge", minLv: 40 },
  { name: "光明顶", type: "challenge", minLv: 50 }, { name: "少林藏经阁", type: "train", minLv: 55 }, { name: "黑木崖", type: "hunt", minLv: 60 }, { name: "紫禁之巅", type: "challenge", minLv: 65 }, { name: "剑冢", type: "search", minLv: 70 },
  { name: "侠客岛", type: "train", minLv: 80 }, { name: "昆仑仙境", type: "search", minLv: 85 }, { name: "剑魔荒冢", type: "train", minLv: 90 }, { name: "破碎虚空", type: "common", minLv: 99 }
];

export const STORY_STAGES = [
  { level: 1, name: "初出茅庐", desc: "初入江湖的懵懂少年" },
  { level: 10, name: "锋芒初露", desc: "小有名气的少侠" },
  { level: 25, name: "名动一方", desc: "一方豪强，威震武林" },
  { level: 40, name: "开宗立派", desc: "武学宗师，开山立柜" },
  { level: 60, name: "一代宗师", desc: "天下无敌，独孤求败" },
  { level: 100, name: "破碎虚空", desc: "羽化登仙，留下传说" }
];

// ⚠️ 核心新增：风味文本库 (AI 强制使用，增加文学性)
export const FLAVOR_TEXTS = {
  environment: ["残阳如血", "枯藤老树", "大雪纷飞", "夜凉如水", "黄沙漫天", "竹林听雨", "断壁残垣"],
  action: ["拔剑出鞘", "屏息凝神", "快马加鞭", "拂袖而去", "仰天长啸", "温酒斩将"],
  object: ["锈迹斑斑的铁剑", "半块玉佩", "染血的书信", "酒旗", "孤灯", "寒鸦"]
};

// ⚠️ 核心新增：剧本模板 (不再是简单的字符串，而是结构化对象)
export const QUEST_SCRIPTS = {
  "初出茅庐": [
    { title: "偷鸡贼的末路", desc: "王大妈的鸡丢了，据说后山有野狗出没。", obj: "找回丢失的老母鸡", antagonist: "成精的野狗", twist: "野狗嘴里叼着的竟是一块官银", faction: 'neutral' },
    { title: "铁匠的委托", desc: "铁匠急需送一批农具去邻村。", obj: "护送板车", antagonist: "路霸", twist: "路霸竟是村长的儿子", faction: 'neutral' }
  ],
  "锋芒初露": [
    { title: "黑风寨的秘密", desc: "官府悬赏黑风寨大当家的首级。", obj: "刺杀大当家", antagonist: "黑风寨主", twist: "大当家其实是朝廷的卧底", faction: 'throne' },
    { title: "古墓惊魂", desc: "据说古墓中有前朝遗宝。", obj: "探索古墓", antagonist: "守墓机关", twist: "宝箱里只有一封情书", faction: 'sect' }
  ],
  // ... 其他境界的剧本可继续扩展
  "default": [
    { title: "江湖琐事", desc: "有人需要帮忙。", obj: "解决麻烦", antagonist: "未知的阻碍", twist: "事情并没有那么简单", faction: 'neutral' }
  ]
};

export const LOOT_TABLE: Partial<Item>[] = [
  // ... (保持之前的物品列表不变，太长略去，请保留原有的物品定义) ...
  { name: "半个冷馒头", type: 'consumable', desc: "干硬难咽，聊胜于无。", price: 1, minLevel: 1, quality: 'common', effect: 10 }, 
  { name: "女儿红", type: 'consumable', desc: "陈年好酒，回血并增加豪气。", price: 20, minLevel: 10, quality: 'common', effect: 50 },
  { name: "金疮药", type: 'consumable', desc: "江湖常备跌打药。", price: 50, minLevel: 15, quality: 'common', effect: 100 },
  { name: "大力丸", type: 'consumable', desc: "街头卖艺人的秘方，据说能补气。", price: 30, minLevel: 5, quality: 'common', effect: 20 }, 
  { name: "九花玉露丸", type: 'consumable', desc: "桃花岛秘药，清香袭人。", price: 300, minLevel: 30, quality: 'rare', effect: 300 },
  { name: "黑玉断续膏", type: 'consumable', desc: "西域灵药，可续断骨。", price: 500, minLevel: 40, quality: 'rare', effect: 500 },
  { name: "天山雪莲", type: 'consumable', desc: "生于绝壁，不仅回血还能精进修为。", price: 1000, minLevel: 50, quality: 'epic', effect: 1000 },
  { name: "大还丹", type: 'consumable', desc: "少林圣药，起死回生，增加一甲子功力。", price: 2000, minLevel: 60, quality: 'epic', effect: 2000 },
  { name: "《长拳图解》", type: 'book', desc: "太祖长拳的入门图谱。", price: 50, minLevel: 1, quality: 'common', effect: "太祖长拳" },
  { name: "《吐纳心法》", type: 'book', desc: "道家基础呼吸法门。", price: 100, minLevel: 5, quality: 'common', effect: "吐纳法" },
  { name: "《草上飞秘籍》", type: 'book', desc: "轻功入门，身轻如燕。", price: 200, minLevel: 10, quality: 'common', effect: "草上飞" },
  { name: "《打狗棒法残卷》", type: 'book', desc: "丐帮绝学，虽然残缺但精妙无比。", price: 800, minLevel: 20, quality: 'rare', effect: "打狗棒法" },
  { name: "《落英神剑掌谱》", type: 'book', desc: "姿态优美，虚实难测。", price: 1000, minLevel: 25, quality: 'rare', effect: "落英神剑掌" },
  { name: "《易筋经》", type: 'book', desc: "少林至宝，改易筋骨。", price: 5000, minLevel: 50, quality: 'legendary', effect: "易筋经" },
  { name: "《独孤九剑总决》", type: 'book', desc: "破尽天下武功。", price: 6000, minLevel: 60, quality: 'legendary', effect: "独孤九剑" },
  { name: "《凌波微步图》", type: 'book', desc: "依卦象而行，令敌人无可奈何。", price: 4000, minLevel: 45, quality: 'epic', effect: "凌波微步" },
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
    "风中隐约传来兵刃相交之声，令我不由得握紧了剑柄。",
    "路过一间破败的茶寮，那瞎眼的说书人正讲到高潮处。",
    "天边残阳如血，将孤独的影子拉得很长很长。",
    "忽觉丹田发热，似乎是近日苦练略有小成。",
    "抚摸着手中的兵器，感受着它冰冷的温度。",
    "远处山峦起伏，恰似这人心险恶的江湖。",
  ],
  fight: [
    "杀气瞬间弥漫，连空气都仿佛凝固。",
    "这一剑快若闪电，直取要害，避无可避。",
    "双方内力激荡，周围的落叶被震得粉碎。",
    "生死只在一线之间，不敢有丝毫分神。",
  ],
  town: [
    "街道两旁叫卖声不绝于耳，充满了红尘烟火气。",
    "酒楼上推杯换盏，几位豪客正在高谈阔论。",
    "市井之中卧虎藏龙，那卖菜的老翁眼神竟如鹰隼般锐利。",
    "由于囊中羞涩，只能看着路边的酱牛肉咽口水。",
  ],
  arena: [
    "四周看台座无虚席，欢呼声震耳欲聋。",
    "对手气息绵长，显然是内家高手，不可轻敌。",
    "这一场比武关乎名声，绝不能输。",
    "胜负已分，台下爆发出雷鸣般的掌声。",
  ]
};