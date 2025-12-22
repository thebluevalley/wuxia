import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QUEST_SOURCES, QuestType, PERSONALITIES, PET_TEMPLATES, ARENA_OPPONENTS, MAP_LOCATIONS, STORY_STAGES, WORLD_LORE } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  const recentLogsRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 辅助函数：根据等级获取当前的故事阶段
  const getStoryStage = (level: number) => {
    // 倒序查找，找到第一个符合等级要求的阶段
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
      storyStage: "初出茅庐", // 初始阶段
      attributes: { constitution: 10, strength: 10, dexterity: 10, intelligence: 10, luck: 10 },
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0, alignment: 0,
      location: getLocationByQuest(initialQuest.type),
      state: 'idle', 
      logs: [], inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      skills: [{ name: '太祖长拳', level: 1, type: 'martial', desc: '入门拳法' }], 
      lifeSkills: [{ name: '烹饪', level: 1, type: 'life', desc: '基础生存' }],
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: initialQuest,
      majorEvents: [`${new Date().toLocaleDateString()}：${name} 踏入江湖，立志扬名立万。`]
    };
    
    if (supabase) {
      let { data } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (!data) {
        const { data: created } = await supabase.from('profiles').insert({ username: name, data: newHero }).select().single();
        data = created;
      }
      const mergedData = { ...newHero, ...data.data };
      if (typeof mergedData.godPower === 'undefined') mergedData.godPower = 100;
      if (!mergedData.unlockedFeatures) mergedData.unlockedFeatures = [];
      if (typeof mergedData.currentQuest === 'string') mergedData.currentQuest = initialQuest;
      if (!mergedData.majorEvents) mergedData.majorEvents = [];
      // 兼容旧数据，更新故事阶段
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

  const triggerAI = async (eventType: string, action?: string) => {
    if (!hero) return false;
    try {
      // 构造极丰富的上下文，包含世界观和人生阶段
      const context = {
        ...hero,
        storyStage: getStoryStage(hero.level), // 确保阶段是最新的
        worldLore: WORLD_LORE,
        questInfo: `[${hero.currentQuest.type}]：${hero.currentQuest.name} (${hero.currentQuest.progress}%)`,
        petInfo: hero.pet ? `携带灵宠：${hero.pet.type}` : "无",
      };
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ context, eventType, userAction: action })
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.text) {
        addLog(data.text, eventType === 'god_action' ? 'highlight' : 'ai');
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const godAction = async (type: 'bless' | 'punish') => {
    if (!hero) return;
    if (hero.godPower < 25) {
      addLog("【神力不足】你的神力已耗尽，请等待恢复。", "system");
      return;
    }
    if (type === 'bless') {
      setHero(h => {
        if (!h) return null;
        const attrBoost = Math.random() < 0.2 ? 1 : 0;
        if (attrBoost) addLog("【神恩】体质得到了净化，体魄 +1", "highlight");
        return {
          ...h, hp: h.maxHp, alignment: Math.min(50, h.alignment + 5), godPower: h.godPower - 25,
          attributes: {...h.attributes, constitution: h.attributes.constitution + attrBoost}
        };
      });
      triggerAI('god_action', '赐福');
    } else {
      setHero(h => h ? {
        ...h, 
        hp: Math.max(1, h.hp - Math.floor(h.maxHp * 0.15)), 
        exp: h.exp + Math.floor(h.maxExp * 0.1),
        alignment: Math.max(-50, h.alignment - 5),
        godPower: h.godPower - 25
      } : null);
      triggerAI('god_action', '天罚');
    }
  };

  useEffect(() => {
    if (!hero) return;

    const gameLoop = async () => {
      // 1. 神力恢复
      setHero(h => h ? { ...h, godPower: Math.min(100, h.godPower + 5) } : null);

      // 2. 解锁检测
      let newFeatures = [...hero.unlockedFeatures];
      if (hero.level >= 3 && !newFeatures.includes('motto')) {
        newFeatures.push('motto');
        addLog("【境界提升】你领悟了人生真谛，解锁了「座右铭」！", "highlight");
      }
      if (hero.level >= 5 && !newFeatures.includes('pet')) {
        newFeatures.push('pet');
        addLog("【境界提升】你感到一阵孤独，解锁了「灵宠」系统！", "highlight");
      }
      if (hero.level >= 10 && !newFeatures.includes('arena')) {
        newFeatures.push('arena');
        addLog("【境界提升】你的大名传遍江湖，解锁了「竞技场」！", "highlight");
      }

      // 3. 宠物 & 竞技场
      let newPet = hero.pet;
      if (hero.level >= 5 && !hero.pet && Math.random() < 0.05) {
        const template = PET_TEMPLATES[Math.floor(Math.random() * PET_TEMPLATES.length)];
        newPet = { name: template.type, type: template.type, level: 1, desc: template.desc };
        addLog(`【奇遇】路边捡到一只流浪的${newPet.type}，决定收养它。`, "highlight");
      }

      let newState = hero.state;
      if (hero.level >= 10 && hero.state === 'idle' && Math.random() < 0.1) {
         newState = 'arena';
         const opponent = ARENA_OPPONENTS[Math.floor(Math.random() * ARENA_OPPONENTS.length)];
         addLog(`【竞技场】遇到了对手「${opponent}」，大战一触即发！`, "highlight");
      } else if (hero.state === 'arena') {
         if (Math.random() > 0.4) { 
           addLog("【竞技胜利】险胜对手，获得了大量声望和金币！", "highlight");
           setHero(h => h ? { ...h, gold: h.gold + 50, stats: {...h.stats, arenaWins: (h.stats.arenaWins || 0) + 1} } : null);
         } else {
           addLog("【竞技失败】技不如人，被打得鼻青脸肿...", "bad");
           setHero(h => h ? { ...h, hp: Math.floor(h.hp * 0.5) } : null);
         }
         newState = 'idle';
      } else if (hero.state !== 'town' && Math.random() < 0.15) {
          newState = hero.state === 'idle' ? 'fight' : 'idle';
      }

      // 4. 任务进度
      let newQuestProgress = hero.currentQuest.progress + 5 + Math.floor(Math.random() * 5);
      let newQuest = hero.currentQuest;
      let newLocation = hero.location;
      
      if (newQuestProgress >= 100) {
        newQuestProgress = 0;
        const reward = Math.floor(Math.random() * 50) + 20;
        setHero(h => h ? { ...h, attributes: {...h.attributes, intelligence: h.attributes.intelligence + 1} } : null);
        addLog(`【任务完成】${hero.currentQuest.name} 达成！阅历增加，悟性 +1。`, 'highlight');
        
        newQuest = generateQuest();
        newLocation = getLocationByQuest(newQuest.type);
        setTimeout(() => addLog(`【新旅程】前往「${newLocation}」执行委托：${newQuest.name}`, 'system'), 1000);
      }

      // 5. 更新状态
      setHero(h => {
        if(!h) return null;
        let finalH = { 
            ...h, 
            unlockedFeatures: newFeatures, 
            pet: newPet, 
            state: newState,
            location: newLocation,
            storyStage: getStoryStage(h.level), // 更新人生阶段
            currentQuest: { ...newQuest, progress: newQuestProgress >= 100 ? 0 : newQuestProgress },
            gold: newQuestProgress >= 100 ? h.gold + 30 : h.gold
        };

        if ((finalH.state === 'fight' || finalH.state === 'arena') && Math.random() < 0.05) {
           const isStr = Math.random() > 0.5;
           if (isStr) {
             finalH.attributes.strength += 1;
             setTimeout(() => addLog("【顿悟】经过一番苦战，臂力 +1", "highlight"), 500);
           } else {
             finalH.attributes.dexterity += 1;
             setTimeout(() => addLog("【顿悟】身法变得更加灵动了，身法 +1", "highlight"), 500);
           }
        }

        if (finalH.inventory.length >= 20 && finalH.state !== 'town') {
             finalH.state = 'town';
             addLog("行囊已满，少侠回城销赃。", "system");
        } else if (finalH.state === 'town') {
             const totalGold = finalH.inventory.reduce((acc, item) => acc + (item.price * item.count), 0);
             if (totalGold > 0) {
                addLog(`在集市变卖杂物，获利 ${totalGold} 文。`, "highlight");
                finalH.inventory = [];
                finalH.gold += totalGold;
             }
             finalH.state = 'idle';
        }

        if (finalH.state !== 'town' && Math.random() < 0.05) {
           const template = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
           const newItem: Item = { 
             id: Date.now().toString(), 
             name: template.name!, desc: template.desc!, quality: 'common', 
             type: template.type as ItemType, count: 1, price: template.price || 1
           };
           const luckBonus = finalH.attributes.luck * 0.01;
           if (Math.random() < luckBonus) {
               addLog("【福源深厚】运气爆发，发现了隐藏的宝物！", "highlight");
           }

           if (newItem.type !== 'misc' && !finalH.equipment[newItem.type as keyof Equipment]) {
              finalH.equipment = { ...finalH.equipment, [newItem.type]: newItem };
              setTimeout(() => addLog(`捡到【${newItem.name}】，正好能用，穿上了。`, 'highlight'), 500);
           } else {
              const idx = finalH.inventory.findIndex(i => i.name === newItem.name);
              if (idx >= 0) finalH.inventory[idx].count++;
              else finalH.inventory.push(newItem);
              if (idx < 0) setTimeout(() => addLog(`获得：${newItem.name}`, 'normal'), 500);
           }
        }
        
        if (finalH.exp >= finalH.maxExp) {
           finalH.level++; finalH.exp = 0; finalH.maxExp = Math.floor(finalH.maxExp * 1.5);
           finalH.maxHp += 20; finalH.hp = finalH.maxHp;
           finalH.attributes.constitution++;
           finalH.attributes.strength++;
           finalH.attributes.dexterity++;
           finalH.attributes.intelligence++;
           finalH.attributes.luck++;
           const event = `【${new Date().toLocaleTimeString()}】境界突破至 Lv.${finalH.level}，全属性提升！`;
           finalH.majorEvents = [event, ...finalH.majorEvents]; 
           addLog(event, 'highlight');
        }
        return finalH;
      });

      // 6. AI 判定 (提升到 60% 概率，增加文学内容)
      const dice = Math.random();
      let aiTriggered = false;
      if (dice < 0.6) aiTriggered = await triggerAI('auto'); // 提高 AI 频率

      if (!aiTriggered) {
         let list = STATIC_LOGS.idle;
         if (newState === 'fight') list = STATIC_LOGS.fight;
         else if (newState === 'town') list = STATIC_LOGS.town;
         else if (newState === 'arena') list = STATIC_LOGS.arena || STATIC_LOGS.fight;
         let text = list[Math.floor(Math.random() * list.length)];
         if (!recentLogsRef.current.includes(text)) addLog(text);
      }

      const nextTick = Math.floor(Math.random() * (180000 - 30000) + 30000); 
      timerRef.current = setTimeout(gameLoop, nextTick);
    };

    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading };
}