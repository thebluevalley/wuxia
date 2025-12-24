import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QuestCategory, Quest, QuestRank, Faction, MAIN_SAGA, SIDE_QUESTS, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message, Quality, NPC_NAMES_MALE, NPC_NAMES_FEMALE, NPC_NAMES_LAST, NPC_ARCHETYPES, NPC_TRAITS, Companion, WORLD_MAP, PERSONALITIES } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

const REFRESH_INTERVAL = 3 * 60 * 60 * 1000; 
const QUEST_REFRESH_INTERVAL = 1 * 60 * 60 * 1000; 

// --- 辅助函数 (保持不变) ---
const getStoryStage = (level: number) => {
  const stage = [...STORY_STAGES].reverse().find(s => level >= s.level);
  return stage ? stage.name : "幸存者";
};

const calculateTags = (hero: HeroState): string[] => {
  const tags: Set<string> = new Set();
  const { hp, maxHp, stamina, gold, attributes, actionCounts, inventory, equipment, level, companion, stats } = hero;
  if (hp < maxHp * 0.2) tags.add("濒死");
  else if (hp < maxHp * 0.5) tags.add("受伤");
  if (stamina < 20) tags.add("极饿");
  if (gold > 1000) tags.add("富足");
  const weaponName = equipment.weapon?.name || "";
  if (weaponName.includes("弓")) tags.add("猎手");
  else if (!equipment.weapon) tags.add("空手");
  return Array.from(tags).slice(0, 8);
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
          total: rank * 80, 
          reqLevel: Math.max(1, level - 2),
          staminaCost: rank * 5,
          rewards: { gold: rank * 20, exp: rank * 50 }
      });
  }
  return quests;
};

const getLocationByQuest = (questType: any, level: number): string => {
  const map = WORLD_MAP[Math.floor(Math.random() * WORLD_MAP.length)];
  return map.name;
};

const getInitialSkills = (): Skill[] => [{ name: "基础求生", type: 'survival', level: 1, exp: 0, maxExp: 100, desc: "生存本能" }];
const getInitialLifeSkills = (): Skill[] => [{ name: "采集", type: 'survival', level: 1, exp: 0, maxExp: 100, desc: "识别食物" }];

