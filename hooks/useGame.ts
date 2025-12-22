import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  const lastLogText = useRef<string>("");

  // 登录/初始化英雄
  const login = async (name: string) => {
    setLoading(true);
    
    // 随机性别
    const gender = Math.random() > 0.5 ? '男' : '女';
    
    const newHero: HeroState = {
      name, 
      level: 1, 
      gender,
      age: 16, // 初出茅庐
      cultivation: '初窥门径',
      hp: 100, maxHp: 100, 
      exp: 0, maxExp: 100, 
      gold: 0,
      location: '荒野古道', 
      state: 'idle', 
      logs: [], 
      inventory: [],
      equipment: { weapon: null, armor: null, accessory: null },
      skills: [{ name: '太祖长拳', level: 1, desc: '江湖流传最广的入门拳法。' }],
      lifeSkills: [{ name: '烹饪', level: 1, desc: '只会烤红薯。' }],
      stats: { kills: 0, deaths: 0, days: 1 }
    };
    
    if (supabase) {
      let { data } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (!data) {
        const { data: created } = await supabase.from('profiles').insert({ username: name, data: newHero }).select().single();
        data = created;
      }
      // 兼容旧数据（防止老号报错）
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

  const triggerAI = async (eventType: string, action?: string) => {
    if (!hero) return false;
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ context: hero, eventType, userAction: action })
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

  // 手动测试
  const testAI = async () => {
    addLog("【系统】正在尝试沟通天道...", "system");
    const success = await triggerAI('auto');
    if (!success) addLog("【系统】天道渺茫。(请检查API Key)", "bad");
  };

  const godAction = async (type: 'bless' | 'punish') => {
    if (!hero) return;
    if (type === 'bless') {
      setHero(h => h ? {...h, hp: h.maxHp} : null);
      triggerAI('god_action', '赐福');
    } else {
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 10), exp: h.exp + 20} : null);
      triggerAI('god_action', '天罚');
    }
  };

  // 游戏循环
  useEffect(() => {
    if (!hero) return;
    const tick = setInterval(async () => {
      const dice = Math.random();
      let aiTriggered = false;

      // AI 触发
      if (dice < 0.4) aiTriggered = await triggerAI('auto');

      // 本地兜底
      if (!aiTriggered) {
        const list = hero.state === 'fight' ? STATIC_LOGS.fight : STATIC_LOGS.idle;
        let text = list[Math.floor(Math.random() * list.length)];
        let attempts = 0;
        while (text === lastLogText.current && attempts < 5) {
           text = list[Math.floor(Math.random() * list.length)];
           attempts++;
        }
        lastLogText.current = text;
        addLog(text);
      }

      // 状态变更 & 掉落
      setHero(h => {
        if(!h) return null;
        let newH = {...h};
        
        // 掉落
        if (Math.random() < 0.1) {
           const lootTemplate = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
           const newItem: Item = { 
             id: Date.now().toString(), 
             name: lootTemplate.name || "未知物品", 
             desc: lootTemplate.desc || "...", 
             quality: 'common',
             type: lootTemplate.type || 'misc' 
           };
           newH.inventory = [...newH.inventory, newItem];
           setTimeout(() => addLog(`捡到了【${newItem.name}】。`, 'highlight'), 500);
        }

        if (Math.random() < 0.1) newH.state = newH.state === 'idle' ? 'fight' : 'idle';
        if (h.hp < h.maxHp && h.state === 'idle') newH.hp += 2;
        if (Math.random() < 0.2) newH.gold += 1;
        
        // 升级
        if (newH.exp >= newH.maxExp) {
           newH.level++; newH.exp = 0; newH.maxExp = Math.floor(newH.maxExp * 1.5); 
           newH.maxHp += 20; newH.hp = newH.maxHp;
           newH.cultivation = newH.level > 10 ? '略有小成' : '初窥门径';
           setTimeout(() => addLog(`【境界突破】金光透体！等级提升至 Lv.${newH.level}`, 'highlight'), 100);
        }
        return newH;
      });
    }, 4000);

    return () => clearInterval(tick);
  }, [hero?.name]);

  return { hero, login, godAction, testAI, loading };
}