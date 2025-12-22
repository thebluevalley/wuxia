'use client';
import { useGame } from '@/hooks/useGame';
import { useEffect, useRef, useState } from 'react';
import { Scroll, Zap, Cloud, MapPin } from 'lucide-react';

export default function Home() {
  const { hero, login, godAction, loading } = useGame();
  const [inputName, setInputName] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // 自动滚动
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hero?.logs]);

  // --- 登录页：极简留白 ---
  if (!hero) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#fcf9f2] text-stone-800 p-6 relative overflow-hidden">
        {/* 背景装饰：淡淡的水墨晕染 */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-stone-200 rounded-full blur-3xl opacity-50" />
        
        <div className="z-10 flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-stone-800 rounded-full flex items-center justify-center mb-6">
             <span className="font-serif text-4xl font-bold">侠</span>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2 tracking-[0.5em] text-stone-900">云游江湖</h1>
          <p className="text-stone-500 text-sm mb-12 font-serif tracking-widest">一剑 · 一酒 · 一江湖</p>
          
          <input 
            type="text" 
            placeholder="请赐道号"
            className="w-64 bg-transparent border-b-2 border-stone-300 p-2 text-center text-xl outline-none focus:border-stone-800 transition-colors mb-8 font-serif placeholder:text-stone-300"
            value={inputName}
            onChange={e => setInputName(e.target.value)}
          />
          
          <button 
            onClick={() => inputName && login(inputName)}
            disabled={loading}
            className="group relative px-8 py-3 bg-stone-800 text-[#fcf9f2] font-serif text-lg rounded shadow-lg hover:bg-stone-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? '墨研中...' : '入世修行'}
            {/* 按钮上的印章装饰 */}
            <div className="absolute -right-3 -bottom-2 w-6 h-6 bg-red-800 rounded-sm opacity-80" />
          </button>
        </div>
      </div>
    );
  }

  // --- 游戏主界面：浅色书卷风 ---
  return (
    <div className="flex flex-col h-[100dvh] bg-[#fcf9f2] text-stone-800 font-serif max-w-md mx-auto shadow-2xl relative">
      
      {/* 1. 顶部：简约信息栏 */}
      <header className="p-5 pb-2 flex-none z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 tracking-wide mb-1">{hero.name}</h2>
            <div className="flex items-center gap-2 text-stone-500 text-xs">
              <span className="border border-stone-300 px-1 rounded">Lv.{hero.level}</span>
              <span className="flex items-center gap-1"><MapPin size={10}/> {hero.location}</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-2xl font-bold text-stone-800">{hero.gold} <span className="text-xs font-normal text-stone-500">文</span></div>
          </div>
        </div>
        
        {/* 极细线条进度条 */}
        <div className="space-y-1.5">
          <div className="h-[2px] w-full bg-stone-200">
            <div className="h-full bg-stone-800 transition-all duration-500" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
          </div>
          <div className="h-[1px] w-full bg-stone-100">
            <div className="h-full bg-red-800/60 transition-all duration-500" style={{ width: `${(hero.exp / hero.maxExp) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* 2. 中间：日志区 (核心体验) */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 relative scroll-smooth mask-image-linear-gradient">
        {hero.logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* 时间戳：竖排或者极小 */}
            <div className="text-[10px] text-stone-400 mb-1 font-sans">{log.time}</div>
            
            {/* 内容：根据类型变色 */}
            <div className={`text-[15px] leading-7 text-justify ${
              log.type === 'highlight' ? 'text-red-800 font-bold' : 
              log.type === 'ai' ? 'text-stone-900 italic' : // AI 生成的字是斜体，模仿手写
              'text-stone-600'
            }`}>
              {log.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} className="h-8" />
      </main>

      {/* 3. 底部：神力操作区 (印章按钮) */}
      <footer className="p-6 pb-8 flex-none bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent">
        <div className="flex justify-between gap-6">
          {/* 天罚按钮：朱红印泥风格 */}
          <button 
            onClick={() => godAction('punish')}
            className="flex-1 h-14 border-2 border-stone-200 rounded-lg flex items-center justify-center gap-2 text-stone-600 hover:border-red-800 hover:text-red-800 hover:bg-red-50 transition-all active:scale-95"
          >
            <Zap size={18} />
            <span>天罚</span>
          </button>
          
          {/* 赐福按钮：青墨风格 */}
          <button 
            onClick={() => godAction('bless')}
            className="flex-1 h-14 border-2 border-stone-200 rounded-lg flex items-center justify-center gap-2 text-stone-600 hover:border-emerald-800 hover:text-emerald-800 hover:bg-emerald-50 transition-all active:scale-95"
          >
            <Cloud size={18} />
            <span>赐福</span>
          </button>
        </div>
      </footer>
    </div>
  );
}