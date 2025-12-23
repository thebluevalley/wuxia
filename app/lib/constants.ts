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

export type Faction = 'stark' | 'lannister' | 'targaryen' | 'baratheon' | 'watch' | 'wildling' | 'citadel' | 'neutral' | 'faith';
export const FACTIONS: Record<Faction, string> = {
  stark: "史塔克家族 (狼)",
  lannister: "兰尼斯特家族 (狮)",
  targaryen: "坦格利安家族 (龙)",
  baratheon: "拜拉席恩家族 (鹿)",
  watch: "守夜人军团",
  wildling: "自由民",
  citadel: "学城",
  faith: "七神教会",
  neutral: "平民"
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

export type SkillType = 'combat' | 'intrigue' | 'survival' | 'knowledge' | 'command';
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
  godPower: number; 
  unlockedFeatures: string[]; storyStage: string;
  pet: Pet | null;
  attributes: { constitution: number; strength: number; dexterity: number; intelligence: number; luck: number; };
  stamina: number; maxStamina: number;
  hp: number; maxHp: number; exp: number; maxExp: number; gold: number; alignment: number;
  reputation: Record<Faction, number>;
  
  tags: string[]; 
  actionCounts: {
    kills: number;        
    retreats: number;     
    gambles: number;      
    charity: number;      
    betrayals: number;    
    shopping: number;     
    drinking: number;     
  }; 
  description: string; 
  equipmentDescription: string; 

  currentQuest: Quest | null;
  queuedQuest: Quest | null;
  questBoard: Quest[];
  lastQuestRefresh: number;
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

// ⚠️ 核心新增：出身剧情模版 (Origin Stories)
export const ORIGIN_STORIES = {
  "私生子": {
    location: "临冬城",
    intro: "那是长夏的最后一年，国王劳勃·拜拉席恩的庞大车队正沿着国王大道向临冬城进发。而你，作为临冬城里一个不起眼的私生子，正站在城墙的角落里，看着史塔克家族的孩子们排练迎接皇室的礼仪。你的手里握着一把木剑，那是琼恩·雪诺送给你的。",
    first_interaction: "琼恩·雪诺"
  },
  "侍从": {
    location: "君临城",
    intro: "君临城的空气里永远弥漫着一股腐烂与香水混合的味道。作为红堡里的一名低阶侍从，你刚帮“小恶魔”提利昂·兰尼斯特倒完酒。他那双异色的眼睛似乎看穿了你的窘迫，扔给你一枚金龙，让你去跳蚤窝给他找个干净的女人。",
    first_interaction: "提利昂·兰尼斯特"
  },
  "守夜人新兵": {
    location: "绝境长城",
    intro: "升降梯的绞盘发出刺耳的嘎吱声，寒风像刀子一样割过你的脸颊。你站在七百尺高的冰墙之上，身边是同样瑟瑟发抖的山姆威尔·塔利。教头艾里沙·索恩爵士刚刚嘲笑了你的出身，但你知道，在这长城之外，无论你是贵族还是强盗，死人的眼睛里只有蓝色。",
    first_interaction: "山姆威尔·塔利"
  }
};

export const WORLD_ARCHIVE = [
  "【疯王之死】：詹姆·兰尼斯特在铁王座下刺杀了疯王伊里斯，终结了坦格利安王朝。",
  "【篡夺者战争】：劳勃·拜拉席恩在他的大锤下赢得了王冠。",
  "【凛冬将至】：史塔克家族的族语，这不仅仅是一句口号，更是古老的预言。",
  "【守夜人】：长夜将至，我从今开始守望，至死方休。",
  "【兰尼斯特有债必偿】：这不仅是关于金钱，更是关于复仇。",
  "【凡人皆有一死】：Valar Morghulis。",
  "【血色婚礼】：弗雷家族背叛了宾客权利，屠杀了北境之王。",
  "【异鬼】：老奶妈故事里的怪物，它们随着寒风而来，那是八千年前的事了。"
];

export const PERSONALITIES = ["荣誉感", "权谋家", "残暴", "忠诚", "贪婪", "信仰坚定", "疯癫", "冷酷", "野心勃勃"];
export const NPC_NAMES_MALE = ["琼恩", "泰温", "詹姆", "艾德", "罗柏", "提利昂", "培提尔", "瓦里斯", "劳勃", "雷加", "布兰", "山姆", "乔里克", "达里奥", "波隆"];
export const NPC_NAMES_FEMALE = ["丹妮莉丝", "瑟曦", "珊莎", "艾莉亚", "凯特琳", "玛格丽", "布蕾妮", "耶哥蕊特", "莱安娜", "梅丽珊卓", "阿莎"];
export const NPC_NAMES_LAST = ["史塔克", "兰尼斯特", "坦格利安", "拜拉席恩", "徒利", "提利尔", "马泰尔", "格雷乔伊", "雪诺", "佛雷", "波顿", "莫尔蒙"];

export const NPC_ARCHETYPES = {
  common: [
    { job: "酒馆老板", buff: "luck", desc: "擦着杯子，眼神闪烁，那是间谍的眼神。" },
    { job: "流浪歌手", buff: "exp", desc: "由于唱了一首嘲讽乔佛里的歌，他的舌头被割掉了。" },
    { job: "金袍子", buff: "attack", desc: "比起维护治安，他更擅长勒索商贩。" }
  ],
  rare: [
    { job: "学士", buff: "exp", desc: "颈上的链条代表着他在旧镇学到的知识：医术、天文、毒药。" },
    { job: "佣兵", buff: "attack", desc: "只要金龙到位，他连婴儿都敢杀。" },
    { job: "红袍祭司", buff: "luck", desc: "长夜黑暗，处处险恶。他在火焰中看到了你的命运。" }
  ],
  epic: [
    { job: "御林铁卫", buff: "defense", desc: "白袍之下，隐藏着无数肮脏的皇室秘密。" },
    { job: "无面者", buff: "attack", desc: "凡人皆有一死，凡人皆需侍奉。" }, 
    { job: "易形者", buff: "luck", desc: "他的眼睛翻白，正透过一只鹰俯瞰着你。" }
  ],
  legendary: [
    { job: "龙之母", buff: "attack", desc: "卡丽熙，不焚者，镣铐破除者。" },
    { job: "弑君者", buff: "attack", desc: "他做了一件无可挽回的错事，却拯救了全城的人。" }
  ]
};

export const NPC_TRAITS = ["私生子", "侏儒", "弑亲者", "守夜人", "骑士", "学士", "野人", "太监", "酒鬼", "美人"];

export const SKILL_LIBRARY = {
  combat: ["水舞者剑术", "双手巨剑", "长矛方阵", "多斯拉克马术", "十字弓"],
  intrigue: ["谎言", "毒药", "情报网", "政治联姻"],
  survival: ["生火", "狩猎", "抗寒", "草药学"],
  knowledge: ["瓦雷利亚语", "历史", "战术", "渡鸦"],
  command: ["鼓舞", "后勤", "攻城", "海战"]
};

export const PET_TEMPLATES = [
  { type: "冰原狼", desc: "北境之魂，忠诚且致命。" },
  { type: "幼龙", desc: "瓦雷利亚的末裔，火焰的化身。" },
  { type: "三眼乌鸦", desc: "它在看着你，一直看着你。" },
  { type: "影子山猫", desc: "潜伏在明月山脉的幽灵。" }
];

export const ARENA_OPPONENTS = ["魔山", "猎狗", "红毒蛇", "巴利斯坦", "詹姆·兰尼斯特", "布蕾妮", "巨人旺旺", "卓戈卡奥"];

export const MAP_LOCATIONS = {
  common: ["十字路口客栈", "跳蚤窝", "红堡地牢", "鼹鼠村", "避冬市镇", "孪河城"],
  search: ["旧镇学城", "龙石岛", "赫伦堡", "先民拳峰", "瓦雷利亚废墟"],
  hunt:   ["御林", "鬼影森林", "多恩沙漠", "铁群岛", "颈泽"],
  challenge: ["比武审判场", "绝境长城", "鹰巢城月门", "极乐塔", "弥林竞技场"],
  train:  ["黑白之院", "神木林", "长夜堡", "风息堡", "凯岩城"],
  life:   ["小指头的妓院", "高庭", "奔流城", "临冬城大厅", "君临集市"]
};

export const WORLD_MAP = [
  { name: "临冬城", type: "life", minLv: 1 }, { name: "狼林", type: "hunt", minLv: 1 }, { name: "神木林", type: "train", minLv: 1 },
  { name: "国王大道", type: "common", minLv: 10 }, { name: "十字路口客栈", type: "life", minLv: 10 }, { name: "孪河城", type: "challenge", minLv: 15 },
  { name: "君临城", type: "life", minLv: 30 }, { name: "跳蚤窝", type: "common", minLv: 30 }, { name: "红堡", type: "search", minLv: 35 },
  { name: "鹰巢城", type: "challenge", minLv: 45 }, { name: "高庭", type: "life", minLv: 50 },
  { name: "绝境长城", type: "train", minLv: 60 }, { name: "黑城堡", type: "common", minLv: 60 }, { name: "鬼影森林", type: "hunt", minLv: 65 },
  { name: "铁王座", type: "common", minLv: 99 }
];

export const STORY_STAGES = [
  { level: 1, name: "私生子", desc: "在这个残酷世界中，私生子的命比狗还贱。" },
  { level: 15, name: "侍从", desc: "你学会了擦亮盔甲，也学会了在权力的游戏中低头。" },
  { level: 40, name: "骑士", desc: "圣油涂抹在额头，但你知道誓言在欲望面前一文不值。" },
  { level: 70, name: "领主", desc: "你拥有了城堡和旗帜，但背后的匕首也更多了。" },
  { level: 100, name: "王者", desc: "当你玩权力的游戏时，不赢，就是死。" }
];

export const FLAVOR_TEXTS = {
  environment: ["凛冬的寒风呼啸", "君临城的腐臭味", "学士塔的乌鸦叫声", "铁王座的阴影", "狭海的咸湿海风", "北境的皑皑白雪"],
  action: ["擦拭瓦雷利亚钢剑", "喝了一口酸涩的红酒", "把玩着金龙币", "在心树前祈祷", "低声密谋", "裹紧了毛皮斗篷"],
  object: ["龙晶匕首", "学士的项链", "无面者的硬币", "族谱", "半个洋葱", "染血的白袍"]
};

// ⚠️ 剧情剧本：权游风格
export const QUEST_SCRIPTS = {
  "私生子": [
    { title: "私生子的证明", desc: "凯特琳·徒利夫人厌恶地看着你。你需要证明自己配得上史塔克的血脉。", obj: "狩猎野猪", antagonist: "森林里的巨型野猪", twist: "你救了罗柏·史塔克一命，但他让你不要声张。", faction: 'stark' },
    { title: "守夜人的召唤", desc: "班扬·史塔克回到了临冬城，他在招募去长城的人。", obj: "加入守夜人", antagonist: "严酷的教头", twist: "长城上缺的不是英雄，是炮灰。", faction: 'watch' }
  ],
  "侍从": [
    { title: "国王的私生子", desc: "首相艾德·史塔克在调查前任首相的死因，他让你去寻找一个铁匠铺的学徒。", obj: "寻找詹德利", antagonist: "金袍子", twist: "那个学徒长得和劳勃国王一模一样。", faction: 'stark' },
    { title: "比武大会的阴谋", desc: "魔山在比武中杀死了对手，你发现了有人在长枪上动了手脚。", obj: "调查线索", antagonist: "派席尔大学士", twist: "这一切都是瑟曦太后授意的。", faction: 'lannister' }
  ],
  "骑士": [
    { title: "五王之战", desc: "蓝礼、史坦尼斯、罗柏、乔佛里、巴隆，五个国王都在宣称王权。", obj: "选择阵营", antagonist: "战场上的逃兵", twist: "无论谁赢，百姓都输了。", faction: 'neutral' }
  ],
  "领主": [
    { title: "红色婚礼", desc: "无论如何，不要去孪河城参加婚礼。", obj: "阻止婚礼", antagonist: "瓦德·佛雷", twist: "这是一个无法改变的悲剧。", faction: 'stark' }
  ],
  "default": [
    { title: "凡人皆有一死", desc: "混乱是阶梯。", obj: "生存", antagonist: "命运", twist: "今天不是死期。", faction: 'neutral' }
  ]
};

export const WORLD_LORE = `
背景：七大王国，铁王座之争。
威胁：凛冬将至，异鬼苏醒。
基调：写实、残酷、低魔。没有绝对的主角光环，任何人随时可能死去。
`;

export const QUEST_SOURCES = {
  search: ["寻找龙蛋"], hunt: ["猎杀冰原狼"], challenge: ["比武审判"], train: ["黑白之院受训"], life: ["御前会议"]
};

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "多恩红酒", type: 'consumable', desc: "像血一样红，像复仇一样甜。", price: 100, minLevel: 10, quality: 'common', effect: 50 },
  { name: "发霉的黑面包", type: 'consumable', desc: "平民的口粮，硬得能砸死人。", price: 1, minLevel: 1, quality: 'common', effect: 10 },
  { name: "罂粟花奶", type: 'consumable', desc: "学士用来止痛的药，喝多了会做梦。", price: 50, minLevel: 15, quality: 'rare', effect: 100 },
  { name: "野火罐", type: 'consumable', desc: "绿色的液体，极不稳定，能燃烧一切。", price: 500, minLevel: 40, quality: 'epic', effect: 1000 },
  { name: "《七星圣经》", type: 'book', desc: "七神教会的经典。", price: 50, minLevel: 5, quality: 'common', effect: "虔诚" },
  { name: "《龙王的谱系》", type: 'book', desc: "记载了坦格利安家族的历史。", price: 200, minLevel: 20, quality: 'rare', effect: "瓦雷利亚语" },
  { name: "瓦雷利亚钢匕首", type: 'weapon', desc: "龙骨柄，波浪纹，那是古瓦雷利亚的魔法。", price: 5000, minLevel: 50, quality: 'legendary', power: 150 },
  { name: "缝衣针", type: 'weapon', desc: "这是琼恩送给艾莉亚的礼物，剑尖锋利。", price: 3000, minLevel: 30, quality: 'epic', power: 80 },
  { name: "劳勃的战锤", type: 'weapon', desc: "沉重无比，神力者方能挥舞。", price: 4000, minLevel: 40, quality: 'epic', power: 120 },
  { name: "守夜人斗篷", type: 'body', desc: "黑色的羊毛，抵御绝境长城的严寒。", price: 50, minLevel: 10, quality: 'common', power: 20 },
  { name: "兰尼斯特金甲", type: 'body', desc: "华丽、昂贵，但能不能防住利剑很难说。", price: 5000, minLevel: 50, quality: 'legendary', power: 150 },
  { name: "国王之手胸针", type: 'accessory', desc: "这是权力的象征，也是死亡的邀请函。", price: 1000, minLevel: 40, quality: 'epic', power: 50 },
];

