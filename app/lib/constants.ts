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

export type Faction = 'nature' | 'survivor' | 'savage' | 'ruins' | 'beast' | 'unknown' | 'neutral' | 'faith' | 'watch'; 

export type QuestCategory = 'main' | 'side' | 'auto'; 
export type QuestRank = 1 | 2 | 3 | 4 | 5;
export type QuestStage = 'start' | 'road' | 'climax' | 'end'; 

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
    npc?: string; 
  };
  desc: string; 
  stage: QuestStage;
  progress: number; 
  total: number;
  reqLevel: number;
  staminaCost: number; 
  isAuto?: boolean; 
  rewards: { gold: number; exp: number; item?: Item; };
};

export type Expedition = {
  id: string;
  name: string;
  desc: string;
  difficulty: QuestRank;
  duration: number; 
  startTime?: number;
  endTime?: number;
  location: string;
  rewards: { gold: number; exp: number; lootChance: number };
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

export type StrategyState = {
    longTermGoal: string; 
    currentFocus: string; 
    urgency: 'low' | 'medium' | 'high'; 
    narrativePhase: 'survival' | 'exploration' | 'mystery' | 'escape'; 
};

export type HeroState = {
  name: string; level: number; gender: '男' | '女'; age: number; personality: string; title: string; motto: string;
  godPower: number; 
  unlockedFeatures: string[]; storyStage: string;
  mainStoryIndex: number; 
  pet: Pet | null;
  attributes: { constitution: number; strength: number; dexterity: number; intelligence: number; luck: number; };
  stamina: number; maxStamina: number;
  hp: number; maxHp: number; exp: number; maxExp: number; gold: number; alignment: number;
  reputation: Record<Faction, number>;
  tags: string[]; 
  actionCounts: { kills: number; retreats: number; gambles: number; charity: number; betrayals: number; shopping: number; drinking: number; }; 
  description: string; 
  equipmentDescription: string; 
  
  strategy: StrategyState;
  currentSeed?: string;
  idleUntil?: number; 

  storyBuffer: string[];

  currentQuest: Quest | null;
  queuedQuest: Quest | null;
  questBoard: Quest[];
  lastQuestRefresh: number;

  activeExpedition: Expedition | null;
  expeditionBoard: Expedition[];
  lastExpeditionRefresh: number;

  narrativeHistory: string;
  location: string; 
  state: 'idle' | 'fight' | 'sleep' | 'town' | 'dungeon' | 'arena' | 'expedition';
  logs: LogEntry[]; messages: Message[]; majorEvents: string[];
  inventory: Item[]; equipment: Equipment; martialArts: Skill[]; lifeSkills: Skill[];
  stats: { kills: number; days: number; arenaWins: number; }; 
  tavern: { visitors: Companion[]; lastRefresh: number; };
  companion: Companion | null; companionExpiry: number;
};

// ⚠️ 新增 'story' 类型，专门用于AI生成的剧情文本
export type LogEntry = { id: string; text: string; type: 'normal' | 'highlight' | 'bad' | 'system' | 'ai' | 'story'; time: string; };

// ⚠️ 剧本节点结构
export type ScriptNode = {
    id: string;
    chapter: string; 
    summary: string; 
    objective: string; 
    location: string; 
    requirements?: { level?: number; item?: string }; 
    rewards?: { gold: number; exp: number; item?: string };
};

// ⚠️ 核心数据：遗落群岛完整剧本
export const NOVEL_SCRIPT: ScriptNode[] = [
    // --- 第一章：海之囚徒 ---
    {
        id: "1-1",
        chapter: "第一章：海之囚徒",
        location: "起始岛海滩",
        objective: "寻找生命之源",
        summary: "剧烈的头痛如重锤敲击，喉咙干渴得像吞了火炭。你俯卧在湿漉漉的沙滩上，周围是救生舱的残骸。脱水正在吞噬你的体力。必须深入岛屿腹地，寻找可饮用的淡水水源。"
    },
    {
        id: "1-2",
        chapter: "第一章：海之囚徒",
        location: "防风岩壁",
        objective: "升起第一堆篝火",
        summary: "夜幕降临，气温骤降。没有火，你可能会失温而死。你尝试了无数次钻木取火，双手磨出了血泡。必须搜集枯木与椰子绒，引燃火种，并确保火堆整夜不灭。"
    },
    {
        id: "1-3",
        chapter: "第一章：海之囚徒",
        location: "深夜营地",
        objective: "猎杀监视者",
        summary: "深夜，你听到了机械摩擦声。一只半掩在沙土中的机械螃蟹正死死盯着你。这是一场不对等的战斗。利用粗木棍和走位，避开它的金属钳，击碎它的核心电路。"
    },
    {
        id: "1-4",
        chapter: "第一章：海之囚徒",
        location: "黑色礁石区",
        objective: "石器时代的飞跃",
        summary: "徒手无法生存。你利用铁皮和黑曜石，开始制作工具。你的目光望向了远方海平线上的阴影——铁锈岛。你需要制作一把石斧和一支尖锐的长矛。"
    },
    // --- 第二章：第一艘筏 ---
    {
        id: "2-1",
        chapter: "第二章：第一艘筏",
        location: "起始岛沙滩",
        objective: "绘制木筏蓝图",
        summary: "淡水和椰子枯竭。看着远处的铁锈岛，你决定离开。根据浮力原理，在沙滩上画下双层甲板木筏的图纸，计算所需的浮木和泡沫板。"
    },
    {
        id: "2-2",
        chapter: "第二章：第一艘筏",
        location: "临时造船厂",
        objective: "组装“希望号”",
        summary: "烈日下，你赤膊挥舞石斧。将收集的原木利用藤蔓进行十字捆绑，完成木筏主体。利用破烂降落伞布制作风帆。每一根原木的倒下都代表着希望。"
    },
    {
        id: "2-3",
        chapter: "第二章：第一艘筏",
        location: "浅水区",
        objective: "驱逐鲨鱼",
        summary: "试航时，血腥味引来了虎鲨。它封锁了出路。不能硬拼，制造内脏诱饵将其引开，或者站在礁石上用长矛刺击它的鼻头将其驱离。"
    },
    {
        id: "2-4",
        chapter: "第二章：第一艘筏",
        location: "环礁死线",
        objective: "穿越暗流区",
        summary: "风向变了。你推船入海，海浪猛烈拍打木筏。驾驭风帆，利用潮汐的力量冲出被称为“死线”的暗礁带。在体力耗尽前，重重冲上铁锈岛的沙滩。"
    },
    // --- 第三章：铁与锈 ---
    {
        id: "3-1",
        chapter: "第三章：铁与锈",
        location: "工业岛废墟",
        objective: "寻找急救包",
        summary: "这里是钢铁丛林，到处是生锈的管道。你踩到废铁受伤了。必须潜入废弃的医务室废墟，在腐烂的骷髅旁寻找未过期的抗生素和急救包。"
    },
    {
        id: "3-2",
        chapter: "第三章：铁与锈",
        location: "锻造车间",
        objective: "打造金属砍刀",
        summary: "在工厂深处发现了尚有余温的老式熔炉。清理通风口，寻找煤炭，将废钢熔炼锻打，制作一把锋利的金属砍刀。这是告别石器时代的关键。"
    },
    {
        id: "3-3",
        chapter: "第三章：铁与锈",
        location: "空旷厂房",
        objective: "击毁机械猎犬",
        summary: "打铁声引来了几只失控的机械猎犬(K-9)。不要硬刚，利用狭窄地形游击，布置陷阱压碎它们，攻击背部电池仓弱点。"
    },
    {
        id: "3-4",
        chapter: "第三章：铁与锈",
        location: "工厂主控室",
        objective: "重启终端",
        summary: "找到一本沾血的日志，记录了“方舟计划”。将电池串联启动主控电脑，读取加密文档。确认主大陆“伊甸园”在北方。下载海图，抉择去向。"
    },
    // --- 第四章：双人舞 ---
    {
        id: "4-1",
        chapter: "第四章：双人舞",
        location: "密林岛",
        objective: "建立丛林哨站",
        summary: "密林岛危机四伏，毒虫遍布。在远离沼泽的高地建立带栅栏的营地。利用泥浆涂满全身防蚊，收集树脂制作火把。"
    },
    {
        id: "4-2",
        chapter: "第四章：双人舞",
        location: "密林深处",
        objective: "绝境谈判",
        summary: "你不慎踩中陷阱被倒吊。猎人赛斯手持复合弓出现。在被倒吊的状态下，通过对话和拿出身份卡，说服他你不是掠夺者，避免被射杀。"
    },
    {
        id: "4-3",
        chapter: "第四章：双人舞",
        location: "赛斯营地",
        objective: "击退变异森蚺",
        summary: "一条15米长的变异森蚺袭击了营地，赛斯重伤。你必须利用落石陷阱和砍刀，攻击森蚺腹部，救下赛斯。这是建立信任的唯一机会。"
    },
    {
        id: "4-4",
        chapter: "第四章：双人舞",
        location: "安全屋",
        objective: "组建双人小队",
        summary: "你救了赛斯。他坦白身世，你们正式结盟。修复他的复合弓，拼合海图，发现下一站是沉没的科研站。第一次有人与你分享烤肉。"
    },
    // --- 第五章：深海回响 ---
    {
        id: "5-1",
        chapter: "第五章：深海回响",
        location: "深海遗迹区",
        objective: "修复潜水钟",
        summary: "为了进入水下科研站，赛斯带你找到了一个生锈的潜水钟。利用橡胶密封缝隙，连接气泵。准备下潜。"
    },
    {
        id: "5-2",
        chapter: "第五章：深海回响",
        location: "水下都市",
        objective: "探索沉没实验室",
        summary: "透过玻璃看到被淹没的摩天大楼。身穿简易潜水服游入地标大厦顶层实验室。时刻注意氧气，利用气泡室换气，避开锤头鲨。"
    },
    {
        id: "5-3",
        chapter: "第五章：深海回响",
        location: "崩塌大楼",
        objective: "生死逃脱",
        summary: "巨型章鱼缠住了大楼，输气管断裂。窒息边缘，必须割断触手，启用备用气瓶，在赛斯的拉扯下拼命游回潜水钟。"
    },
    {
        id: "5-4",
        chapter: "第五章：深海回响",
        location: "海面木筏",
        objective: "解析星盘",
        summary: "死里逃生带回了古代星盘。全息光束指向东方——谎言之港。阅读实验室文档，得知方舟计划失败是人祸。升级木筏底座。"
    },
    // --- 第六章：谎言之港 ---
    {
        id: "6-1",
        chapter: "第六章：谎言之港",
        location: "海上浮城",
        objective: "寻找船用引擎",
        summary: "巨大的海上贫民窟，鱼龙混杂。为了穿越风暴，必须在集市中寻找出售旧时代柴油引擎的商人。小心扒手。"
    },
    {
        id: "6-2",
        chapter: "第六章：谎言之港",
        location: "废弃军舰",
        objective: "高风险谈判",
        summary: "中间人老杰克带你们交易。面对贪婪的商人和保镖，利用武力威慑压价，同时警惕暗处的埋伏。"
    },
    {
        id: "6-3",
        chapter: "第六章：谎言之港",
        location: "水牢",
        objective: "水牢求生",
        summary: "被背叛了。老杰克是铁锈帮的人。你们被关在水位上涨的水牢里。安抚幽闭恐惧症发作的赛斯，在水底寻找铁丝撬锁越狱。"
    },
    {
        id: "6-4",
        chapter: "第六章：谎言之港",
        location: "港口出口",
        objective: "夺船大逃亡",
        summary: "炸开牢门，抢夺一艘安装了引擎的快艇。操作鱼叉炮反击追兵，冲进库房夺回星盘，引爆燃油储备制造火墙，冲出港口。"
    },
    // --- 第七章：迷雾航路 ---
    {
        id: "7-1",
        chapter: "第七章：迷雾航路",
        location: "迷雾区",
        objective: "登上幽灵船",
        summary: "为了甩掉追兵驶入迷雾。登上死寂的豪华游轮寻找燃油。船上全是干尸。阅读日记，发现迷雾里有东西。"
    },
    {
        id: "7-2",
        chapter: "第七章：迷雾航路",
        location: "游轮走廊",
        objective: "分清虚实",
        summary: "吸入孢子产生幻觉。看到了死去的亲人和说话的机械蟹。必须找到防毒面具恢复理智，唤醒发疯的赛斯。"
    },
    {
        id: "7-3",
        chapter: "第七章：迷雾航路",
        location: "游轮甲板",
        objective: "保卫船只",
        summary: "巨型迷雾乌贼袭击。利用消防水炮喷射燃油，攻击乌贼眼球，砍断缠绕船体的触手。"
    },
    {
        id: "7-4",
        chapter: "第七章：迷雾航路",
        location: "阳光海域",
        objective: "升级复仇号",
        summary: "冲出迷雾。利用游轮零件将快艇升级为半机械化战舰“复仇号”。安装雷达，清洗孢子。"
    },
    // --- 第八章：枯萎病 ---
    {
        id: "8-1",
        chapter: "第八章：枯萎病",
        location: "复仇号船舱",
        objective: "寻找解药线索",
        summary: "赛斯感染枯萎病，命悬一线。根据海图，附近的沼泽岛曾是医疗中心。必须独自登岛寻找血清。"
    },
    {
        id: "8-2",
        chapter: "第八章：枯萎病",
        location: "沼泽生化岛",
        objective: "收集原料",
        summary: "岛上充满毒气和变异植物。深入腹地，采集三种稀有变异植物样本。维护防毒面具，制造除草剂开路。"
    },
    {
        id: "8-3",
        chapter: "第八章：枯萎病",
        location: "地下实验室",
        objective: "破解生物锁",
        summary: "进入核心实验室，解开基因序列谜题。骇入自动炮塔防御系统。得知病毒是人造武器。"
    },
    {
        id: "8-4",
        chapter: "第八章：枯萎病",
        location: "实验室出口",
        objective: "突围与拯救",
        summary: "合成血清，杀出丧尸包围圈。救治赛斯，并顺手救下机械师和医生，招募他们上船。净化岛屿水源。"
    },
    // --- 第九章：叹息之墙 ---
    {
        id: "9-1",
        chapter: "第九章：叹息之墙",
        location: "风暴边缘",
        objective: "分析风暴眼",
        summary: "伊甸园被超级风暴墙阻挡。计算风暴规律，寻找5分钟的进入窗口。全员动员，加固船体。"
    },
    {
        id: "9-2",
        chapter: "第九章：叹息之墙",
        location: "风暴中心",
        objective: "驾驭风暴",
        summary: "冲入风暴。巨浪滔天。控制方向避开漩涡，清理卷上甲板的深海生物，扑灭机舱火灾。"
    },
    {
        id: "9-3",
        chapter: "第九章：叹息之墙",
        location: "引擎室",
        objective: "艰难的抉择",
        summary: "冷却阀卡死。老机械师把你推出去，自己进入高温蒸汽室手动开启阀门。听着他的遗言，引擎轰鸣，你含泪冲破最后一道浪墙。"
    },
    {
        id: "9-4",
        chapter: "第九章：叹息之墙",
        location: "大陆滩头",
        objective: "插上旗帜",
        summary: "风暴骤停，搁浅登陆。双脚终于踩在大陆上。为牺牲者立碑。眺望远处的废弃宏伟城市。"
    },
    // --- 第十章：新黎明 ---
    {
        id: "10-1",
        chapter: "第十章：新黎明",
        location: "中央废墟都市",
        objective: "前往中央尖塔",
        summary: "城市空无一人。伊甸园只是个传说。穿过废墟，前往世界树大厦。拼凑人类灭亡真相，重启区域电力。"
    },
    {
        id: "10-2",
        chapter: "第十章：新黎明",
        location: "大厦顶层",
        objective: "对话AI盖亚",
        summary: "见到守护者量子主机盖亚。它解释风暴是筛选机制。利用星盘和身份卡进行最高权限验证。"
    },
    {
        id: "10-3",
        chapter: "第十章：新黎明",
        location: "核心控制台",
        objective: "按下重启按钮",
        summary: "面临抉择：毁灭还是重启。看着身边的伙伴，回想起一路的艰辛，坚定选择重启文明。解锁基因库和科技蓝图。"
    },
    {
        id: "10-4",
        chapter: "第十章：新黎明",
        location: "大厦露台",
        objective: "种下希望",
        summary: "防御风暴消散，向全海域发送广播。你在废墟缝隙中种下第一章带来的椰子。海面上千帆竞发。这不是终点，是新文明的第一天。"
    }
];

// --- 其他静态配置 (保持不变) ---
export const FLAVOR_TEXTS = {
  environment: ["潮湿的海风带着盐粒", "丛林深处未知的嘶吼", "暴雨打在芭蕉叶上的闷响", "远处火山腾起的黑烟", "腐烂植物的刺鼻气味", "刺骨的海风像刀割一样"],
  action: ["用力磨尖手中的木棍", "用浑浊的雨水清洗伤口", "强忍恶心生吃螃蟹", "警惕地环顾四周动静", "在树皮上刻下生存天数", "检查水源是否被污染"],
  object: ["生锈的锋利铁片", "不知名动物的白骨", "半个破碎的漂流瓶", "几块干燥的燧石", "干枯长毛的椰子", "旧时代的塑料碎片"]
};

export const EVENT_SEEDS: Record<string, string[]> = {
  "收集": ["拖拽一根吸饱水的浮木，肩膀被粗糙的树皮磨破了皮。", "翻开腐烂的圆木，几只肥硕的白色幼虫在蠕动。", "在灌木丛中收集这种坚韧的纤维，手指被荆棘划出几道血痕。", "这块石头边缘锋利如刀，正好可以用来切割猎物。", "收集了一些干燥的苔藓作为引火物，它们闻起来有股霉味。"],
  "寻找": ["趴在地上观察兽径，泥土里保留着清晰的蹄印。", "拨开茂密的蕨类植物，一只惊恐的蜥蜴窜了出去。", "空气中弥漫着淡淡的硫磺味。", "阳光穿过树冠投下斑驳的光影。", "顺着海鸟盘旋的方向走去。"],
  "制作": ["石刀一次次刮过木杆，木屑纷飞。", "用牙齿咬紧藤蔓打结，咸涩的汗水流进眼睛里。", "尝试把骨头磨成针，指尖因为长时间用力而发白。", "将两块石头互相敲击，火星四溅。", "编织这该死的草绳需要极大的耐心。"],
  "休息": ["脱下湿透的靴子，脚底已经被海水泡得发白起皱。", "靠在岩石上喘息，每一口呼吸都带着血腥味。", "用指甲一点点剔除伤口里的沙砾。", "盯着跳动的火苗出神。", "嚼着苦涩的草根，试图欺骗痉挛的胃袋。"],
  "荒芜海滩": ["涨潮了，冰冷的海水漫过脚踝。", "一只巨大的信天翁尸体躺在沙滩上。", "海风卷起细沙打在脸上。", "发现了一串巨大且奇怪的脚印延伸向大海。"],
  "深邃丛林": ["头顶传来树枝折断的脆响。", "这该死的湿度，衣服紧紧贴在身上。", "误触了一种带刺的植物，半条手臂瞬间麻木。", "在树根下发现了一个废弃的土著图腾。"]
};

export const AUTO_TASKS: any = {}; 

export const MAIN_SAGA = [{ title: "遗落群岛", goal: "重启文明", phase: "survival", desc: "活下去。", tasks: [], location: "起始岛", reqLevel: 1 }]; 

export const SIDE_QUESTS = {
  "荒芜海滩": [{ title: "抓捕沙蟹", desc: "储备食物。", obj: "寻找", antagonist: "螃蟹" }, { title: "收集漂流木", desc: "优质木材。", obj: "收集", antagonist: "沉重" }],
  "深邃丛林": [{ title: "采集野果", desc: "小心有毒。", obj: "收集", antagonist: "中毒" }, { title: "寻找草药", desc: "止血草。", obj: "寻找", antagonist: "蛇" }],
  "default": [{ title: "制作绳索", desc: "编织。", obj: "制作", antagonist: "枯燥" }, { title: "练习投掷", desc: "提高命中。", obj: "制作", antagonist: "脱靶" }]
};

export const WORLD_ARCHIVE = ["【日记残页】", "【奇怪的吼声】", "【飞机残骸】", "【部落图腾】"];
export const WORLD_LORE = "文明已死，唯适者生存。";
export const NPC_ARCHETYPES = { common: [{ job: "流浪者", buff: "luck", desc: "眼神游离。" }], rare: [{ job: "医生", buff: "heal", desc: "幸存医生。" }], epic: [{ job: "特种兵", buff: "attack", desc: "单兵作战。" }], legendary: [{ job: "土著", buff: "luck", desc: "秘密。" }] };
export const SKILL_LIBRARY = { combat: ["矛术"], intrigue: ["潜行"], survival: ["生火"], knowledge: ["地理"], command: ["驯兽"] };
export const PERSONALITIES = ["坚韧", "悲观", "冷静"];
export const NPC_NAMES_MALE = ["阿杰", "老黑"];
export const NPC_NAMES_FEMALE = ["小红", "安娜"];
export const NPC_NAMES_LAST = ["幸存者"];
export const NPC_TRAITS = ["饥饿的", "受伤的"];
export const LOOT_TABLE: Partial<Item>[] = [{ name: "椰子", type: 'consumable', desc: "水。", price: 5, minLevel: 1, quality: 'common', effect: 20 }];
export const MAP_LOCATIONS = { common: ["沙滩"], search: ["残骸"], hunt: ["密林"], challenge: ["火山"], train: ["营地"], life: ["河边"] };
export const WORLD_MAP = [{ name: "荒芜海滩", type: "life", minLv: 1 }, { name: "深邃丛林", type: "hunt", minLv: 5 }, { name: "坠机山顶", type: "search", minLv: 10 }];
export const STORY_STAGES = [{ level: 1, name: "幸存者" }];
export const STATIC_LOGS = { idle: ["海浪拍打礁石。", "擦拭伤口。", "空气有土腥味。", "远处野兽嚎叫。", "盯着铁片发呆。"] };
export const EXPEDITION_LOCATIONS = [{ name: "遗忘掩体", desc: "阴森。", diff: 4, duration: 1800000, rewards: {gold: 100, exp: 200, lootChance: 0.5} }];