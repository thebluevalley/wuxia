import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QuestCategory, Quest, QuestRank, Faction, MAIN_SAGA, SIDE_QUESTS, STORY_STAGES, WORLD_LORE, SKILL_LIBRARY, Skill, Message, Quality, NPC_NAMES_MALE, NPC_NAMES_FEMALE, NPC_NAMES_LAST, NPC_ARCHETYPES, NPC_TRAITS, Companion, WORLD_MAP } from '@/app/lib/constants';

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
  if (stamina < 20) tags.add("力竭");
  if (gold > 10000) tags.add("富有");
  if (attributes.strength > 20) tags.add("强壮");
  
  const weaponName = equipment.weapon?.name || "";
  if (weaponName.includes("剑")) tags.add("剑客");
  else if (!equipment.weapon) tags.add("空手");

  return Array.from(tags).slice(0, 10);
};

// ⚠️ 核心重构：生成任务板 (包含主线)
const generateQuestBoard = (hero: HeroState): Quest[] => {
  const quests: Quest[] = [];
  const { level, mainStoryIndex, location } = hero;

  // 1. 检查是否有可用的主线任务
  if (mainStoryIndex < MAIN_SAGA.length) {
      const saga = MAIN_SAGA[mainStoryIndex];
      // 只有等级达到要求才显示主线
      if (level >= (saga.reqLevel || 1)) {
          quests.push({
              id: `main_${mainStoryIndex}`,
              name: `【主线】${saga.title}`,
              category: 'main',
              rank: 5, // 主线总是最高星级
              faction: 'neutral', // 或根据 saga.faction
              script: {
                  title: saga.title,
                  description: saga.desc,
                  objective: saga.obj,
                  antagonist: saga.antagonist,
                  twist: saga.twist,
                  npc: saga.npc
              },
              desc: `(关键剧情) ${saga.desc}`,
              stage: 'start',
              progress: 0,
              total: 500 + (mainStoryIndex * 200), // 主线进度条更长
              reqLevel: saga.reqLevel || 1,
              staminaCost: 30, // 主线消耗大
              rewards: { gold: 500 + (mainStoryIndex * 200), exp: 1000 + (mainStoryIndex * 500) }
          });
      }
  }

  // 2. 填充支线任务 (Side Quests)
  const locationKey = SIDE_QUESTS[location as keyof typeof SIDE_QUESTS] ? location : "default";
  // @ts-ignore
  const sidePool = SIDE_QUESTS[locationKey] || SIDE_QUESTS["default"];

  const fillCount = 3 - quests.length; // 补足3个任务
  for (let i = 0; i < fillCount; i++) {
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
          total: rank * 150,
          reqLevel: Math.max(1, level - 2),
          staminaCost: rank * 10,
          rewards: { gold: rank * 50, exp: rank * 80 }
      });
  }

  return quests;
};

const getLocationByQuest = (questType: any, level: number): string => {
  return "荒野"; // 简化逻辑
};

const getInitialSkills = (): Skill[] => [{ name: "基础剑术", type: 'combat', level: 1, exp: 0, maxExp: 100, desc: "维斯特洛通用的防身剑术" }];
const getInitialLifeSkills = (): Skill[] => [{ name: "伤口处理", type: 'survival', level: 1, exp: 0, maxExp: 100, desc: "在乱世中活下去的必备技能" }];

