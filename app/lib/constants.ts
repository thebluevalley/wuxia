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

export type HeroState = {
  name: string;
  level: number;
  gender: '男' | '女';
  age: number;
  cultivation: string;
  
  hp: number;
  maxHp: number;
  exp: number;
  maxExp: number;
  gold: number;
  
  // 新增：任务与性格
  currentQuest: string;    // 当前任务名
  questProgress: number;   // 任务进度 0-100
  alignment: number;       // 善恶值：-50(恶) ~ 50(善)
  
  location: string;
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon';
  
  logs: LogEntry[];
  inventory: Item[];
  equipment: Equipment;
  
  skills: Skill[];
  lifeSkills: Skill[];
  
  stats: {
    kills: number;
    deaths: number;
    days: number;
  };
};

export type Skill = {
  name: string;
  level: number;
  desc: string;
};

export type LogEntry = {
  id: string;
  text: string;
  type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai';
  time: string;
};

// 任务库 (Godville 风格无厘头任务)
export const QUEST_TEMPLATES = [
  "帮隔壁王大妈寻找走失的橘猫",
  "试图理解为什么这里的鸡不肯过马路",
  "收集 99 个史莱姆的粘液（虽然不知道有什么用）",
  "寻找传说中能让人长高的秘方",
  "去少林寺偷学怎么做素斋",
  "向武林盟主讨要拖欠的工资",
  "为了正义，消灭村口过多的蚊子",
  "寻找一把并不存在的绝世好剑",
  "练习如何用眼神杀死对手",
  "护送一位说话很啰嗦的书生进京赶考",
  "调查最近猪肉涨价的幕后黑手",
];

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "半个冷馒头", type: 'misc', desc: "硬得像石头，但能填饱肚子。", price: 1 },
  { name: "不知名的野花", type: 'misc', desc: "路边采的，有一股淡淡的幽香。", price: 2 },
  { name: "狼皮", type: 'misc', desc: "虽然破损了，但还能卖几个钱。", price: 15 },
  { name: "金疮药", type: 'misc', desc: "江湖救急必备良药。", price: 50 },
  { name: "生锈的铁剑", type: 'weapon', desc: "虽然锈迹斑斑，但也勉强能用。", price: 30 },
  { name: "青竹杖", type: 'weapon', desc: "一根坚韧的竹子，打狗专用。", price: 25 },
  { name: "粗布头巾", type: 'head', desc: "甚至不能挡雨，只能束发。", price: 10 },
  { name: "破旧皮甲", type: 'body', desc: "猎户穿过的旧皮甲，有股汗味。", price: 40 },
  { name: "麻布裤", type: 'legs', desc: "非常宽松，方便踢腿。", price: 15 },
  { name: "草鞋", type: 'feet', desc: "行侠仗义，千里之行始于足下。", price: 5 },
  { name: "平安符", type: 'accessory', desc: "庙里求来的，希望能保平安。", price: 88 },
  { name: "板砖", type: 'weapon', desc: "趁手的兵器，拍人专用。", price: 5 },
  { name: "神秘的藏宝图", type: 'misc', desc: "画得像小孩子的涂鸦。", price: 100 },
];

// 海量静态文案库 (减少重复感)
export const STATIC_LOGS = {
  idle: [
    "微风拂过，路边的狗尾巴草挠得少侠鼻子发痒。",
    "少侠停下脚步，抖了抖鞋里的沙子。",
    "路过一片竹林，少侠试图用剑劈开落叶，结果扭了腰。",
    "肚子咕咕叫了一声，少侠摸出半个冷馒头啃了起来。",
    "远处传来几声鸦啼，江湖路远，少侠紧了紧背后的包袱。",
    "遇到一个算命瞎子，非说少侠印堂发黑。",
    "天色渐暗，路边的野花倒是开得正好。",
    "少侠对着空气挥了一拳，假装打败了武林盟主。",
    "踩到了一坨看起来很像黄金的牛粪。",
    "忽然想起出门忘了关窗户，少侠懊恼不已。",
    "路边的茶棚里，几个脚夫正在吹嘘自己见过神龙。",
    "一只松鼠站在树梢上，鄙视地看着少侠。",
    "少侠试图用内力震碎一块石头，结果手肿了。",
    "捡到一文钱，少侠高兴得像个三百斤的孩子。",
    "一阵妖风吹过，发型乱了，头可断发型不能乱啊。",
    "看到蚂蚁搬家，少侠蹲在路边看了半个时辰。",
    "打了个喷嚏，一定是有人在想念本大侠。",
    "路过一个水坑，照了照镜子，觉得自己依然帅气。",
    "遇到一个乞丐，比少侠还有钱的样子。",
    "鞋底磨穿了一个洞，感觉到了一丝凉意。",
  ],
  fight: [
    "那毛贼不知死活，挥舞着生锈的片刀冲了上来。",
    "少侠侧身一闪，脚下使了个绊子，那恶霸便摔了个狗吃屎。",
    "剑光一闪！少侠并未拔剑，仅用剑鞘便点中了对方的麻穴。",
    "对方使出一招'黑虎掏心'，少侠冷笑一声，反手一掌将其击退。",
    "一番缠斗，少侠衣衫虽有些凌乱，但眼神却愈发锐利。",
    "对手大喊一声“看暗器”，结果扔过来一只鞋。",
    "少侠使出了“王八拳”，乱拳打死老师傅。",
    "对方见势不妙，跪地求饶，说上有八十老母。",
    "一场恶战，少侠的发型丝毫未乱。",
    "对手是个结巴，光是报上名号就花了一炷香时间。",
    "少侠一脚踢中对方屁股，那人捂着屁股跑了。",
  ],
  town: [
    "路过一个小镇，少侠决定去集市把背包里的垃圾卖掉。",
    "酒馆里人声鼎沸，少侠进去叫了一斤熟牛肉。",
    "在当铺里，掌柜的拿着放大镜仔细端详少侠捡来的破烂。",
    "集市上人来人往，少侠捂紧了钱袋。",
    "听说镇上的豆腐西施很漂亮，少侠特意去买了两块豆腐。",
    "在铁匠铺修补了一下兵器，花了五文钱。",
  ],
  quest: [
    "为了完成任务，少侠正在向路人打听消息。",
    "虽然不知道还要走多远，但为了任务，冲鸭！",
    "线索似乎断了，少侠陷入了沉思。",
    "距离完成目标又近了一步，虽然只有一小步。",
    "这个任务真是麻烦，少侠忍不住吐槽了一句。",
  ]
};