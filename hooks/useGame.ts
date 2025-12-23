import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QUEST_SCRIPTS, QuestType, PERSONALITIES, PET_TEMPLATES, ARENA_OPPONENTS, MAP_LOCATIONS, WORLD_MAP, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message, Quality, NPC_NAMES_MALE, NPC_NAMES_FEMALE, NPC_NAMES_LAST, NPC_ARCHETYPES, NPC_TRAITS, Companion, Quest, QuestRank, Faction } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

// 缩短刷新间隔，防止长时间无响应
const REFRESH_INTERVAL = 3 * 60 * 60 * 1000; 
const QUEST_REFRESH_INTERVAL = 6 * 60 * 60 * 1000; 

// --- 辅助函数 ---

const getStoryStage = (level: number) => {
  const stage = [...STORY_STAGES].reverse().find(s => level >= s.level);
  return stage ? stage.name : "微尘";
};

const calculateTags = (hero: HeroState): string[] => {
  const tags: Set<string> = new Set();
  const { hp, maxHp, stamina, gold, attributes, actionCounts, inventory, equipment, level, companion, stats } = hero;

  if (hp < maxHp * 0.1) tags.add("命悬一线");
  else if (hp < maxHp * 0.3) tags.add("重伤");
  
  if (stamina < 20) tags.add("精疲力竭");
  else if (stamina > 100) tags.add("龙精虎猛");

  if (gold > 50000) tags.add("富可敌国");
  else if (gold < 50) tags.add("穷困潦倒");

  if (actionCounts.kills > 100) tags.add("杀人如麻");
  if (actionCounts.drinking > 20) tags.add("酒鬼");

  if (attributes.strength > 20) tags.add("天生神力");
  if (attributes.intelligence > 20) tags.add("多智近妖");

  const weaponName = equipment.weapon?.name || "";
  if (weaponName.includes("剑")) tags.add("剑客");
  else if (weaponName.includes("刀")) tags.add("刀客");
  else if (!equipment.weapon) tags.add("拳师");
  
  if (stats.arenaWins > 50) tags.add("武林神话");

  return Array.from(tags).slice(0, 10);
};

const generateQuestBoard = (level: number, stageName: string): Quest[] => {
  const quests: Quest[] = [];
  // @ts-ignore
  const scripts = QUEST_SCRIPTS[stageName] || QUEST_SCRIPTS["default"];
  for (let i = 0; i < 3; i++) {
    const isCombat = Math.random() > 0.4;
    const template = scripts[Math.floor(Math.random() * scripts.length)];
    const rand = Math.random();
    let rank: QuestRank = 1;
    if (rand < 0.1) rank = 5; else if (rand < 0.3) rank = 4; else if (rand < 0.6) rank = 3; else rank = 2;
    const baseGold = level * 20 + 50;
    const baseExp = level * 50 + 100;
    const multiplier = rank * 1.5;
    const staminaCost = rank * 10;
    const totalProgress = rank * 300; 
    quests.push({
      id: Date.now() + i + Math.random().toString(),
      name: `[${rank}星] ${template.title}`,
      category: isCombat ? 'combat' : 'life',
      rank, faction: template.faction as Faction,
      script: { title: template.title, description: template.desc, objective: template.obj, antagonist: template.antagonist, twist: template.twist },
      desc: template.desc, progress: 0, total: totalProgress, stage: 'start', reqLevel: Math.max(1, level - 2 + Math.floor(Math.random() * 5)), isAuto: false, staminaCost,
      rewards: { gold: Math.floor(baseGold * multiplier), exp: Math.floor(baseExp * multiplier) }
    });
  }
  return quests;
};

const generateFillerQuest = (level: number, stageName: string): Quest => {
  return { id: 'auto_' + Date.now(), name: "闲逛", category: 'life', rank: 1, faction: 'neutral', script: { title: "闲逛", description: "无事发生", objective: "消磨时间", antagonist: "无", twist: "无" }, desc: "日常琐事...", progress: 0, total: 200, reqLevel: 1, stage: 'start', isAuto: true, staminaCost: 5, rewards: { gold: level * 5 + 10, exp: level * 10 + 20 } };
};

