import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QuestCategory, Quest, QuestRank, Faction, MAIN_SAGA, SIDE_QUESTS, AUTO_TASKS, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message, Quality, NPC_NAMES_MALE, NPC_NAMES_FEMALE, NPC_NAMES_LAST, NPC_ARCHETYPES, NPC_TRAITS, Companion, WORLD_MAP, PERSONALITIES, EXPEDITION_LOCATIONS, Expedition } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

const REFRESH_INTERVAL = 1 * 60 * 60 * 1000; 
const EXPEDITION_REFRESH_INTERVAL = 4 * 60 * 60 * 1000; 

// --- 辅助函数 ---
const getStoryStage = (level: number) => {
  const stage = [...STORY_STAGES].reverse().find(s => level >= s.level);
  return stage ? stage.name : "幸存者";
};

const calculateTags = (hero: HeroState): string[] => {
  const tags: Set<string> = new Set();
  const { hp, maxHp, stamina, gold, equipment } = hero;
  if (hp < maxHp * 0.3) tags.add("重伤");
  if (stamina < 30) tags.add("饥饿");
  if (equipment.weapon) tags.add("武装"); else tags.add("空手");
  if (hero.state === 'expedition') tags.add("探险中");
  return Array.from(tags).slice(0, 5);
};

const generateQuestBoard = (hero: HeroState): Quest[] => {
  const quests: Quest[] = [];
  const { location } = hero;
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
          faction: 'nature',
          script: { title: template.title, description: template.desc, objective: template.obj, antagonist: template.antagonist, twist: "无", npc: "无" },
          desc: template.desc,
          stage: 'start',
          progress: 0,
          total: rank * 60, 
          reqLevel: Math.max(1, hero.level - 2),
          staminaCost: rank * 5,
          rewards: { gold: rank * 10, exp: rank * 30 }
      });
  }
  return quests;
};

const generateExpeditions = (level: number): Expedition[] => {
    const expeditions: Expedition[] = [];
    for (let i = 0; i < 3; i++) {
        const template = EXPEDITION_LOCATIONS[Math.floor(Math.random() * EXPEDITION_LOCATIONS.length)];
        const duration = 30 * 60 * 1000; 
        expeditions.push({
            id: `exp_${Date.now()}_${i}`,
            name: template.name,
            desc: template.desc,
            difficulty: template.diff as QuestRank,
            duration: duration,
            location: template.name,
            rewards: { gold: template.diff * 100, exp: template.diff * 200, lootChance: template.diff * 0.2 }
        });
    }
    return expeditions;
};

const getLocationByQuest = (questType: any, level: number): string => {
  const map = WORLD_MAP[Math.floor(Math.random() * WORLD_MAP.length)];
  return map.name;
};

const getInitialSkills = (): Skill[] => [{ name: "基础求生", type: 'survival', level: 1, exp: 0, maxExp: 100, desc: "本能" }];
const getInitialLifeSkills = (): Skill[] => [{ name: "采集", type: 'survival', level: 1, exp: 0, maxExp: 100, desc: "识别" }];

const generateVisitors = (): Companion[] => {
  const visitors: Companion[] = [];
  const tiers: Quality[] = [];
  for (let i = 0; i < 2; i++) { const rand = Math.random(); let tier: Quality = 'common'; if (rand < 0.1) tier = 'epic'; else if (rand < 0.3) tier = 'rare'; else tier = 'common'; tiers.push(tier); }
  tiers.forEach((tier, i) => {
    const templates = NPC_ARCHETYPES[tier]; const template = templates[Math.floor(Math.random() * templates.length)];
    let gender: '男' | '女' = Math.random() > 0.5 ? '男' : '女';
    const firstNameList = gender === '男' ? NPC_NAMES_MALE : NPC_NAMES_FEMALE;
    const firstName = firstNameList[Math.floor(Math.random() * firstNameList.length)];
    const trait = NPC_TRAITS[Math.floor(Math.random() * NPC_TRAITS.length)];
    visitors.push({ id: Date.now() + i + Math.random().toString(), name: `${trait}${firstName}`, gender: '男', title: template.job, archetype: template.job, personality: trait, desc: template.desc, quality: tier, price: 100, buff: { type: template.buff as any, val: 10 } });
  });
  return visitors;
};