const generateVisitors = (): Companion[] => {
  const visitors: Companion[] = [];
  // ... (保留原有生成逻辑，简化展示)
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
    const initialStage = "私生子";
    
    // 初始化英雄
    const newHero: HeroState = {
      name, level: 1, gender: '男', age: 16, 
      personality: "坚韧", title: initialStage, motto: "凡人皆有一死", godPower: 100, unlockedFeatures: [], 
      pet: null, storyStage: initialStage,
      mainStoryIndex: 0, // ⚠️ 从第0章开始
      attributes: { constitution: 10, strength: 10, dexterity: 10, intelligence: 10, luck: 10 },
      stamina: 120, maxStamina: 120,
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 200, 
      alignment: 0, location: "临冬城", state: 'idle', 
      logs: [{ id: "init", text: "北境的寒风凛冽，你裹紧了破旧的斗篷，望着灰暗的天空，心中知道——凛冬将至。", type: "highlight", time: "00:00" }], 
      messages: [], majorEvents: [`${new Date().toLocaleDateString()}：${name} 踏入维斯特洛。`],
      inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      martialArts: getInitialSkills(), lifeSkills: getInitialLifeSkills(),
      stats: { kills: 0, days: 1, arenaWins: 0 },
      currentQuest: null, queuedQuest: null, 
      questBoard: [], // 稍后生成
      lastQuestRefresh: 0, 
      tavern: { visitors: [], lastRefresh: 0 },
      companion: null, companionExpiry: 0,
      reputation: { stark: 0, lannister: 0, targaryen: 0, baratheon: 0, watch: 0, wildling: 0, citadel: 0, neutral: 0, faith: 0 },
      narrativeHistory: "凛冬将至。",
      tags: ["私生子"], 
      actionCounts: { kills: 0, retreats: 0, gambles: 0, charity: 0, betrayals: 0, shopping: 0, drinking: 0 },
      description: "一个默默无闻的私生子。",
      equipmentDescription: "一身布衣。" 
    };
    
    // 生成初始任务板
    newHero.questBoard = generateQuestBoard(newHero);

    if (!supabase) { setHero(newHero); setLoading(false); setTimeout(() => triggerAI('start_game', undefined, undefined, newHero), 500); return; }

    try {
      let { data: user } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (user) {
        if (user.password !== password) { setError("密令错误！"); setLoading(false); return; }
        const mergedData = { ...newHero, ...user.data };
        // 修复老数据可能缺少的字段
        if (mergedData.mainStoryIndex === undefined) mergedData.mainStoryIndex = 0;
        
        // 刷新任务板以显示主线
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
    
    // ⚠️ 如果是主线任务，直接改变当前位置到剧情发生地
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
        location: newLocation // 瞬移到剧情点
    } : null);
    
    addMessage('system', '誓言', `接受委托：${quest.name}`);
    triggerAI('quest_start', '', 'accept', { ...hero, queuedQuest: quest, location: newLocation }); 
  };

  // ... (hireCompanion 保持不变) ...
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
    const companionInfo = (showCompanion && currentHero.companion) ? `伙伴:${currentHero.companion.title} ${currentHero.companion.name}` : "独行";
    
    // ⚠️ 注入更多原著上下文
    const mainSagaInfo = currentHero.mainStoryIndex < MAIN_SAGA.length 
        ? `当前篇章: ${MAIN_SAGA[currentHero.mainStoryIndex].title}` 
        : "传说终章";

    try {
      const context = { 
        ...currentHero, 
        storyStage: getStoryStage(currentHero.level), 
        worldLore: WORLD_LORE, 
        mainSaga: mainSagaInfo,
        questScript: currentHero.currentQuest?.script || currentHero.queuedQuest?.script, 
        questStage: currentHero.currentQuest?.stage,
        companionInfo: companionInfo, 
        narrativeHistory: currentHero.narrativeHistory,
        tags: currentHero.tags || [],
        equipment: currentHero.equipment
      };
      const res = await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ context, eventType, userAction: action }) });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.text) {
        if (eventType.includes('generate_')) {
            // handle description updates
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
        addLog("风雪太大了，你看不清前方的路...", "highlight");
    }
    return false;
  };

  // ... (godAction, autoManageInventory, 保持不变) ...
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
    // ... (Inventory logic omitted for brevity, keep existing logic) ...
    // 假设这里保留原有的装备/吃药逻辑
    
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
      
      if (newQuest) {
        // Quest Progression Logic ...
        if (newQuest.progress === 0 && newQuest.stage === 'start') {
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

           // ⚠️ 主线完成逻辑：推进篇章
           if (newQuest.category === 'main') {
               managedHero.mainStoryIndex += 1;
               addMessage('system', '史诗', `【${newQuest.name}】篇章结束。新的命运已开启。`);
               // 强制刷新任务板，出现下一章主线
               managedHero.questBoard = generateQuestBoard(managedHero);
           }

           if (queued) {
             // ... queue logic
             newQuest = queued;
             queued = null;
             managedHero.state = 'fight'; 
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
             newQuest = queued; queued = null;
             managedHero.currentQuest = newQuest; managedHero.queuedQuest = queued;
             managedHero.state = 'fight'; 
             aiEvent = 'quest_start';
         } else if (Math.random() < 0.3) { 
             // 自动接取填充任务 (不接主线，主线必须手动)
             // ... filler logic
         }
      }

      // ... Loot Logic ...

      // ⚠️ 自动生成逻辑：如果当前空闲，大概率触发闲逛剧情
      if (aiEvent) {
         setHero(managedHero);
         await triggerAI(aiEvent);
      } else if (!aiEvent && managedHero.currentQuest && Math.random() < 0.95) { 
         setHero(managedHero);
         await triggerAI('quest_journey');
      } else if (!aiEvent && !managedHero.currentQuest && Math.random() < 0.95) { 
         setHero(managedHero);
         await triggerAI('idle_event');
      } else {
         setHero(managedHero);
      }
      
      const nextTick = Math.floor(Math.random() * (20000 - 15000) + 15000); 
      timerRef.current = setTimeout(gameLoop, nextTick);
    };
    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]);

  return { hero, login, godAction, loading, error, clearError: () => setError(null), hireCompanion, acceptQuest };
}