import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QuestCategory, Quest, QuestRank, Faction, MAIN_SAGA, SIDE_QUESTS, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message, Quality, NPC_NAMES_MALE, NPC_NAMES_FEMALE, NPC_NAMES_LAST, NPC_ARCHETYPES, NPC_TRAITS, Companion, WORLD_MAP, PERSONALITIES } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

const REFRESH_INTERVAL = 3 * 60 * 60 * 1000; 
const QUEST_REFRESH_INTERVAL = 1 * 60 * 60 * 1000; 

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
  else if (stamina > 100) tags.add("精力充沛");
  if (gold > 50000) tags.add("巨富");
  else if (gold < 50) tags.add("赤贫");
  if (actionCounts.kills > 100) tags.add("屠夫");
  if (actionCounts.drinking > 20) tags.add("酒鬼");
  if (attributes.strength > 20) tags.add("魔山之力");
  if (attributes.intelligence > 20) tags.add("小恶魔之智");
  const weaponName = equipment.weapon?.name || "";
  if (weaponName.includes("剑")) tags.add("剑客");
  else if (weaponName.includes("锤")) tags.add("战士");
  else if (weaponName.includes("匕首")) tags.add("刺客");
  else if (!equipment.weapon) tags.add("赤手空拳");
  if (stats.arenaWins > 50) tags.add("竞技场之王");
  return Array.from(tags).slice(0, 10);
};

const generateQuestBoard = (hero: HeroState): Quest[] => {
  const quests: Quest[] = [];
  const { level, location } = hero;
  const locationKey = SIDE_QUESTS[location as keyof typeof SIDE_QUESTS] ? location : "default";
  // @ts-ignore
  const sidePool = SIDE_QUESTS[locationKey] || SIDE_QUESTS["default"];

  for (let i = 0; i < 4; i++) {
      const template = sidePool[Math.floor(Math.random() * sidePool.length)];
      const rank = Math.ceil(Math.random() * 3) as QuestRank;
      quests.push({
          id: `side_${Date.now()}_${i}`,
          name: template.title,
          category: 'side',
          rank,
          faction: 'neutral',
          script: {
              title: template.title,
              description: template.desc,
              objective: template.obj,
              antagonist: template.antagonist,
              twist: "无"
          },
          desc: template.desc,
          stage: 'start',
          progress: 0,
          total: rank * 120, 
          reqLevel: Math.max(1, level - 2),
          staminaCost: rank * 8,
          rewards: { gold: rank * 50, exp: rank * 80 }
      });
  }
  return quests;
};

