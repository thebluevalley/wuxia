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
};

export type Equipment = {
  weapon: Item | null;
  head: Item | null;
  body: Item | null;
  legs: Item | null;
  feet: Item | null;
  accessory: Item | null;
};

export type QuestType = 'search' | 'hunt' | 'challenge' | 'train' | 'life';
export type Quest = { name: string; type: QuestType; desc: string; progress: number; total: number; };

export type SkillType = 'attack' | 'inner' | 'speed' | 'medical' | 'trade';
export type Skill = { name: string; type: SkillType; level: number; exp: number; maxExp: number; desc: string; };

export type MessageType = 'rumor' | 'system';
export type Message = { id: string; type: MessageType; title: string; content: string; time: string; isRead: boolean; };

// 伙伴定义
export type Companion = {
  id: string;
  name: string;
  title: string;
  archetype: string;
  personality: string;
  desc: string;
  price: number;
  quality: Quality;
  buff: { type: 'attack' | 'defense' | 'heal' | 'luck' | 'exp'; val: number; };
};

export type Pet = {
  name: string;
  type: string;
  level: number;
  desc: string;
};

// ⚠️ 核心修复：HeroState 必须包含 pet, companion, tavern
export type HeroState = {
  name: string;
  level: number;
  gender: '男' | '女';
  age: number;
  personality: string;
  title: string;
  motto: string;
  godPower: number;
  unlockedFeatures: string[];
  storyStage: string;
  
  // 关键字段：宠物
  pet: Pet | null;

  attributes: { constitution: number; strength: number; dexterity: number; intelligence: number; luck: number; };
  hp: number; maxHp: number;
  exp: number; maxExp: number;
  gold: number;
  alignment: number;
  
  currentQuest: Quest;
  location: string;
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon' | 'arena';
  
  logs: LogEntry[];
  messages: Message[];
  majorEvents: string[];
  
  inventory: Item[];
  equipment: Equipment;
  martialArts: Skill[];
  lifeSkills: Skill[];
  stats: { kills: number; days: number; arenaWins: number; };
  
  // 关键字段：酒馆
  tavern: {
    visitors: Companion[];
    lastRefresh: number;
  };
  // 关键字段：伙伴
  companion: Companion | null;
  companionExpiry: number;
};

