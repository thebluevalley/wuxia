import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QUEST_TEMPLATES } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  const lastLogText = useRef<string>("");
  
  // 使用 useRef 存储定时器，方便清除
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
      // 新增初始任务
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
    setHero(prev => {
      if (!prev) return null;
      const newLog = { 
        id: Date.now().toString(), text, type, 
        time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) 
      };
      return { ...prev, logs: [...prev.logs, newLog].slice(-50) };
    });
  };

  // AI 接口：带入任务上下文
  const triggerAI = async (eventType: string, action?: string) => {
    if (!hero) return false;
    try {
      // 构造更丰富的上下文
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
        lastLogText.current = data.text;
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const godAction = async (type: 'bless' | 'punish') => {
    if (!hero) return;
    if (type === 'bless') {
      // 赐福：加善意，回血
      setHero(h => h ? {...h, hp: h.maxHp, alignment: Math.min(50, h.alignment + 5)} : null);
      triggerAI('god_action', '赐福');
    } else {
      // 天罚：加恶意，扣血涨经验
      setHero(h => h ? {
        ...h, 
        hp: Math.max(1, h.hp - Math.floor(h.maxHp * 0.15)), 
        exp: h.exp + Math.floor(h.maxExp * 0.1),
        alignment: Math.max(-50, h.alignment - 5)
      } : null);
      triggerAI('god_action', '天罚');
    }
  };

  // 核心循环：随机时间间隔
  useEffect(() => {
    if (!hero) return;

    const gameLoop = async () => {
      // 1. 任务进度逻辑 (Godville 核心)
      let questUpdateText = "";
      let newQuestProgress = hero.questProgress + Math.floor(Math.random() * 5) + 1; // 每次加 1-5%
      let newQuest = hero.currentQuest;

      // 任务完成
      if (newQuestProgress >= 100) {
        newQuestProgress = 0;
        const reward = Math.floor(Math.random() * 50) + 20;
        addLog(`【任务完成】${hero.currentQuest} 已达成！获得赏金 ${reward} 文。`, 'highlight');
        // 随机新任务
        newQuest = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
        setTimeout(() => addLog(`【新任务】少侠接到了新委托：${newQuest}`, 'system'), 1000);
        
        // 更新 hero 状态 (在下面 setHero 统一做)
      }

      // 2. 决定是否触发 AI (40%)
      const dice = Math.random();
      let aiTriggered = false;
      if (dice < 0.4) aiTriggered = await triggerAI('auto');

      // 3. 本地兜底逻辑 (如果 AI 没触发)
      if (!aiTriggered) {
        // 根据状态和任务混合生成
        let list = STATIC_LOGS.idle;
        if (hero.state === 'fight') list = STATIC_LOGS.fight;
        else if (hero.state === 'town') list = STATIC_LOGS.town;
        else if (Math.random() < 0.3) list = STATIC_LOGS.quest; // 30% 概率刷任务相关日志

        let text = list[Math.floor(Math.random() * list.length)];
        // 简单替换任务名
        if (text.includes("任务")) text = text + ` (${hero.currentQuest})`;
        
        let attempts = 0;
        while (text === lastLogText.current && attempts < 5) {
           text = list[Math.floor(Math.random() * list.length)];
           attempts++;
        }
        lastLogText.current = text;
        addLog(text);
      }

      // 4. 更新数值状态
      setHero(h => {
        if(!h) return null;
        let newH = {...h};
        
        // 更新任务
        newH.questProgress = newQuestProgress >= 100 ? 0 : newQuestProgress;
        newH.currentQuest = newQuest;
        if (newQuestProgress >= 100) newH.gold += 30; // 奖励

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

        // 掉落 (低概率)
        if (h.state !== 'town' && Math.random() < 0.05) { // 5% 概率
           const template = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
           const newItem: Item = { 
             id: Date.now().toString(), 
             name: template.name!, desc: template.desc!, quality: 'common', 
             type: template.type as ItemType, count: 1, price: template.price || 1
           };
           // 自动装备或堆叠
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

        // 状态切换与升级
        if (h.state !== 'town' && Math.random() < 0.15) newH.state = newH.state === 'idle' ? 'fight' : 'idle';
        if (h.hp < h.maxHp && h.state === 'idle') newH.hp += 5;
        if (newH.exp >= newH.maxExp) {
           newH.level++; newH.exp = 0; newH.maxExp = Math.floor(newH.maxExp * 1.5); 
           newH.maxHp += 20; newH.hp = newH.maxHp;
           setTimeout(() => addLog(`【升级】功力精进！Lv.${newH.level}`, 'highlight'), 200);
        }
        return newH;
      });

      // 5. 设置下一次心跳 (随机时间：30秒 ~ 180秒)
      // 为了测试方便，我先设为 5秒 ~ 15秒。如果您想要正式版节奏，请把下面一行改成:
      // const nextTick = Math.floor(Math.random() * (180000 - 30000) + 30000); 
      const nextTick = Math.floor(Math.random() * (15000 - 5000) + 5000); 
      
      timerRef.current = setTimeout(gameLoop, nextTick);
    };

    // 启动循环
    timerRef.current = setTimeout(gameLoop, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hero?.name]); // 仅在名字变化(登录)时重置

  return { hero, login, godAction, loading };
}