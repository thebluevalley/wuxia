import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QUEST_SCRIPTS, QuestType, PERSONALITIES, PET_TEMPLATES, ARENA_OPPONENTS, MAP_LOCATIONS, WORLD_MAP, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message, Quality, NPC_NAMES_MALE, NPC_NAMES_FEMALE, NPC_NAMES_LAST, NPC_ARCHETYPES, NPC_TRAITS, Companion, Quest, QuestRank, Faction } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

const REFRESH_INTERVAL = 3 * 60 * 60 * 1000; 
const QUEST_REFRESH_INTERVAL = 6 * 60 * 60 * 1000; 

// --- 辅助函数 ---

const getStoryStage = (level: number) => {
  const stage = [...STORY_STAGES].reverse().find(s => level >= s.level);
  return stage ? stage.name : "私生子";
};

const calculateTags = (hero: HeroState): string[] => {
  const tags: Set<string> = new Set();
  const { hp, maxHp, stamina, gold, attributes, actionCounts, inventory, equipment, level, companion, stats } = hero;

  if (hp < maxHp * 0.1) tags.add("濒死");
  else if (hp < maxHp * 0.3) tags.add("重伤");
  
  if (stamina < 20) tags.add("力竭");
  else if (stamina > 100) tags.add("充沛");

  if (gold > 50000) tags.add("巨富");
  else if (gold < 50) tags.add("赤贫");

  if (actionCounts.kills > 100) tags.add("屠夫");
  if (actionCounts.drinking > 20) tags.add("酒鬼");

  if (attributes.strength > 20) tags.add("神力");
  if (attributes.intelligence > 20) tags.add("智者");

  const weaponName = equipment.weapon?.name || "";
  if (weaponName.includes("剑")) tags.add("剑客");
  else if (weaponName.includes("锤")) tags.add("力士");
  else if (weaponName.includes("匕首")) tags.add("刺客");
  else if (!equipment.weapon) tags.add("空手");
  
  if (stats.arenaWins > 50) tags.add("角斗士");

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
  return { id: 'auto_' + Date.now(), name: "巡视", category: 'life', rank: 1, faction: 'neutral', script: { title: "巡视", description: "日常事务", objective: "消磨时间", antagonist: "无", twist: "无" }, desc: "在领地内巡视...", progress: 0, total: 200, reqLevel: 1, stage: 'start', isAuto: true, staminaCost: 5, rewards: { gold: level * 5 + 10, exp: level * 10 + 20 } };
};

const getLocationByQuest = (questType: QuestType, level: number): string => {
  const availableMaps = WORLD_MAP.filter(m => level >= m.minLv && level <= m.minLv + 40);
  const pool = availableMaps.length > 0 ? availableMaps : WORLD_MAP.slice(0, 3);
  return pool[Math.floor(Math.random() * pool.length)].name;
};

