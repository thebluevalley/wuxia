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
  
  // 新增：人生阶段 (Narrative Arc)
  storyStage: string; 

  attributes: { constitution: number; strength: number; dexterity: number; intelligence: number; luck: number; };
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
  skills: Skill[];
  lifeSkills: Skill[];
  stats: { kills: number; days: number; arenaWins: number; };
};

export type Skill = { name: string; level: number; type: 'martial' | 'life'; desc: string; };

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai';
  time: string;
};

export const PERSONALITIES = ["侠义", "孤僻", "狂放", "儒雅", "贪财", "痴情", "阴狠", "中庸", "社恐"];

// ⚠️ 新增：世界观设定 (Worldview) - 发给 AI 做背景参考
export const WORLD_LORE = `
背景：王朝末年，宦官专权，边疆战乱。江湖中，旧的盟主失踪，少林武当闭门谢客，魔教蠢蠢欲动。
势力：
1. 听雨楼：最大的情报组织，亦正亦邪。
2. 铸剑山庄：掌握神兵秘密，被各方觊觎。
3. 隐元会：神秘杀手组织。
4. 丐帮：眼线遍布天下。
`;

// ⚠️ 新增：人生阶段 (用于控制剧情走向)
export const STORY_STAGES = [
  { level: 1, name: "初出茅庐", desc: "初入江湖的懵懂少年，对一切充满好奇，常在市井中摸爬滚打。" },
  { level: 10, name: "锋芒初露", desc: "在江湖上小有名气，开始接触各大门派，卷入恩怨纠葛。" },
  { level: 25, name: "名动一方", desc: "成为一方豪侠，开始建立自己的势力或威望，面临更深层的阴谋。" },
  { level: 40, name: "开宗立派", desc: "武功大成，开始思考武学真谛，收徒传艺，或者归隐山林。" },
  { level: 60, name: "一代宗师", desc: "天下无敌，心境超然，甚至可以破碎虚空。" }
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

export const ARENA_OPPONENTS = ["少林铜人", "峨眉师太", "全真道士", "丐帮八袋长老", "魔教左护法", "隐世扫地僧", "金兵百夫长", "东瀛浪人", "波斯圣女"];

export const MAP_LOCATIONS = {
  common: ["荒野古道", "龙门客栈", "风陵渡口", "乱葬岗"],
  search: ["楼兰废墟", "剑冢", "绝情谷底", "桃花岛", "大漠深处"],
  hunt:   ["黑风寨", "万兽山庄", "五毒教总坛", "快活林", "阴风谷"],
  challenge: ["光明顶", "紫禁之巅", "华山栈道", "聚贤庄", "侠客岛"],
  train:  ["少林藏经阁", "活死人墓寒玉床", "思过崖", "达摩洞", "冰火岛"],
  life:   ["扬州丽春院", "汴京御街", "牛家村", "七侠镇", "同福客栈"]
};

export const QUEST_SOURCES = {
  search: ["寻找失传的《易筋经》残卷", "探寻前朝宝藏线索", "搜集打造屠龙刀的玄铁", "寻找传说中的天山雪莲", "寻找失踪的盟主信物"],
  hunt:   ["讨伐黑风寨的土匪首领", "清理后山的吊睛白额虎", "追捕采花大盗‘万里独行’", "消灭为祸一方的五毒教徒", "刺杀通敌叛国的将军"],
  challenge: ["挑战华山派大弟子", "去少林寺闯十八铜人阵", "与丐帮长老比拼酒量", "参加武林大会争夺盟主", "破解珍珑棋局"],
  train:  ["在寒玉床上修炼内功", "在瀑布下练习拔剑一万次", "在梅花桩上练习轻功", "参悟石壁上的太玄经", "在海浪中修炼掌法"],
  life:   ["帮隔壁王大妈寻找走失的鸭子", "去集市摆摊卖艺赚盘缠", "帮村长修补漏雨的屋顶", "为心上人描眉画画", "在酒馆打听江湖传闻"]
};

// 物品库
export const LOOT_TABLE: Partial<Item>[] = [
  { name: "半个冷馒头", type: 'misc', desc: "硬得像石头，但能填饱肚子。", price: 1 },
  { name: "女儿红", type: 'misc', desc: "陈年好酒，喝一口精神百倍。", price: 20 },
  { name: "金疮药", type: 'misc', desc: "江湖救急必备良药。", price: 50 },
  { name: "黑玉断续膏", type: 'misc', desc: "西域秘药，专治骨折。", price: 200 },
  { name: "九花玉露丸", type: 'misc', desc: "桃花岛秘药，清香扑鼻。", price: 300 },
  { name: "生锈的铁剑", type: 'weapon', desc: "虽然锈迹斑斑，但也勉强能用。", price: 30 },
  { name: "玄铁重剑(仿)", type: 'weapon', desc: "很重，但没开刃，像个大铁棍。", price: 100 },
  { name: "倚天剑鞘", type: 'weapon', desc: "只有鞘没有剑，但依然锋利。", price: 500 },
  { name: "粗布头巾", type: 'head', desc: "甚至不能挡雨，只能束发。", price: 10 },
  { name: "金丝软甲(残)", type: 'body', desc: "破了好几个洞，防御力堪忧。", price: 150 },
  { name: "麻布裤", type: 'legs', desc: "非常宽松，方便踢腿。", price: 15 },
  { name: "神行太保靴", type: 'feet', desc: "据说穿上能日行八百里。", price: 80 },
  { name: "平安符", type: 'accessory', desc: "庙里求来的，希望能保平安。", price: 88 },
  { name: "神秘的藏宝图", type: 'misc', desc: "画得像小孩子的涂鸦。", price: 100 },
  { name: "不知名秘籍", type: 'misc', desc: "缺页严重的武功秘籍。", price: 500 },
];

export const STATIC_LOGS = {
  idle: [
    "微风拂过，路边的狗尾巴草挠得少侠鼻子发痒。",
    "少侠停下脚步，抖了抖鞋里的沙子，顺便看了一眼远处的青山。",
    "路过一片竹林，少侠试图用剑劈开落叶，结果扭了腰。",
    "肚子咕咕叫了一声，少侠摸出半个冷馒头啃了起来，略感凄凉。",
    "远处传来几声鸦啼，江湖路远，少侠紧了紧背后的包袱。",
    "遇到一个算命瞎子，非说少侠印堂发黑，少侠没理他，快步走开。",
    "天色渐暗，路边的野花倒是开得正好，少侠忍不住多看了两眼。",
    "少侠对着空气挥了一拳，假装打败了天下第一高手。",
    "踩到了一坨看起来很像黄金的牛粪，少侠叹了口气。",
    "忽然想起出门忘了关窗户，少侠懊恼不已。",
    "路边的茶棚里，几个脚夫正在吹嘘自己见过神龙大侠。",
  ],
  fight: [
    "那毛贼不知死活，挥舞着生锈的片刀冲了上来。",
    "少侠侧身一闪，脚下使了个绊子，那恶霸便摔了个狗吃屎。",
    "剑光一闪！少侠并未拔剑，仅用剑鞘便点中了对方的麻穴。",
    "对方使出一招'黑虎掏心'，少侠冷笑一声，反手一掌将其击退。",
    "一番缠斗，少侠衣衫虽有些凌乱，但眼神却愈发锐利。",
    "你来我往，好不热闹，周围的看客纷纷叫好。",
    "这一招险象环生，还好少侠基本功扎实，勉强躲过。",
  ],
  town: [
    "路过一个小镇，少侠决定去集市把背包里的垃圾卖掉。",
    "酒馆里人声鼎沸，少侠进去叫了一斤熟牛肉，二两烧刀子。",
    "在当铺里，掌柜的拿着放大镜仔细端详少侠捡来的破烂。",
    "街边的小贩在大声叫卖，充满了烟火气息。",
    "听说最近镇上的李寡妇要比武招亲，少侠凑过去看了看热闹。",
  ],
  arena: [
    "观众席传来阵阵欢呼，似乎有人押了少侠赢。",
    "对手露出了破绽，少侠犹豫了一下要不要攻其要害。",
    "这一招'亢龙有悔'险些没躲过，少侠惊出了一身冷汗。",
    "双方内力比拼，头顶冒出了丝丝白气。",
    "只听'当'的一声，兵器相交，火花四溅。",
  ]
};