const rollLoot = (level: number, luck: number): Partial<Item> | null => {
    const validItems = LOOT_TABLE.filter(i => (i.minLevel || 1) <= level);
    if (validItems.length === 0) return null;
    return validItems[Math.floor(Math.random() * validItems.length)];
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
    const initialStage = "幸存者";
    
    const newHero: HeroState = {
      name, level: 1, gender: '男', age: 20, 
      personality: "坚韧", title: initialStage, motto: "活下去", godPower: 100, unlockedFeatures: [], 
      pet: null, storyStage: initialStage, mainStoryIndex: 0, 
      attributes: { constitution: 8, strength: 8, dexterity: 8, intelligence: 8, luck: 10 },
      stamina: 100, maxStamina: 100, hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0, 
      alignment: 0, location: "荒芜海滩", state: 'idle', 
      logs: [], messages: [], majorEvents: [`第1天：${name} 在海滩醒来。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: getInitialSkills(), lifeSkills: getInitialLifeSkills(),
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: null, queuedQuest: null, questBoard: [], lastQuestRefresh: 0, 
      tavern: { visitors: generateVisitors(), lastRefresh: Date.now() },
      companion: null, companionExpiry: 0,
      reputation: { nature: 0, survivor: 0, savage: 0, ruins: 0, beast: 0, unknown: 0, neutral: 0, faith: 0, watch: 0 },
      narrativeHistory: "海难幸存。",
      tags: ["幸存者", "湿透"], 
      actionCounts: { kills: 0, retreats: 0, gambles: 0, charity: 0, betrayals: 0, shopping: 0, drinking: 0 },
      description: "一个衣衫褴褛的幸存者。",
      equipmentDescription: "湿透的衬衫。",
      activeExpedition: null, expeditionBoard: [], lastExpeditionRefresh: 0
    };
    
    newHero.questBoard = generateQuestBoard(newHero);
    newHero.expeditionBoard = generateExpeditions(1);

    if (!supabase) { setHero(newHero); setLoading(false); setTimeout(() => triggerAI('start_game', undefined, undefined, newHero), 500); return; }

    try {
      let { data: user } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (user) {
        if (user.password !== password) { setError("验证失败"); setLoading(false); return; }
        const mergedData = { ...newHero, ...user.data };
        if (mergedData.mainStoryIndex === undefined) mergedData.mainStoryIndex = 0;
        if (!mergedData.expeditionBoard) mergedData.expeditionBoard = generateExpeditions(mergedData.level);
        mergedData.questBoard = generateQuestBoard(mergedData);
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
      const lastLog = prev.logs[0]?.text;
      if (lastLog === text) return prev; 
      const timeStr = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
      const newHistory = (prev.narrativeHistory + " " + text).slice(-800); 
      const newLog: LogEntry = { id: Date.now().toString(), text, type: finalType, time: timeStr };
      return { ...prev, logs: [newLog, ...prev.logs].slice(0, 50), narrativeHistory: newHistory };
    });
  };

  const addMessage = (type: 'rumor' | 'system', title: string, content: string) => {
    setHero(prev => { if (!prev) return null; return { ...prev, messages: [{ id: Date.now().toString(), type, title, content, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}), isRead: false }, ...prev.messages].slice(0, 50) }; });
  };

  // ⚠️ 核心重构：手动接受任务逻辑
  const acceptQuest = (questId: string) => {
    if (!heroRef.current) return;
    const hero = heroRef.current;
    if (hero.activeExpedition) { addMessage('system', '无法行动', '正在探险中！'); return; }
    
    const quest = hero.questBoard.find(q => q.id === questId);
    if (!quest) return;
    if (hero.level < quest.reqLevel) { addMessage('system', '拒绝', `需Lv.${quest.reqLevel}`); return; }
    
    const newBoard = hero.questBoard.filter(q => q.id !== questId); 
    
    // 主线瞬移逻辑
    let newLocation = hero.location;
    if (quest.category === 'main') {
        const saga = MAIN_SAGA.find(s => s.title === quest.script.title);
        if (saga && saga.location) newLocation = saga.location;
    } else {
        // 支线也需要移动到对应地点（如果设定了）
        // 简单处理：如果是支线，位置暂时不变，或者根据任务类型变
        // 这里保持不变，依赖 gameLoop 的过程描述
    }

    // 判断主角是否忙碌 (非 auto 任务才算忙)
    const isBusy = hero.currentQuest && hero.currentQuest.category !== 'auto';

    if (isBusy) {
        // 如果真的很忙（正在做主线或手动支线），则排队
        if (hero.queuedQuest) { addMessage('system', '繁忙', `队列已满`); return; }
        
        setHero(prev => prev ? { 
            ...prev, 
            queuedQuest: quest, 
            questBoard: newBoard 
        } : null);
        addMessage('system', '计划', `已列入计划：${quest.name}`);
        triggerAI('quest_start', '', 'accept', { ...hero, queuedQuest: quest }); // AI 描写准备过程
    } else {
        // ⚠️ 瞬发逻辑：如果正在发呆或做自动任务，直接打断，立即开始！
        const newHeroState = { 
            ...hero, 
            stamina: hero.stamina - quest.staminaCost, 
            currentQuest: quest, // 直接上位
            queuedQuest: null,   // 清空队列
            questBoard: newBoard, 
            location: newLocation,
            state: 'fight' // 激活状态
        };
        
        setHero(newHeroState);
        addMessage('system', '执行', `立即开始：${quest.name}`);
        
        // ⚠️ 关键：触发 'quest_journey' (过程) 而不是 'quest_start' (准备)
        // 这样 AI 会立刻描写 "正在砍树/正在寻找"，而不是 "我打算去..."
        triggerAI('quest_journey', '', 'start', newHeroState); 
    }
  };

  const startExpedition = (expeditionId: string) => {
      if (!heroRef.current) return;
      const hero = heroRef.current;
      const exp = hero.expeditionBoard.find(e => e.id === expeditionId);
      if (!exp) return;
      
      if (hero.currentQuest && hero.currentQuest.category !== 'auto') { addMessage('system', '繁忙', '先完成手头工作。'); return; }
      if (hero.stamina < 30) { addMessage('system', '疲惫', '体力不足。'); return; }

      const newHeroState = {
          ...hero,
          activeExpedition: { ...exp, startTime: Date.now(), endTime: Date.now() + exp.duration },
          state: 'expedition',
          stamina: hero.stamina - 30,
          location: exp.location,
          expeditionBoard: hero.expeditionBoard.filter(e => e.id !== expeditionId),
          currentQuest: null, // 暂停自动任务
          queuedQuest: null
      };

      setHero(newHeroState);
      addMessage('system', '出发', `前往【${exp.name}】探险`);
      triggerAI('expedition_start', '', 'start', newHeroState);
  };

  const hireCompanion = (visitorId: string) => {
    if (!hero) return;
    const visitor = hero.tavern.visitors.find(v => v.id === visitorId);
    if (!visitor) return;
    if (hero.gold < visitor.price) { addMessage('system', '穷困', "物资不足。"); return; }
    setHero(prev => prev ? { ...prev, gold: prev.gold - visitor.price, companion: visitor, companionExpiry: Date.now() + 24 * 60 * 60 * 1000, tavern: { ...prev.tavern, visitors: prev.tavern.visitors.filter(v => v.id !== visitorId) } } : null);
    addMessage('system', '结盟', `【${visitor.name}】加入。`);
    triggerAI("recruit_companion", "", "recruit", { ...hero, companion: visitor });
  };

  const triggerAI = async (eventType: string, suffix: string = "", action?: string, explicitHero?: HeroState) => {
    const currentHero = explicitHero || hero;
    if (!currentHero) return false;
    
    const companionInfo = currentHero.companion ? `伙伴:${currentHero.companion.title}` : "独自";
    const mainSagaInfo = currentHero.mainStoryIndex < MAIN_SAGA.length ? MAIN_SAGA[currentHero.mainStoryIndex].title : "完结";
    
    let questTitle = "无";
    let taskObjective = "休息/放松"; 

    if (currentHero.state === 'expedition' && currentHero.activeExpedition) {
        questTitle = currentHero.activeExpedition.name;
        taskObjective = `在${currentHero.activeExpedition.name}探索未知`;
    } else if (currentHero.currentQuest) {
        questTitle = currentHero.currentQuest.name;
        taskObjective = currentHero.currentQuest.script.objective; 
    }

    const isDanger = currentHero.state === 'fight' || currentHero.hp < currentHero.maxHp * 0.3 || currentHero.state === 'expedition';

    try {
      const context = { 
        ...currentHero, 
        storyStage: getStoryStage(currentHero.level), 
        worldLore: WORLD_LORE, 
        mainSaga: mainSagaInfo,
        questTitle,
        taskObjective,
        questScript: currentHero.currentQuest?.script || currentHero.queuedQuest?.script, 
        questStage: currentHero.currentQuest?.stage,
        companionInfo: companionInfo, 
        recentLogs: recentLogsRef.current, 
        tags: currentHero.tags || [],
        equipment: currentHero.equipment,
        isDanger: isDanger 
      };
      
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ context, eventType, userAction: action }) });
      if (!res.ok) throw new Error("AI API Failed");
      
      const data = await res.json();
      if (data.text) {
        if (eventType.includes('generate_')) {
            if (eventType === 'generate_rumor') addMessage('rumor', '信号', data.text);
            else if (eventType === 'generate_description') setHero(h => h ? {...h, description: data.text} : null);
            else if (eventType === 'generate_equip_desc') setHero(h => h ? {...h, equipmentDescription: data.text} : null);
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
    if (hero.godPower < 25) { addMessage('system', '意志', "精神力不足。"); return; }
    if (type === 'bless') { 
      setHero(h => h ? {...h, hp: h.maxHp, godPower: h.godPower - 25} : null); 
      addMessage('system', '幸运', "发现了一些草药。");
      triggerAI('god_action', ''); 
    } else { 
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 20), exp: h.exp + 50, godPower: h.godPower - 25} : null); 
      addMessage('system', '磨难', "虽然受伤了，但你学到了教训。");
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
        if (item.type === 'weapon' && (!hero.equipment.weapon || (item.power||0) > (hero.equipment.weapon.power||0))) {
            hero.equipment.weapon = item; updated = true; equipChanged = true;
        }
    });

    if (hero.hp < hero.maxHp * 0.5) {
       const potion = hero.inventory.find(i => i.type === 'consumable' && !i.desc.includes("热量"));
       if (potion) {
          const heal = Number(potion.effect) || 0;
          hero.hp = Math.min(hero.maxHp, hero.hp + heal);
          logs.push(`使用: ${potion.name}`);
          const idx = hero.inventory.findIndex(i => i.id === potion.id);
          if (idx > -1) { if (hero.inventory[idx].count > 1) hero.inventory[idx].count--; else hero.inventory.splice(idx, 1); }
          updated = true;
       }
    }

    if (hero.stamina < hero.maxStamina * 0.2) {
       const food = hero.inventory.find(i => i.type === 'consumable' && (i.desc.includes("热量") || i.name.includes("椰子") || i.name.includes("饼干")));
       if (food) {
          const regen = Number(food.effect) || 0;
          hero.stamina = Math.min(hero.maxStamina, hero.stamina + regen);
          logs.push(`食用: ${food.name}`);
          const idx = hero.inventory.findIndex(i => i.id === food.id);
          if (idx > -1) { if (hero.inventory[idx].count > 1) hero.inventory[idx].count--; else hero.inventory.splice(idx, 1); }
          updated = true;
       }
    }

    if (equipChanged) { setTimeout(() => triggerAI('generate_equip_desc', '', undefined, hero), 100); }
    return { hero: updated ? hero : currentHero, logs, tagsChanged };
  };

  useEffect(() => {
    if (!heroRef.current) return;

    const gameLoop = async () => {
      try {
          const currentHero = heroRef.current;
          if (!currentHero) return;

          if (currentHero.state === 'expedition' && currentHero.activeExpedition) {
              const exp = currentHero.activeExpedition;
              const now = Date.now();
              const timeLeft = (exp.endTime || 0) - now;

              if (timeLeft <= 0) {
                  const lootItem = rollLoot(currentHero.level + 2, 20);
                  setHero(h => h ? {
                      ...h,
                      state: 'idle',
                      activeExpedition: null,
                      location: '临时营地', 
                      gold: h.gold + exp.rewards.gold,
                      exp: h.exp + exp.rewards.exp,
                      inventory: lootItem ? [...h.inventory, { ...lootItem, id: Date.now().toString(), count: 1 } as Item] : h.inventory
                  } : null);
                  addMessage('system', '归来', `探险完成！获得大量物资。`);
                  triggerAI('expedition_end', '', 'end');
              } else {
                  if (Math.random() < 0.3) {
                      await triggerAI('expedition_event');
                  }
              }
              const nextTick = 10000 + Math.random() * 5000;
              timerRef.current = setTimeout(gameLoop, nextTick);
              return;
          }

          const { hero: managedHero, logs: autoLogs, tagsChanged } = autoManageInventory(currentHero);
          if (autoLogs.length > 0) { setHero(managedHero); autoLogs.forEach(l => addMessage('system', '记录', l)); } 
          
          let aiEvent: string | null = null;
          let newQuest = managedHero.currentQuest;
          let queued = managedHero.queuedQuest;

          if (Date.now() - (managedHero.lastQuestRefresh || 0) > REFRESH_INTERVAL) {
             managedHero.questBoard = generateQuestBoard(managedHero);
             managedHero.lastQuestRefresh = Date.now();
             addMessage('system', '消息', '任务已刷新');
          }
          if (Date.now() - (managedHero.lastExpeditionRefresh || 0) > EXPEDITION_REFRESH_INTERVAL) {
             managedHero.expeditionBoard = generateExpeditions(managedHero.level);
             managedHero.lastExpeditionRefresh = Date.now();
             addMessage('system', '探险', '发现了新的探索区域');
          }

          // 智能休息/自动任务
          const needRest = managedHero.stamina < 30 || managedHero.hp < 50;
          
          // ⚠️ 修复：如果正在做正经任务 (manual/main)，绝对不休息！
          const isBusyWithRealJob = newQuest && newQuest.category !== 'auto';

          if (needRest && !isBusyWithRealJob && !queued) {
              managedHero.state = 'sleep';
              aiEvent = 'idle_event'; 
          } else if (!newQuest && !queued) {
              // 只有真的没事干了，才考虑 auto task
              if (Math.random() < 0.3) { 
                  managedHero.state = 'idle';
                  aiEvent = 'idle_event'; 
              } else {
                  const locationKey = AUTO_TASKS[managedHero.location as keyof typeof AUTO_TASKS] ? managedHero.location : "default";
                  // @ts-ignore
                  const autoPool = AUTO_TASKS[locationKey] || AUTO_TASKS["default"];
                  const autoTask = autoPool[Math.floor(Math.random() * autoPool.length)];
                  
                  newQuest = {
                      id: `auto_${Date.now()}`,
                      name: autoTask.title,
                      category: 'auto',
                      rank: 1,
                      faction: 'nature',
                      script: { title: autoTask.title, description: autoTask.desc, objective: autoTask.obj, antagonist: autoTask.antagonist, twist: "无", npc: "无" },
                      desc: autoTask.desc,
                      stage: 'start',
                      progress: 0,
                      total: 30, 
                      reqLevel: 1,
                      staminaCost: 2,
                      rewards: { gold: 5, exp: 10 },
                      isAuto: true
                  };
                  managedHero.currentQuest = newQuest;
                  aiEvent = 'quest_start';
              }
          }

          if (newQuest) {
            let progressInc = 5 + Math.floor(Math.random() * 5); 
            newQuest.progress += progressInc;
            if (newQuest.progress >= newQuest.total) {
               aiEvent = 'quest_end'; 
               managedHero.gold += newQuest.rewards.gold;
               managedHero.exp += newQuest.rewards.exp;
               if (!newQuest.isAuto) addMessage('system', '完成', `${newQuest.name}`);
               newQuest = null; 
               managedHero.state = 'idle'; 
            }
            managedHero.currentQuest = newQuest;
          }

          if (aiEvent) {
             setHero(managedHero);
             await triggerAI(aiEvent);
          } else if (managedHero.currentQuest) { 
             setHero(managedHero);
             await triggerAI('quest_journey'); 
          } 
          
          const nextTick = 10000 + Math.random() * 5000;
          timerRef.current = setTimeout(gameLoop, nextTick);

      } catch (error) {
          console.error("GameLoop Error:", error);
      } finally {
          if (!timerRef.current) timerRef.current = setTimeout(gameLoop, 10000);
      }
    };
    
    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading, error, clearError: () => setError(null), hireCompanion, acceptQuest, startExpedition };
}