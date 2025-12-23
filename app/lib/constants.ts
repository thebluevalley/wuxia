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
export type QuestCategory = 'combat' | 'life';
export type QuestRank = 1 | 2 | 3 | 4 | 5;

export type Quest = { 
  id: string;
  name: string; 
  category: QuestCategory; 
  rank: QuestRank;
  desc: string; 
  progress: number; 
  total: number;
  reqLevel: number;
  isAuto?: boolean; // ⚠️ 标记是否为自动生成的挂机任务
  rewards: {
    gold: number;
    exp: number;
    item?: Item; 
  };
};

export type SkillType = 'attack' | 'inner' | 'speed' | 'medical' | 'trade';
export type Skill = { name: string; type: SkillType; level: number; exp: number; maxExp: number; desc: string; };

export type MessageType = 'rumor' | 'system';
export type Message = { id: string; type: MessageType; title: string; content: string; time: string; isRead: boolean; };

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

export type Pet = { name: string; type: string; level: number; desc: string; };

export type HeroState = {
  name: string; level: number; gender: '男' | '女'; age: number; personality: string; title: string; motto: string;
  godPower: number; unlockedFeatures: string[]; storyStage: string;
  pet: Pet | null;
  attributes: { constitution: number; strength: number; dexterity: number; intelligence: number; luck: number; };
  hp: number; maxHp: number; exp: number; maxExp: number; gold: number; alignment: number;
  
  // ⚠️ 任务系统升级
  currentQuest: Quest | null; 
  queuedQuest: Quest | null;  // 预约队列
  questBoard: Quest[];
  lastQuestRefresh: number;   // 上次刷新时间戳
  
  location: string; 
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon' | 'arena';
  logs: LogEntry[]; messages: Message[]; majorEvents: string[];
  inventory: Item[]; equipment: Equipment; martialArts: Skill[]; lifeSkills: Skill[];
  stats: { kills: number; days: number; arenaWins: number; };
  tavern: { visitors: Companion[]; lastRefresh: number; };
  companion: Companion | null; companionExpiry: number;
};