const getLocationByQuest = (questType: QuestType, level: number): string => {
  const availableMaps = WORLD_MAP.filter(m => level >= m.minLv && level <= m.minLv + 40);
  const pool = availableMaps.length > 0 ? availableMaps : WORLD_MAP.slice(0, 3);
  return pool[Math.floor(Math.random() * pool.length)].name;
};

const getInitialSkills = (): Skill[] => [{ name: "太祖长拳", type: 'attack', level: 1, exp: 0, maxExp: 100, desc: "江湖流传最广的入门拳法" }];
const getInitialLifeSkills = (): Skill[] => [{ name: "包扎", type: 'medical', level: 1, exp: 0, maxExp: 100, desc: "简单的伤口处理" }];

const generateVisitors = (): Companion[] => {
  const visitors: Companion[] = [];
  const tiers: Quality[] = [];
  for (let i = 0; i < 5; i++) { const rand = Math.random(); let tier: Quality = 'common'; if (rand < 0.02) tier = 'legendary'; else if (rand < 0.10) tier = 'epic'; else if (rand < 0.35) tier = 'rare'; else tier = 'common'; tiers.push(tier); }
  const commonCount = tiers.filter(t => t === 'common').length;
  if (commonCount === 5) { const luckyIndex = Math.floor(Math.random() * 5); const pityRoll = Math.random(); if (pityRoll < 0.1) tiers[luckyIndex] = 'legendary'; else if (pityRoll < 0.4) tiers[luckyIndex] = 'epic'; else tiers[luckyIndex] = 'rare'; }
  tiers.forEach((tier, i) => {
    const templates = NPC_ARCHETYPES[tier]; const template = templates[Math.floor(Math.random() * templates.length)];
    let gender: '男' | '女' = Math.random() > 0.5 ? '男' : '女';
    if (template.job.includes('女') || template.job.includes('花')) gender = '女';
    if (template.job.includes('僧') || template.job.includes('少')) gender = '男';
    const firstNameList = gender === '男' ? NPC_NAMES_MALE : NPC_NAMES_FEMALE;
    const firstName = firstNameList[Math.floor(Math.random() * firstNameList.length)];
    const lastName = NPC_NAMES_LAST[Math.floor(Math.random() * NPC_NAMES_LAST.length)];
    const trait = NPC_TRAITS[Math.floor(Math.random() * NPC_TRAITS.length)];
    const priceMap = { common: 200, rare: 1000, epic: 5000, legendary: 20000 };
    const buffVal = { common: 5, rare: 15, epic: 30, legendary: 80 };
    visitors.push({ id: Date.now() + i + Math.random().toString(), name: `${firstName}${lastName}`, gender, title: template.job, archetype: template.job, personality: trait, desc: template.desc, quality: tier, price: priceMap[tier], buff: { type: template.buff as any, val: buffVal[tier] } });
  });
  return visitors;
};

const rollLoot = (level: number, luck: number): Partial<Item> | null => {
    const validItems = LOOT_TABLE.filter(i => (i.minLevel || 1) <= level);
    if (validItems.length === 0) return null;
    const rand = Math.random() * 100 - (luck * 0.5);
    let targetQuality: Quality = 'common';
    if (rand < 2) targetQuality = 'legendary'; else if (rand < 10) targetQuality = 'epic'; else if (rand < 30) targetQuality = 'rare'; else targetQuality = 'common';
    let pool = validItems.filter(i => i.quality === targetQuality);
    if (pool.length === 0) pool = validItems.filter(i => i.quality === 'common');
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
};

