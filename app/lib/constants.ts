export type ItemType = 'weapon' | 'head' | 'body' | 'legs' | 'feet' | 'accessory' | 'misc';

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

  attributes: {
    constitution: number; 
    strength: number; 
    dexterity: number; 
    intelligence: number; 
    luck: number;
  };

  hp: number; maxHp: number;
  exp: number; maxExp: number;
  gold: number;
  alignment: number;
  currentQuest: Quest;
  
  location: string;
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon' | 'arena';
  
  logs: LogEntry[];
  majorEvents: string[]; // 大事记
  inventory: Item[];
  equipment: Equipment;
  skills: Skill[];
  lifeSkills: Skill[];
  stats: {
    kills: number;
    days: number;
    arenaWins: number;
  };
};

export type Skill = {
  name: string;
  level: number;
  type: 'martial' | 'life';
  desc: string;
};

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai';
  time: string;
};

export const PERSONALITIES = [
  "侠义", "孤僻", "狂放", "儒雅", "贪财", "痴情", "阴狠", "中庸", "社恐"
];

export const PET_TEMPLATES = [
  { type: "神雕", desc: "羽毛如铁，力大无穷，似乎曾陪伴过某位独臂大侠隐居深谷。" },
  { type: "闪电貂", desc: "体型娇小，动作如电，极具灵性，专咬敌人手指，剧毒无比。" },
  { type: "昆仑白猿", desc: "腹中似乎藏着经书，通晓人性，甚至会使几招简单的越女剑法。" },
  { type: "汗血宝马", desc: "日行千里，流汗如血，万金难求的绝世坐骑，侠客的最佳拍档。" },
  { type: "莽牯朱蛤", desc: "万毒之王，全身通红，叫声似牛，吃了它可百毒不侵。" },
  { type: "九尾灵狐", desc: "通体雪白，眼神中透着一股狡黠，传说在长白山修行了千年。" },
  { type: "玉蜂", desc: "古墓派驯养的异种蜜蜂，尾针剧毒，酿出的蜂蜜却是疗伤圣药。" },
  { type: "赤练蛇", desc: "色彩斑斓，剧毒无比，曾被一位女魔头用来练功。" },
  { type: "大黄", desc: "虽然只是一条普通的中华田园犬，但忠诚护主，从未退缩。" }
];

export const ARENA_OPPONENTS = [
  "少林铜人", "峨眉师太", "全真道士", "丐帮八袋长老", "魔教左护法", "只会一招的菜鸟", "隐世扫地僧", "金兵百夫长"
];

// 地点库 (关联任务类型)
export const MAP_LOCATIONS = {
  common: ["荒野古道", "龙门客栈", "十里坡", "风陵渡口"],
  search: ["楼兰废墟", "剑冢", "绝情谷底", "桃花岛"],
  hunt:   ["黑风寨", "万兽山庄", "五毒教总坛", "快活林"],
  challenge: ["光明顶", "紫禁之巅", "华山栈道", "聚贤庄"],
  train:  ["少林藏经阁", "活死人墓寒玉床", "思过崖", "达摩洞"],
  life:   ["扬州丽春院", "汴京御街", "牛家村", "七侠镇"]
};

export const QUEST_SOURCES = {
  search: ["寻找失传的《易筋经》残卷", "探寻楼兰古国的宝藏线索", "搜集打造屠龙刀的玄铁", "寻找传说中的天山雪莲"],
  hunt:   ["讨伐黑风寨的土匪首领", "清理后山的吊睛白额虎", "追捕采花大盗‘万里独行’", "消灭为祸一方的五毒教徒"],
  challenge: ["挑战华山派大弟子", "去少林寺闯十八铜人阵", "与丐帮长老比拼酒量", "参加武林大会争夺盟主"],
  train:  ["在寒玉床上修炼内功", "在瀑布下练习拔剑一万次", "在梅花桩上练习轻功", "背诵艰涩难懂的武功心法"],
  life:   ["帮隔壁王大妈寻找走失的鸭子", "去集市摆摊卖艺赚盘缠", "帮村长修补屋顶", "为心上人描眉画画"]
};

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "半个冷馒头", type: 'misc', desc: "硬得像石头，但能填饱肚子。", price: 1 },
  { name: "女儿红", type: 'misc', desc: "陈年好酒，喝一口精神百倍。", price: 20 },
  { name: "金疮药", type: 'misc', desc: "江湖救急必备良药。", price: 50 },
  { name: "黑玉断续膏", type: 'misc', desc: "西域秘药，专治骨折。", price: 200 },
  { name: "生锈的铁剑", type: 'weapon', desc: "虽然锈迹斑斑，但也勉强能用。", price: 30 },
  { name: "玄铁重剑(仿)", type: 'weapon', desc: "很重，但没开刃，像个大铁棍。", price: 100 },
  { name: "粗布头巾", type: 'head', desc: "甚至不能挡雨，只能束发。", price: 10 },
  { name: "金丝软甲(残)", type: 'body', desc: "破了好几个洞，防御力堪忧。", price: 150 },
  { name: "麻布裤", type: 'legs', desc: "非常宽松，方便踢腿。", price: 15 },
  { name: "神行太保靴", type: 'feet', desc: "据说穿上能日行八百里。", price: 80 },
  { name: "平安符", type: 'accessory', desc: "庙里求来的，希望能保平安。", price: 88 },
  { name: "神秘的藏宝图", type: 'misc', desc: "画得像小孩子的涂鸦。", price: 100 },
];

export const STATIC_LOGS = {
  idle: ["微风拂过。", "发了一会儿呆。", "路边的狗尾巴草挠得心里痒痒的。", "抬头看了看天上的流云。"],
  fight: ["你来我往，好不热闹。", "刀光剑影，招招致命。", "险象环生，还好躲得快。", "使出一招'白鹤亮翅'。"],
  town: ["集市热闹非凡。", "闻到了酒香，走不动道了。", "路人行色匆匆。", "听说最近猪肉又涨价了。"],
  arena: ["观众席传来阵阵欢呼。", "对手露出了破绽。", "这一招险些没躲过。", "双方内力比拼，头顶冒出白气。"]
};