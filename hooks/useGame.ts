import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_EVENTS } from '@/app/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);

  // 登录逻辑
  const login = async (name: string) => {
    setLoading(true);
    const newHero: HeroState = {
      name, level: 1, hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0,
      location: '荒野古道', logs: []
    };

    if (supabase) {
      let { data } = await supabase.from('profiles').select('*').eq('username', name).single();
      if (!data) {
        const { data: created } = await supabase.from('profiles').insert({ username: name, data: newHero }).select().single();
        data = created;
      }
      if (data) setHero(data.data);
    } else {
      setHero(newHero); // 无数据库模式
    }
    setLoading(false);
  };

  // 增加日志
  const addLog = (text: string, type: LogEntry['type'] = 'normal') => {
    setHero(prev => {
      if (!prev) return null;
      const newLog = { 
        id: Date.now().toString(), 
        text, type, 
        time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'}) 
      };
      return { ...prev, logs: [...prev.logs, newLog].slice(-50) };
    });
  };

  // 游戏主循环 (每5秒一次)
  useEffect(() => {
    if (!hero) return;
    const tick = setInterval(async () => {
      // 30% 概率触发 AI，让游戏更有灵性
      const useAI = Math.random() < 0.3;
      let aiSuccess = false;

      if (useAI) {
        try {
          const res = await fetch('/api/ai', {
            method: 'POST',
            body: JSON.stringify({ context: hero, eventType: 'idle' })
          });
          const data = await res.json();
          if (data.text) {
            addLog(data.text, 'highlight');
            setHero(h => h ? {...h, exp: h.exp + 20} : null); // AI事件奖励更高
            aiSuccess = true;
          }
        } catch (e) { console.error(e); }
      }

      // 如果AI没触发或失败，使用本地文案
      if (!aiSuccess) {
        const randomText = STATIC_EVENTS[Math.floor(Math.random() * STATIC_EVENTS.length)];
        addLog(randomText);
        setHero(h => h ? {...h, gold: h.gold + 2} : null);
      }
    }, 5000);
    return () => clearInterval(tick);
  }, [hero ? hero.name : null]);

  // 自动存档与升级
  useEffect(() => {
    if (!hero) return;
    if (hero.exp >= hero.maxExp) {
      setHero(h => h ? { ...h, level: h.level + 1, exp: 0, maxExp: Math.floor(h.maxExp * 1.5), maxHp: h.maxHp + 50, hp: h.maxHp + 50 } : null);
      addLog(`【境界突破】丹田滚烫，金光透体而出！境界提升至 Lv.${hero.level + 1}`, 'highlight');
    }
    if (supabase) {
      supabase.from('profiles').update({ data: hero, updated_at: new Date() }).eq('username', hero.name).then(()=>{});
    }
  }, [hero]);

  return { hero, login, addLog, setHero, loading };
}