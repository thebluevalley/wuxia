'use client';
import { useGame } from '@/hooks/useGame';
import { useEffect, useRef, useState } from 'react';
import { Scroll, Zap, User, Sword } from 'lucide-react';

export default function Home() {
  const { hero, login, addLog, setHero, loading } = useGame();
  const [inputName, setInputName] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hero?.logs]);

  // 登录界面
  if (!hero) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#1c1917] text-amber-500 p-6">
        <div className="mb-6 p-4 border-2 border-amber-800 rounded-full bg-[#292524]">
           <Sword size={48} />
        </div>
        <h1 className="text-3xl font-serif mb-2 tracking-[0.3em] text-amber-500 font-bold">天道模拟器</h1>
        <p className="text-stone-500 text-sm mb-10 font-mono">云游江湖 · 放置修仙</p>
        
        <input 
          type="text" 
          placeholder="请输入道号 (如: 令狐冲)"
          className="w-full max-w-xs bg-stone-800 border border-stone-600 p-4 rounded-lg text-center text-stone-200 outline-none focus:border-amber-600 transition-colors mb-4"
          value={inputName}
          onChange={e => setInputName(e.target.value)}
        />
        <button 
          onClick={() => inputName && login(inputName)}
          disabled={loading}
          className="w-full max-w-xs bg-amber-800 text-stone-200 p-4 rounded-lg font-bold hover:bg-amber-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? '正在推演天机...' : '踏入江湖'}
        </button>
      </div>
    );
  }

  // 游戏界面
  return (
    <div className="flex flex-col h-[100dvh] bg-[#0c0a09] text-stone-300 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      
      {/* 状态栏 */}
      <header className="bg-[#1c1917] p-4 border-b border-stone-800 flex-none z-20 shadow-lg">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-stone-800 rounded-lg flex items-center justify-center border border-amber-900/50">
              <User size={24} className="text-amber-700" />
            </div>
            <div>
              <div className="text-amber-500 font-bold text-lg tracking-wide">{hero.name}</div>
              <div className="text-xs text-stone-500 mt-1 font-mono">
                <span className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-400 mr-2">Lv.{hero.level}</span>
                {hero.location}
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-stone-500 text-xs mb-1">盘缠</div>
             <div className="text-amber-400 font-mono">{hero.gold} 文</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-800 transition-all duration-500" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
          </div>
          <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-900/60 transition-all duration-500" style={{ width: `${(hero.exp / hero.maxExp) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* 日志区 */}
      <main className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0c0a09] relative scroll-smooth">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#0c0a09] to-transparent pointer-events-none z-10" />
        {hero.logs.map((log) => (
          <div key={log.id} className="flex gap-3 text-[15px] leading-relaxed">
            <span className="text-stone-700 font-mono text-xs pt-[5px] flex-none">[{log.time}]</span>
            <span className={
              log.type === 'highlight' ? 'text-amber-500 font-serif' : 
              log.type === 'bad' ? 'text-red-400' : 'text-stone-400 font-serif'
            }>
              {log.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} className="h-4" />
      </main>

      {/* 按钮区 */}
      <footer className="bg-[#1c1917] p-4 border-t border-stone-800 flex-none pb-8">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => {
              setHero(h => h ? {...h, hp: Math.max(0, h.hp - 15)} : null);
              addLog('【天罚】一道惊雷劈下，少侠抱头鼠窜！', 'bad');
            }}
            className="flex items-center justify-center gap-2 bg-[#292524] text-stone-400 hover:text-red-400 py-3 rounded-xl border border-stone-700 active:scale-95 transition-all"
          >
            <Zap size={18} /> 天罚
          </button>
          <button 
            onClick={() => {
              setHero(h => h ? {...h, hp: h.maxHp} : null);
              addLog('【赐福】一阵暖流涌过，少侠伤势痊愈。', 'highlight');
            }}
            className="flex items-center justify-center gap-2 bg-[#292524] text-stone-400 hover:text-emerald-400 py-3 rounded-xl border border-stone-700 active:scale-95 transition-all"
          >
            <Scroll size={18} /> 赐福
          </button>
        </div>
      </footer>
    </div>
  );
}