// --- Main Hook ---

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef<HeroState | null>(null);
  const recentLogsRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { heroRef.current = hero; }, [hero]);

  const login = async (name: string, password: string) => {
    setLoading(true); setError(null);
    const initialStage = "微尘";
    const initialBoard = generateQuestBoard(1, initialStage);

    const newHero: HeroState = {
      name, level: 1, gender: Math.random() > 0.5 ? '男' : '女', age: 16, 
      personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)], 
      title: initialStage, motto: "莫欺少年穷", godPower: 100, unlockedFeatures: [], 
      pet: null, storyStage: initialStage,
      attributes: { constitution: 10, strength: 10, dexterity: 10, intelligence: 10, luck: 10 },
      stamina: 120, maxStamina: 120,
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 200, 
      alignment: 0, location: "牛家村", state: 'idle', 
      logs: [], messages: [], majorEvents: [`${new Date().toLocaleDateString()}：${name} 踏入江湖。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: getInitialSkills(), lifeSkills: getInitialLifeSkills(),
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: null, queuedQuest: null, questBoard: initialBoard, lastQuestRefresh: Date.now(), 
      tavern: { visitors: generateVisitors(), lastRefresh: Date.now() },
      companion: null, companionExpiry: 0,
      reputation: { alliance: 0, freedom: 0, court: 0, sword: 0, healer: 0, cult: 0, invader: 0, hidden: 0, neutral: 0 },
      narrativeHistory: "初入江湖，一切未卜。",
      tags: ["初出茅庐"], 
      actionCounts: { kills: 0, retreats: 0, gambles: 0, charity: 0, betrayals: 0, shopping: 0, drinking: 0 },
      description: "初入江湖，默默无闻。",
      equipmentDescription: "一身布衣，手无寸铁。" 
    };

    if (!supabase) { setHero(newHero); setLoading(false); setTimeout(() => triggerAI('start_game', undefined, undefined, newHero), 500); return; }

    try {
      let { data: user } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (user) {
        if (user.password !== password) { setError("密令错误！"); setLoading(false); return; }
        const mergedData = { ...newHero, ...user.data };
        if (!mergedData.equipmentDescription) mergedData.equipmentDescription = "衣着朴素，风尘仆仆。";
        
        setHero(mergedData);
        setTimeout(() => triggerAI('resume_game', undefined, undefined, mergedData), 500);
      } else {
        await supabase.from('profiles').insert({ username: name, password: password, data: newHero });
        setHero(newHero);
        setTimeout(() => triggerAI('start_game', undefined, undefined, newHero), 500);
      }
    } catch (e) { console.error(e); setError("网络错误"); }
    setLoading(false);
  };

  useEffect(() => {
    if (!hero || !supabase) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => { await supabase.from('profiles').update({ data: hero }).eq('username', hero.name); }, 5000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [hero]);

  const addLog = (text: string, type: LogEntry['type'] = 'normal') => {
    recentLogsRef.current = [text, ...recentLogsRef.current].slice(0, 3);
    setHero(prev => {
      if (!prev) return null;
      const newHistory = (prev.narrativeHistory + " " + text).slice(-500);
      const newLog = { id: Date.now().toString(), text, type, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) };
      return { ...prev, logs: [...prev.logs, newLog].slice(-50), narrativeHistory: newHistory };
    });
  };

  const addMessage = (type: 'rumor' | 'system', title: string, content: string) => {
    setHero(prev => { if (!prev) return null; return { ...prev, messages: [{ id: Date.now().toString(), type, title, content, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}), isRead: false }, ...prev.messages].slice(0, 50) }; });
  };

  const acceptQuest = (questId: string) => {
    if (!heroRef.current) return;
    const hero = heroRef.current;
    const quest = hero.questBoard.find(q => q.id === questId);
    if (!quest) return;
    if (hero.level < quest.reqLevel) { addLog(`【接取失败】此任务凶险，建议达到 Lv.${quest.reqLevel} 再尝试。`, 'system'); return; }
    if (hero.stamina < quest.staminaCost) { addLog(`【精力不足】身体疲惫，需休息恢复。(需要 ${quest.staminaCost} 精力)`, 'system'); return; }
    if (hero.queuedQuest) { addLog(`【接取失败】你已经预约了下一个任务，请先完成。`, 'system'); return; }

    const newBoard = hero.questBoard.filter(q => q.id !== questId); 
    setHero(prev => prev ? { ...prev, stamina: prev.stamina - quest.staminaCost, queuedQuest: quest, questBoard: newBoard } : null);
    addLog(`【揭榜】已消耗精力接下委托：${quest.name}，将在当前事务完成后执行。`, 'highlight');
  };

  const hireCompanion = (visitorId: string) => {
    if (!hero) return;
    const visitor = hero.tavern.visitors.find(v => v.id === visitorId);
    if (!visitor) return;
    if (hero.gold < visitor.price) { addLog("囊中羞涩，请不起这位大侠。", "system"); return; }
    setHero(prev => {
      if (!prev) return null;
      return { ...prev, gold: prev.gold - visitor.price, companion: visitor, companionExpiry: Date.now() + 24 * 60 * 60 * 1000, tavern: { ...prev.tavern, visitors: prev.tavern.visitors.filter(v => v.id !== visitorId) } };
    });
    addLog(`豪掷 ${visitor.price} 文，成功邀请【${visitor.name}】结伴同行！`, "highlight");
    triggerAI("recruit_companion", "", "recruit", { ...hero, companion: visitor });
  };

  const triggerAI = async (eventType: string, suffix: string = "", action?: string, explicitHero?: HeroState) => {
    const currentHero = explicitHero || hero;
    if (!currentHero) return false;
    const showCompanion = Math.random() > 0.7;
    const companionInfo = (showCompanion && currentHero.companion) ? `伙伴:${currentHero.companion.title} ${currentHero.companion.name} (性别:${currentHero.companion.gender}, 性格:${currentHero.companion.personality})` : "独行 (暂不描写伙伴)";
    try {
      const bestSkill = currentHero.martialArts.sort((a,b) => b.level - a.level)[0];
      const context = { 
        ...currentHero, 
        storyStage: getStoryStage(currentHero.level), 
        worldLore: WORLD_LORE, 
        questScript: currentHero.currentQuest?.script,
        questStage: currentHero.currentQuest?.stage,
        questInfo: currentHero.currentQuest ? `[${currentHero.currentQuest.category}] ${currentHero.currentQuest.name}` : "无任务，游历中", 
        petInfo: currentHero.pet ? `灵宠:${currentHero.pet.type}` : "无", 
        companionInfo: companionInfo, 
        skillInfo: `擅长${bestSkill?.name || '乱拳'}(Lv.${bestSkill?.level || 1})`, 
        narrativeHistory: currentHero.narrativeHistory,
        recentLogs: recentLogsRef.current, 
        lastLogLen: recentLogsRef.current[0]?.length || 0,
        tags: currentHero.tags || [],
        equipment: currentHero.equipment
      };
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ context, eventType, userAction: action }) });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.text) {
        if (eventType === 'generate_description') {
            setHero(h => h ? { ...h, description: data.text } : null);
            return true;
        }
        if (eventType === 'generate_equip_desc') {
            setHero(h => h ? { ...h, equipmentDescription: data.text } : null);
            return true;
        }

        if (eventType === 'generate_rumor') {
           let title = "江湖风声"; let content = data.text;
           if (data.text.includes("：")) { const parts = data.text.split("："); title = parts[0]; content = parts.slice(1).join("："); }
           addMessage('rumor', title, content);
        } else {
           const fullText = suffix ? `${data.text} ${suffix}` : data.text;
           // ⚠️ 关键修正：确保剧情事件类型为 'highlight'，以便触发打字机效果
           const logType = ['god_action','start_game','resume_game','recruit_companion','quest_start','quest_climax','quest_end','quest_journey','idle_event'].includes(eventType) ? 'highlight' : 'normal';
           addLog(fullText, logType);
        }
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const godAction = async (type: 'bless' | 'punish') => {
    if (!hero) return;
    if (hero.godPower < 25) { addLog("【神力不足】请等待神力自然恢复。", "system"); return; }
    if (type === 'bless') { 
      setHero(h => h ? {...h, hp: h.maxHp, godPower: h.godPower - 25} : null); 
      addLog("【天降甘霖】一道金光笼罩全身，伤势尽愈！(HP恢复)", "highlight");
      triggerAI('god_action', ''); 
    } else { 
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 20), exp: h.exp + 50, godPower: h.godPower - 25} : null); 
      addLog("【天降雷罚】一道惊雷劈下，虽受皮肉之苦，却觉内力精进！(经验+50)", "highlight");
      triggerAI('god_action', ''); 
    }
  };

  const autoManageInventory = (currentHero: HeroState): { hero: HeroState, logs: string[], tagsChanged: boolean } => {
    let hero = { ...currentHero };
    const logs: string[] = [];
    let updated = false;
    let equipChanged = false;

    const newTags = calculateTags(hero);
    const tagsChanged = JSON.stringify(newTags) !== JSON.stringify(hero.tags);
    if (tagsChanged) {
        hero.tags = newTags;
        updated = true;
    }

    hero.inventory.forEach(item => {
      const equipPower = item.power || 0;
      if (equipPower > 0) {
        let slotKey: keyof Equipment | null = null;
        if (item.type === 'weapon') slotKey = 'weapon';
        else if (item.type === 'head') slotKey = 'head';
        else if (item.type === 'body') slotKey = 'body';
        else if (item.type === 'legs') slotKey = 'legs';
        else if (item.type === 'feet') slotKey = 'feet';
        else if (item.type === 'accessory') slotKey = 'accessory';

        if (slotKey) {
          const currentEquip = hero.equipment[slotKey];
          const currentPower = currentEquip?.power || 0;
          if (equipPower > currentPower) {
            if (currentEquip) hero.inventory.push(currentEquip);
            hero.equipment[slotKey] = item;
            const idx = hero.inventory.findIndex(i => i.id === item.id);
            if (idx > -1) { if (hero.inventory[idx].count > 1) hero.inventory[idx].count--; else hero.inventory.splice(idx, 1); }
            logs.push(`【换装】装备了更强的 ${item.name} (强度 ${equipPower})`);
            updated = true;
            equipChanged = true;
          }
        }
      }
    });

    const books = hero.inventory.filter(i => i.type === 'book');
    books.forEach(book => {
       const skillName = String(book.effect);
       const existingSkill = hero.martialArts.find(s => s.name === skillName);
       if (existingSkill) {
          existingSkill.exp += 100;
          logs.push(`【研读】自动研读 ${book.name}，${skillName}熟练度提升！`);
       } else {
          hero.martialArts.push({ name: skillName, type: 'attack', level: 1, exp: 0, maxExp: 100, desc: "新习得的武学" });
          logs.push(`【顿悟】自动研读 ${book.name}，习得【${skillName}】！`);
       }
       const idx = hero.inventory.findIndex(i => i.id === book.id);
       if (idx > -1) { if (hero.inventory[idx].count > 1) hero.inventory[idx].count--; else hero.inventory.splice(idx, 1); }
       updated = true;
    });

    if (hero.hp < hero.maxHp * 0.5) {
       const potion = hero.inventory.find(i => i.type === 'consumable' && !i.desc.includes("精力"));
       if (potion) {
          const heal = Number(potion.effect) || 0;
          hero.hp = Math.min(hero.maxHp, hero.hp + heal);
          logs.push(`【自救】重伤之际服下 ${potion.name}，气血恢复 ${heal}。`);
          const idx = hero.inventory.findIndex(i => i.id === potion.id);
          if (idx > -1) { if (hero.inventory[idx].count > 1) hero.inventory[idx].count--; else hero.inventory.splice(idx, 1); }
          updated = true;
       }
    }

    if (hero.stamina < hero.maxStamina * 0.2) {
       const food = hero.inventory.find(i => i.type === 'consumable' && (i.desc.includes("精力") || i.desc.includes("补气")));
       if (food) {
          const regen = Number(food.effect) || 0;
          hero.stamina = Math.min(hero.maxStamina, hero.stamina + regen);
          logs.push(`【补给】体力不支服下 ${food.name}，精力恢复 ${regen}。`);
          const idx = hero.inventory.findIndex(i => i.id === food.id);
          if (idx > -1) { if (hero.inventory[idx].count > 1) hero.inventory[idx].count--; else hero.inventory.splice(idx, 1); }
          hero.actionCounts.drinking++; 
          updated = true;
       }
    }

    if (equipChanged) {
        setTimeout(() => triggerAI('generate_equip_desc', '', undefined, hero), 100);
    }

    return { hero: updated ? hero : currentHero, logs, tagsChanged };
  };

  useEffect(() => {
    if (!heroRef.current) return;

    const gameLoop = async () => {
      const currentHero = heroRef.current;
      if (!currentHero) return;

      const { hero: managedHero, logs: autoLogs, tagsChanged } = autoManageInventory(currentHero);
      if (autoLogs.length > 0) { setHero(managedHero); autoLogs.forEach(l => addLog(l, 'system')); } // 系统日志用 'system'
      const activeHero = managedHero;

      if (tagsChanged) {
          await triggerAI('generate_description', '', undefined, activeHero);
      }

      if (activeHero.companion && Date.now() > activeHero.companionExpiry) {
         addLog(`【离别】${activeHero.companion.name} 拱手道别：“青山不改，绿水长流！”`, "system");
         setHero(h => h ? { ...h, companion: null } : null);
      }
      if (Date.now() - activeHero.tavern.lastRefresh > REFRESH_INTERVAL) { 
         setHero(prev => { if (!prev) return null; return { ...prev, tavern: { visitors: generateVisitors(), lastRefresh: Date.now() } }; });
         addLog("酒馆里来了一批新客。", "system");
      }
      if (Date.now() - (activeHero.lastQuestRefresh || 0) > QUEST_REFRESH_INTERVAL) {
         const newBoard = generateQuestBoard(activeHero.level, activeHero.storyStage);
         setHero(h => h ? { ...h, questBoard: newBoard, lastQuestRefresh: Date.now() } : null);
         addMessage('system', '悬赏更新', '悬赏榜已刷新。');
      }

      let newState = activeHero.state;
      let newLocation = activeHero.location;
      let newQuest = activeHero.currentQuest;
      let queued = activeHero.queuedQuest;
      let newQuestProgress = newQuest ? newQuest.progress : 0;
      let goldChange = 0;
      let expChange = 0;
      let lootItem: Item | null = null;
      let logSuffix = "";
      let aiEvent: string | null = null; 

      if (newQuest) {
        if (newQuest.progress === 0 && newQuest.stage === 'start') {
           newQuest.stage = 'road';
           aiEvent = 'quest_start';
        }

        newQuestProgress += 5 + Math.floor(Math.random() * 5); 
        if (newQuest.category === 'combat') newQuestProgress += Math.floor(activeHero.attributes.strength / 5);
        else newQuestProgress += Math.floor(activeHero.attributes.luck / 5);

        if (newQuestProgress >= newQuest.total * 0.5 && newQuest.stage === 'road') {
           newQuest.stage = 'climax'; 
           aiEvent = 'quest_climax';
        }

        if (newQuestProgress >= newQuest.total) {
          goldChange += newQuest.rewards.gold;
          expChange += newQuest.rewards.exp;
          aiEvent = 'quest_end'; 
          
          if (queued) {
             const targetLoc = getLocationByQuest(queued.category === 'combat' ? 'hunt' : 'life', activeHero.level);
             newQuest = queued;
             queued = null;
             newLocation = targetLoc; 
             newState = newQuest.category === 'combat' ? 'fight' : 'idle';
          } else {
             if (Math.random() < 0.7) {
               newQuest = null; 
               newState = 'idle'; 
             } else {
               const filler = generateFillerQuest(activeHero.level, activeHero.storyStage);
               setHero(h => h ? { ...h, stamina: Math.max(0, h.stamina - filler.staminaCost) } : null);
               newQuest = filler;
             }
          }
        }
      } else {
         if (queued) {
             const targetLoc = getLocationByQuest(queued.category === 'combat' ? 'hunt' : 'life', activeHero.level);
             newQuest = queued;
             queued = null;
             newLocation = targetLoc; 
             newState = newQuest.category === 'combat' ? 'fight' : 'idle';
         } else if (Math.random() < 0.2) {
            newQuest = generateFillerQuest(activeHero.level, activeHero.storyStage);
            addLog(`【启程】休息片刻，决定去${newQuest.name}。`, 'system');
         }
      }

      if (activeHero.state !== 'town' && Math.random() < 0.15) {
         const luck = activeHero.attributes.luck + (activeHero.companion?.buff.type === 'luck' ? activeHero.companion.buff.val : 0);
         const loot = rollLoot(activeHero.level, luck);
         if (loot) {
            lootItem = { ...loot, id: Date.now().toString(), count: 1 } as Item;
            if (Math.random() < 0.5) logSuffix = `(获得: ${lootItem.name})`;
         }
      }
      if (activeHero.level >= 10 && activeHero.state === 'idle' && Math.random() < 0.15) newState = 'arena';
      else if (activeHero.inventory.length >= 15 && activeHero.state !== 'town') newState = 'town';

      setHero(h => {
        if(!h) return null;
        let finalH = { 
            ...h, 
            state: newState, 
            location: newLocation, 
            storyStage: getStoryStage(h.level),
            currentQuest: newQuest ? { ...newQuest, progress: newQuestProgress } : null,
            queuedQuest: queued, 
            gold: h.gold + goldChange, 
            exp: h.exp + expChange,
            stamina: Math.min(h.maxStamina, h.stamina + (h.state === 'idle' ? 1 : 0.5)),
            godPower: Math.min(100, h.godPower + 5)
        };
        if (lootItem) {
           const idx = finalH.inventory.findIndex(i => i.name === lootItem!.name);
           if (idx >= 0) finalH.inventory[idx].count++; else finalH.inventory.push(lootItem);
        }
        if (finalH.state === 'town') {
           const sellValue = finalH.inventory.reduce((acc, i) => acc + (i.price * i.count), 0);
           if (sellValue > 0) { finalH.gold += sellValue; finalH.inventory = []; finalH.actionCounts.shopping++; }
           if (finalH.gold > 50 && finalH.hp < finalH.maxHp) { finalH.gold -= 20; finalH.hp = finalH.maxHp; }
           finalH.state = 'idle'; 
        }
        if (finalH.state === 'fight' || finalH.state === 'arena') {
           const gainExp = 10 + Math.floor(h.level * 1.5);
           finalH.exp += gainExp;
           if (finalH.martialArts.length > 0) {
             const skill = finalH.martialArts[Math.floor(Math.random() * finalH.martialArts.length)];
             skill.exp += (finalH.attributes.intelligence * 0.5) + 5;
             if (skill.exp >= skill.maxExp) { skill.level++; skill.exp = 0; skill.maxExp = Math.floor(skill.maxExp * 1.2); }
           }
           if (finalH.state === 'fight') finalH.actionCounts.kills++; 
           if (finalH.state === 'arena') {
              if (Math.random() < 0.4) { finalH.stats.arenaWins++; finalH.gold += 100; } else { finalH.hp = Math.floor(finalH.hp * 0.6); }
              finalH.state = 'idle';
           }
        }
        if (finalH.exp >= finalH.maxExp) {
           finalH.level++; finalH.exp = 0; finalH.maxExp = Math.floor(finalH.maxExp * 1.5); finalH.maxHp += 30; finalH.hp = finalH.maxHp;
           finalH.majorEvents.unshift(`${new Date().toLocaleTimeString()} 突破至 Lv.${finalH.level}`);
        }
        return finalH;
      });

      // ⚠️ 核心调整：频率提高 (8s - 20s)，并大幅增加事件概率
      if (aiEvent) {
         await triggerAI(aiEvent, logSuffix);
      } else if (!aiEvent && newQuest && newQuest.stage === 'road' && Math.random() < 0.7) { // 概率提升到 0.7
         await triggerAI('quest_journey', logSuffix);
      } else if (!aiEvent && !newQuest && Math.random() < 0.6) { // 概率提升到 0.6
         await triggerAI('idle_event', logSuffix);
      } else if (Math.random() < 0.1) {
         await triggerAI('generate_rumor');
      } else if (logSuffix) {
         addLog(logSuffix, 'system');
      }
      
      // ⚠️ 缩短心跳
      const nextTick = Math.floor(Math.random() * (20000 - 8000) + 8000); 
      timerRef.current = setTimeout(gameLoop, nextTick);
    };
    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading, error, clearError: () => setError(null), hireCompanion, acceptQuest };
}