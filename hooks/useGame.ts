import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HeroState, LogEntry, STATIC_LOGS, Item, LOOT_TABLE, ItemType, Equipment, QUEST_SOURCES, QuestType, PERSONALITIES } from '@/app/lib/constants';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

export function useGame() {
  const [hero, setHero] = useState<HeroState | null>(null);
  const [loading, setLoading] = useState(false);
  const recentLogsRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 生成新任务
  const generateQuest = (): HeroState['currentQuest'] => {
    const types: QuestType[] = ['search', 'hunt', 'challenge', 'train', 'life'];
    const type = types[Math.floor(Math.random() * types.length)];
    const templates = QUEST_SOURCES[type];
    const name = templates[Math.floor(Math.random() * templates.length)];
    return {
      name,
      type,
      desc: "努力中...",
      progress: 0,
      total: 100
    };
  };

  const login = async (name: string) => {
    setLoading(true);
    const gender = Math.random() > 0.5 ? '男' : '女';
    const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    
    const newHero: HeroState = {
      name, level: 1, gender, age: 16, 
      personality, title: "初出茅庐",
      attributes: { constitution: 10, strength: 10, dexterity: 10, intelligence: 10, luck: 10 },
      hp: 100, maxHp: 100, exp: 0, maxExp: 100, gold: 0, alignment: 0,
      location: '荒野古道', state: 'idle', 
      logs: [], inventory: [], equipment: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
      skills: [{ name: '太祖长拳', level: 1, type: 'martial', desc: '入门拳法' }], 
      lifeSkills: [{ name: '烹饪', level: 1, type: 'life', desc: '基础生存' }],
      stats: { kills: 0, days: 1 },
      currentQuest: generateQuest(),
      majorEvents: [`${new Date().toLocaleDateString()}：踏入江湖，立志成为一代大侠。`]
    };
    
    if (supabase) {
      // (Supabase 逻辑保持不变...)
      setHero(newHero);
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
      const context = {
        ...hero,
        questInfo: `[${hero.currentQuest.type}任务]：${hero.currentQuest.name} (进度 ${hero.currentQuest.progress}%)`
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

  useEffect(() => {
    if (!hero) return;

    const gameLoop = async () => {
      // 1. 任务进度逻辑 (根据属性加成)
      // 智力高，进度快；福源高，暴击进度
      const baseProgress = 2;
      const attrBonus = hero.attributes.intelligence * 0.1;
      const luckBonus = Math.random() < (hero.attributes.luck * 0.01) ? 5 : 0;
      
      let newProgress = hero.currentQuest.progress + baseProgress + Math.floor(attrBonus) + luckBonus;
      let questCompleted = false;

      // 任务完成结算
      if (newProgress >= 100) {
        questCompleted = true;
        newProgress = 100;
        
        // 奖励结算逻辑
        let rewardText = "";
        let newHeroData = { ...hero };
        
        switch (hero.currentQuest.type) {
          case 'search': // 寻宝 -> 得装备或秘籍
             rewardText = "获得了一本残破的秘籍！悟性 +1";
             newHeroData.attributes.intelligence += 1;
             break;
          case 'hunt': // 讨伐 -> 大量经验/金币
             const gold = 50 + hero.level * 10;
             rewardText = `获得赏金 ${gold} 文，江湖声望提升。`;
             newHeroData.gold += gold;
             break;
          case 'challenge': // 挑战 -> 提升武学/臂力
             rewardText = "在实战中领悟了武学真谛！臂力 +1";
             newHeroData.attributes.strength += 1;
             break;
          case 'train': // 修行 -> 提升根骨/身法
             rewardText = "体魄得到了极大的锻炼！根骨 +1";
             newHeroData.attributes.constitution += 1;
             newHeroData.maxHp += 10;
             break;
          case 'life': // 生活 -> 提升福源/生活技能
             rewardText = "做了一件好事，福源 +1";
             newHeroData.attributes.luck += 1;
             break;
        }

        // 写入大事记
        const eventText = `${new Date().toLocaleTimeString()}：完成了【${hero.currentQuest.name}】，${rewardText}`;
        newHeroData.majorEvents = [eventText, ...newHeroData.majorEvents];
        addLog(`【任务完成】${hero.currentQuest.name} 已达成！${rewardText}`, 'highlight');
        
        // 重置任务
        setTimeout(() => {
           setHero(h => h ? { ...h, currentQuest: generateQuest() } : null);
           addLog(`【新历练】决定开始：${generateQuest().name}`, 'system');
        }, 2000);
        
        // 只有这里更新 hero，防止闭包问题
        setHero(h => h ? { ...newHeroData, currentQuest: { ...h.currentQuest, progress: 100 } } : null);
      } else {
        // 更新进度
        setHero(h => h ? { ...h, currentQuest: { ...h.currentQuest, progress: newProgress } } : null);
      }

      // 2. AI 触发 (50%)
      if (!questCompleted && Math.random() < 0.5) {
         await triggerAI('auto');
      } 
      // 3. 本地兜底
      else if (!questCompleted) {
         // (省略本地兜底，和之前类似，可以简化)
         // 为了演示效果，这里简化
         let text = "正在努力...";
         if (hero.personality === '懒散') text = "找个地方偷懒了一会儿。";
         else if (hero.personality === '热血') text = "大喊一声‘燃起来了’，加快了脚步。";
         
         if (!recentLogsRef.current.includes(text)) addLog(text);
      }

      // 4. 随机时间间隔 (30秒 - 3分钟)
      const nextTick = Math.floor(Math.random() * (180000 - 30000) + 30000);
      console.log(`⏳ 下次更新: ${nextTick/1000}s`);
      timerRef.current = setTimeout(gameLoop, nextTick);
    };

    timerRef.current = setTimeout(gameLoop, 2000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hero?.name]); // 依赖项

  return { hero, login, godAction, loading };
}