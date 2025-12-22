export type ItemType = 'weapon' | 'head' | 'body' | 'legs' | 'feet' | 'accessory' | 'misc' | 'consumable' | 'book';

export type Item = {
  id: string;
  name: string;
  desc: string;
  quality: 'common' | 'rare' | 'legendary';
  type: ItemType;
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

export type Quest = {
  name: string;
  type: QuestType;
  desc: string;
  progress: number;
  total: number;
};

export type Pet = {
  name: string;
  type: string;
  level: number;
  desc: string;
};

// 技能系统
export type SkillType = 'attack' | 'inner' | 'speed' | 'medical' | 'trade';
export type Skill = {
  name: string;
  type: SkillType;
  level: number; // 当前层数
  exp: number;   // 当前熟练度
  maxExp: number; // 升级所需
  desc: string;
};

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
  pet: Pet | null;
  storyStage: string; 

  attributes: { 
    constitution: number; // 根骨 -> 影响血量成长
    strength: number;     // 臂力 -> 影响战斗胜率
    dexterity: number;    // 身法 -> 影响闪避/跑图
    intelligence: number; // 悟性 -> 影响技能升级速度
    luck: number;         // 福源 -> 影响掉落
  };

  hp: number; maxHp: number;
  exp: number; maxExp: number;
  gold: number;
  alignment: number;
  currentQuest: Quest;
  
  location: string;
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon' | 'arena';
  
  logs: LogEntry[];
  majorEvents: string[];
  inventory: Item[];
  equipment: Equipment;
  
  // 技能列表
  martialArts: Skill[]; // 武功
  lifeSkills: Skill[];  // 生活技能
  
  stats: { kills: number; days: number; arenaWins: number; };
};

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai';
  time: string;
};

export const PERSONALITIES = ["侠义", "孤僻", "狂放", "儒雅", "贪财", "痴情", "阴狠", "中庸", "社恐"];

// 技能库
export const SKILL_LIBRARY = {
  attack: ["太祖长拳", "落英神剑掌", "降龙十八掌", "独孤九剑", "打狗棒法", "六脉神剑"],
  inner:  ["吐纳法", "易筋经", "九阳神功", "北冥神功", "小无相功", "洗髓经"],
  speed:  ["草上飞", "凌波微步", "梯云纵", "神行百变", "水上漂"],
  medical:["包扎", "推拿", "针灸", "炼丹术", "神农尝百草"],
  trade:  ["讨价还价", "鉴宝", "巧舌如簧", "市井智慧"]
};

export const PET_TEMPLATES = [
  { type: "神雕", desc: "羽毛如铁，曾陪伴独臂大侠。" },
  { type: "闪电貂", desc: "动作如电，专咬手指，剧毒。" },
  { type: "昆仑白猿", desc: "腹藏经书，会使越女剑法。" },
  { type: "汗血宝马", desc: "日行千里，流汗如血。" },
  { type: "莽牯朱蛤", desc: "万毒之王，百毒不侵。" },
  { type: "九尾灵狐", desc: "通体雪白，极具灵性。" },
  { type: "玉蜂", desc: "古墓派驯养，酿造玉蜂浆。" },
  { type: "大黄", desc: "忠诚的中华田园犬。" }
];

export const ARENA_OPPONENTS = ["少林铜人", "峨眉师太", "全真道士", "丐帮长老", "魔教护法", "隐世扫地僧", "金兵百夫长", "东瀛浪人"];

export const MAP_LOCATIONS = {
  common: ["荒野古道", "龙门客栈", "风陵渡口", "乱葬岗", "悦来客栈"],
  search: ["楼兰废墟", "剑冢", "绝情谷底", "桃花岛", "大漠深处"],
  hunt:   ["黑风寨", "万兽山庄", "五毒教总坛", "快活林", "阴风谷"],
  challenge: ["光明顶", "紫禁之巅", "华山栈道", "聚贤庄", "侠客岛"],
  train:  ["少林藏经阁", "寒玉床", "思过崖", "达摩洞", "冰火岛"],
  life:   ["扬州丽春院", "汴京御街", "牛家村", "七侠镇", "同福客栈"]
};

export const QUEST_SOURCES = {
  search: ["寻找失传的《易筋经》", "探寻前朝宝藏", "搜集玄铁", "寻找天山雪莲", "寻找盟主信物"],
  hunt:   ["讨伐黑风寨主", "清理吊睛白额虎", "追捕采花大盗", "消灭五毒教徒", "刺杀叛国将军"],
  challenge: ["挑战华山大弟子", "闯十八铜人阵", "比拼酒量", "争夺武林盟主", "破解珍珑棋局"],
  train:  ["修炼内功", "练习拔剑", "练习轻功", "参悟太玄经", "海浪中练掌"],
  life:   ["帮王大妈找鸭子", "摆摊卖艺", "修补屋顶", "为心上人画眉", "打听江湖传闻"]
};

// 掉落表 (增加武功秘籍、消耗品)
export const LOOT_TABLE: Partial<Item>[] = [
  { name: "半个冷馒头", type: 'consumable', desc: "回血 +10", price: 1 },
  { name: "女儿红", type: 'consumable', desc: "回血 +50，增加豪气", price: 20 },
  { name: "金疮药", type: 'consumable', desc: "回血 +100", price: 50 },
  { name: "大还丹", type: 'consumable', desc: "回满血，增加内力", price: 500 },
  { name: "生锈的铁剑", type: 'weapon', desc: "攻击 +1", price: 30 },
  { name: "百炼钢刀", type: 'weapon', desc: "攻击 +10", price: 150 },
  { name: "粗布头巾", type: 'head', desc: "防御 +1", price: 10 },
  { name: "金丝软甲(残)", type: 'body', desc: "防御 +20", price: 250 },
  { name: "神行太保靴", type: 'feet', desc: "身法 +5", price: 80 },
  { name: "平安符", type: 'accessory', desc: "福源 +1", price: 88 },
  { name: "武功秘籍残卷", type: 'book', desc: "记载着一招半式", price: 300 },
  { name: "神秘的藏宝图", type: 'misc', desc: "可能通向宝藏", price: 100 },
];

// 旁白文案 (更简洁，作为转场)
export const STATIC_LOGS = {
  idle: ["风起云涌。", "路漫漫其修远兮。", "江湖夜雨十年灯。", "天边划过流星。"],
  fight: ["杀气弥漫。", "胜负只在一念之间。", "此时无声胜有声。"],
  town: ["市井喧嚣。", "红尘滚滚。", "有人欢喜有人愁。"],
  arena: ["万众瞩目。", "巅峰对决。", "生死状已签。"]
};

export const STORY_STAGES = [
  { level: 1, name: "初出茅庐", desc: "初入江湖的懵懂少年" },
  { level: 10, name: "锋芒初露", desc: "小有名气的少侠" },
  { level: 25, name: "名动一方", desc: "一方豪强，威震武林" },
  { level: 40, name: "开宗立派", desc: "武学宗师，开山立柜" },
  { level: 60, name: "一代宗师", desc: "天下无敌，独孤求败" },
  { level: 100, name: "破碎虚空", desc: "羽化登仙，留下传说" }
];

// 世界观
export const WORLD_LORE = `
背景：王朝末年，乱世江湖。
势力：听雨楼(情报)、铸剑山庄(神兵)、隐元会(杀手)、丐帮(天下第一帮)。
体系：内练一口气，外练筋骨皮。武学分外功、内功、轻功。
`;