import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);

  // 登录/初始化
  const login = async (name: string) => {
    setLoading(true);
    const newHero: HeroState = {
      name, level: 1, hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0,
      location: '荒野古道', state: 'idle', logs: []
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

  // 触发 AI 生成
  const triggerAI = async (eventType: string, action?: string) => {
    if (!hero) return false;
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ context: hero, eventType, userAction: action })
      });
      const data = await res.json();
      if (data.text) {
        addLog(data.text, eventType === 'god_action' ? 'highlight' : 'ai');
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  // 玩家干预 (上帝之手)
  const godAction = async (type: 'bless' | 'punish') => {
    if (!hero) return;
    // 立即反馈 UI (乐观更新)
    if (type === 'bless') {
      setHero(h => h ? {...h, hp: h.maxHp} : null);
      // 异步调用 AI 描述神迹
      triggerAI('god_action', '赐福(加血)');
    } else {
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 10), exp: h.exp + 20} : null);
      triggerAI('god_action', '天罚(雷劈)');
    }
  };

  // 自动循环 (每4秒)
  useEffect(() => {
    if (!hero) return;
    const tick = setInterval(async () => {
      // 简单的状态机
      const dice = Math.random();
      let aiTriggered = false;

      // 30% 概率触发 AI 旁白
      if (dice < 0.3) {
        aiTriggered = await triggerAI('auto');
      }

      if (!aiTriggered) {
        // AI 没触发，走本地逻辑
        const list = hero.state === 'fight' ? STATIC_LOGS.fight : STATIC_LOGS.idle;
        const text = list[Math.floor(Math.random() * list.length)];
        addLog(text);
      }

      // 数值变化模拟
      setHero(h => {
        if(!h) return null;
        let newH = {...h};
        // 自动回血/扣血逻辑
        if (h.hp < h.maxHp && h.state === 'idle') newH.hp += 2;
        if (Math.random() < 0.2) newH.gold += 1;
        
        // 升级检查
        if (newH.exp >= newH.maxExp) {
           newH.level++; newH.exp = 0; newH.maxExp *= 1.5; newH.maxHp += 20; newH.hp = newH.maxHp;
           addLog(`【境界突破】金光透体！少侠突破至 Lv.${newH.level}`, 'highlight');
        }
        return newH;
      });
    }, 4000);

    return () => clearInterval(tick);
  }, [hero?.name]);

  return { hero, login, godAction, loading };
}