export const STATIC_LOGS = {
  idle: [
    "凛冬的寒风吹过，你裹紧了破旧的斗篷。",
    "远处君临城的钟声敲响了，那是国王驾崩的丧钟吗？",
    "一只乌鸦落在枝头，黑色的眼睛死死盯着你，仿佛在说：雪诺。",
    "路边的乞丐在唱着《卡斯特梅的雨季》，让人不寒而栗。",
    "你擦拭着剑上的锈迹，在这乱世，这是你唯一的朋友。",
  ],
  fight: [
    "钢铁碰撞的声音在空旷的战场上回荡。",
    "鲜血染红了雪地，像极了那一年的心树叶子。",
    "没有荣誉，只有生存。你将剑刺入了对手的喉咙。",
    "痛觉让你清醒，这说明你还活着。",
  ],
  town: [
    "跳蚤窝的街道上流淌着污水，散发着腐烂的味道。",
    "红堡高耸入云，那是权力的中心，也是谎言的温床。",
    "金袍子卫兵粗暴地推开路人，为一辆兰尼斯特的马车开道。",
  ],
  arena: [
    "这里是比武审判，只有胜利者才是无罪的。",
    "观众们高呼着嗜血的口号，他们渴望看到鲜血。",
    "魔山那庞大的身躯像一座小山，遮住了阳光。",
  ]
};