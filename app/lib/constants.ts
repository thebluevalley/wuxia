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

export type SkillType = 'attack' | 'inner' | 'speed' | 'medical' | 'trade';
export type Skill = {
  name: string;
  type: SkillType;
  level: number;
  exp: number;
  maxExp: number;
  desc: string;
};

export type MessageType = 'rumor' | 'system';
export type Message = {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
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
    constitution: number; strength: number; dexterity: number; intelligence: number; luck: number;
  };

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
};

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai';
  time: string;
};

export const PERSONALITIES = ["侠义", "孤僻", "狂放", "儒雅", "贪财", "痴情", "阴狠", "中庸", "社恐"];

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

// ⚠️ 升级：分级地图系统
// minLv: 最低进入等级
export const WORLD_MAP = [
  // Tier 1: 新手村 (1-10级)
  { name: "牛家村", type: "life", minLv: 1 },
  { name: "破庙", type: "common", minLv: 1 },
  { name: "乱葬岗", type: "hunt", minLv: 1 },
  { name: "荒野古道", type: "common", minLv: 1 },
  { name: "十里坡", type: "train", minLv: 1 },
  { name: "小河边", type: "life", minLv: 1 },
  // Tier 2: 初入江湖 (10-30级)
  { name: "扬州城", type: "life", minLv: 10 },
  { name: "快活林", type: "hunt", minLv: 10 },
  { name: "悦来客栈", type: "common", minLv: 10 },
  { name: "丐帮分舵", type: "challenge", minLv: 15 },
  { name: "黑风寨", type: "hunt", minLv: 15 },
  { name: "风陵渡口", type: "common", minLv: 15 },
  { name: "无量山", type: "search", minLv: 20 },
  { name: "梅庄", type: "life", minLv: 20 },
  // Tier 3: 名动一方 (30-50级)
  { name: "汴京御街", type: "life", minLv: 30 },
  { name: "五毒教总坛", type: "hunt", minLv: 30 },
  { name: "绝情谷", type: "search", minLv: 35 },
  { name: "桃花岛", type: "train", minLv: 35 },
  { name: "终南山", type: "challenge", minLv: 40 },
  { name: "聚贤庄", type: "challenge", minLv: 40 },
  { name: "冰火岛", type: "train", minLv: 45 },
  // Tier 4: 绝世高手 (50-80级)
  { name: "光明顶", type: "challenge", minLv: 50 },
  { name: "少林藏经阁", type: "train", minLv: 55 },
  { name: "黑木崖", type: "hunt", minLv: 60 },
  { name: "紫禁之巅", type: "challenge", minLv: 65 },
  { name: "剑冢", type: "search", minLv: 70 },
  // Tier 5: 传说之地 (80+级)
  { name: "侠客岛", type: "train", minLv: 80 },
  { name: "昆仑仙境", type: "search", minLv: 85 },
  { name: "剑魔荒冢", type: "train", minLv: 90 },
  { name: "破碎虚空", type: "common", minLv: 99 }
];

export const QUEST_SOURCES = {
  search: ["寻找失传的《易筋经》残卷", "探寻前朝宝藏线索", "搜集打造屠龙刀的玄铁", "寻找传说中的天山雪莲", "寻找失踪的盟主信物"],
  hunt:   ["讨伐黑风寨的土匪首领", "清理后山的吊睛白额虎", "追捕采花大盗‘万里独行’", "消灭为祸一方的五毒教徒", "刺杀通敌叛国的将军"],
  challenge: ["挑战华山派大弟子", "去少林寺闯十八铜人阵", "与丐帮长老比拼酒量", "参加武林大会争夺盟主", "破解珍珑棋局"],
  train:  ["在寒玉床上修炼内功", "在瀑布下练习拔剑一万次", "在梅花桩上练习轻功", "参悟石壁上的太玄经", "在海浪中修炼掌法"],
  life:   ["帮隔壁王大妈寻找走失的鸭子", "去集市摆摊卖艺赚盘缠", "帮村长修补漏雨的屋顶", "为心上人描眉画画", "在酒馆打听江湖传闻"]
};

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "半个冷馒头", type: 'consumable', desc: "回血 +10", price: 1 },
  { name: "女儿红", type: 'consumable', desc: "回血 +50，增加豪气", price: 20 },
  { name: "金疮药", type: 'consumable', desc: "回血 +100", price: 50 },
  { name: "大还丹", type: 'consumable', desc: "回满血，增加内力", price: 500 },
  { name: "叫花鸡", type: 'consumable', desc: "回血 +200，香气扑鼻", price: 100 },
  { name: "生锈的铁剑", type: 'weapon', desc: "攻击 +1", price: 30 },
  { name: "百炼钢刀", type: 'weapon', desc: "攻击 +10", price: 150 },
  { name: "倚天剑鞘", type: 'weapon', desc: "攻击 +50", price: 1000 },
  { name: "粗布头巾", type: 'head', desc: "防御 +1", price: 10 },
  { name: "金丝软甲(残)", type: 'body', desc: "防御 +20", price: 250 },
  { name: "神行太保靴", type: 'feet', desc: "身法 +5", price: 80 },
  { name: "平安符", type: 'accessory', desc: "福源 +1", price: 88 },
  { name: "武功秘籍残卷", type: 'book', desc: "记载着一招半式", price: 300 },
  { name: "神秘的藏宝图", type: 'misc', desc: "可能通向宝藏", price: 100 },
];

export const STATIC_LOGS = {
  idle: ["微风拂过。", "发了一会儿呆。", "路边的狗尾巴草挠得心里痒痒的。", "抬头看了看天上的流云。"],
  fight: ["杀气弥漫。", "胜负只在一念之间。", "此时无声胜有声。", "刀光剑影。"],
  town: ["市井喧嚣。", "红尘滚滚。", "有人欢喜有人愁。", "酒香不怕巷子深。"],
  arena: ["万众瞩目。", "巅峰对决。", "生死状已签。", "台下欢声雷动。"]
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