const generateVisitors = (): Companion[] => {
  const visitors: Companion[] = [];
  const tiers: Quality[] = [];
  for (let i = 0; i < 3; i++) { const rand = Math.random(); let tier: Quality = 'common'; if (rand < 0.1) tier = 'epic'; else if (rand < 0.3) tier = 'rare'; else tier = 'common'; tiers.push(tier); }
  tiers.forEach((tier, i) => {
    const templates = NPC_ARCHETYPES[tier]; const template = templates[Math.floor(Math.random() * templates.length)];
    let gender: '男' | '女' = Math.random() > 0.5 ? '男' : '女';
    const firstNameList = gender === '男' ? NPC_NAMES_MALE : NPC_NAMES_FEMALE;
    const firstName = firstNameList[Math.floor(Math.random() * firstNameList.length)];
    const trait = NPC_TRAITS[Math.floor(Math.random() * NPC_TRAITS.length)];
    const priceMap = { common: 50, rare: 200, epic: 1000, legendary: 5000 };
    const buffVal = { common: 5, rare: 15, epic: 30, legendary: 80 };
    visitors.push({ id: Date.now() + i + Math.random().toString(), name: `${trait}${firstName}`, gender, title: template.job, archetype: template.job, personality: trait, desc: template.desc, quality: tier, price: priceMap[tier], buff: { type: template.buff as any, val: buffVal[tier] } });
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
      name, level: 1, gender: Math.random() > 0.5 ? '男' : '女', age: 20 + Math.floor(Math.random()*10), 
      personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)], 
      title: initialStage, motto: "活下去", godPower: 100, unlockedFeatures: [], 
      pet: null, storyStage: initialStage,
      mainStoryIndex: 0, 
      attributes: { constitution: 8, strength: 8, dexterity: 8, intelligence: 8, luck: 10 },
      stamina: 100, maxStamina: 100,
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0, 
      alignment: 0, location: "荒芜海滩", state: 'idle', 
      logs: [], 
      messages: [], majorEvents: [`第1天：${name} 在海滩醒来。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: getInitialSkills(), lifeSkills: getInitialLifeSkills(),
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: null, queuedQuest: null, questBoard: [], 
      lastQuestRefresh: 0, 
      tavern: { visitors: generateVisitors(), lastRefresh: Date.now() },
      companion: null, companionExpiry: 0,
      reputation: { nature: 0, survivor: 0, savage: 0, ruins: 0, beast: 0, unknown: 0, neutral: 0, faith: 0, watch: 0 },
      narrativeHistory: "海难幸存。",
      tags: ["幸存者", "湿透"], 
      actionCounts: { kills: 0, retreats: 0, gambles: 0, charity: 0, betrayals: 0, shopping: 0, drinking: 0 },
      description: "一个衣衫褴褛的幸存者。",
      equipmentDescription: "湿透的衬衫。" 
    };
    
    newHero.questBoard = generateQuestBoard(newHero);

    if (!supabase) { setHero(newHero); setLoading(false); setTimeout(() => triggerAI('start_game', undefined, undefined, newHero), 500); return; }

    try {
      let { data: user } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (user) {
        if (user.password !== password) { setError("身份验证失败"); setLoading(false); return; }
        const mergedData = { ...newHero, ...user.data };
        if (mergedData.mainStoryIndex === undefined) mergedData.mainStoryIndex = 0;
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
      // ⚠️ 核心修复：防止重复文本
      const lastLog = prev.logs[0]?.text;
      if (lastLog === text) return prev; // 如果跟上一条一样，直接忽略

      const timeStr = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
      const newHistory = (prev.narrativeHistory + " " + text).slice(-1000); 
      const newLog: LogEntry = { id: Date.now().toString(), text, type: finalType, time: timeStr };
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
    // ... validation logic
    if (hero.queuedQuest) { addMessage('system', '繁忙', `一次只能做一件事`); return; }

    const newBoard = hero.questBoard.filter(q => q.id !== questId); 
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
    
    addMessage('system', '决心', `开始：${quest.name}`);
    triggerAI('quest_start', '', 'accept', { ...hero, queuedQuest: quest, location: newLocation }); 
  };

  const hireCompanion = (visitorId: string) => {
    // ... (keep logic)
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
    const isDanger = currentHero.state === 'fight' || currentHero.hp < currentHero.maxHp * 0.3;

    try {
      const context = { 
        ...currentHero, 
        storyStage: getStoryStage(currentHero.level), 
        worldLore: WORLD_LORE, 
        mainSaga: mainSagaInfo,
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
            // handle meta updates
        } else {
           const fullText = suffix ? `${data.text} ${suffix}` : data.text;
           addLog(fullText, 'highlight');
        }
        return true;
      }
    } catch (e) { 
        console.error(e); 
        // ⚠️ 智能兜底：从 STATIC_LOGS 随机选一个与上一条不重复的
        const lastLog = currentHero.logs[0]?.text;
        let fallback = "";
        let attempts = 0;
        do {
            fallback = STATIC_LOGS.idle[Math.floor(Math.random() * STATIC_LOGS.idle.length)];
            attempts++;
        } while (fallback === lastLog && attempts < 5); // 尝试5次避免重复
        
        addLog(fallback, "highlight");
    }
    return false;
  };

  // ... (godAction, autoManageInventory 保持不变，请确保代码完整) ...
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

    if (hero.hp < hero.maxHp * 0.5) {
       const potion = hero.inventory.find(i => i.type === 'consumable' && !i.desc.includes("热量"));
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
       const food = hero.inventory.find(i => i.type === 'consumable' && (i.desc.includes("热量") || i.name.includes("椰子") || i.name.includes("饼干")));
       if (food) {
          const regen = Number(food.effect) || 0;
          hero.stamina = Math.min(hero.maxStamina, hero.stamina + regen);
          logs.push(`吃了 ${food.name}`);
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
      try {
          const currentHero = heroRef.current;
          if (!currentHero) return;

          const { hero: managedHero, logs: autoLogs, tagsChanged } = autoManageInventory(currentHero);
          if (autoLogs.length > 0) { setHero(managedHero); autoLogs.forEach(l => addMessage('system', '记录', l)); } 
          
          let aiEvent: string | null = null;
          let newQuest = managedHero.currentQuest;
          let queued = managedHero.queuedQuest;

          // 主线强制接取
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
                  rewards: { gold: 100, exp: 500 }
              };
              managedHero.currentQuest = newQuest;
              managedHero.location = nextSaga.location; 
              managedHero.state = 'fight'; 
              
              addMessage('system', '目标', `新任务：${nextSaga.title}`);
              aiEvent = 'quest_start'; 
          }
      }
      
      if (Date.now() - (managedHero.lastQuestRefresh || 0) > QUEST_REFRESH_INTERVAL) {
         managedHero.questBoard = generateQuestBoard(managedHero);
         managedHero.lastQuestRefresh = Date.now();
         addMessage('system', '消息', '附近资源已刷新。');
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
           addMessage('system', '生存', `完成了：${newQuest.name}`);

           if (newQuest.category === 'main') {
               managedHero.mainStoryIndex += 1;
               addMessage('system', '进化', `生存阶段提升！`);
           }

           if (queued) {
             let targetLoc = getLocationByQuest('life', managedHero.level);
             if (queued.category === 'main') {
                 const saga = MAIN_SAGA.find(s => s.title === queued?.script.title);
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
                 const saga = MAIN_SAGA.find(s => s.title === queued?.script.title);
                 if (saga) targetLoc = saga.location;
             }
             newQuest = queued; queued = null;
             managedHero.currentQuest = newQuest; managedHero.queuedQuest = queued;
             managedHero.location = targetLoc;
             managedHero.state = newQuest.category === 'main' ? 'fight' : 'idle'; 
             aiEvent = 'quest_start';
         } 
      }

      if (managedHero.state !== 'town' && Math.random() < 0.2) {
         const luck = managedHero.attributes.luck + (managedHero.companion?.buff.type === 'luck' ? managedHero.companion.buff.val : 0);
         const loot = rollLoot(managedHero.level, luck);
         if (loot) {
            const lootItem = { ...loot, id: Date.now().toString(), count: 1 } as Item;
            const idx = managedHero.inventory.findIndex(i => i.name === lootItem.name);
            if (idx >= 0) managedHero.inventory[idx].count++; else managedHero.inventory.push(lootItem);
            addMessage('system', '拾取', `发现了 ${lootItem.name}。`);
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
      } catch (error) {
          console.error("GameLoop Error:", error);
      } finally {
          const currentHero = heroRef.current;
          const isDanger = currentHero ? (currentHero.state === 'fight' || currentHero.hp < currentHero.maxHp * 0.3) : false;
          const minTick = isDanger ? 4000 : 7000;
          const maxTick = isDanger ? 6000 : 12000;
          const nextTick = Math.floor(Math.random() * (maxTick - minTick) + minTick); 
          timerRef.current = setTimeout(gameLoop, nextTick);
      }
    };
    
    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading, error, clearError: () => setError(null), hireCompanion, acceptQuest };
}