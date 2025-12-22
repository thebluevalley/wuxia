'use client';
import { useGame } from '@/hooks/useGame';
import { useEffect, useRef, useState } from 'react';
import { Scroll, Zap, Cloud, MapPin, Package, X } from 'lucide-react';

export default function Home() {
  const { hero, login, godAction, testAI, loading } = useGame();
  const [inputName, setInputName] = useState('');
  const [showBag, setShowBag] = useState(false); // 背包弹窗状态
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hero?.logs]);

  // --- 登录页 ---
  if (!hero) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#fcf9f2] text-stone-800 p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-stone-200 rounded-full blur-3xl opacity-50" />
        <div className="z-10 flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-stone-800 rounded-full flex items-center justify-center mb-6 shadow-lg bg-white">
             <span className="font-serif text-4xl font-bold">侠</span>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2 tracking-[0.5em] text-stone-900">云游江湖</h1>
          <p className="text-stone-500 text-sm mb-12 font-serif tracking-widest">一剑 · 一酒 · 一江湖</p>
          <input 
            type="text" placeholder="请赐道号"
            className="w-64 bg-transparent border-b-2 border-stone-300 p-2 text-center text-xl outline-none focus:border-stone-800 transition-colors mb-8 font-serif placeholder:text-stone-300"
            value={inputName} onChange={e => setInputName(e.target.value)}
          />
          <button 
            onClick={() => inputName && login(inputName)} disabled={loading}
            className="group relative px-8 py-3 bg-stone-800 text-[#fcf9f2] font-serif text-lg rounded shadow-lg hover:bg-stone-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? '墨研中...' : '入世修行'}
          </button>
        </div>
      </div>
    );
  }

  // --- 游戏主界面 ---
  return (
    <div className="flex flex-col h-[100dvh] bg-[#fcf9f2] text-stone-800 font-serif max-w-md mx-auto shadow-2xl relative">
      
      {/* 顶部：信息栏 (点击金币打开背包) */}
      <header className="p-4 pb-2 flex-none z-10 bg-[#fcf9f2]/90 backdrop-blur-sm border-b border-stone-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-wide mb-1">{hero.name}</h2>
            <div className="flex items-center gap-2 text-stone-500 text-xs">
              <span className="border border-stone-300 px-1 rounded bg-white">Lv.{hero.level}</span>
              <span className="flex items-center gap-1"><MapPin size={10}/> {hero.location}</span>
            </div>
          </div>
          <div 
            className="text-right cursor-pointer hover:opacity-70 transition-opacity active:scale-95"
            onClick={() => setShowBag(true)}
          >
             <div className="flex items-center justify-end gap-1 text-xl font-bold text-stone-800">
               <Package size={16} className="text-stone-400"/>
               {hero.gold} <span className="text-xs font-normal text-stone-500">文</span>
             </div>
             <div className="text-[10px] text-stone-400 mt-1">点击查看行囊</div>
          </div>
        </div>
        {/* 细进度条 */}
        <div className="space-y-1">
          <div className="h-[2px] w-full bg-stone-200 rounded-full">
            <div className="h-full bg-stone-800 transition-all duration-500 rounded-full" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
          </div>
          <div className="h-[1px] w-full bg-stone-100 rounded-full">
            <div className="h-full bg-red-800/60 transition-all duration-500 rounded-full" style={{ width: `${(hero.exp / hero.maxExp) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* 中间：日志区 (紧凑排版) */}
      <main className="flex-1 overflow-y-auto p-5 space-y-3 relative scroll-smooth mask-image-linear-gradient">
        {hero.logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-700 flex gap-2 items-baseline">
            {/* 时间戳 */}
            <span className="text-[10px] text-stone-300 font-sans shrink-0 w-8 text-right">{log.time}</span>
            
            {/* 内容 */}
            <span className={`text-[14px] leading-6 text-justify ${
              log.type === 'highlight' ? 'text-red-800 font-bold' : 
              log.type === 'ai' ? 'text-stone-900 font-medium' : 
              'text-stone-600'
            }`}>
              {/* AI 标识 */}
              {log.type === 'ai' && <span className="inline-block text-[9px] text-amber-600 mr-1 px-1 border border-amber-200 rounded bg-amber-50 align-middle">灵感</span>}
              {log.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} className="h-4" />
      </main>

      {/* 调试按钮：测试 AI */}
      <div className="absolute bottom-24 right-4 z-20">
        <button onClick={testAI} className="text-[10px] bg-stone-200/50 px-2 py-1 rounded text-stone-400 hover:bg-stone-200 hover:text-stone-600 backdrop-blur">
          测试天道
        </button>
      </div>

      {/* 底部：操作区 */}
      <footer className="p-5 pb-8 flex-none bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent">
        <div className="flex justify-between gap-4">
          <button onClick={() => godAction('punish')} className="flex-1 h-12 border border-stone-200 rounded flex items-center justify-center gap-2 text-stone-600 hover:border-stone-400 hover:bg-stone-100 transition-all active:scale-95 shadow-sm bg-white">
            <Zap size={16} /> <span className="text-sm">天罚</span>
          </button>
          <button onClick={() => godAction('bless')} className="flex-1 h-12 border border-stone-200 rounded flex items-center justify-center gap-2 text-stone-600 hover:border-stone-400 hover:bg-stone-100 transition-all active:scale-95 shadow-sm bg-white">
            <Cloud size={16} /> <span className="text-sm">赐福</span>
          </button>
        </div>
      </footer>

      {/* 弹窗：背包 (简单的 Overlay) */}
      {showBag && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-[#fcf9f2] w-full max-w-sm rounded-lg shadow-2xl border border-stone-200 flex flex-col max-h-[70vh]">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-stone-900">行囊</h3>
              <button onClick={() => setShowBag(false)} className="text-stone-400 hover:text-stone-800"><X size={20}/></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {hero.inventory.length === 0 ? (
                <div className="text-center text-stone-400 py-8 text-sm">空空如也</div>
              ) : (
                hero.inventory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-stone-100 rounded shadow-sm">
                    <span className="text-stone-800 font-medium">{item.name}</span>
                    <span className="text-[10px] text-stone-400">{item.desc}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}