import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  const lastLogText = useRef<string>("");

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
      stats: { kills: 0, deaths: 0, days: 1 }
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

  const godAction = async (type: 'bless' | 'punish') => {
    if (!hero) return;
    if (type === 'bless') {
      setHero(h => h ? {...h, hp: h.maxHp} : null);
      triggerAI('god_action', '赐福');
    } else {
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - Math.floor(h.maxHp * 0.15)), exp: h.exp + Math.floor(h.maxExp * 0.1)} : null);
      triggerAI('god_action', '天罚');
    }
  };

  // 游戏循环
  useEffect(() => {
    if (!hero) return;
    const tick = setInterval(async () => {
      const dice = Math.random();
      let aiTriggered = false;

      // AI 触发概率
      if (dice < 0.4) aiTriggered = await triggerAI('auto');

      if (!aiTriggered) {
        // 如果背包满了，强制进入“城镇”状态去卖东西
        if (hero.inventory.length >= 20 && hero.state !== 'town') {
             setHero(h => h ? { ...h, state: 'town' } : null);
             addLog("行囊已满，少侠决定找个集市把破烂卖了。", "system");
        } else if (hero.state === 'town') {
             // 卖东西逻辑
             setHero(h => {
               if(!h) return null;
               const totalGold = h.inventory.reduce((acc, item) => acc + (item.price * item.count), 0);
               addLog(`少侠在当铺里一阵讨价还价，把包里的东西都卖了，换得 ${totalGold} 文钱。`, "highlight");
               return { ...h, inventory: [], gold: h.gold + totalGold, state: 'idle' };
             });
        } else {
             // 普通日志
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
      }

      // 状态变更
      setHero(h => {
        if(!h) return null;
        let newH = {...h};
        
        // 掉落逻辑 (降低概率到 2%)
        if (h.state !== 'town' && Math.random() < 0.02) {
           const template = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
           const newItem: Item = { 
             id: Date.now().toString(), 
             name: template.name!, desc: template.desc!, quality: 'common', 
             type: template.type as ItemType, count: 1, price: template.price || 1
           };

           // 1. 自动装备逻辑：如果该部位是空的，直接穿上
           if (newItem.type !== 'misc' && !newH.equipment[newItem.type as keyof Equipment]) {
              newH.equipment = { ...newH.equipment, [newItem.type]: newItem };
              setTimeout(() => addLog(`捡到一件【${newItem.name}】，正好缺这个，顺手穿上了。`, 'highlight'), 200);
           } 
           // 2. 堆叠逻辑
           else {
              const existingIndex = newH.inventory.findIndex(i => i.name === newItem.name);
              if (existingIndex >= 0) {
                newH.inventory[existingIndex].count += 1;
                // 只有第一次捡到或者通过AI才提示，防止刷屏
              } else {
                newH.inventory = [...newH.inventory, newItem];
                setTimeout(() => addLog(`捡到了【${newItem.name}】。`, 'highlight'), 500);
              }
           }
        }

        if (h.state !== 'town' && Math.random() < 0.1) newH.state = newH.state === 'idle' ? 'fight' : 'idle';
        if (h.hp < h.maxHp && h.state === 'idle') newH.hp += 2;
        if (Math.random() < 0.2) newH.gold += 1;
        
        if (newH.exp >= newH.maxExp) {
           newH.level++; newH.exp = 0; newH.maxExp = Math.floor(newH.maxExp * 1.5); newH.maxHp += 20; newH.hp = newH.maxHp;
           setTimeout(() => addLog(`【境界突破】金光透体！等级提升至 Lv.${newH.level}`, 'highlight'), 100);
        }
        return newH;
      });
    }, 4000);

    return () => clearInterval(tick);
  }, [hero?.name, hero?.state, hero?.inventory.length]); // 监听 inventory.length 以触发回城

  return { hero, login, godAction, loading };
}