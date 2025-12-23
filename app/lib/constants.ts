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

// ⚠️ 核心重构：七国势力 (The Seven Kingdoms & Beyond)
export type Faction = 'stark' | 'lannister' | 'targaryen' | 'baratheon' | 'watch' | 'wildling' | 'citadel' | 'neutral' | 'faith';
export const FACTIONS: Record<Faction, string> = {
  stark: "北境家族 (狼)",
  lannister: "西境金狮 (狮)",
  targaryen: "流亡真龙 (龙)",
  baratheon: "铁王座 (鹿)",
  watch: "守夜人军团 (黑)",
  wildling: "塞外野人 (自由民)",
  citadel: "学城 (知识)",
  faith: "七神教会 (信仰)",
  neutral: "平民百姓"
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

// 技能重构：中世纪战技与权谋
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
  godPower: number; // 改为 "命运值/旧神眷顾"
  unlockedFeatures: string[]; storyStage: string;
  pet: Pet | null;
  attributes: { constitution: number; strength: number; dexterity: number; intelligence: number; luck: number; };
  stamina: number; maxStamina: number;
  hp: number; maxHp: number; exp: number; maxExp: number; gold: number; alignment: number; // Gold -> Gold Dragons (金龙)
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

// --- 典故系统 (Lore of Westeros-like World) ---
export const WORLD_ARCHIVE = [
  "【篡夺者战争】：十五年前，鹿家联合狼家推翻了疯王的统治，真龙血脉流亡海外。",
  "【长夜传说】：八千年前，异鬼从极北之地南下，几乎毁灭了人类文明，直到筑城者布兰登建立了绝境长城。",
  "【血色婚礼】：在孪河城，宾客权利被践踏，北境之王惨遭背叛，狼头被缝在了尸体上。",
  "【守夜人誓言】：长夜将至，我从今开始守望，至死方休。我是黑暗中的利剑，长城上的守卫。",
  "【兰尼斯特有债必偿】：西境守护家族的非官方族语，既是承诺，也是威胁。",
  "【凡人皆有一死 (Valar Morghulis)】：来自狭海对岸的古老谚语。",
  "【无面者】：布拉佛斯的刺客组织，他们没有名字，也没有脸。",
  "【旧神与七神】：北境人依然信仰鱼梁木上的旧神，而南方人则在圣堂祈祷七神保佑。"
];

export const PERSONALITIES = ["荣誉", "狡诈", "残酷", "忠诚", "贪婪", "虔诚", "疯癫", "冷漠", "野心"];
export const NPC_NAMES_MALE = ["琼恩", "泰温", "詹姆", "艾德", "罗柏", "提利昂", "培提尔", "瓦里斯", "劳勃", "雷加", "布兰", "山姆", "乔里克", "达里奥"];
export const NPC_NAMES_FEMALE = ["丹妮莉丝", "瑟曦", "珊莎", "艾莉亚", "凯特琳", "玛格丽", "布蕾妮", "耶哥蕊特", "莱安娜", "梅丽珊卓"];
export const NPC_NAMES_LAST = ["史塔克", "兰尼斯特", "坦格利安", "拜拉席恩", "徒利", "提利尔", "马泰尔", "格雷乔伊", "雪诺(私生子)", "石东(私生子)", "佛雷", "波顿"];

export const NPC_ARCHETYPES = {
  common: [
    { job: "酒馆老板", buff: "luck", desc: "擦着杯子，听着来自维斯特洛各地的流言。" },
    { job: "流浪歌手", buff: "exp", desc: "弹着竖琴，唱着《卡斯特梅的雨季》。" },
    { job: "妓院老鸨", buff: "luck", desc: "她知道这城里所有大人物的秘密。" }, 
    { job: "君临城卫兵", buff: "attack", desc: "穿着金袍子，比起抓贼更擅长收受贿赂。" }
  ],
  rare: [
    { job: "学士", buff: "exp", desc: "颈上挂着重重的金属链条，代表着渊博的知识。" },
    { job: "佣兵", buff: "attack", desc: "只认金龙，不认骑士精神。" },
    { job: "红袍祭司", buff: "luck", desc: "在火焰中看到了未来，嘴里念叨着光之王。" },
    { job: "守夜人游骑兵", buff: "defense", desc: "黑衣如墨，这是他在长城外活下来的第十个年头。" }
  ],
  epic: [
    { job: "御林铁卫", buff: "defense", desc: "身披白甲，誓死守护国王，虽说现在的国王不值得守护。" },
    { job: "无面者", buff: "attack", desc: "不仅能杀人，还能变成死者的模样。" }, 
    { job: "龙石岛法师", buff: "exp", desc: "掌握着失传已久的瓦雷利亚巫术。" }, 
    { job: "北境封臣", buff: "attack", desc: "虽然粗鲁，但绝对忠诚。" }
  ],
  legendary: [
    { job: "龙之母", buff: "attack", desc: "不焚者，带着三条龙重返维斯特洛。" },
    { job: "弑君者", buff: "attack", desc: "金发飘扬，剑术无双，背负着一生的骂名。" }, 
    { job: "三眼乌鸦", buff: "exp", desc: "坐在鱼梁木的树根中，看穿了过去与未来。" }
  ]
};

export const NPC_TRAITS = ["私生子", "侏儒", "弑亲者", "守夜人", "骑士", "学士", "野人", "太监", "酒鬼", "美人"];

export const SKILL_LIBRARY = {
  combat: ["水舞者剑术", "双手巨剑精通", "长矛方阵", "骑枪冲锋", "多斯拉克弯刀", "十字弓射击"],
  intrigue: ["谎言织造", "情报收集", "毒药调配", "政治联姻", "收买人心"],
  survival: ["绝境求生", "雪地追踪", "草药识别", "生火取暖"],
  knowledge: ["高等瓦雷利亚语", "历史学", "战术指挥", "渡鸦传信"],
  command: ["鼓舞士气", "阵型指挥", "后勤管理", "攻城术"]
};

export const PET_TEMPLATES = [
  { type: "冰原狼", desc: "北境的图腾，比普通的狼大两倍，忠诚且凶猛。" },
  { type: "幼龙", desc: "虽然还小，但喷出的火焰已能融化钢铁。" },
  { type: "三眼乌鸦", desc: "神秘的向导，总是在梦中出现。" },
  { type: "影子山猫", desc: "潜伏在明月山脉的杀手。" },
  { type: "信鸦", desc: "虽然不能战斗，但能带来远方的消息。" }
];

export const ARENA_OPPONENTS = ["魔山", "猎狗", "红毒蛇", "巴利斯坦爵士", "詹姆·兰尼斯特", "美人布蕾妮", "巨人旺旺", "卓戈卡奥"];

export const MAP_LOCATIONS = {
  common: ["十字路口客栈", "跳蚤窝", "君临城下水道", "鼹鼠村", "避冬市镇", "孪河城"],
  search: ["旧镇学城", "龙石岛地下", "赫伦堡废墟", "先民拳峰", "瓦雷利亚废墟"],
  hunt:   ["御林", "鬼影森林", "多恩沙漠", "铁群岛", "颈泽"],
  challenge: ["比武审判场", "绝境长城之巅", "鹰巢城月门", "极乐塔", "弥林竞技场"],
  train:  ["布拉佛斯黑白之院", "红堡地牢", "心树之下", "长夜堡", "风息堡"],
  life:   ["小指头的妓院", "高庭花园", "奔流城", "凯岩城", "临冬城大厅"]
};

export const WORLD_MAP = [
  { name: "临冬城", type: "life", minLv: 1 }, { name: "狼林", type: "hunt", minLv: 1 }, { name: "避冬市镇", type: "common", minLv: 1 }, { name: "心树神木林", type: "train", minLv: 1 },
  { name: "国王大道", type: "common", minLv: 10 }, { name: "十字路口客栈", type: "life", minLv: 10 }, { name: "孪河城", type: "challenge", minLv: 15 }, { name: "颈泽", type: "hunt", minLv: 15 },
  { name: "君临城", type: "life", minLv: 30 }, { name: "跳蚤窝", type: "common", minLv: 30 }, { name: "红堡", type: "search", minLv: 35 }, { name: "贝勒大圣堂", type: "train", minLv: 35 },
  { name: "御林", type: "hunt", minLv: 40 }, { name: "鹰巢城", type: "challenge", minLv: 45 }, { name: "高庭", type: "life", minLv: 50 },
  { name: "绝境长城", type: "train", minLv: 60 }, { name: "黑城堡", type: "common", minLv: 60 }, { name: "鬼影森林", type: "hunt", minLv: 65 }, { name: "先民拳峰", type: "search", minLv: 70 },
  { name: "艰难屯", type: "challenge", minLv: 80 }, { name: "永冬之地", type: "search", minLv: 90 }, { name: "铁王座", type: "common", minLv: 99 }
];

export const STORY_STAGES = [
  { level: 1, name: "私生子", desc: "你是这个残酷世界中被遗忘的角落，连姓氏都是耻辱。" },
  { level: 15, name: "侍从", desc: "你学会了擦亮盔甲，也学会了在权力的游戏中低头。" },
  { level: 40, name: "骑士", desc: "你被涂抹了圣油，宣誓效忠，但你发现誓言在欲望面前一文不值。" },
  { level: 70, name: "领主", desc: "你拥有了自己的城堡和旗帜，但背后的匕首也更多了。" },
  { level: 100, name: "王者", desc: "你赢得了权力的游戏，或者...你死得稍微晚了一些。" }
];

export const FLAVOR_TEXTS = {
  environment: ["凛冬的寒风呼啸", "君临城的腐臭味", "学士塔的乌鸦叫声", "铁王座的阴影", "狭海的咸湿海风", "北境的皑皑白雪"],
  action: ["擦拭瓦雷利亚钢剑", "喝了一口酸涩的红酒", "把玩着金龙币", "在神木林中祈祷", "低声密谋", "裹紧了毛皮斗篷"],
  object: ["龙晶匕首", "学士的项链", "无面者的硬币", "族谱", "半个洋葱", "染血的白袍"]
};

// ⚠️ 核心重构：权游风格剧本 (Grimdark)
export const QUEST_SCRIPTS = {
  "私生子": [
    { title: "凛冬将至", desc: "绝境长城的逃兵带来了关于'异鬼'的消息，但没人相信他。", obj: "调查逃兵", antagonist: "守夜人征兵官", twist: "逃兵其实是被自己人吓疯的，但长城外真的有东西在动。", faction: 'watch' },
    { title: "比武大会的赌注", desc: "国王之手的比武大会即将开始，你需要弄到一副盔甲。", obj: "筹集装备", antagonist: "势利的铁匠", twist: "你偷来的盔甲上刻着一个已经灭绝家族的纹章。", faction: 'neutral' }
  ],
  "侍从": [
    { title: "小指头的任务", desc: "培提尔·贝里席大人让你去妓院送一封信。", obj: "送信", antagonist: "金袍子卫兵", twist: "信里是前任首相被毒死的真相，你成了唯一的知情者。", faction: 'baratheon' },
    { title: "保护小恶魔", desc: "提利昂·兰尼斯特在跳蚤窝喝醉了，有人想借机杀他。", obj: "护送侏儒", antagonist: "雇佣刺客", twist: "刺客是他的姐姐瑟曦派来的。", faction: 'lannister' }
  ],
  "骑士": [
    { title: "血色婚礼的请以此", desc: "佛雷家族邀请你去参加一场婚礼，据说有美酒和美食。", obj: "赴宴", antagonist: "佛雷家族士兵", twist: "乐队开始演奏《卡斯特梅的雨季》，门被锁上了。", faction: 'stark' },
    { title: "审判", desc: "你被指控谋杀国王，要在比武审判中证明清白。", obj: "决斗", antagonist: "魔山", twist: "你的代理骑士在决斗前夜被毒死了，你必须亲自上场。", faction: 'baratheon' }
  ],
  "领主": [
    { title: "长夜之战", desc: "夜王攻破了长城，死人军团南下。", obj: "死守临冬城", antagonist: "夜王", twist: "龙妈的龙变成了尸龙，正在向你喷吐蓝色的火焰。", faction: 'watch' }
  ],
  "default": [
    { title: "权力的游戏", desc: "混乱不是深渊，混乱是阶梯。", obj: "往上爬", antagonist: "昨日的盟友", twist: "在权力的游戏中，你不当赢家，就只有死路一条。", faction: 'neutral' }
  ]
};

export const WORLD_LORE = `
背景：七大王国，铁王座之争。疯王已死，篡夺者劳勃坐镇君临，但兰尼斯特家族暗中掌权。
威胁：北境长城之外，异鬼苏醒，凛冬将至；狭海对岸，真龙血脉正在崛起。
基调：凡人皆有一死 (Valar Morghulis)。没有绝对的正义，只有家族利益和生存。
`;

export const QUEST_SOURCES = {
  search: ["寻找瓦雷利亚钢"], hunt: ["猎杀冰原狼"], challenge: ["比武审判"], train: ["黑白之院受训"], life: ["参与御前会议"]
};

export const LOOT_TABLE: Partial<Item>[] = [
  { name: "青亭岛红酒", type: 'consumable', desc: "口感醇厚，贵族的最爱。", price: 100, minLevel: 10, quality: 'common', effect: 50 },
  { name: "黑面包", type: 'consumable', desc: "硬得像石头，但能填饱肚子。", price: 1, minLevel: 1, quality: 'common', effect: 10 },
  { name: "罂粟花奶", type: 'consumable', desc: "强效止痛药，喝多了会让人迟钝。", price: 50, minLevel: 15, quality: 'rare', effect: 100 },
  { name: "野火", type: 'consumable', desc: "绿色的液体，极不稳定，能燃烧一切。", price: 500, minLevel: 40, quality: 'epic', effect: 1000 },
  { name: "《七星圣经》", type: 'book', desc: "教会的经典。", price: 50, minLevel: 5, quality: 'common', effect: "虔诚" },
  { name: "《龙的族谱》", type: 'book', desc: "记载了坦格利安家族的历史。", price: 200, minLevel: 20, quality: 'rare', effect: "瓦雷利亚语" },
  { name: "瓦雷利亚钢匕首", type: 'weapon', desc: "削铁如泥，据说曾用来刺杀布兰。", price: 5000, minLevel: 50, quality: 'legendary', power: 150 },
  { name: "长爪", type: 'weapon', desc: "莫尔蒙家族的祖传宝剑，现属于琼恩·雪诺。", price: 6000, minLevel: 60, quality: 'legendary', power: 200 },
  { name: "缝衣针", type: 'weapon', desc: "艾莉亚的佩剑，小巧锋利。", price: 3000, minLevel: 30, quality: 'epic', power: 80 },
  { name: "劳勃的战锤", type: 'weapon', desc: "沉重无比，一击曾击碎雷加的胸甲。", price: 4000, minLevel: 40, quality: 'epic', power: 120 },
  { name: "守夜人黑衣", type: 'body', desc: "厚重保暖，也许还能挡几刀。", price: 50, minLevel: 10, quality: 'common', power: 20 },
  { name: "兰尼斯特金甲", type: 'body', desc: "华丽耀眼，防御力极高。", price: 5000, minLevel: 50, quality: 'legendary', power: 150 },
  { name: "国王之手胸针", type: 'accessory', desc: "权力的象征，也是靶子。", price: 1000, minLevel: 40, quality: 'epic', power: 50 },
  { name: "无面者硬币", type: 'accessory', desc: "Valar Dohaeris。", price: 500, minLevel: 30, quality: 'rare', power: 30 },
];

export const STATIC_LOGS = {
  idle: [
    "凛冬的寒风吹过，你裹紧了破旧的斗篷。",
    "远处君临城的钟声敲响了，那是国王驾崩的丧钟吗？",
    "一只乌鸦落在枝头，黑色的眼睛死死盯着你。",
    "路边的乞丐在唱着关于美人和熊的下流歌曲。",
    "你擦拭着剑上的锈迹，在这乱世，这是你唯一的朋友。",
  ],
  fight: [
    "这是为了家族的荣誉，也是为了生存。",
    "鲜血染红了雪地，像极了那一年的心树叶子。",
    "对手的眼神中充满了恐惧，但他别无选择。",
    "钢铁碰撞的声音在空旷的战场上回荡。",
  ],
  town: [
    "跳蚤窝的街道上流淌着污水，散发着腐烂的味道。",
    "红堡高耸入云，那是权力的中心，也是谎言的温床。",
    "金袍子卫兵粗暴地推开路人，为一辆装饰华丽的马车开道。",
  ],
  arena: [
    "这里是比武审判，只有胜利者才是无罪的。",
    "观众们高呼着嗜血的口号，他们渴望看到鲜血。",
    "魔山那庞大的身躯像一座小山，遮住了阳光。",
  ]
};