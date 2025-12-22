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

  // 登录
  const login = async (name: string) => {
    setLoading(true);
    const newHero: HeroState = {
      name, level: 1, hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0,
      location: '荒野古道', state: 'idle', logs: [], inventory: []
    };
    
    if (supabase) {
      let { data } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (!data) {
        const { data: created } = await supabase.from('profiles').insert({ username: name, data: newHero }).select().single();
        data = created;
      }
      if (data) setHero(data.data);
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

  // 触发 AI
  const triggerAI = async (eventType: string, action?: string) => {
    if (!hero) return false;
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ context: hero, eventType, userAction: action })
      });
      
      // 增加错误处理，防止静默失败
      if (!res.ok) {
        console.error("API请求失败:", res.status, res.statusText);
        return false;
      }

      const data = await res.json();
      if (data.text) {
        addLog(data.text, eventType === 'god_action' ? 'highlight' : 'ai');
        lastLogText.current = data.text;
        return true;
      }
    } catch (e) { console.error("前端调用错误:", e); }
    return false;
  };

  // 手动测试 AI (文案已更新为 Groq)
  const testAI = async () => {
    addLog("【系统】正在尝试沟通天道 (Groq Llama3)...", "system");
    const success = await triggerAI('auto');
    if (!success) addLog("【系统】天道渺茫。(请检查 .env.local 是否配置了 GROQ_API_KEY 并重启了终端)", "bad");
  };

  // 拾取物品
  const lootItem = (itemName: string) => {
    setHero(prev => {
      if (!prev) return null;
      const newItem: Item = {
        id: Date.now().toString(), name: itemName,
        desc: "江湖上常见的小物件。", quality: 'common'
      };
      return { ...prev, inventory: [...prev.inventory, newItem] };
    });
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

      // 40% 概率触发 AI
      if (dice < 0.4) {
        aiTriggered = await triggerAI('auto');
      }

      // 兜底文案
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

      // 状态变更
      setHero(h => {
        if(!h) return null;
        let newH = {...h};
        if (Math.random() < 0.1) {
           const item = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
           setTimeout(() => addLog(`意外发现了一个【${item}】。`, 'highlight'), 500);
           const newItem: Item = { id: Date.now().toString(), name: item, desc: "寻常之物。", quality: 'common' };
           newH.inventory = [...newH.inventory, newItem];
        }

        if (Math.random() < 0.1) newH.state = newH.state === 'idle' ? 'fight' : 'idle';
        if (h.hp < h.maxHp && h.state === 'idle') newH.hp += 2;
        if (Math.random() < 0.2) newH.gold += 1;
        if (newH.exp >= newH.maxExp) {
           newH.level++; newH.exp = 0; newH.maxExp = Math.floor(newH.maxExp * 1.5); 
           newH.maxHp += 20; newH.hp = newH.maxHp;
           setTimeout(() => addLog(`【境界突破】金光透体！少侠突破至 Lv.${newH.level}`, 'highlight'), 100);
        }
        return newH;
      });
    }, 4000);

    return () => clearInterval(tick);
  }, [hero?.name]);

  return { hero, login, godAction, testAI, loading };
}