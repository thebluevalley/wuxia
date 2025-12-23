import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QUEST_SOURCES, QuestType, PERSONALITIES, PET_TEMPLATES, ARENA_OPPONENTS, MAP_LOCATIONS, WORLD_MAP, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message, Quality, NPC_NAMES_FIRST, NPC_NAMES_LAST, NPC_ARCHETYPES, NPC_TRAITS, Companion } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

// --- 辅助函数 (保持在组件外，防止找不到) ---

const getStoryStage = (level: number) => {
  const stage = [...STORY_STAGES].reverse().find(s => level >= s.level);
  return stage ? stage.name : "初出茅庐";
};

const generateQuest = (): HeroState['currentQuest'] => {
  const types: QuestType[] = ['search', 'hunt', 'challenge', 'train', 'life'];
  const type = types[Math.floor(Math.random() * types.length)];
  const templates = QUEST_SOURCES[type];
  const name = templates[Math.floor(Math.random() * templates.length)];
  return { name, type, desc: "努力中...", progress: 0, total: 100 };
};

const getLocationByQuest = (questType: QuestType, level: number): string => {
  const availableMaps = WORLD_MAP.filter(m => level >= m.minLv && level <= m.minLv + 40);
  const typeMatches = availableMaps.filter(m => m.type === questType);
  const pool = typeMatches.length > 0 ? typeMatches : availableMaps;
  if (pool.length === 0) return "荒野古道";
  return pool[Math.floor(Math.random() * pool.length)].name;
};

const getInitialSkills = (): Skill[] => [{ name: "太祖长拳", type: 'attack', level: 1, exp: 0, maxExp: 100, desc: "江湖流传最广的入门拳法" }];
const getInitialLifeSkills = (): Skill[] => [{ name: "包扎", type: 'medical', level: 1, exp: 0, maxExp: 100, desc: "简单的伤口处理" }];

const generateVisitors = (): Companion[] => {
  const visitors: Companion[] = [];
  for (let i = 0; i < 5; i++) {
    const rand = Math.random();
    let tier: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
    if (rand < 0.05) tier = 'legendary';
    else if (rand < 0.15) tier = 'epic';
    else if (rand < 0.4) tier = 'rare';

    const templates = NPC_ARCHETYPES[tier];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const firstName = NPC_NAMES_FIRST[Math.floor(Math.random() * NPC_NAMES_FIRST.length)];
    const lastName = NPC_NAMES_LAST[Math.floor(Math.random() * NPC_NAMES_LAST.length)];
    const trait = NPC_TRAITS[Math.floor(Math.random() * NPC_TRAITS.length)];
    
    const priceMap = { common: 200, rare: 800, epic: 3000, legendary: 10000 };
    const buffVal = { common: 5, rare: 10, epic: 20, legendary: 50 };

    visitors.push({
      id: Date.now() + i + Math.random().toString(),
      name: `${firstName}${lastName}`,
      title: template.job,
      archetype: template.job,
      personality: trait,
      desc: template.desc,
      quality: tier,
      price: priceMap[tier],
      buff: { type: template.buff as any, val: buffVal[tier] }
    });
  }
  return visitors;
};

const rollLoot = (level: number, luck: number): Partial<Item> | null => {
    const validItems = LOOT_TABLE.filter(i => (i.minLevel || 1) <= level);
    if (validItems.length === 0) return null;
    const rand = Math.random() * 100 - (luck * 0.5);
    let targetQuality: Quality = 'common';
    if (rand < 2) targetQuality = 'legendary';
    else if (rand < 10) targetQuality = 'epic';
    else if (rand < 30) targetQuality = 'rare';
    else targetQuality = 'common';

    let pool = validItems.filter(i => i.quality === targetQuality);
    if (pool.length === 0) pool = validItems.filter(i => i.quality === 'common');
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
};

