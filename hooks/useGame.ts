import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QUEST_TEMPLATES } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  
  // ⚠️ 升级：记录最近 5 条日志内容，用于强力去重
  const recentLogsRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 登录
  const login = async (name: string) => {
    setLoading(true);
    const gender = Math.random() > 0.5 ? '男' : '女';
    const newHero: HeroState = {
      name, level: 1, gender, age: 16, cultivation: '初窥门径',
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0,
      location: '荒野古道', state: 'idle', 
      logs: [], inventory: [],
      equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      skills: [{ name: '太祖长拳', level: 1, desc: '江湖入门拳法。' }],
      lifeSkills: [{ name: '烹饪', level: 1, desc: '只会烤红薯。' }],
      stats: { kills: 0, deaths: 0, days: 1 },
      currentQuest: QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)],
      questProgress: 0,
      alignment: 0
    };
    
    if (supabase) {
      let { data } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (!data) {
        const { data: created } = await supabase.from('profiles').insert({ username: name, data: newHero }).select().single();
        data = created;
      }
      const mergedData = { ...newHero, ...data.data }; 
      if (data) setHero(mergedData);
    } else {
      setHero(newHero);
    }
    setLoading(false);
  };

  const addLog = (text: string, type: LogEntry['type'] = 'normal') => {
    // 更新去重队列
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
      const contextWithQuest = {
        ...hero,
        questInfo: `正在进行任务：${hero.currentQuest} (进度 ${hero.questProgress}%)`
      };

      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ context: contextWithQuest, eventType, userAction: action })
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
    if (type === 'bless') {
      setHero(h => h ? {...h, hp: h.maxHp, alignment: Math.min(50, h.alignment + 5)} : null);
      triggerAI('god_action', '赐福');
    } else {
      setHero(h => h ? {
        ...h, 
        hp: Math.max(1, h.hp - Math.floor(h.maxHp * 0.15)), 
        exp: h.exp + Math.floor(h.maxExp * 0.1),
        alignment: Math.max(-50, h.alignment - 5)
      } : null);
      triggerAI('god_action', '天罚');
    }
  };

  // 核心循环
  useEffect(() => {
    if (!hero) return;

    const gameLoop = async () => {
      // 1. 任务进度
      let newQuestProgress = hero.questProgress + Math.floor(Math.random() * 5) + 1;
      let newQuest = hero.currentQuest;

      if (newQuestProgress >= 100) {
        newQuestProgress = 0;
        const reward = Math.floor(Math.random() * 50) + 20;
        addLog(`【任务完成】${hero.currentQuest} 已达成！获得赏金 ${reward} 文。`, 'highlight');
        newQuest = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
        setTimeout(() => addLog(`【新任务】少侠接到了新委托：${newQuest}`, 'system'), 1000);
      }

      // 2. 决定是否触发 AI (50% 概率，比之前高一点，因为现在频率慢了)
      const dice = Math.random();
      let aiTriggered = false;
      if (dice < 0.5) aiTriggered = await triggerAI('auto');

      // 3. 本地兜底逻辑 (增强版)
      if (!aiTriggered) {
        let list = STATIC_LOGS.idle;
        if (hero.state === 'fight') list = STATIC_LOGS.fight;
        else if (hero.state === 'town') list = STATIC_LOGS.town;
        // 增加任务日志的权重
        else if (Math.random() < 0.4) list = STATIC_LOGS.quest; 

        // 随机取一条
        let text = list[Math.floor(Math.random() * list.length)];

        // ⚠️ 强力去重：如果这句话最近 5 条出现过，就重随，直到不重复
        let attempts = 0;
        while (recentLogsRef.current.includes(text) && attempts < 10) {
           text = list[Math.floor(Math.random() * list.length)];
           attempts++;
        }
        
        // ⚠️ 润滑剂：简单的文本替换，让固定文案也带上任务名
        // 比如："为了完成任务，少侠..." -> "为了[寻找丢失的假牙]，少侠..."
        if (text.includes("任务")) {
             text = text.replace("任务", `[${hero.currentQuest}]`);
        }
        
        addLog(text);
      }

      // 4. 更新数值
      setHero(h => {
        if(!h) return null;
        let newH = {...h};
        newH.questProgress = newQuestProgress >= 100 ? 0 : newQuestProgress;
        newH.currentQuest = newQuest;
        if (newQuestProgress >= 100) newH.gold += 30;

        // 自动卖垃圾
        if (h.inventory.length >= 20 && h.state !== 'town') {
             newH.state = 'town';
             addLog("行囊已满，少侠回城销赃。", "system");
        } else if (h.state === 'town') {
             const totalGold = h.inventory.reduce((acc, item) => acc + (item.price * item.count), 0);
             if (totalGold > 0) {
                addLog(`在集市变卖杂物，获利 ${totalGold} 文。`, "highlight");
                newH.inventory = [];
                newH.gold += totalGold;
             }
             newH.state = 'idle';
        }

        // 掉落
        if (h.state !== 'town' && Math.random() < 0.05) {
           const template = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
           const newItem: Item = { 
             id: Date.now().toString(), 
             name: template.name!, desc: template.desc!, quality: 'common', 
             type: template.type as ItemType, count: 1, price: template.price || 1
           };
           if (newItem.type !== 'misc' && !newH.equipment[newItem.type as keyof Equipment]) {
              newH.equipment = { ...newH.equipment, [newItem.type]: newItem };
              setTimeout(() => addLog(`捡到【${newItem.name}】，正好能用，穿上了。`, 'highlight'), 500);
           } else {
              const idx = newH.inventory.findIndex(i => i.name === newItem.name);
              if (idx >= 0) newH.inventory[idx].count++;
              else newH.inventory.push(newItem);
              if (idx < 0) setTimeout(() => addLog(`获得：${newItem.name}`, 'normal'), 500);
           }
        }

        if (h.state !== 'town' && Math.random() < 0.15) newH.state = newH.state === 'idle' ? 'fight' : 'idle';
        if (h.hp < h.maxHp && h.state === 'idle') newH.hp += 5;
        if (newH.exp >= newH.maxExp) {
           newH.level++; newH.exp = 0; newH.maxExp = Math.floor(newH.maxExp * 1.5); 
           newH.maxHp += 20; newH.hp = newH.maxHp;
           setTimeout(() => addLog(`【升级】功力精进！Lv.${newH.level}`, 'highlight'), 200);
        }
        return newH;
      });

      // 5. 设置下一次心跳：30秒 ~ 180秒 (真实 Godville 节奏)
      // Math.random() * (最大 - 最小) + 最小
      const nextTick = Math.floor(Math.random() * (180000 - 30000) + 30000); 
      // ⚠️ 调试用：如果您现在想测得快一点，可以暂时把上面那行注释，用下面这行：
      // const nextTick = Math.floor(Math.random() * (10000 - 5000) + 5000); 
      
      console.log(`⏳ 下次更新将在 ${nextTick / 1000} 秒后...`);
      timerRef.current = setTimeout(gameLoop, nextTick);
    };

    // 启动
    timerRef.current = setTimeout(gameLoop, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hero?.name]);

  return { hero, login, godAction, loading };
}