const getLocationByQuest = (questType: any, level: number): string => {
  const map = WORLD_MAP[Math.floor(Math.random() * WORLD_MAP.length)];
  return map.name;
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
    let targetQuality: Quality = 'common';
    const rand = Math.random() * 100 - (luck * 0.5);
    if (rand < 2) targetQuality = 'legendary'; else if (rand < 10) targetQuality = 'epic'; else if (rand < 30) targetQuality = 'rare'; 
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
    
    const newHero: HeroState = {
      name, level: 1, gender: Math.random() > 0.5 ? '男' : '女', age: 16, 
      personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)], 
      title: initialStage, motto: "凡人皆有一死", godPower: 100, unlockedFeatures: [], 
      pet: null, storyStage: initialStage,
      mainStoryIndex: 0, 
      attributes: { constitution: 10, strength: 10, dexterity: 10, intelligence: 10, luck: 10 },
      stamina: 120, maxStamina: 120,
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 200, 
      alignment: 0, location: "临冬城", state: 'idle', 
      logs: [{ id: "init", text: "北境的寒风凛冽，你裹紧了破旧的斗篷，望着灰暗的天空，心中知道——凛冬将至。", type: "highlight", time: "00:00" }], 
      messages: [], majorEvents: [`${new Date().toLocaleDateString()}：${name} 踏入维斯特洛。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: getInitialSkills(), lifeSkills: getInitialLifeSkills(),
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: null, queuedQuest: null, questBoard: [], 
      lastQuestRefresh: 0, 
      tavern: { visitors: generateVisitors(), lastRefresh: Date.now() },
      companion: null, companionExpiry: 0,
      reputation: { stark: 0, lannister: 0, targaryen: 0, baratheon: 0, watch: 0, wildling: 0, citadel: 0, neutral: 0, faith: 0 },
      narrativeHistory: "凛冬将至。",
      tags: ["私生子"], 
      actionCounts: { kills: 0, retreats: 0, gambles: 0, charity: 0, betrayals: 0, shopping: 0, drinking: 0 },
      description: "一个默默无闻的私生子。",
      equipmentDescription: "一身布衣。" 
    };
    
    newHero.questBoard = generateQuestBoard(newHero);

    if (!supabase) { setHero(newHero); setLoading(false); setTimeout(() => triggerAI('start_game', undefined, undefined, newHero), 500); return; }

    try {
      let { data: user } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (user) {
        if (user.password !== password) { setError("密令错误！"); setLoading(false); return; }
        const mergedData = { ...newHero, ...user.data };
        if (mergedData.mainStoryIndex === undefined) mergedData.mainStoryIndex = 0;
        mergedData.questBoard = generateQuestBoard(mergedData);

        if (!mergedData.logs || mergedData.logs.length === 0) {
            mergedData.logs = [{ id: "init_resume", text: "你从沉睡中醒来，周围的一切既熟悉又陌生。战乱的硝烟似乎从未散去。", type: "highlight", time: "08:00" }];
        }
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

  const addLog = (text: string, type: LogEntry['type'] = 'highlight') => {
    const finalType: LogEntry['type'] = 'highlight'; 
    setHero(prev => {
      if (!prev) return null;
      const newHistory = (prev.narrativeHistory + " " + text).slice(-1500); 
      const newLog: LogEntry = { id: Date.now().toString(), text, type: finalType, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) };
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
    if (hero.level < quest.reqLevel) { addMessage('system', '拒绝', `等级不足 (需Lv.${quest.reqLevel})`); return; }
    if (hero.stamina < quest.staminaCost) { addMessage('system', '疲惫', `体力不足`); return; }
    if (hero.queuedQuest) { addMessage('system', '繁忙', `已有任务在身`); return; }

    const newBoard = hero.questBoard.filter(q => q.id !== questId); 
    
    // 主线任务瞬移
    let newLocation = hero.location;
    if (quest.category === 'main') {
        const saga = MAIN_SAGA.find(s => s.title === quest.script.title);
        if (saga && saga.location) newLocation = saga.location;
    }

    setHero(prev => prev ? { 
        ...prev, 
        stamina: prev.stamina - quest.staminaCost, 
        queuedQuest: quest, 
        questBoard: newBoard,
        location: newLocation 
    } : null);
    
    addMessage('system', '誓言', `接受支线委托：${quest.name}`);
    triggerAI('quest_start', '', 'accept', { ...hero, queuedQuest: quest, location: newLocation }); 
  };

  const hireCompanion = (visitorId: string) => {
    if (!hero) return;
    const visitor = hero.tavern.visitors.find(v => v.id === visitorId);
    if (!visitor) return;
    if (hero.gold < visitor.price) { addMessage('system', '穷困', "囊中羞涩。"); return; }
    setHero(prev => {
      if (!prev) return null;
      return { ...prev, gold: prev.gold - visitor.price, companion: visitor, companionExpiry: Date.now() + 24 * 60 * 60 * 1000, tavern: { ...prev.tavern, visitors: prev.tavern.visitors.filter(v => v.id !== visitorId) } };
    });
    addMessage('system', '结盟', `招募了【${visitor.name}】。`);
    triggerAI("recruit_companion", "", "recruit", { ...hero, companion: visitor });
  };

  const triggerAI = async (eventType: string, suffix: string = "", action?: string, explicitHero?: HeroState) => {
    const currentHero = explicitHero || hero;
    if (!currentHero) return false;
    const showCompanion = Math.random() > 0.7;
    const companionInfo = (showCompanion && currentHero.companion) ? `伙伴:${currentHero.companion.title} ${currentHero.companion.name} (性别:${currentHero.companion.gender}, 性格:${currentHero.companion.personality})` : "独行";
    
    const mainSagaInfo = currentHero.mainStoryIndex < MAIN_SAGA.length 
        ? `当前篇章: ${MAIN_SAGA[currentHero.mainStoryIndex].title}` 
        : "传说终章";

    let currentMainQuestInfo = "无主线任务";
    if (currentHero.currentQuest?.category === 'main') {
        currentMainQuestInfo = `主线进行中: ${currentHero.currentQuest.name}。目标: ${currentHero.currentQuest.script.objective}。关键NPC: ${currentHero.currentQuest.script.npc}`;
    }

    try {
      const bestSkill = currentHero.martialArts.sort((a,b) => b.level - a.level)[0];
      const context = { 
        ...currentHero, 
        storyStage: getStoryStage(currentHero.level), 
        worldLore: WORLD_LORE, 
        mainSaga: mainSagaInfo,
        mainQuestContext: currentMainQuestInfo, 
        questScript: currentHero.currentQuest?.script || currentHero.queuedQuest?.script, 
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
        if (eventType.includes('generate_')) {
            // update descriptions
        } else if (eventType === 'generate_rumor') {
           addMessage('rumor', '风声', data.text);
        } else {
           const fullText = suffix ? `${data.text} ${suffix}` : data.text;
           addLog(fullText, 'highlight');
        }
        return true;
      }
    } catch (e) { 
        console.error(e); 
        const fallback = STATIC_LOGS.idle[Math.floor(Math.random() * STATIC_LOGS.idle.length)];
        addLog(fallback, "highlight");
    }
    return false;
  };

  const godAction = async (type: 'bless' | 'punish') => {
    if (!hero) return;
    if (hero.godPower < 25) { addMessage('system', '命运', "命运值不足。"); return; }
    if (type === 'bless') { 
      setHero(h => h ? {...h, hp: h.maxHp, godPower: h.godPower - 25} : null); 
      addMessage('system', '眷顾', "伤势尽愈！");
      triggerAI('god_action', ''); 
    } else { 
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 20), exp: h.exp + 50, godPower: h.godPower - 25} : null); 
      addMessage('system', '试炼', "意志更坚！");
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
    if (tagsChanged) { hero.tags = newTags; updated = true; }

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
            logs.push(`装备了 ${item.name}`); 
            updated = true;
            equipChanged = true;
          }
        }
      }
    });
    
    // Books & Potions logic omitted for space, keep original logic
    const books = hero.inventory.filter(i => i.type === 'book');
    books.forEach(book => {
       const skillName = String(book.effect);
       const existingSkill = hero.martialArts.find(s => s.name === skillName);
       if (existingSkill) {
          existingSkill.exp += 100;
          logs.push(`研读 ${book.name}`);
       } else {
          hero.martialArts.push({ name: skillName, type: 'combat', level: 1, exp: 0, maxExp: 100, desc: "通过书籍习得" });
          logs.push(`习得 ${skillName}`);
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
          logs.push(`使用了 ${potion.name}`);
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
          logs.push(`使用了 ${food.name}`);
          const idx = hero.inventory.findIndex(i => i.id === food.id);
          if (idx > -1) { if (hero.inventory[idx].count > 1) hero.inventory[idx].count--; else hero.inventory.splice(idx, 1); }
          hero.actionCounts.drinking++; 
          updated = true;
       }
    }

    if (equipChanged) { setTimeout(() => triggerAI('generate_equip_desc', '', undefined, hero), 100); }
    return { hero: updated ? hero : currentHero, logs, tagsChanged };
  };

  useEffect(() => {
    if (!heroRef.current) return;

    const gameLoop = async () => {
      const currentHero = heroRef.current;
      if (!currentHero) return;

      const { hero: managedHero, logs: autoLogs, tagsChanged } = autoManageInventory(currentHero);
      if (autoLogs.length > 0) { setHero(managedHero); autoLogs.forEach(l => addMessage('system', '记录', l)); } 
      
      let aiEvent: string | null = null;
      let newQuest = managedHero.currentQuest;
      let queued = managedHero.queuedQuest;

      // ⚠️ 1. 主线强制接取逻辑
      if (!newQuest && !queued && managedHero.mainStoryIndex < MAIN_SAGA.length) {
          const nextSaga = MAIN_SAGA[managedHero.mainStoryIndex];
          if (managedHero.level >= nextSaga.reqLevel) {
              newQuest = {
                  id: `main_${managedHero.mainStoryIndex}`,
                  name: `【主线】${nextSaga.title}`,
                  category: 'main',
                  rank: 5,
                  faction: 'neutral',
                  script: {
                      title: nextSaga.title,
                      description: nextSaga.desc,
                      objective: nextSaga.obj,
                      antagonist: nextSaga.antagonist,
                      twist: nextSaga.twist,
                      npc: nextSaga.npc
                  },
                  desc: nextSaga.desc,
                  stage: 'start',
                  progress: 0,
                  total: 300,
                  reqLevel: nextSaga.reqLevel,
                  staminaCost: 0,
                  rewards: { gold: 1000, exp: 2000 }
              };
              managedHero.currentQuest = newQuest;
              managedHero.location = nextSaga.location; 
              managedHero.state = 'fight'; 
              
              addMessage('system', '宿命', `命运的齿轮转动：${nextSaga.title}`);
              aiEvent = 'quest_start'; 
          }
      }
      
      // ⚠️ 2. 任务刷新逻辑
      if (Date.now() - (managedHero.lastQuestRefresh || 0) > QUEST_REFRESH_INTERVAL) {
         managedHero.questBoard = generateQuestBoard(managedHero);
         managedHero.lastQuestRefresh = Date.now();
         addMessage('system', '消息', '酒馆悬赏已更新');
      }

      if (newQuest) {
        if (newQuest.progress === 0 && newQuest.stage === 'start' && !aiEvent) {
           newQuest.stage = 'road';
           aiEvent = 'quest_start';
        }
        
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
           addMessage('system', '报偿', `委托【${newQuest.name}】已完成。`);

           if (newQuest.category === 'main') {
               managedHero.mainStoryIndex += 1;
               addMessage('system', '史诗', `【${newQuest.name}】篇章结束。`);
           }

           if (queued) {
             // ⚠️ 修复：排队任务位置逻辑
             let targetLoc = getLocationByQuest('life', managedHero.level);
             if (queued.category === 'main') {
                 const saga = MAIN_SAGA.find(s => s.title === queued.script.title);
                 if (saga) targetLoc = saga.location;
             }

             newQuest = queued;
             queued = null;
             managedHero.location = targetLoc; 
             managedHero.state = newQuest.category === 'main' ? 'fight' : 'idle';
             setTimeout(() => triggerAI('quest_start', '', undefined, managedHero), 500);
          } else {
             newQuest = null; 
             managedHero.state = 'idle'; 
          }
        }
        managedHero.currentQuest = newQuest;
        managedHero.queuedQuest = queued;
      } else {
         if (queued) {
             let targetLoc = getLocationByQuest('life', managedHero.level);
             if (queued.category === 'main') {
                 const saga = MAIN_SAGA.find(s => s.title === queued.script.title);
                 if (saga) targetLoc = saga.location;
             }
             newQuest = queued; queued = null;
             managedHero.currentQuest = newQuest; managedHero.queuedQuest = queued;
             managedHero.location = targetLoc;
             managedHero.state = newQuest.category === 'main' ? 'fight' : 'idle'; 
             aiEvent = 'quest_start';
         } 
      }

      if (managedHero.state !== 'town' && Math.random() < 0.15) {
         const luck = managedHero.attributes.luck + (managedHero.companion?.buff.type === 'luck' ? managedHero.companion.buff.val : 0);
         const loot = rollLoot(managedHero.level, luck);
         if (loot) {
            const lootItem = { ...loot, id: Date.now().toString(), count: 1 } as Item;
            const idx = managedHero.inventory.findIndex(i => i.name === lootItem.name);
            if (idx >= 0) managedHero.inventory[idx].count++; else managedHero.inventory.push(lootItem);
            addMessage('system', '战利品', `获得了 ${lootItem.name}。`);
         }
      }

      if (aiEvent) {
         setHero(managedHero);
         await triggerAI(aiEvent);
      } else if (!aiEvent && managedHero.currentQuest) { 
         setHero(managedHero);
         await triggerAI('quest_journey');
      } else if (!aiEvent && !managedHero.currentQuest) { 
         setHero(managedHero);
         await triggerAI('idle_event');
      } else {
         setHero(managedHero);
      }
      
      const nextTick = Math.floor(Math.random() * (15000 - 8000) + 8000); 
      timerRef.current = setTimeout(gameLoop, nextTick);
    };
    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading, error, clearError: () => setError(null), hireCompanion, acceptQuest };
}