const getInitialSkills = (): Skill[] => [{ name: "基础剑术", type: 'combat', level: 1, exp: 0, maxExp: 100, desc: "维斯特洛通用的防身剑术" }];
const getInitialLifeSkills = (): Skill[] => [{ name: "伤口处理", type: 'survival', level: 1, exp: 0, maxExp: 100, desc: "在乱世中活下去的必备技能" }];

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
    visitors.push({ id: Date.now() + i + Math.random().toString(), name: `${firstName}·${lastName}`, gender, title: template.job, archetype: template.job, personality: trait, desc: template.desc, quality: tier, price: priceMap[tier], buff: { type: template.buff as any, val: buffVal[tier] } });
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
    const initialStage = "私生子";
    const initialBoard = generateQuestBoard(1, initialStage);

    const newHero: HeroState = {
      name, level: 1, gender: Math.random() > 0.5 ? '男' : '女', age: 16, 
      personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)], 
      title: initialStage, motto: "凡人皆有一死", godPower: 100, unlockedFeatures: [], 
      pet: null, storyStage: initialStage,
      attributes: { constitution: 10, strength: 10, dexterity: 10, intelligence: 10, luck: 10 },
      stamina: 120, maxStamina: 120,
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 200, 
      alignment: 0, location: "临冬城", state: 'idle', 
      logs: [], messages: [], majorEvents: [`${new Date().toLocaleDateString()}：${name} 踏入维斯特洛。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: getInitialSkills(), lifeSkills: getInitialLifeSkills(),
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: null, queuedQuest: null, questBoard: initialBoard, lastQuestRefresh: Date.now(), 
      tavern: { visitors: generateVisitors(), lastRefresh: Date.now() },
      companion: null, companionExpiry: 0,
      reputation: { stark: 0, lannister: 0, targaryen: 0, baratheon: 0, watch: 0, wildling: 0, citadel: 0, neutral: 0, faith: 0 },
      narrativeHistory: "凛冬将至。",
      tags: ["私生子"], 
      actionCounts: { kills: 0, retreats: 0, gambles: 0, charity: 0, betrayals: 0, shopping: 0, drinking: 0 },
      description: "一个默默无闻的私生子。",
      equipmentDescription: "一身布衣。" 
    };

    if (!supabase) { setHero(newHero); setLoading(false); setTimeout(() => triggerAI('start_game', undefined, undefined, newHero), 500); return; }

    try {
      let { data: user } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (user) {
        if (user.password !== password) { setError("密令错误！"); setLoading(false); return; }
        const mergedData = { ...newHero, ...user.data };
        if (!mergedData.equipmentDescription) mergedData.equipmentDescription = "衣着朴素。";
        
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

  // ⚠️ 核心修改：日志前插 (Unshift)，保证最新在最上面
  const addLog = (text: string, type: LogEntry['type'] = 'normal') => {
    recentLogsRef.current = [text, ...recentLogsRef.current].slice(0, 3);
    setHero(prev => {
      if (!prev) return null;
      const newHistory = (prev.narrativeHistory + " " + text).slice(-500);
      const newLog = { id: Date.now().toString(), text, type, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) };
      // ⚠️ 倒序：新日志在前
      return { ...prev, logs: [newLog, ...prev.logs].slice(0, 50), narrativeHistory: newHistory };
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
    if (hero.level < quest.reqLevel) { addLog(`【接取失败】需要 Lv.${quest.reqLevel}。`, 'system'); return; }
    if (hero.stamina < quest.staminaCost) { addLog(`【体力不足】需要休息。(需要 ${quest.staminaCost} 体力)`, 'system'); return; }
    if (hero.queuedQuest) { addLog(`【接取失败】队列已满。`, 'system'); return; }

    const newBoard = hero.questBoard.filter(q => q.id !== questId); 
    setHero(prev => prev ? { ...prev, stamina: prev.stamina - quest.staminaCost, queuedQuest: quest, questBoard: newBoard } : null);
    addLog(`【誓言】已接受委托：${quest.name}。`, 'highlight');
  };

  const hireCompanion = (visitorId: string) => {
    if (!hero) return;
    const visitor = hero.tavern.visitors.find(v => v.id === visitorId);
    if (!visitor) return;
    if (hero.gold < visitor.price) { addLog("无法支付雇佣金。", "system"); return; }
    setHero(prev => {
      if (!prev) return null;
      return { ...prev, gold: prev.gold - visitor.price, companion: visitor, companionExpiry: Date.now() + 24 * 60 * 60 * 1000, tavern: { ...prev.tavern, visitors: prev.tavern.visitors.filter(v => v.id !== visitorId) } };
    });
    addLog(`与【${visitor.name}】结盟！`, "highlight");
    triggerAI("recruit_companion", "", "recruit", { ...hero, companion: visitor });
  };

  const triggerAI = async (eventType: string, suffix: string = "", action?: string, explicitHero?: HeroState) => {
    const currentHero = explicitHero || hero;
    if (!currentHero) return false;
    const showCompanion = Math.random() > 0.7;
    const companionInfo = (showCompanion && currentHero.companion) ? `伙伴:${currentHero.companion.title} ${currentHero.companion.name} (性别:${currentHero.companion.gender}, 性格:${currentHero.companion.personality})` : "独行";
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
        skillInfo: `擅长${bestSkill?.name || '乱舞'}(Lv.${bestSkill?.level || 1})`, 
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
           let title = "风声"; let content = data.text;
           if (data.text.includes("：")) { const parts = data.text.split("："); title = parts[0]; content = parts.slice(1).join("："); }
           addMessage('rumor', title, content);
        } else {
           const fullText = suffix ? `${data.text} ${suffix}` : data.text;
           // 剧情类型统一为 highlight
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
    if (hero.godPower < 25) { addLog("【命运值不足】等待。", "system"); return; }
    if (type === 'bless') { 
      setHero(h => h ? {...h, hp: h.maxHp, godPower: h.godPower - 25} : null); 
      addLog("【旧神眷顾】伤势尽愈！", "highlight");
      triggerAI('god_action', ''); 
    } else { 
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 20), exp: h.exp + 50, godPower: h.godPower - 25} : null); 
      addLog("【严酷试炼】意志更坚！(经验+50)", "highlight");
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
            logs.push(`【装备】换上了 ${item.name}`);
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
          logs.push(`【研读】${skillName}熟练度提升！`);
       } else {
          hero.martialArts.push({ name: skillName, type: 'combat', level: 1, exp: 0, maxExp: 100, desc: "通过书籍习得" });
          logs.push(`【学习】习得【${skillName}】！`);
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
          logs.push(`【治疗】使用了 ${potion.name}`);
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
          logs.push(`【补给】使用了 ${food.name}`);
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
      
      // ⚠️ 核心调整：如果 AI 剧情即将触发，暂时不显示自动管理的琐碎日志，避免打断
      // 如果没有 AI 事件，才显示系统日志
      let aiEventTriggered = false;
      let logSuffix = "";
      
      // 预判 AI 事件
      let aiEvent: string | null = null;
      let newQuest = managedHero.currentQuest;
      let queued = managedHero.queuedQuest;
      // ... (Quest logic same as before, simplified for this snippet) ...
      // 简化的逻辑占位，完整逻辑见下方整合
      
      if (newQuest) {
        if (newQuest.progress === 0 && newQuest.stage === 'start') {
           newQuest.stage = 'road';
           aiEvent = 'quest_start';
        }
        // ... progress logic ...
        let progressInc = 5 + Math.floor(Math.random() * 5); 
        newQuest.progress += progressInc;

        if (newQuest.progress >= newQuest.total * 0.5 && newQuest.stage === 'road') {
           newQuest.stage = 'climax'; 
           aiEvent = 'quest_climax';
        }
        if (newQuest.progress >= newQuest.total) {
           aiEvent = 'quest_end'; 
           managedHero.gold += newQuest.rewards.gold;
           managedHero.exp += newQuest.rewards.exp;
           // Quest Switching Logic
           if (queued) {
             const targetLoc = getLocationByQuest(queued.category === 'combat' ? 'hunt' : 'life', managedHero.level);
             newQuest = queued;
             queued = null;
             managedHero.location = targetLoc; 
             managedHero.state = newQuest.category === 'combat' ? 'fight' : 'idle';
          } else {
             if (Math.random() < 0.7) { newQuest = null; managedHero.state = 'idle'; } 
             else { 
                 const filler = generateFillerQuest(managedHero.level, managedHero.storyStage);
                 managedHero.stamina = Math.max(0, managedHero.stamina - filler.staminaCost);
                 newQuest = filler;
             }
          }
        }
        managedHero.currentQuest = newQuest;
        managedHero.queuedQuest = queued;
      } else {
         if (queued) {
             newQuest = queued; queued = null;
             managedHero.currentQuest = newQuest; managedHero.queuedQuest = queued;
             managedHero.state = 'fight'; // Assume start
         } else if (Math.random() < 0.3) { // 提高接任务概率
            managedHero.currentQuest = generateFillerQuest(managedHero.level, managedHero.storyStage);
            addLog(`【启程】决定去${managedHero.currentQuest.name}。`, 'system');
         }
      }

      // Loot Logic
      if (managedHero.state !== 'town' && Math.random() < 0.15) {
         const luck = managedHero.attributes.luck + (managedHero.companion?.buff.type === 'luck' ? managedHero.companion.buff.val : 0);
         const loot = rollLoot(managedHero.level, luck);
         if (loot) {
            const lootItem = { ...loot, id: Date.now().toString(), count: 1 } as Item;
            const idx = managedHero.inventory.findIndex(i => i.name === lootItem.name);
            if (idx >= 0) managedHero.inventory[idx].count++; else managedHero.inventory.push(lootItem);
            logSuffix = `(获得: ${lootItem.name})`;
         }
      }

      // 决定是否触发 AI
      if (aiEvent) {
         await triggerAI(aiEvent, logSuffix);
         aiEventTriggered = true;
      } else if (!aiEvent && managedHero.currentQuest && managedHero.currentQuest.stage === 'road' && Math.random() < 0.6) { 
         await triggerAI('quest_journey', logSuffix);
         aiEventTriggered = true;
      } else if (!aiEvent && !managedHero.currentQuest && Math.random() < 0.5) { 
         await triggerAI('idle_event', logSuffix);
         aiEventTriggered = true;
      }

      // ⚠️ 互斥逻辑：只有在没有 AI 事件时，才显示系统自动日志（如喝药、升级），防止信息过载
      if (!aiEventTriggered && autoLogs.length > 0) {
          setHero(managedHero); 
          autoLogs.forEach(l => addLog(l, 'system')); 
      } else if (aiEventTriggered) {
          // 如果有 AI 事件，应用状态更新，但忽略 system logs (让 AI 文本主导)
          setHero(managedHero);
      } else {
          // 既无 AI 也无 System log，正常更新状态
          setHero(managedHero);
          if (logSuffix) addLog(logSuffix, 'system');
      }
      
      // ⚠️ 慢节奏心跳：8秒 ~ 25秒，给打字机留出表演时间
      const nextTick = Math.floor(Math.random() * (25000 - 8000) + 8000); 
      timerRef.current = setTimeout(gameLoop, nextTick);
    };
    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading, error, clearError: () => setError(null), hireCompanion, acceptQuest };
}