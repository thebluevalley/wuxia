import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 用于去重：记录上一条日志
  const lastLogText = useRef<string>("");

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
      // 保持最近 50 条
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
      const data = await res.json();
      if (data.text) {
        addLog(data.text, eventType === 'god_action' ? 'highlight' : 'ai');
        lastLogText.current = data.text; // 记录 AI 生成的文本
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  // 玩家干预
  const godAction = async (type: 'bless' | 'punish') => {
    if (!hero) return;
    if (type === 'bless') {
      setHero(h => h ? {...h, hp: h.maxHp} : null);
      triggerAI('god_action', '赐福(加血)');
    } else {
      setHero(h => h ? {...h, hp: Math.max(1, h.hp - 10), exp: h.exp + 20} : null);
      triggerAI('god_action', '天罚(雷劈)');
    }
  };

  // 核心循环 (每4秒)
  useEffect(() => {
    if (!hero) return;
    const tick = setInterval(async () => {
      const dice = Math.random();
      let aiTriggered = false;

      // 40% 概率触发 AI
      if (dice < 0.4) {
        aiTriggered = await triggerAI('auto');
      }

      // AI 没触发，使用本地文案 (带去重逻辑)
      if (!aiTriggered) {
        const list = hero.state === 'fight' ? STATIC_LOGS.fight : STATIC_LOGS.idle;
        
        let text = list[Math.floor(Math.random() * list.length)];
        let attempts = 0;
        // 如果随到的和上一条一样，重随，最多试5次
        while (text === lastLogText.current && attempts < 5) {
           text = list[Math.floor(Math.random() * list.length)];
           attempts++;
        }
        
        lastLogText.current = text;
        addLog(text);
      }

      // 状态模拟
      setHero(h => {
        if(!h) return null;
        let newH = {...h};
        // 随机切换战斗/闲逛状态
        if (Math.random() < 0.1) newH.state = newH.state === 'idle' ? 'fight' : 'idle';
        
        // 自动回血/升级
        if (h.hp < h.maxHp && h.state === 'idle') newH.hp += 2;
        if (Math.random() < 0.2) newH.gold += 1;
        if (newH.exp >= newH.maxExp) {
           newH.level++; newH.exp = 0; newH.maxExp = Math.floor(newH.maxExp * 1.5); 
           newH.maxHp += 20; newH.hp = newH.maxHp;
           addLog(`【境界突破】金光透体！少侠突破至 Lv.${newH.level}`, 'highlight');
        }
        return newH;
      });
    }, 4000);

    return () => clearInterval(tick);
  }, [hero?.name]); // 依赖 hero.name 避免死循环

  return { hero, login, godAction, loading };
}