export type LogEntry = { id: string; text: string; type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai'; time: string; };

export const PERSONALITIES = ["侠义", "孤僻", "狂放", "儒雅", "贪财", "痴情", "阴狠", "中庸", "社恐"];

// ⚠️ 必须包含这些 NPC 相关的导出
export const NPC_NAMES_FIRST = ["独孤", "西门", "欧阳", "诸葛", "慕容", "李", "王", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "马", "朱", "胡", "林", "郭", "何", "高", "罗", "郑", "梁", "谢", "宋", "唐", "许", "韩", "冯", "邓", "曹", "彭", "曾", "萧", "田", "董"];
export const NPC_NAMES_LAST = ["一刀", "无忌", "吹雪", "寻欢", "留香", "不败", "求败", "铁手", "无情", "追命", "冷血", "小宝", "大侠", "三少", "四娘", "无缺", "灵珊", "盈盈", "语嫣", "莫愁", "过", "靖", "康", "峰", "誉", "竹", "梅", "兰", "菊", "风", "云", "霜", "雪", "雷", "电"];

export const NPC_ARCHETYPES = {
  common: [
    { job: "店小二", buff: "luck", desc: "消息灵通，跑腿勤快。" },
    { job: "落魄书生", buff: "exp", desc: "虽然手无缚鸡之力，但满腹经纶。" },
    { job: "卖花女", buff: "heal", desc: "笑容甜美，能让人忘却疲惫。" },
    { job: "地痞", buff: "attack", desc: "打架全靠一股狠劲。" }
  ],
  rare: [
    { job: "游方郎中", buff: "heal", desc: "医术精湛，悬壶济世。" },
    { job: "镖师", buff: "defense", desc: "走南闯北，经验丰富。" },
    { job: "算命先生", buff: "luck", desc: "铁口直断，趋吉避凶。" },
    { job: "猎户", buff: "attack", desc: "擅长追踪和设伏。" }
  ],
  epic: [
    { job: "独臂刀客", buff: "attack", desc: "刀法刚猛，力劈华山。" },
    { job: "峨眉女侠", buff: "attack", desc: "剑法轻灵，身法飘逸。" },
    { job: "少林武僧", buff: "defense", desc: "金钟罩铁布衫，刀枪不入。" },
    { job: "丐帮长老", buff: "exp", desc: "眼线遍布天下，通晓江湖秘闻。" }
  ],
  legendary: [
    { job: "隐世扫地僧", buff: "exp", desc: "深不可测，一花一世界。" },
    { job: "魔教圣女", buff: "attack", desc: "行事乖张，武功诡异。" },
    { job: "剑圣", buff: "attack", desc: "人剑合一，万剑归宗。" }
  ]
};

export const NPC_TRAITS = [
  "嗜酒如命", "贪财好色", "刚正不阿", "沉默寡言", "话痨", 
  "阴阳怪气", "胆小如鼠", "豪气干云", "多愁善感", "洁癖", 
  "路痴", "毒舌", "中二病", "社恐", "吃货"
];

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

export const ARENA_OPPONENTS = ["少林铜人", "峨眉师太", "全真道士", "丐帮长老", "魔教护法", "隐世扫地僧", "金兵百夫长", "东瀛浪人", "波斯圣女", "西域番僧"];

export const MAP_LOCATIONS = {
  common: ["荒野古道", "龙门客栈", "风陵渡口", "乱葬岗", "悦来客栈"],
  search: ["楼兰废墟", "剑冢", "绝情谷底", "桃花岛", "大漠深处"],
  hunt:   ["黑风寨", "万兽山庄", "五毒教总坛", "快活林", "阴风谷"],
  challenge: ["光明顶", "紫禁之巅", "华山栈道", "聚贤庄", "侠客岛"],
  train:  ["少林藏经阁", "寒玉床", "思过崖", "达摩洞", "冰火岛"],
  life:   ["扬州丽春院", "汴京御街", "牛家村", "七侠镇", "同福客栈"]
};

export const WORLD_MAP = [
  // Tier 1: 1-10
  { name: "牛家村", type: "life", minLv: 1 }, { name: "破庙", type: "common", minLv: 1 }, { name: "乱葬岗", type: "hunt", minLv: 1 }, { name: "荒野古道", type: "common", minLv: 1 }, { name: "十里坡", type: "train", minLv: 1 },
  // Tier 2: 10-30
  { name: "扬州城", type: "life", minLv: 10 }, { name: "快活林", type: "hunt", minLv: 10 }, { name: "悦来客栈", type: "common", minLv: 10 }, { name: "丐帮分舵", type: "challenge", minLv: 15 }, { name: "黑风寨", type: "hunt", minLv: 15 }, { name: "无量山", type: "search", minLv: 20 },
  // Tier 3: 30-50
  { name: "汴京御街", type: "life", minLv: 30 }, { name: "五毒教总坛", type: "hunt", minLv: 30 }, { name: "绝情谷", type: "search", minLv: 35 }, { name: "桃花岛", type: "train", minLv: 35 }, { name: "终南山", type: "challenge", minLv: 40 },
  // Tier 4: 50-80
  { name: "光明顶", type: "challenge", minLv: 50 }, { name: "少林藏经阁", type: "train", minLv: 55 }, { name: "黑木崖", type: "hunt", minLv: 60 }, { name: "紫禁之巅", type: "challenge", minLv: 65 }, { name: "剑冢", type: "search", minLv: 70 },
  // Tier 5: 80+
  { name: "侠客岛", type: "train", minLv: 80 }, { name: "昆仑仙境", type: "search", minLv: 85 }, { name: "剑魔荒冢", type: "train", minLv: 90 }, { name: "破碎虚空", type: "common", minLv: 99 }
];

export const QUEST_SOURCES = {
  search: ["寻找失传的《易筋经》残卷", "探寻前朝宝藏线索", "搜集打造屠龙刀的玄铁", "寻找传说中的天山雪莲", "寻找失踪的盟主信物"],
  hunt:   ["讨伐黑风寨的土匪首领", "清理后山的吊睛白额虎", "追捕采花大盗‘万里独行’", "消灭为祸一方的五毒教徒", "刺杀通敌叛国的将军"],
  challenge: ["挑战华山派大弟子", "去少林寺闯十八铜人阵", "与丐帮长老比拼酒量", "参加武林大会争夺盟主", "破解珍珑棋局"],
  train:  ["在寒玉床上修炼内功", "在瀑布下练习拔剑一万次", "在梅花桩上练习轻功", "参悟石壁上的太玄经", "在海浪中修炼掌法"],
  life:   ["帮隔壁王大妈寻找走失的鸭子", "去集市摆摊卖艺赚盘缠", "帮村长修补漏雨的屋顶", "为心上人描眉画画", "在酒馆打听江湖传闻"]
};

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "半个冷馒头", type: 'consumable', desc: "回血 +10", price: 1, minLevel: 1, quality: 'common' },
  { name: "生锈的铁剑", type: 'weapon', desc: "攻击 +1", price: 10, minLevel: 1, quality: 'common' },
  { name: "粗布头巾", type: 'head', desc: "防御 +1", price: 5, minLevel: 1, quality: 'common' },
  { name: "麻布裤", type: 'legs', desc: "防御 +1", price: 5, minLevel: 1, quality: 'common' },
  { name: "草鞋", type: 'feet', desc: "身法 +1", price: 2, minLevel: 1, quality: 'common' },
  { name: "女儿红", type: 'consumable', desc: "回血 +50，增加豪气", price: 20, minLevel: 10, quality: 'common' },
  { name: "百炼钢刀", type: 'weapon', desc: "攻击 +10", price: 150, minLevel: 10, quality: 'rare' },
  { name: "精铁护腕", type: 'accessory', desc: "臂力 +2", price: 100, minLevel: 10, quality: 'rare' },
  { name: "皮甲", type: 'body', desc: "防御 +10", price: 80, minLevel: 10, quality: 'common' },
  { name: "金疮药", type: 'consumable', desc: "回血 +100", price: 50, minLevel: 20, quality: 'common' },
  { name: "神行太保靴", type: 'feet', desc: "身法 +15", price: 300, minLevel: 20, quality: 'rare' },
  { name: "金丝软甲(残)", type: 'body', desc: "防御 +30", price: 500, minLevel: 25, quality: 'rare' },
  { name: "平安符", type: 'accessory', desc: "福源 +5", price: 200, minLevel: 15, quality: 'common' },
  { name: "黑玉断续膏", type: 'consumable', desc: "回血 +500", price: 200, minLevel: 40, quality: 'rare' },
  { name: "九花玉露丸", type: 'consumable', desc: "回血 +300, 内力大增", price: 300, minLevel: 35, quality: 'rare' },
  { name: "玄铁重剑(仿)", type: 'weapon', desc: "攻击 +80", price: 1000, minLevel: 40, quality: 'epic' },
  { name: "武功秘籍残卷", type: 'book', desc: "记载着一招半式", price: 500, minLevel: 30, quality: 'rare' },
  { name: "大还丹", type: 'consumable', desc: "起死回生", price: 1000, minLevel: 60, quality: 'epic' },
  { name: "倚天剑", type: 'weapon', desc: "武林至尊，攻击 +200", price: 5000, minLevel: 60, quality: 'legendary' },
  { name: "屠龙刀", type: 'weapon', desc: "号令天下，攻击 +220", price: 5500, minLevel: 65, quality: 'legendary' },
  { name: "软猬甲", type: 'body', desc: "刀枪不入，反弹伤害", price: 4000, minLevel: 55, quality: 'legendary' },
];

export const STATIC_LOGS = {
  idle: [
    "风中隐约传来兵刃相交之声，令我不由得握紧了剑柄。",
    "路过一间破败的茶寮，那瞎眼的说书人正讲到高潮处。",
    "天边残阳如血，将孤独的影子拉得很长很长。",
    "一阵马蹄声疾驰而过，尘土飞扬，不知又是哪里的急报。",
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

export const STORY_STAGES = [
  { level: 1, name: "初出茅庐", desc: "初入江湖的懵懂少年" },
  { level: 10, name: "锋芒初露", desc: "小有名气的少侠" },
  { level: 25, name: "名动一方", desc: "一方豪强，威震武林" },
  { level: 40, name: "开宗立派", desc: "武学宗师，开山立柜" },
  { level: 60, name: "一代宗师", desc: "天下无敌，独孤求败" },
  { level: 100, name: "破碎虚空", desc: "羽化登仙，留下传说" }
];

export const WORLD_LORE = `
背景：王朝末年，乱世江湖。
势力：听雨楼(情报)、铸剑山庄(神兵)、隐元会(杀手)、丐帮(天下第一帮)。
体系：内练一口气，外练筋骨皮。武学分外功、内功、轻功。
`;