'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { LogEntry } from './lib/constants';

export default function Game() {
  const { hero, login, godAction, loading, error, clearError, hireCompanion, acceptQuest, startExpedition } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [hero?.logs, hero?.storyBuffer]);

  // 🎨 样式表：适配 Stone 浅色主题
  const LOG_STYLES: Record<LogEntry['type'], string> = {
    normal: "text-stone-800",
    highlight: "text-amber-700 font-bold", // 关键信息：琥珀色
    bad: "text-red-700 font-bold",         // 警告：深红
    system: "text-stone-400 italic text-sm", // 系统：浅灰斜体
    ai: "text-indigo-800",                 // 普通AI：深蓝
    
    // ⚠️ 剧情文字：深青色，适合浅色背景阅读，左侧加重边框
    story: "text-teal-900 leading-relaxed border-l-4 border-teal-600 pl-3 py-2 my-2 bg-teal-50" 
  };

  // 登录界面：经典 Stone 风格
  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-200 text-stone-800 font-serif">
        <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl border border-stone-300 rounded-sm">
          <div className="text-center border-b border-stone-100 pb-4">
            <h1 className="text-3xl font-bold tracking-widest text-stone-900 uppercase">遗落群岛</h1>
            <p className="text-xs text-stone-500 mt-2 tracking-wider">SURVIVAL CHRONICLES</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase">Identity</label>
              <input type="text" className="w-full p-3 bg-stone-50 border border-stone-300 focus:outline-none focus:border-stone-500 transition-colors" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase">Access Key</label>
              <input type="password" className="w-full p-3 bg-stone-50 border border-stone-300 focus:outline-none focus:border-stone-500 transition-colors" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button onClick={() => login(username, password)} disabled={loading} className="w-full p-3 bg-stone-800 hover:bg-stone-700 text-stone-100 transition-all uppercase tracking-wider font-bold shadow-sm">
              {loading ? "正在连接..." : "进入世界"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 主界面：经典 Stone 风格
  return (
    <div className="min-h-screen bg-stone-200 text-stone-900 font-serif p-2 md:p-6 flex justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-4 h-[95vh] md:h-[90vh]">
        
        {/* 左侧：状态 (3 cols) */}
        <div className="md:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* 角色卡 */}
          <div className="bg-white border border-stone-300 p-4 shadow-sm">
            <div className="flex justify-between items-baseline border-b border-stone-100 pb-2 mb-3">
              <h2 className="text-xl font-bold text-stone-900">{hero.name}</h2>
              <span className="text-xs text-stone-500 font-sans bg-stone-100 px-2 py-0.5 rounded">Lv.{hero.level}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between text-xs uppercase text-stone-500 font-sans"><span>HP</span> <span>{hero.hp}/{hero.maxHp}</span></div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${hero.hp < hero.maxHp*0.3 ? 'bg-red-600' : 'bg-stone-600'}`} style={{width: `${(hero.hp/hero.maxHp)*100}%`}}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs uppercase text-stone-500 font-sans"><span>Stamina</span> <span>{hero.stamina}/{hero.maxStamina}</span></div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full transition-all duration-500" style={{width: `${(hero.stamina/hero.maxStamina)*100}%`}}></div>
                </div>
              </div>
              <div className="pt-2 text-xs text-stone-500 flex justify-between font-sans">
                <span>📍 {hero.location}</span>
                <span>💰 {hero.gold}</span>
              </div>
            </div>
          </div>

          {/* 背包 */}
          <div className="bg-white border border-stone-300 p-4 flex-1 shadow-sm">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 border-b border-stone-100 pb-2">Backpack</h3>
            <div className="space-y-2 text-sm overflow-y-auto max-h-[30vh]">
              {hero.inventory.length === 0 ? <p className="text-stone-400 italic text-center py-4">空空如也</p> : 
               hero.inventory.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-colors">
                  <span className={item.quality === 'rare' ? 'text-blue-700' : 'text-stone-700'}>{item.name}</span>
                  <span className="text-stone-400 text-xs font-sans">x{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中间：日志 (6 cols) */}
        <div className="md:col-span-6 flex flex-col bg-[#faf9f6] border border-stone-300 shadow-md relative">
          {/* 顶栏 */}
          <div className="bg-white px-4 py-3 border-b border-stone-200 flex justify-between items-center shadow-sm z-10">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">Survival Log</span>
            <div className="flex gap-2">
               {/* 上帝按钮：放在这里比较顺手 */}
               <button onClick={() => godAction('bless')} className="text-[10px] px-2 py-1 bg-stone-100 border border-stone-300 hover:bg-white text-stone-600 uppercase">Bless</button>
               <button onClick={() => godAction('punish')} className="text-[10px] px-2 py-1 bg-stone-100 border border-stone-300 hover:bg-white text-stone-600 uppercase">Punish</button>
            </div>
          </div>
          
          {/* 滚动区 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
            {hero.logs.map((log) => (
              <div key={log.id} className={`text-base leading-7 animate-in fade-in slide-in-from-bottom-2 duration-500 ${LOG_STYLES[log.type] || LOG_STYLES.normal}`}>
                {/* 时间戳仅在鼠标悬停时显示，保持界面简洁 */}
                <span className="text-[10px] text-stone-300 mr-2 select-none font-sans opacity-50">{log.time}</span>
                {log.text}
              </div>
            ))}
            
            {/* 正在输入 */}
            {hero.storyBuffer.length > 0 && (
               <div className="flex items-center gap-2 text-teal-600 text-xs mt-6 pl-4 animate-pulse italic">
                 <span className="w-1.5 h-1.5 bg-teal-600 rounded-full"></span> 正在记录...
               </div>
            )}
            <div className="h-6"></div>
          </div>
        </div>

        {/* 右侧：任务 (3 cols) */}
        <div className="md:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          {hero.currentQuest && (
            <div className="bg-amber-50/50 border border-amber-200 p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1">
                {hero.currentQuest.category === 'main' && <span className="text-[9px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-sans font-bold">MAIN</span>}
              </div>
              <span className="text-xs text-amber-800/60 font-bold uppercase tracking-widest">Active Task</span>
              <h3 className="text-amber-900 font-bold text-lg mt-1 mb-2">{hero.currentQuest.name}</h3>
              <p className="text-amber-800 text-xs italic mb-4 leading-relaxed opacity-80">{hero.currentQuest.desc}</p>
              
              <div className="w-full bg-amber-200/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full transition-all duration-1000" style={{width: `${(hero.currentQuest.progress / hero.currentQuest.total) * 100}%`}}></div>
              </div>
            </div>
          )}

          <div className="bg-white border border-stone-300 p-4 flex-1 shadow-sm">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 border-b border-stone-100 pb-2">Quest Board</h3>
            <div className="space-y-3">
              {hero.questBoard.map(quest => (
                <div key={quest.id} onClick={() => acceptQuest(quest.id)} className="group cursor-pointer p-3 bg-stone-50 border border-stone-200 hover:border-stone-400 hover:bg-white transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-stone-700 group-hover:text-stone-900">{quest.name}</span>
                    <span className="text-[10px] text-stone-400 font-sans border border-stone-200 px-1 rounded">{quest.rank}★</span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{quest.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}