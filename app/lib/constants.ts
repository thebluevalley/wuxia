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

// 任务类型
export type QuestType = 'search' | 'hunt' | 'challenge' | 'train' | 'life';

export type Quest = {
  name: string;
  type: QuestType;
  desc: string;
  progress: number;
  total: number;
};

// 宠物结构
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
  
  // Lv.3 解锁
  motto: string;
  
  // 神力值
  godPower: number;
  
  // 解锁功能列表
  unlockedFeatures: string[];

  // Lv.5 解锁
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
  alignment: number; // 善恶值
  currentQuest: Quest;
  
  location: string;
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon' | 'arena';
  
  logs: LogEntry[];
  majorEvents: string[];
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

// 性格库
export const PERSONALITIES = [
  "侠义", "孤僻", "狂放", "儒雅", "贪财", "痴情", "阴狠", "中庸", "社恐"
];

// 宠物库 (纯正武侠风)
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

// 竞技场对手 (补充)
export const ARENA_OPPONENTS = [
  "少林铜人", "峨眉师太", "全真道士", "丐帮八袋长老", "魔教左护法", "只会一招的菜鸟", "隐世扫地僧", "金兵百夫长"
];

// 任务模板
export const QUEST_SOURCES = {
  search: ["寻找失传的《易筋经》残卷", "探寻楼兰古国的宝藏线索", "搜集打造屠龙刀的玄铁", "寻找传说中的天山雪莲"],
  hunt:   ["讨伐黑风寨的土匪首领", "清理后山的吊睛白额虎", "追捕采花大盗‘万里独行’", "消灭为祸一方的五毒教徒"],
  challenge: ["挑战华山派大弟子", "去少林寺闯十八铜人阵", "与丐帮长老比拼酒量", "参加武林大会争夺盟主"],
  train:  ["在寒玉床上修炼内功", "在瀑布下练习拔剑一万次", "在梅花桩上练习轻功", "背诵艰涩难懂的武功心法"],
  life:   ["帮隔壁王大妈寻找走失的鸭子", "去集市摆摊卖艺赚盘缠", "帮村长修补漏雨的屋顶", "为心上人描眉画画"]
};

// 掉落表
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
  idle: [
    "微风拂过，路边的狗尾巴草挠得少侠鼻子发痒。",
    "少侠停下脚步，抖了抖鞋里的沙子，顺便看了一眼远处的青山。",
    "路过一片竹林，少侠试图用剑劈开落叶，结果差点扭了腰。",
    "肚子咕咕叫了一声，少侠摸出半个冷馒头啃了起来。",
    "远处传来几声鸦啼，江湖路远，少侠紧了紧背后的包袱。",
    "遇到一个算命瞎子，非说少侠印堂发黑，少侠没理他。",
    "天色渐暗，路边的野花倒是开得正好。",
    "少侠对着空气挥了一拳，假装打败了东方不败。",
    "踩到了一坨看起来很像黄金的牛粪，少侠叹了口气。",
    "忽然想起出门忘了关窗户，少侠懊恼不已。",
    "路边的茶棚里，几个脚夫正在吹嘘自己见过郭靖。",
  ],
  fight: [
    "那毛贼不知死活，挥舞着生锈的片刀冲了上来。",
    "少侠侧身一闪，脚下使了个绊子，那恶霸便摔了个狗吃屎。",
    "剑光一闪！少侠并未拔剑，仅用剑鞘便点中了对方的麻穴。",
    "对方使出一招'黑虎掏心'，少侠冷笑一声，反手一掌将其击退。",
    "一番缠斗，少侠衣衫虽有些凌乱，但眼神却愈发锐利。",
  ],
  town: [
    "路过一个小镇，少侠决定去集市把背包里的垃圾卖掉。",
    "酒馆里人声鼎沸，少侠进去叫了一斤熟牛肉，二两烧刀子。",
    "在当铺里，掌柜的拿着放大镜仔细端详少侠捡来的破烂。",
  ],
  arena: [
    "观众席传来阵阵欢呼，似乎有人押了少侠赢。",
    "对手露出了破绽，少侠犹豫了一下要不要攻其要害。",
    "这一招'亢龙有悔'险些没躲过，少侠惊出了一身冷汗。",
    "双方内力比拼，头顶冒出了丝丝白气。",
  ]
};