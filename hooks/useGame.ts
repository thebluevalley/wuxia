import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QuestCategory, Quest, QuestRank, Faction, MAIN_SAGA, SIDE_QUESTS, AUTO_TASKS, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message, Quality, NPC_NAMES_MALE, NPC_NAMES_FEMALE, NPC_NAMES_LAST, NPC_ARCHETYPES, NPC_TRAITS, Companion, WORLD_MAP, PERSONALITIES, EXPEDITION_LOCATIONS, Expedition, EVENT_SEEDS } from '@/app/lib/constants';

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

const pickEventSeed = (location: string, objective: string): string => {
    const actionKey = objective.substring(0, 2); 
    const actionSeeds = EVENT_SEEDS[actionKey] || [];
    const locationSeeds = EVENT_SEEDS[location] || [];
    const pool = [...actionSeeds, ...locationSeeds];
    if (pool.length === 0) return "观察周围的环境"; 
    return pool[Math.floor(Math.random() * pool.length)];
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
      
      // ⚠️ 增强：生成更具体的描述
      const detailedDesc = `当前急需${template.desc}，必须前往${location}执行【${template.title}】。这可能会有些危险，但为了资源是值得的。`;

      quests.push({
          id: `side_${Date.now()}_${i}`,
          name: template.title,
          category: 'side',
          rank,
          faction: 'nature',
          script: { 
              title: template.title, 
              // ⚠️ 传递给 AI 的详细描述
              description: detailedDesc, 
              objective: template.title, 
              antagonist: template.antagonist, 
              twist: "无", 
              npc: "无" 
          },
          desc: detailedDesc, // 界面显示
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
  const isRequestingRef = useRef(false);
  const aiCooldownRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { heroRef.current = hero; }, [hero]);

  const login = async (name: string, password: string) => {
    setLoading(true); setError(null);
    const initialStage = "幸存者";
    const initialSaga = MAIN_SAGA[0];

    const newHero: HeroState = {
      name, level: 1, gender: '男', age: 20, 
      personality: "坚韧", title: initialStage, motto: "活下去", godPower: 100, unlockedFeatures: [], 
      pet: null, storyStage: initialStage, mainStoryIndex: 0, 
      attributes: { constitution: 8, strength: 8, dexterity: 8, intelligence: 8, luck: 10 },
      stamina: 100, maxStamina: 100, hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0, 
      alignment: 0, location: initialSaga.location, state: 'idle', 
      logs: [], messages: [], majorEvents: [`第1天：${name} 在海滩醒来。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: [], lifeSkills: [],
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: null, queuedQuest: null, questBoard: [], lastQuestRefresh: 0, 
      tavern: { visitors: [], lastRefresh: Date.now() },
      companion: null, companionExpiry: 0,
      reputation: { nature: 0, survivor: 0, savage: 0, ruins: 0, beast: 0, unknown: 0, neutral: 0, faith: 0, watch: 0 },
      narrativeHistory: "海难幸存。",
      tags: ["幸存者", "湿透"], 
      actionCounts: { kills: 0, retreats: 0, gambles: 0, charity: 0, betrayals: 0, shopping: 0, drinking: 0 },
      description: "一个衣衫褴褛的幸存者。",
      equipmentDescription: "湿透的衬衫。",
      activeExpedition: null, expeditionBoard: [], lastExpeditionRefresh: 0,
      strategy: { longTermGoal: initialSaga.goal, currentFocus: "生存", urgency: 'high', narrativePhase: 'survival' },
      idleUntil: 0
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
        if (!mergedData.strategy) {
            const saga = MAIN_SAGA[mergedData.mainStoryIndex] || MAIN_SAGA[0];
            mergedData.strategy = { longTermGoal: saga.goal, currentFocus: "生存", urgency: 'medium', narrativePhase: saga.phase as any };
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
      const recentTexts = prev.logs.slice(0, 5).map(l => l.text);
      if (recentTexts.includes(text)) { return prev; }
      const timeStr = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
      const newHistory = (prev.narrativeHistory + " " + text).slice(-800); 
      const newLog: LogEntry = { id: Date.now().toString(), text, type: finalType, time: timeStr };
      const newLogs = [newLog, ...prev.logs].slice(0, 50);
      recentLogsRef.current = newLogs.slice(0, 5).map(l => l.text);
      return { ...prev, logs: newLogs, narrativeHistory: newHistory };
    });
  };

  const addMessage = (type: 'rumor' | 'system', title: string, content: string) => { setHero(prev => { if (!prev) return null; return { ...prev, messages: [{ id: Date.now().toString(), type, title, content, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}), isRead: false }, ...prev.messages].slice(0, 50) }; }); };
  
  const acceptQuest = (questId: string) => { 
    if(!heroRef.current) return; 
    const hero=heroRef.current; 
    if(hero.activeExpedition) { addMessage('system', '无法行动', '正在探险中！'); return; }
    
    const quest=hero.questBoard.find(q=>q.id===questId); 
    if(!quest) return; 
    
    const newBoard=hero.questBoard.filter(q=>q.id!==questId); 
    let newLocation=hero.location; 
    if(quest.category==='main'){ 
        const saga=MAIN_SAGA.find(s=>s.title===quest.script.title); 
        if(saga) newLocation=saga.location; 
    } 
    
    const isBusy = !!hero.currentQuest;
    
    if(isBusy){ 
        if(hero.queuedQuest) { addMessage('system', '繁忙', `队列已满`); return; }
        setHero(prev => prev ? { ...prev, queuedQuest: quest, questBoard: newBoard } : null); 
        addMessage('system', '计划', `已列入计划：${quest.name}`);
    } else { 
        const ns:HeroState={
            ...hero,
            stamina:hero.stamina-quest.staminaCost,
            currentQuest:quest,
            queuedQuest:null,
            questBoard:newBoard,
            location:newLocation,
            state:'fight',
            idleUntil: 0 
        }; 
        setHero(ns); 
        triggerAI('quest_journey','','start',ns); 
    } 
  };

  const startExpedition = (expeditionId: string) => { 
      if(!heroRef.current) return; 
      const hero=heroRef.current; 
      const exp=hero.expeditionBoard.find(e=>e.id===expeditionId); 
      if(!exp) return; 
      const ns:HeroState={...hero,activeExpedition:{...exp,startTime:Date.now(),endTime:Date.now()+exp.duration},state:'expedition',stamina:hero.stamina-30,location:exp.location,expeditionBoard:hero.expeditionBoard.filter(e=>e.id!==expeditionId),currentQuest:null,queuedQuest:null}; 
      setHero(ns); 
      triggerAI('expedition_start','','start',ns); 
  };

  const hireCompanion = (visitorId: string) => { 
      if(!hero) return; 
      const v=hero.tavern.visitors.find(v=>v.id===visitorId); 
      if(!v) return; 
      setHero(p=>p?{...p,gold:p.gold-v.price,companion:v,companionExpiry:Date.now()+86400000,tavern:{...p.tavern,visitors:p.tavern.visitors.filter(x=>x.id!==visitorId)}}:null); 
      triggerAI("recruit_companion","", "recruit",{...hero,companion:v}); 
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

  const triggerAI = async (eventType: string, suffix: string = "", action?: string, explicitHero?: HeroState, forceSeed?: string) => {
    if (Date.now() < aiCooldownRef.current) return false;
    if (isRequestingRef.current) return false;

    const currentHero = explicitHero || hero;
    if (!currentHero) return false;
    
    isRequestingRef.current = true;

    const companionInfo = currentHero.companion ? `伙伴:${currentHero.companion.title}` : "独自";
    const mainSagaInfo = currentHero.mainStoryIndex < MAIN_SAGA.length ? MAIN_SAGA[currentHero.mainStoryIndex].title : "完结";
    
    let questTitle = "无";
    let taskObjective = "生存"; 
    let questCategory = "none";

    if (currentHero.state === 'expedition' && currentHero.activeExpedition) {
        questTitle = currentHero.activeExpedition.name;
        taskObjective = `在${currentHero.activeExpedition.name}探索未知`;
        questCategory = "expedition";
    } else if (currentHero.currentQuest) {
        questTitle = currentHero.currentQuest.name;
        taskObjective = currentHero.currentQuest.script.objective || currentHero.currentQuest.name; 
        questCategory = currentHero.currentQuest.category;
    }

    let seedEvent = forceSeed || currentHero.currentSeed || "";
    if (!seedEvent && (eventType === 'quest_journey' || eventType === 'idle_event')) {
        seedEvent = pickEventSeed(currentHero.location, taskObjective);
    }

    const isDanger = currentHero.state === 'fight' || currentHero.hp < currentHero.maxHp * 0.3 || currentHero.state === 'expedition';
    const recentLogs = recentLogsRef.current || [];
    const strategy = currentHero.strategy || { longTermGoal: "生存", currentFocus: "活着", urgency: "medium" };

    try {
      const context = { 
        ...currentHero, 
        storyStage: getStoryStage(currentHero.level), 
        worldLore: WORLD_LORE, 
        mainSaga: mainSagaInfo,
        questTitle,
        taskObjective,
        questCategory,
        seedEvent, 
        // ⚠️ 关键：将完整的任务对象传递给后端，以便读取 description
        questScript: currentHero.currentQuest?.script || currentHero.queuedQuest?.script, 
        questStage: currentHero.currentQuest?.stage,
        companionInfo: companionInfo, 
        recentLogs: recentLogs, 
        tags: currentHero.tags || [],
        equipment: currentHero.equipment,
        isDanger: isDanger,
        strategy: strategy 
      };
      
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ context, eventType, userAction: action }) });
      
      if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API Error: ${res.status} - ${errorText.substring(0, 50)}`);
      }
      
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
      }
    } catch (e: any) { 
        console.error("AI Generation Failed:", e); 
        if (e.message.includes('429')) {
            aiCooldownRef.current = Date.now() + 30000;
            addLog("(思维过载，暂时休息...)", "system");
        } else {
            addLog(`(信号中断: ${e.message})`, "bad");
        }
    } finally {
        isRequestingRef.current = false;
    }
    return true;
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

  const autoDirector = (currentHero: HeroState) => {
      const isHurt = currentHero.hp < currentHero.maxHp * 0.4;
      const isHungry = currentHero.stamina < 30;
      const sagaIndex = Math.min(currentHero.mainStoryIndex, MAIN_SAGA.length - 1);
      const saga = MAIN_SAGA[sagaIndex];
      let newStrategy = { ...currentHero.strategy };
      let chosenTaskTitle = "";
      
      if (isHurt || isHungry) {
          newStrategy.currentFocus = "生存优先";
          newStrategy.urgency = 'high';
          chosenTaskTitle = isHurt ? "包扎伤口" : "寻找食物";
      } else {
          newStrategy.currentFocus = saga.goal; 
          newStrategy.urgency = 'medium';
          const tasks = saga.tasks || ["探索周边"];
          chosenTaskTitle = tasks[Math.floor(Math.random() * tasks.length)];
      }

      const seedEvent = pickEventSeed(currentHero.location, chosenTaskTitle);

      const newQuest: Quest = {
          id: `auto_${Date.now()}`,
          name: chosenTaskTitle,
          category: 'auto',
          rank: 1,
          faction: 'nature',
          script: { 
              title: chosenTaskTitle, 
              // ⚠️ 核心修正：自动生成的描述更像一个真正的任务指引
              description: `当前的首要策略是【${newStrategy.currentFocus}】。为了实现这一点，必须前往${currentHero.location}，执行【${chosenTaskTitle}】行动。`,
              objective: chosenTaskTitle, 
              antagonist: "自然环境", 
              twist: seedEvent 
          },
          // 界面显示
          desc: `为了${newStrategy.currentFocus}，前往${currentHero.location}${chosenTaskTitle}。`,
          stage: 'start',
          progress: 0,
          total: 30, 
          reqLevel: 1,
          staminaCost: 2,
          rewards: { gold: 5, exp: 10 },
          isAuto: true
      };

      return { newQuest, newStrategy, seedEvent };
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
          let seedEvent = "";

          if (!newQuest) {
              if (queued) {
                  newQuest = queued;
                  managedHero.queuedQuest = null; 
                  managedHero.currentQuest = newQuest;
                  
                  seedEvent = pickEventSeed(managedHero.location, newQuest.name);
                  managedHero.currentSeed = seedEvent;
                  
                  aiEvent = 'quest_start';
                  addMessage('system', '执行', `按计划执行：${newQuest.name}`);
              } 
              else {
                  const isResting = managedHero.idleUntil && Date.now() < managedHero.idleUntil;
                  
                  if (isResting) {
                      if (Math.random() < 0.3) { 
                          managedHero.state = 'idle';
                          aiEvent = 'idle_event'; 
                      }
                  } else {
                      const { newQuest: autoQuest, newStrategy, seedEvent: seed } = autoDirector(managedHero);
                      newQuest = autoQuest;
                      managedHero.strategy = newStrategy; 
                      managedHero.currentQuest = newQuest;
                      managedHero.currentSeed = seed; 
                      seedEvent = seed;
                      aiEvent = 'quest_start';
                  }
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
               
               managedHero.currentQuest = null; 
               managedHero.state = 'idle'; 
               managedHero.currentSeed = undefined; 
               
               if (!queued) {
                   const idleMins = Math.floor(Math.random() * (15 - 2) + 2);
                   managedHero.idleUntil = Date.now() + idleMins * 60 * 1000;
               }
            } else {
                managedHero.currentQuest = newQuest;
            }
          }

          if (aiEvent) {
             setHero({...managedHero}); 
             await triggerAI(aiEvent, "", undefined, undefined, seedEvent);
          } else if (managedHero.currentQuest) { 
             setHero({...managedHero});
             await triggerAI('quest_journey'); 
          } 
          
      } catch (error) {
          console.error("GameLoop Error:", error);
      } finally {
          const currentHero = heroRef.current;
          const isDanger = currentHero ? (currentHero.state === 'fight' || currentHero.hp < currentHero.maxHp * 0.3) : false;
          const minTick = isDanger ? 15000 : 25000;
          const maxTick = isDanger ? 25000 : 45000;
          const nextTick = Math.floor(Math.random() * (maxTick - minTick) + minTick); 
          timerRef.current = setTimeout(gameLoop, nextTick);
      }
    };
    
    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading, error, clearError: () => setError(null), hireCompanion, acceptQuest, startExpedition };
}