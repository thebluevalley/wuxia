import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QUEST_SOURCES, QuestType, PERSONALITIES, PET_TEMPLATES, ARENA_OPPONENTS, MAP_LOCATIONS, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  const recentLogsRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const getLocationByQuest = (questType: QuestType): string => {
    const locations = MAP_LOCATIONS[questType] || MAP_LOCATIONS.common;
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const getInitialSkills = (): Skill[] => [{ name: "太祖长拳", type: 'attack', level: 1, exp: 0, maxExp: 100, desc: "江湖流传最广的入门拳法" }];
  const getInitialLifeSkills = (): Skill[] => [{ name: "包扎", type: 'medical', level: 1, exp: 0, maxExp: 100, desc: "简单的伤口处理" }];

  const login = async (name: string) => {
    setLoading(true);
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
      location: getLocationByQuest(initialQuest.type),
      state: 'idle', 
      logs: [], messages: [], majorEvents: [`${new Date().toLocaleDateString()}：${name} 踏入江湖。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: getInitialSkills(),
      lifeSkills: getInitialLifeSkills(),
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: initialQuest,
    };
    
    if (supabase) {
      let { data } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (!data) {
        const { data: created } = await supabase.from('profiles').insert({ username: name, data: newHero }).select().single();
        data = created;
      }
      const mergedData = { ...newHero, ...data.data };
      if (!mergedData.martialArts) mergedData.martialArts = getInitialSkills();
      if (!mergedData.lifeSkills) mergedData.lifeSkills = getInitialLifeSkills();
      if (!mergedData.messages) mergedData.messages = []; // 兼容旧号
      mergedData.storyStage = getStoryStage(mergedData.level);
      
      if (data) setHero(mergedData);
    } else {
      setHero(newHero);
    }
    setLoading(false);
  };

  const addLog = (text: string, type: LogEntry['type'] = 'normal') => {
    recentLogsRef.current = [text, ...recentLogsRef.current].slice(0, 5);
    setHero(prev => {
      if (!prev) return null;
      const newLog = { 
        id: Date.now().toString(), text, type, 
        time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) 
      };
      return { ...prev, logs: [...prev.logs, newLog].slice(-50) };
    });
  };

  // ⚠️ 新增：添加消息（传闻/系统）
  const addMessage = (type: 'rumor' | 'system', title: string, content: string) => {
    setHero(prev => {
      if (!prev) return null;
      const newMsg: Message = {
        id: Date.now().toString(),
        type, title, content,
        time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}),
        isRead: false
      };
      // 保留最近 50 条消息
      return { ...prev, messages: [newMsg, ...prev.messages].slice(0, 50) };
    });
  };

  const triggerAI = async (eventType: string, action?: string) => {
    if (!hero) return false;
    try {
      const bestSkill = hero.martialArts.sort((a,b) => b.level - a.level)[0];
      const context = {
        ...hero,
        storyStage: getStoryStage(hero.level),
        worldLore: WORLD_LORE,
        questInfo: `[${hero.currentQuest.type}] ${hero.currentQuest.name} (${hero.currentQuest.progress}%)`,
        petInfo: hero.pet ? `携带${hero.pet.type}` : "无",
        skillInfo: `擅长${bestSkill.name}(Lv.${bestSkill.level})`, 
      };
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ context, eventType, userAction: action })
      });
      if (!res.ok) return false;
      const data = await res.json();
      
      if (data.text) {
        // 如果是传闻，添加到消息列表
        if (eventType === 'generate_rumor') {
           // 简单的正则尝试提取标题，如果 AI 没按格式返回，就用默认标题
           let title = "江湖风声";
           let content = data.text;
           if (data.text.includes("：")) {
             const parts = data.text.split("：");
             title = parts[0].length < 10 ? parts[0] : "江湖风声";
             content = parts.slice(1).join("：");
           }
           addMessage('rumor', title, content);
        } else {
           // 普通日志
           addLog(data.text, eventType === 'god_action' ? 'highlight' : 'normal');
        }
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const godAction = async (type: 'bless' | 'punish') => {
    if (!hero) return;
    if (hero.godPower < 25) {
      addLog("【神力不足】请等待神力自然恢复。", "system");
      return;
    }
    if (type === 'bless') {
      setHero(h => h ? {...h, hp: h.maxHp, godPower: h.godPower - 25} : null);
      triggerAI('god_action', '赐福');
    } else {
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 20), exp: h.exp + 50, godPower: h.godPower - 25} : null);
      triggerAI('god_action', '天罚');
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
      let goldChange = 0;
      let expChange = 0;

      // 任务完成 -> 系统消息
      if (newQuestProgress >= 100) {
        newQuestProgress = 0;
        const reward = Math.floor(Math.random() * 50) + 30;
        goldChange += reward;
        expChange += 50;
        setHero(h => h ? { ...h, attributes: {...h.attributes, intelligence: h.attributes.intelligence + 1} } : null);
        
        addLog(`【委托达成】完成 ${newQuest.name}`, 'highlight');
        addMessage('system', '任务完成', `成功完成【${newQuest.name}】，获得赏金 ${reward} 文，经验 +50，悟性 +1。`);
        
        newQuest = generateQuest();
        newLocation = getLocationByQuest(newQuest.type);
        setTimeout(() => addLog(`【新程】前往 ${newLocation} 执行：${newQuest.name}`, 'system'), 1000);
      }

      if (hero.level >= 10 && hero.state === 'idle' && Math.random() < 0.15) {
         newState = 'arena';
      } else if (hero.inventory.length >= 15 && hero.state !== 'town') {
         newState = 'town';
      } else if (hero.state !== 'town' && Math.random() < 0.2) {
         newState = hero.state === 'idle' ? 'fight' : 'idle';
      }

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
           if (finalH.martialArts.length > 0) {
             const skillIdx = Math.floor(Math.random() * finalH.martialArts.length);
             const skill = finalH.martialArts[skillIdx];
             skill.exp += (finalH.attributes.intelligence * 0.5) + 2;
             if (skill.exp >= skill.maxExp) {
               skill.level++; skill.exp = 0; skill.maxExp = Math.floor(skill.maxExp * 1.2);
               // 技能升级 -> 系统消息
               addMessage('system', '武学精进', `你的【${skill.name}】突破到了第 ${skill.level} 层！`);
               setTimeout(() => addLog(`【武学突破】${skill.name} 晋升至 ${skill.level} 层！`, 'highlight'), 500);
             }
           }
           if (finalH.state === 'arena') {
              if (Math.random() > 0.4) {
                 finalH.stats.arenaWins++; finalH.gold += 50;
                 addLog("【胜】险胜强敌，名声大噪！", "highlight");
              } else {
                 finalH.hp = Math.floor(finalH.hp * 0.6);
                 addLog("【败】技不如人，被打得鼻青脸肿。", "bad");
              }
              finalH.state = 'idle';
           }
        }

        // 城镇逻辑
        if (finalH.state === 'town') {
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
                 addLog(`斥资 300 文购得【${newSkillName}】秘籍，开始修习！`, 'highlight');
                 addMessage('system', '习得神功', `花费重金购得【${newSkillName}】，江湖路远，技多不压身。`);
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
                 setTimeout(() => addLog(`捡到${newItem.name}服下，伤势好转。`, 'system'), 200);
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
              if (Math.random() < 0.5) setTimeout(() => addLog(`获得：${newItem.name}`, 'normal'), 500);
           }
        }

        // 升级 -> 系统消息
        if (finalH.exp >= finalH.maxExp) {
           finalH.level++; finalH.exp = 0; finalH.maxExp = Math.floor(finalH.maxExp * 1.5);
           finalH.maxHp += 30; finalH.hp = finalH.maxHp;
           Object.keys(finalH.attributes).forEach(k => finalH.attributes[k as keyof typeof finalH.attributes]++);
           finalH.majorEvents.unshift(`${new Date().toLocaleTimeString()} 突破至 Lv.${finalH.level}`);
           
           addMessage('system', '境界提升', `恭喜！你的境界突破至 Lv.${finalH.level}，全属性提升！`);
           addLog(`【境界突破】气冲斗牛，晋升 Lv.${finalH.level}！`, 'highlight');
        }

        return finalH;
      });

      // AI 触发逻辑
      const dice = Math.random();
      // 5% 概率触发江湖传闻 (低频)
      if (dice < 0.05) {
         await triggerAI('generate_rumor');
      } 
      // 60% 概率触发普通日志
      else if (dice < 0.65) {
         await triggerAI('auto');
      }
      else {
         let list = STATIC_LOGS.idle;
         if (newState === 'fight') list = STATIC_LOGS.fight;
         else if (newState === 'town') list = STATIC_LOGS.town;
         else if (newState === 'arena') list = STATIC_LOGS.arena;
         let text = list[Math.floor(Math.random() * list.length)];
         if (!recentLogsRef.current.includes(text)) addLog(text, 'system');
      }

      const nextTick = Math.floor(Math.random() * (120000 - 30000) + 30000); 
      timerRef.current = setTimeout(gameLoop, nextTick);
    };

    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading };
}