export type LogEntry = { id: string; text: string; type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai'; time: string; };

export const PERSONALITIES = ["侠义", "孤僻", "狂放", "儒雅", "贪财", "痴情", "阴狠", "中庸", "避世"];

export const NPC_NAMES_FIRST = ["独孤", "西门", "欧阳", "诸葛", "慕容", "李", "王", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "马", "朱", "胡", "林", "郭", "何", "高", "罗", "郑", "梁", "谢", "宋", "唐", "许", "韩", "冯", "邓", "曹", "彭", "曾", "萧", "田", "董"];
export const NPC_NAMES_LAST = ["一刀", "无忌", "吹雪", "寻欢", "留香", "不败", "求败", "铁手", "无情", "追命", "冷血", "小宝", "大侠", "三少", "四娘", "无缺", "灵珊", "盈盈", "语嫣", "莫愁", "过", "靖", "康", "峰", "誉", "竹", "梅", "兰", "菊", "风", "云", "霜", "雪", "雷", "电"];

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

export const QUEST_TEMPLATES = {
  "初出茅庐": {
    combat: ["清理后山野狼", "教训村头恶霸", "驱赶偷鸡贼", "巡逻村口", "切磋武艺"],
    life: ["帮王大妈找鸡", "替铁匠送货", "在酒馆打杂", "采集止血草", "抄写经书", "寻找走失孩童"]
  },
  "锋芒初露": {
    combat: ["讨伐黑风寨", "追捕采花大盗", "护送扬州镖车", "挑战武馆教头", "清理运河水匪"],
    life: ["探查古墓外围", "寻找失踪的信物", "调解帮派纠纷", "参加汴京诗会", "鉴定前朝宝物"]
  },
  "名动一方": {
    combat: ["围攻光明顶前哨", "刺杀敌国探子", "镇压门派叛徒", "单挑十二连环坞", "夺取玄铁令"],
    life: ["寻找传世名画", "破解珍珑棋局", "招募江湖门客", "经营商铺", "探访隐世高手"]
  },
  "开宗立派": {
    combat: ["决战紫禁之巅", "清理魔教总坛", "抵御外族入侵", "争夺武林盟主", "探索绝情谷底"],
    life: ["开坛讲道", "撰写武学秘籍", "建立分舵", "炼制长生丹", "参悟天道石碑"]
  },
  "一代宗师": {
    combat: ["破碎虚空之战", "挑战上古神兽", "独战八大门派", "斩杀心魔", "逆天改命"],
    life: ["游历红尘", "点化世人", "创造小世界", "寻找飞升契机", "归隐田园"]
  },
  "破碎虚空": {
    combat: ["神魔大战", "修补天裂"],
    life: ["重塑轮回", "俯瞰众生"]
  }
};

export const WORLD_LORE = `
背景：王朝末年，乱世江湖。
势力：听雨楼(情报)、铸剑山庄(神兵)、隐元会(杀手)、丐帮(天下第一帮)。
体系：内练一口气，外练筋骨皮。武学分外功、内功、轻功。
`;

export const QUEST_SOURCES = {
  search: ["寻找失传的《易筋经》残卷"], hunt: ["讨伐黑风寨"], challenge: ["挑战华山"], train: ["修炼"], life: ["打杂"]
};

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "半个冷馒头", type: 'consumable', desc: "回血 +10", price: 1, minLevel: 1, quality: 'common' },
  { name: "生锈的铁剑", type: 'weapon', desc: "攻击 +1", price: 10, minLevel: 1, quality: 'common' },
  { name: "粗布头巾", type: 'head', desc: "防御 +1", price: 5, minLevel: 1, quality: 'common' },
  { name: "麻布裤", type: 'legs', desc: "防御 +1", price: 5, minLevel: 1, quality: 'common' },
  { name: "草鞋", type: 'feet', desc: "身法 +1", price: 2, minLevel: 1, quality: 'common' },
  { name: "女儿红", type: 'consumable', desc: "回血 +50", price: 20, minLevel: 10, quality: 'common' },
  { name: "百炼钢刀", type: 'weapon', desc: "攻击 +10", price: 150, minLevel: 10, quality: 'rare' },
  { name: "精铁护腕", type: 'accessory', desc: "臂力 +2", price: 100, minLevel: 10, quality: 'rare' },
  { name: "皮甲", type: 'body', desc: "防御 +10", price: 80, minLevel: 10, quality: 'common' },
  { name: "金疮药", type: 'consumable', desc: "回血 +100", price: 50, minLevel: 20, quality: 'common' },
  { name: "神行太保靴", type: 'feet', desc: "身法 +15", price: 300, minLevel: 20, quality: 'rare' },
  { name: "金丝软甲(残)", type: 'body', desc: "防御 +30", price: 500, minLevel: 25, quality: 'rare' },
  { name: "平安符", type: 'accessory', desc: "福源 +5", price: 200, minLevel: 15, quality: 'common' },
  { name: "黑玉断续膏", type: 'consumable', desc: "回血 +500", price: 200, minLevel: 40, quality: 'rare' },
  { name: "九花玉露丸", type: 'consumable', desc: "回血 +300", price: 300, minLevel: 35, quality: 'rare' },
  { name: "玄铁重剑(仿)", type: 'weapon', desc: "攻击 +80", price: 1000, minLevel: 40, quality: 'epic' },
  { name: "武功秘籍残卷", type: 'book', desc: "记载着一招半式", price: 500, minLevel: 30, quality: 'rare' },
  { name: "大还丹", type: 'consumable', desc: "起死回生", price: 1000, minLevel: 60, quality: 'epic' },
  { name: "倚天剑", type: 'weapon', desc: "武林至尊", price: 5000, minLevel: 60, quality: 'legendary' },
  { name: "屠龙刀", type: 'weapon', desc: "号令天下", price: 5500, minLevel: 65, quality: 'legendary' },
  { name: "软猬甲", type: 'body', desc: "刀枪不入", price: 4000, minLevel: 55, quality: 'legendary' },
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