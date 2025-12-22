import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QUEST_SOURCES, QuestType, PERSONALITIES, PET_TEMPLATES, ARENA_OPPONENTS, WORLD_MAP, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recentLogsRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // ⚠️ 核心：根据等级和任务类型筛选地图
  const getLocationByQuest = (questType: QuestType, level: number): string => {
    // 1. 筛选符合等级范围的地点 (当前等级 >= 地点最低等级)
    // 为了防止高级别后不去低级图，我们设定一个范围：MinLv <= CurrentLv <= MinLv + 30
    const availableMaps = WORLD_MAP.filter(m => level >= m.minLv && level <= m.minLv + 40);
    
    // 2. 优先匹配任务类型
    const typeMatches = availableMaps.filter(m => m.type === questType);
    
    // 3. 如果有匹配类型的，从中随机；否则从所有符合等级的里面随机
    const pool = typeMatches.length > 0 ? typeMatches : availableMaps;
    
    // 兜底
    if (pool.length === 0) return "荒野古道";
    return pool[Math.floor(Math.random() * pool.length)].name;
  };

  const getInitialSkills = (): Skill[] => [{ name: "太祖长拳", type: 'attack', level: 1, exp: 0, maxExp: 100, desc: "江湖流传最广的入门拳法" }];
  const getInitialLifeSkills = (): Skill[] => [{ name: "包扎", type: 'medical', level: 1, exp: 0, maxExp: 100, desc: "简单的伤口处理" }];

  const login = async (name: string, password: string) => {
    setLoading(true);
    setError(null);

    const gender = Math.random() > 0.5 ? '男' : '女';
    const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    const initialQuest = generateQuest();
    const newHero: HeroState = {
      name, level: 1, gender, age: 16, 
      personality, title: "初出茅庐",
      motto: "莫欺少年穷", 
      godPower: 100,      
      unlockedFeatures: [],
      pet: null,
      storyStage: "初出茅庐",
      attributes: { constitution: 10, strength: 10, dexterity: 10, intelligence: 10, luck: 10 },
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0, alignment: 0,
      location: "牛家村", // 初始必定是牛家村
      state: 'idle', 
      logs: [], messages: [], majorEvents: [`${new Date().toLocaleDateString()}：${name} 踏入江湖。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: getInitialSkills(),
      lifeSkills: getInitialLifeSkills(),
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: initialQuest,
    };

    if (!supabase) {
      setHero(newHero);
      setLoading(false);
      setTimeout(() => triggerAI('start_game', undefined, undefined, newHero), 500);
      return;
    }

    try {
      let { data: user } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (user) {
        if (user.password !== password) {
          setError("密令错误！"); setLoading(false); return;
        }
        const mergedData = { ...newHero, ...user.data };
        if (!mergedData.martialArts) mergedData.martialArts = getInitialSkills();
        mergedData.storyStage = getStoryStage(mergedData.level);
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
    saveTimeoutRef.current = setTimeout(async () => {
      await supabase.from('profiles').update({ data: hero }).eq('username', hero.name);
    }, 5000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [hero]);

  const addLog = (text: string, type: LogEntry['type'] = 'normal') => {
    recentLogsRef.current = [text, ...recentLogsRef.current].slice(0, 3);
    setHero(prev => {
      if (!prev) return null;
      const newLog = { 
        id: Date.now().toString(), text, type, 
        time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) 
      };
      return { ...prev, logs: [...prev.logs, newLog].slice(-50) };
    });
  };

  const addMessage = (type: 'rumor' | 'system', title: string, content: string) => {
    setHero(prev => {
      if (!prev) return null;
      const newMsg: Message = { id: Date.now().toString(), type, title, content, time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}), isRead: false };
      return { ...prev, messages: [newMsg, ...prev.messages].slice(0, 50) };
    });
  };

  // ⚠️ 升级：支持 suffix (数值变动)
  const triggerAI = async (eventType: string, suffix: string = "", action?: string, explicitHero?: HeroState) => {
    const currentHero = explicitHero || hero;
    if (!currentHero) return false;
    
    try {
      const bestSkill = currentHero.martialArts.sort((a,b) => b.level - a.level)[0];
      // 检查上一条日志长度，决定本次长短
      const lastLogLength = recentLogsRef.current[0]?.length || 0;
      
      const context = {
        ...currentHero,
        storyStage: getStoryStage(currentHero.level),
        worldLore: WORLD_LORE,
        questInfo: `[${currentHero.currentQuest.type}] ${currentHero.currentQuest.name} (${currentHero.currentQuest.progress}%)`,
        petInfo: currentHero.pet ? `携带${currentHero.pet.type}` : "无",
        skillInfo: `擅长${bestSkill?.name || '乱拳'}(Lv.${bestSkill?.level || 1})`,
        recentLogs: recentLogsRef.current,
        // 传递给后端控制节奏
        lastLogLen: lastLogLength 
      };
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ context, eventType, userAction: action })
      });
      if (!res.ok) return false;
      const data = await res.json();
      
      if (data.text) {
        if (eventType === 'generate_rumor') {
           let title = "江湖风声";
           let content = data.text;
           if (data.text.includes("：")) {
             const parts = data.text.split("：");
             title = parts[0].length < 15 ? parts[0] : "江湖风声";
             content = parts.slice(1).join("：");
           }
           addMessage('rumor', title, content);
        } else {
           // ⚠️ 核心：将 AI 文本 + 数值变动 拼接
           const fullText = suffix ? `${data.text} ${suffix}` : data.text;
           addLog(fullText, eventType === 'god_action' || eventType === 'start_game' ? 'highlight' : 'normal');
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
      triggerAI('god_action', '(HP恢复)');
    } else {
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 20), exp: h.exp + 50, godPower: h.godPower - 25} : null);
      triggerAI('god_action', '(经验 +50)');
    }
  };

  useEffect(() => {
    if (!hero) return;

    const gameLoop = async () => {
      setHero(h => h ? { ...h, godPower: Math.min(100, h.godPower + 5) } : null);

      let newState = hero.state;
      let newLocation = hero.location;
      let newQuest = hero.currentQuest;
      let newQuestProgress = newQuest.progress + 5 + Math.floor(Math.random() * 5);
      
      // ⚠️ 状态变动记录，用于生成 suffix
      let suffix = "";
      let goldChange = 0;
      let expChange = 0;
      let isQuestUpdate = false; 

      if (newQuestProgress >= 100) {
        newQuestProgress = 0;
        const reward = Math.floor(Math.random() * 50) + 30;
        goldChange += reward;
        expChange += 100;
        
        // 升级悟性
        setHero(h => h ? { ...h, attributes: {...h.attributes, intelligence: h.attributes.intelligence + 1} } : null);
        addLog(`【委托达成】完成 ${newQuest.name}`, 'highlight');
        addMessage('system', '任务完成', `成功完成【${newQuest.name}】，获得赏金 ${reward} 文，经验 +100，悟性 +1。`);
        
        newQuest = generateQuest();
        newLocation = getLocationByQuest(newQuest.type, hero.level); // ⚠️ 传入等级
        setTimeout(() => addLog(`【新程】前往「${newLocation}」执行：${newQuest.name}`, 'system'), 1000);
      } else {
        isQuestUpdate = true;
      }

      if (hero.level >= 10 && hero.state === 'idle' && Math.random() < 0.15) newState = 'arena';
      else if (hero.inventory.length >= 15 && hero.state !== 'town') newState = 'town';
      else if (hero.state !== 'town' && Math.random() < 0.2) newState = hero.state === 'idle' ? 'fight' : 'idle';

      setHero(h => {
        if(!h) return null;
        let finalH = { 
            ...h, 
            state: newState, location: newLocation,
            storyStage: getStoryStage(h.level),
            currentQuest: { ...newQuest, progress: newQuestProgress >= 100 ? 0 : newQuestProgress },
            gold: h.gold + goldChange,
            exp: h.exp + expChange
        };

        // 战斗逻辑
        if (finalH.state === 'fight' || finalH.state === 'arena') {
           // 经验增长
           const gainExp = 10 + Math.floor(h.level * 1.5);
           finalH.exp += gainExp;
           
           if (Math.random() < 0.3) {
              suffix = `(经验 +${gainExp})`; // 记录后缀
           }

           if (finalH.martialArts.length > 0) {
             const skillIdx = Math.floor(Math.random() * finalH.martialArts.length);
             const skill = finalH.martialArts[skillIdx];
             skill.exp += (finalH.attributes.intelligence * 0.5) + 5;
             if (skill.exp >= skill.maxExp) {
               skill.level++; skill.exp = 0; skill.maxExp = Math.floor(skill.maxExp * 1.2);
               addMessage('system', '武学精进', `你的【${skill.name}】突破到了第 ${skill.level} 层！`);
               setTimeout(() => addLog(`【突破】${skill.name} 晋升至 ${skill.level} 层！`, 'highlight'), 500);
             }
           }
           if (finalH.state === 'arena') {
              if (Math.random() > 0.4) {
                 finalH.stats.arenaWins++; finalH.gold += 50;
                 addLog("【胜】险胜强敌，名声大噪！(声望+1)", "highlight");
              } else {
                 finalH.hp = Math.floor(finalH.hp * 0.6);
                 addLog("【败】技不如人，鼻青脸肿。(生命-40%)", "bad");
              }
              finalH.state = 'idle';
           }
        }

        // 城镇逻辑
        else if (finalH.state === 'town') {
           const sellValue = finalH.inventory.reduce((acc, i) => acc + (i.price * i.count), 0);
           if (sellValue > 0) {
             finalH.gold += sellValue; finalH.inventory = [];
             addLog(`在集市变卖行囊，获利 ${sellValue} 文。`, 'system');
           }
           if (finalH.gold > 50 && finalH.hp < finalH.maxHp) {
              finalH.gold -= 20; finalH.hp = finalH.maxHp;
              addLog("花费 20 文在医馆疗伤，精神焕发。", 'system');
           }
           if (finalH.gold > 300 && Math.random() < 0.2) {
              finalH.gold -= 300;
              const newSkillName = SKILL_LIBRARY.inner[Math.floor(Math.random() * SKILL_LIBRARY.inner.length)];
              if (!finalH.martialArts.find(s => s.name === newSkillName)) {
                 finalH.martialArts.push({ name: newSkillName, type: 'inner', level: 1, exp: 0, maxExp: 100, desc: "重金购得的秘籍" });
                 addMessage('system', '习得神功', `花费重金购得【${newSkillName}】。`);
                 finalH.majorEvents.unshift(`${new Date().toLocaleTimeString()} 习得 ${newSkillName}`);
              }
           }
           finalH.state = 'idle';
        }
        
        // 掉落逻辑
        else if (Math.random() < 0.15) { 
           const template = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
           const newItem: Item = { id: Date.now().toString(), name: template.name!, desc: template.desc!, quality: 'common', type: template.type as ItemType, count: 1, price: template.price || 1 };
           
           if (newItem.type === 'consumable') {
              if (finalH.hp < finalH.maxHp) {
                 finalH.hp = Math.min(finalH.maxHp, finalH.hp + 50);
                 setTimeout(() => addLog(`服下${newItem.name}，伤势好转。(生命+50)`, 'system'), 200);
              } else {
                 const idx = finalH.inventory.findIndex(i => i.name === newItem.name);
                 if (idx >= 0) finalH.inventory[idx].count++; else finalH.inventory.push(newItem);
              }
           } 
           else if (newItem.type !== 'misc' && newItem.type !== 'book' && !finalH.equipment[newItem.type as keyof Equipment]) {
              finalH.equipment = { ...finalH.equipment, [newItem.type]: newItem };
              addMessage('system', '获得装备', `捡到了【${newItem.name}】，立即装备上了。`);
              setTimeout(() => addLog(`获得装备【${newItem.name}】。`, 'highlight'), 500);
           } else {
              const idx = finalH.inventory.findIndex(i => i.name === newItem.name);
              if (idx >= 0) finalH.inventory[idx].count++; else finalH.inventory.push(newItem);
              // 50% 概率追加到 AI 日志后缀
              if (Math.random() < 0.5) suffix = `(获得: ${newItem.name})`;
           }
        }

        // 升级
        if (finalH.exp >= finalH.maxExp) {
           finalH.level++; finalH.exp = 0; finalH.maxExp = Math.floor(finalH.maxExp * 1.5);
           finalH.maxHp += 30; finalH.hp = finalH.maxHp;
           Object.keys(finalH.attributes).forEach(k => finalH.attributes[k as keyof typeof finalH.attributes]++);
           finalH.majorEvents.unshift(`${new Date().toLocaleTimeString()} 突破至 Lv.${finalH.level}`);
           addMessage('system', '境界提升', `恭喜！你的境界突破至 Lv.${finalH.level}！`);
           addLog(`【境界突破】气冲斗牛，晋升 Lv.${finalH.level}！`, 'highlight');
        }

        return finalH;
      });

      const dice = Math.random();
      if (dice < 0.05) await triggerAI('generate_rumor');
      else if (isQuestUpdate && dice < 0.5) await triggerAI('quest_update', suffix); // 传入 suffix
      else if (dice < 0.8) await triggerAI('auto', suffix);
      else {
         let list = STATIC_LOGS.idle;
         if (newState === 'fight') list = STATIC_LOGS.fight;
         else if (newState === 'town') list = STATIC_LOGS.town;
         else if (newState === 'arena') list = STATIC_LOGS.arena;
         let text = list[Math.floor(Math.random() * list.length)];
         if (!recentLogsRef.current.includes(text)) addLog(text + (suffix ? ` ${suffix}` : ''), 'system');
      }

      const nextTick = Math.floor(Math.random() * (120000 - 30000) + 30000); 
      timerRef.current = setTimeout(gameLoop, nextTick);
    };

    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading, error, clearError: () => setError(null) };
}