'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { LogEntry } from './lib/constants';

export default function Game() {
  const { hero, login, godAction, loading, error, clearError, hireCompanion, acceptQuest, startExpedition } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [hero?.logs]);

  // 🎨 日志样式映射表
  const LOG_STYLES: Record<LogEntry['type'], string> = {
    normal: "text-gray-800",
    highlight: "text-amber-700 font-medium", // 传统高亮（金色）
    bad: "text-red-700 font-bold",           // 警告（红色）
    system: "text-gray-500 text-sm italic",   // 系统消息（灰色斜体）
    ai: "text-indigo-800",                    // 通用AI消息（深蓝）
    
    // ⚠️ 核心新增：剧情专属样式 (深青色 + 左侧边框 + 稍微大一点的行高)
    story: "text-teal-900 leading-relaxed border-l-4 border-teal-700 pl-3 py-1 my-1 bg-teal-50/50 rounded-r" 
  };

  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100 text-stone-800 font-serif">
        <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-sm border border-stone-300">
          <h1 className="text-3xl font-bold text-center tracking-widest text-stone-900">遗落群岛</h1>
          <p className="text-center text-stone-500 text-sm">硬核文字生存 • 互动小说</p>
          <div className="space-y-4">
            <input type="text" placeholder="幸存者代号" className="w-full p-3 border border-stone-300 focus:outline-none focus:border-stone-500 bg-stone-50" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="秘钥" className="w-full p-3 border border-stone-300 focus:outline-none focus:border-stone-500 bg-stone-50" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button onClick={() => login(username, password)} disabled={loading} className="w-full p-3 bg-stone-800 text-stone-100 hover:bg-stone-700 transition-colors uppercase tracking-wider font-bold">
              {loading ? "连接中..." : "开始生存"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-200 text-stone-900 font-serif p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* 左侧：状态栏 (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white p-4 shadow-sm border border-stone-300">
            <h2 className="text-xl font-bold border-b border-stone-200 pb-2 mb-2">{hero.name}</h2>
            <div className="space-y-1 text-sm text-stone-700">
              <div className="flex justify-between"><span>状态</span> <span className={hero.hp < 30 ? "text-red-600 font-bold" : ""}>{hero.hp}/{hero.maxHp} HP</span></div>
              <div className="flex justify-between"><span>体力</span> <span>{hero.stamina}/{hero.maxStamina}</span></div>
              <div className="flex justify-between"><span>金币</span> <span>{hero.gold}</span></div>
              <div className="flex justify-between"><span>等级</span> <span>Lv.{hero.level}</span></div>
              <div className="mt-2 pt-2 border-t border-stone-100 text-xs text-stone-500">
                <p>位置: {hero.location}</p>
                <p>目标: {hero.strategy.currentFocus}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 shadow-sm border border-stone-300">
            <h3 className="font-bold mb-2 text-stone-800">背包</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto text-sm">
              {hero.inventory.length === 0 ? <p className="text-stone-400 italic">空空如也</p> : 
               hero.inventory.map((item, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <span className={item.quality === 'rare' ? 'text-blue-600' : ''}>{item.name} x{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中间：日志流 (6 cols) */}
        <div className="md:col-span-6 flex flex-col h-[80vh] md:h-auto bg-white shadow-lg border border-stone-300 relative">
          <div className="absolute top-0 left-0 right-0 bg-stone-50 p-2 text-center border-b border-stone-200 z-10">
            <span className="text-xs font-bold tracking-widest uppercase text-stone-400">生存日志 / LOGS</span>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 pt-10 space-y-3 bg-[#faf9f6]">
            {hero.logs.slice().reverse().map((log) => (
              <div key={log.id} className={`text-base animate-in fade-in slide-in-from-bottom-2 duration-500 ${LOG_STYLES[log.type] || LOG_STYLES.normal}`}>
                <span className="text-stone-300 text-xs mr-2 select-none">{log.time}</span>
                {log.text}
              </div>
            ))}
            {/* 正在输入指示器 */}
            {hero.storyBuffer.length > 0 && (
               <div className="text-xs text-teal-600 animate-pulse mt-2 ml-4">
                 ... 正在记录 ...
               </div>
            )}
          </div>

          {/* 底部操作区 */}
          <div className="p-4 bg-stone-100 border-t border-stone-300 grid grid-cols-2 gap-2">
             {/* 只有在非剧情等待期才显示上帝干预 */}
             <button onClick={() => godAction('bless')} className="p-2 bg-stone-200 hover:bg-white border border-stone-300 text-xs">祈祷 (+HP)</button>
             <button onClick={() => godAction('punish')} className="p-2 bg-stone-200 hover:bg-white border border-stone-300 text-xs">试炼 (+EXP)</button>
          </div>
        </div>

        {/* 右侧：任务板 (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          {hero.currentQuest && (
            <div className="bg-amber-50 p-4 shadow-sm border border-amber-200">
              <h3 className="font-bold text-amber-900 text-sm mb-1">当前行动</h3>
              <p className="text-amber-800 font-bold">{hero.currentQuest.name}</p>
              <div className="w-full bg-amber-200 h-2 mt-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full transition-all duration-1000" style={{width: `${(hero.currentQuest.progress / hero.currentQuest.total) * 100}%`}}></div>
              </div>
              <p className="text-xs text-amber-700 mt-2 italic">{hero.currentQuest.script.description}</p>
            </div>
          )}

          <div className="bg-white p-4 shadow-sm border border-stone-300">
            <h3 className="font-bold mb-3 text-stone-800 border-b pb-1">待办事项</h3>
            <div className="space-y-2">
              {hero.questBoard.map(quest => (
                <div key={quest.id} className="p-2 bg-stone-50 border border-stone-200 hover:border-stone-400 transition-colors cursor-pointer group" onClick={() => acceptQuest(quest.id)}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-stone-700 group-hover:text-stone-900">{quest.name}</span>
                    <span className="text-xs bg-stone-200 px-1 rounded text-stone-600">{quest.rank}★</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{quest.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}