// --- 主 Hook ---

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 引用最新状态
  const heroRef = useRef<HeroState | null>(null);
  const recentLogsRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    heroRef.current = hero;
  }, [hero]);

  // --- 登录 ---
  const login = async (name: string, password: string) => {
    setLoading(true); setError(null);
    const initialQuest = { name: "初出茅庐", type: "life" as QuestType, desc: "熟悉环境", progress: 0, total: 100 };
    
    const newHero: HeroState = {
      name, level: 1, gender: Math.random() > 0.5 ? '男' : '女', age: 16, 
      personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)], 
      title: "初出茅庐", motto: "莫欺少年穷", godPower: 100, unlockedFeatures: [], 
      pet: null, 
      storyStage: "初出茅庐",
      attributes: { constitution: 10, strength: 10, dexterity: 10, intelligence: 10, luck: 10 },
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 100, alignment: 0,
      location: "牛家村", state: 'idle', 
      logs: [], messages: [], majorEvents: [`${new Date().toLocaleDateString()}：${name} 踏入江湖。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: getInitialSkills(), lifeSkills: getInitialLifeSkills(),
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: initialQuest,
      tavern: { visitors: generateVisitors(), lastRefresh: Date.now() },
      companion: null, companionExpiry: 0
    };

    if (!supabase) { setHero(newHero); setLoading(false); setTimeout(() => triggerAI('start_game', undefined, undefined, newHero), 500); return; }

    try {
      let { data: user } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (user) {
        if (user.password !== password) { setError("密令错误！"); setLoading(false); return; }
        const mergedData = { ...newHero, ...user.data };
        if (!mergedData.tavern) mergedData.tavern = { visitors: generateVisitors(), lastRefresh: Date.now() };
        if (!mergedData.pet) mergedData.pet = null;
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

  // --- 自动保存 ---
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
      const newLog = { id: Date.now().toString(), text, type, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) };
      return { ...prev, logs: [...prev.logs, newLog].slice(-50) };
    });
  };

  const addMessage = (type: 'rumor' | 'system', title: string, content: string) => {
    setHero(prev => { if (!prev) return null; return { ...prev, messages: [{ id: Date.now().toString(), type, title, content, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}), isRead: false }, ...prev.messages].slice(0, 50) }; });
  };

  const hireCompanion = (visitorId: string) => {
    if (!hero) return;
    const visitor = hero.tavern.visitors.find(v => v.id === visitorId);
    if (!visitor) return;
    if (hero.gold < visitor.price) { addLog("囊中羞涩，请不起这位大侠。", "system"); return; }

    setHero(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gold: prev.gold - visitor.price,
        companion: visitor,
        companionExpiry: Date.now() + 24 * 60 * 60 * 1000, 
        tavern: { ...prev.tavern, visitors: prev.tavern.visitors.filter(v => v.id !== visitorId) } 
      };
    });
    addLog(`豪掷 ${visitor.price} 文，成功邀请【${visitor.name}】结伴同行！`, "highlight");
    triggerAI("recruit_companion", "", "recruit", { ...hero, companion: visitor });
  };

  const refreshTavern = (force: boolean = false) => {
    if (!hero) return;
    const now = Date.now();
    if (!force && now - hero.tavern.lastRefresh < 3 * 60 * 60 * 1000) return;
    if (force) {
       if (hero.gold < 50) { addLog("没钱打点店小二，无法刷新。", "system"); return; }
       setHero(prev => prev ? { ...prev, gold: prev.gold - 50 } : null);
    }
    setHero(prev => prev ? { ...prev, tavern: { visitors: generateVisitors(), lastRefresh: now } } : null);
    if (force) addLog("店小二换了一批新茶客名单。", "system");
  };

  const triggerAI = async (eventType: string, suffix: string = "", action?: string, explicitHero?: HeroState) => {
    const currentHero = explicitHero || hero;
    if (!currentHero) return false;
    try {
      const bestSkill = currentHero.martialArts.sort((a,b) => b.level - a.level)[0];
      const context = {
        ...currentHero,
        storyStage: getStoryStage(currentHero.level),
        worldLore: WORLD_LORE,
        questInfo: `[${currentHero.currentQuest.type}] ${currentHero.currentQuest.name} (${currentHero.currentQuest.progress}%)`,
        petInfo: currentHero.pet ? `灵宠:${currentHero.pet.type}` : "无",
        companionInfo: currentHero.companion ? `伙伴:${currentHero.companion.title} ${currentHero.companion.name} (性格:${currentHero.companion.personality})` : "独行",
        skillInfo: `擅长${bestSkill?.name || '乱拳'}(Lv.${bestSkill?.level || 1})`,
        recentLogs: recentLogsRef.current,
        lastLogLen: recentLogsRef.current[0]?.length || 0
      };
      
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ context, eventType, userAction: action }) });
      if (!res.ok) return false;
      const data = await res.json();
      
      if (data.text) {
        if (eventType === 'generate_rumor') {
           let title = "江湖风声"; let content = data.text;
           if (data.text.includes("：")) { const parts = data.text.split("："); title = parts[0]; content = parts.slice(1).join("："); }
           addMessage('rumor', title, content);
        } else {
           const fullText = suffix ? `${data.text} ${suffix}` : data.text;
           addLog(fullText, ['god_action','start_game','resume_game','recruit_companion'].includes(eventType) ? 'highlight' : 'normal');
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
    }
    else { 
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 20), exp: h.exp + 50, godPower: h.godPower - 25} : null); 
      addLog("【天降雷罚】一道惊雷劈下，虽受皮肉之苦，却觉内力精进！(经验+50)", "highlight");
      triggerAI('god_action', ''); 
    }
  };

  useEffect(() => {
    if (!heroRef.current) return;

    const gameLoop = async () => {
      // ⚠️ 使用 heroRef.current 避免闭包陷阱
      const currentHero = heroRef.current;
      if (!currentHero) return;

      setHero(h => h ? { ...h, godPower: Math.min(100, h.godPower + 5) } : null);
      
      if (currentHero.companion && Date.now() > currentHero.companionExpiry) {
         addLog(`【离别】${currentHero.companion.name} 拱手道别：“青山不改，绿水长流！”`, "system");
         setHero(h => h ? { ...h, companion: null } : null);
      }

      if (Date.now() - currentHero.tavern.lastRefresh > 3 * 60 * 60 * 1000) { refreshTavern(false); }

      let newState = currentHero.state;
      let newLocation = currentHero.location;
      let newQuest = currentHero.currentQuest;
      let newQuestProgress = newQuest.progress + 5 + Math.floor(Math.random() * 5);
      
      let suffix = "";
      let goldChange = 0;
      let expChange = 0;
      let isQuestUpdate = false; 

      if (newQuestProgress >= 100) {
        newQuestProgress = 0;
        const reward = Math.floor(Math.random() * 100) + 100;
        goldChange += reward; expChange += 100;
        
        setHero(h => h ? { ...h, attributes: {...h.attributes, intelligence: h.attributes.intelligence + 1} } : null);
        addLog(`【达成】完成 ${newQuest.name}`, 'highlight');
        addMessage('system', '任务完成', `完成【${newQuest.name}】，赏金 ${reward}，经验 +100。`);
        
        const q = generateQuest();
        newQuest = q;
        
        // ⚠️ 彻底修复：预先计算好 targetLocation，不使用 h 变量
        const targetLocation = getLocationByQuest(q.type, currentHero.level);
        newLocation = targetLocation;

        setTimeout(() => {
           // 这里的 h 是 setHero 的参数，只在 setHero 内部使用
           setHero(h => h ? { ...h, currentQuest: q, location: targetLocation } : null);
           // 这里直接使用预计算好的 targetLocation，不再试图访问 h
           addLog(`【新程】前往 ${targetLocation} 执行：${q.name}`, 'system');
        }, 1000);
      } else { isQuestUpdate = true; }

      if (currentHero.level >= 10 && currentHero.state === 'idle' && Math.random() < 0.15) newState = 'arena';
      else if (currentHero.inventory.length >= 15 && currentHero.state !== 'town') newState = 'town';
      else if (currentHero.state !== 'town' && Math.random() < 0.2) newState = currentHero.state === 'idle' ? 'fight' : 'idle';

      // 批量更新状态
      setHero(h => {
        if(!h) return null;
        const companion = h.companion;
        if (companion) { if (companion.buff.type === 'exp') expChange += companion.buff.val; }

        let finalH = { 
            ...h, state: newState, location: newLocation, storyStage: getStoryStage(h.level),
            currentQuest: { ...newQuest, progress: newQuestProgress >= 100 ? 0 : newQuestProgress },
            gold: h.gold + goldChange, exp: h.exp + expChange
        };

        if (finalH.state === 'fight' || finalH.state === 'arena') {
           const gainExp = 10 + Math.floor(h.level * 1.5);
           finalH.exp += gainExp;
           
           if (finalH.martialArts.length > 0) {
             const skill = finalH.martialArts[Math.floor(Math.random() * finalH.martialArts.length)];
             skill.exp += (finalH.attributes.intelligence * 0.5) + 5;
             if (skill.exp >= skill.maxExp) {
               skill.level++; skill.exp = 0; skill.maxExp = Math.floor(skill.maxExp * 1.2);
               addMessage('system', '武学精进', `【${skill.name}】突破到 ${skill.level} 层！`);
             }
           }
           if (finalH.state === 'arena') {
              let winRate = 0.4;
              if (companion?.buff.type === 'attack') winRate += 0.2;
              if (Math.random() < winRate) {
                 finalH.stats.arenaWins++; finalH.gold += 100;
                 addLog("【胜】险胜强敌！(声望+1)", "highlight");
              } else {
                 finalH.hp = Math.floor(finalH.hp * 0.6); addLog("【败】技不如人。(生命-40%)", "bad");
              }
              finalH.state = 'idle';
           }
        }
        else if (finalH.state === 'town') {
           const sellValue = finalH.inventory.reduce((acc, i) => acc + (i.price * i.count), 0);
           if (sellValue > 0) { finalH.gold += sellValue; finalH.inventory = []; addLog(`变卖行囊获利 ${sellValue} 文。`, 'system'); }
           if (finalH.gold > 50 && finalH.hp < finalH.maxHp) { finalH.gold -= 20; finalH.hp = finalH.maxHp; addLog("医馆疗伤。", 'system'); }
           finalH.state = 'idle';
        }
        else if (Math.random() < 0.15) { 
           const luck = finalH.attributes.luck + (companion?.buff.type === 'luck' ? companion.buff.val : 0);
           const loot = rollLoot(finalH.level, luck);
           if (loot) {
             const item = { ...loot, id: Date.now().toString(), count: 1 } as Item;
             if (item.type === 'consumable') {
                if (finalH.hp < finalH.maxHp) { finalH.hp = Math.min(finalH.maxHp, finalH.hp + 50); setTimeout(() => addLog(`服下${item.name}。(生命+50)`, 'system'), 200); }
                else { const idx = finalH.inventory.findIndex(i => i.name === item.name); if(idx>=0) finalH.inventory[idx].count++; else finalH.inventory.push(item); }
             } else {
                const idx = finalH.inventory.findIndex(i => i.name === item.name); if(idx>=0) finalH.inventory[idx].count++; else finalH.inventory.push(item);
                if (Math.random() < 0.5) suffix = `(获得: ${item.name})`;
             }
           }
        }

        if (finalH.exp >= finalH.maxExp) {
           finalH.level++; finalH.exp = 0; finalH.maxExp = Math.floor(finalH.maxExp * 1.5); finalH.maxHp += 30; finalH.hp = finalH.maxHp;
           finalH.majorEvents.unshift(`${new Date().toLocaleTimeString()} 突破至 Lv.${finalH.level}`);
           addMessage('system', '境界提升', `恭喜！突破至 Lv.${finalH.level}！`);
           addLog(`【境界突破】气冲斗牛，晋升 Lv.${finalH.level}！`, 'highlight');
        }
        return finalH;
      });

      const dice = Math.random();
      if (dice < 0.05) await triggerAI('generate_rumor');
      else if (isQuestUpdate && dice < 0.5) await triggerAI('quest_update', suffix); 
      else if (dice < 0.8) await triggerAI('auto', suffix);
      else {
         let list = STATIC_LOGS.idle;
         if (newState === 'fight') list = STATIC_LOGS.fight; else if (newState === 'town') list = STATIC_LOGS.town; else if (newState === 'arena') list = STATIC_LOGS.arena;
         let text = list[Math.floor(Math.random() * list.length)];
         if (!recentLogsRef.current.includes(text)) addLog(text + (suffix ? ` ${suffix}` : ''), 'system');
      }
      const nextTick = Math.floor(Math.random() * (120000 - 30000) + 30000); 
      timerRef.current = setTimeout(gameLoop, nextTick);
    };
    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading, error, clearError: () => setError(null), refreshTavern, hireCompanion };
}