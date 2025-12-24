'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { LogEntry } from './lib/constants';

// ------------------------------------------------------------------
// 图标组件库 (适配《遗落群岛》生存主题)
// ------------------------------------------------------------------
const Icons = {
  // 日志 (Log - 书本/记录) - 对应原本的“江湖”位置
  Log: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ),
  // 状态 (Status - 生理监控) - 对应原本的“侠客”位置
  Status: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  // 仓库 (Storage - 物资箱) - 对应原本的“行囊”位置
  Storage: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  // 蓝图 (Blueprint - 制造/科技) - 对应原本的“装备”位置
  Blueprint: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  ),
  // 信号 (Signal - 任务/通讯) - 对应原本的“告示”位置
  Signal: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
  ),
  // 突破 (Breakthrough - 闪电/力量)
  Bolt: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  // 愈合 (Recover - 云/治疗)
  Heal: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/></svg>
};

export default function Game() {
  const { hero, login, godAction, loading, error, acceptQuest } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // 导航状态更新为生存主题
  const [activeTab, setActiveTab] = useState<'log' | 'status' | 'storage' | 'blueprint' | 'signal'>('log');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'log' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [hero?.logs, hero?.storyBuffer, activeTab]);

  // 🎨 主题色：米纸色 + 墨色 (保持不变，因为非常符合“航海日志”的感觉)
  const THEME = {
    bg: "bg-[#fcfbf7]",
    textMain: "text-[#3a3530]",
    textSub: "text-[#8c867a]",
    accent: "text-[#c29d67]",
    accentBg: "bg-[#c29d67]",
    border: "border-[#e5e2d9]",
  };

  const LOG_STYLES: Record<LogEntry['type'], string> = {
    normal: "text-[#3a3530]",
    highlight: "text-[#c29d67] font-bold", 
    bad: "text-[#9f433f] font-bold",
    system: "text-[#a8a29e] text-xs font-sans",
    ai: "text-[#3a3530]",
    story: "text-[#3a3530] leading-relaxed" 
  };

  // ------------------------------------------------------------------
  // 1. 登录界面 (《遗落群岛》主题)
  // ------------------------------------------------------------------
  if (!hero) {
    return (
      <div className={`flex flex-col items-center justify-center h-[100dvh] w-full ${THEME.bg} ${THEME.textMain} font-serif overscroll-none`}>
        <div className="w-full max-w-xs space-y-16 animate-in fade-in duration-700">
          
          {/* Logo */}
          <div className="flex flex-col items-center space-y-6">
            <div className={`w-24 h-24 rounded-full border-2 ${THEME.textMain} flex items-center justify-center bg-white shadow-sm`}>
              <span className="text-5xl font-bold pb-2">生</span>
            </div>
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold tracking-[0.1em] text-[#3a3530]">生存：进化</h1>
              <p className="text-[10px] text-[#a8a29e] tracking-[0.3em] uppercase">Civilization Restart</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-8 px-4">
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="幸存者代号" 
                className="w-full py-3 bg-transparent border-b border-[#d6d3d1] text-center focus:outline-none focus:border-[#3a3530] transition-colors placeholder-[#d6d3d1] text-base tracking-widest"
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />
              <input 
                type="password" 
                placeholder="身份密钥" 
                className="w-full py-3 bg-transparent border-b border-[#d6d3d1] text-center focus:outline-none focus:border-[#3a3530] transition-colors placeholder-[#d6d3d1] text-base tracking-widest"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
            
            {error && <div className="text-[#9f433f] text-xs text-center">{error}</div>}
            
            <button 
              onClick={() => login(username, password)} 
              disabled={loading} 
              className="w-full py-4 bg-[#3a3530] active:bg-[#292524] text-[#fcfbf7] transition-all tracking-[0.2em] font-bold text-sm shadow-lg rounded-sm active:scale-95"
            >
              {loading ? "LINKING..." : "唤醒意识"}
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-8 text-[10px] text-[#d6d3d1] tracking-widest">
          v2.0 • LOST ARCHIPELAGO
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 2. 主界面 (生存仪表盘 - 严格适配截图布局)
  // ------------------------------------------------------------------
  return (
    <div className={`flex flex-col h-[100dvh] w-full ${THEME.bg} ${THEME.textMain} font-serif overflow-hidden overscroll-none`}>
      
      {/* --- Top Bar (生理指征) --- */}
      <div className="flex-none px-5 pt-4 pb-2 bg-[#fcfbf7]/95 backdrop-blur-sm z-30 border-b border-[#e5e2d9]">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-wide">{hero.name}</h1>
            <span className="text-[10px] bg-[#e5e2d9] text-[#78716c] px-1.5 py-0.5 rounded-sm">{hero.title}</span>
          </div>
          <div className="flex items-center gap-3 font-sans text-xs font-bold">
             {/* 资源显示：不再是金币，而是生存资源 */}
             <div className="flex items-center gap-1 text-[#059669]">
               <span className="w-1.5 h-1.5 bg-[#059669] rounded-full"></span>
               {hero.hp}
             </div>
             <div className="flex items-center gap-1 text-[#d97706]">
               <span className="text-[10px]">⚡</span>
               {hero.stamina}
             </div>
             <div className="flex items-center gap-1 text-[#3a3530]">
               <span className="text-[10px]">资</span>
               {hero.gold}
             </div>
          </div>
        </div>

        {/* 等级与地点 */}
        <div className="flex items-center gap-2 text-xs text-[#a8a29e] mb-3 font-sans">
          <span className="border border-[#e7e5e4] px-1 rounded-sm">Lv.{hero.level}</span>
          <span>◎ {hero.location}</span>
        </div>

        {/* 任务进度条 */}
        {hero.currentQuest && (
          <div className="relative pt-1">
            <div className="flex justify-between items-center text-[10px] text-[#a8a29e] mb-1">
              <span className="tracking-wider truncate max-w-[70%] font-bold text-[#57534e]">
                 {hero.currentQuest.category === 'main' ? '♛ ' : '◎ '}{hero.currentQuest.name}
              </span>
              <span className="font-sans">{Math.floor((hero.currentQuest.progress / hero.currentQuest.total) * 100)}%</span>
            </div>
            <div className="w-full h-1 bg-[#e5e2d9] rounded-full overflow-hidden">
              <div className="h-full bg-[#d97706] transition-all duration-1000" style={{width: `${(hero.currentQuest.progress / hero.currentQuest.total) * 100}%`}}></div>
            </div>
          </div>
        )}
      </div>

      {/* --- Content Area --- */}
      <div className="flex-1 overflow-y-auto relative no-scrollbar" ref={scrollRef}>
        
        {/* 1. 日志 (Log) - 替换“江湖” */}
        {activeTab === 'log' && (
          <div className="px-5 py-4 pb-32 space-y-6">
            {hero.logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center pt-1.5 gap-1">
                   <span className="text-[9px] text-[#d6d3d1] font-sans w-8 text-right">{log.time.slice(0,5)}</span>
                </div>
                <div className={`text-[15px] leading-relaxed tracking-wide ${LOG_STYLES[log.type] || LOG_STYLES.normal} font-serif text-justify`}>
                  {log.text}
                </div>
              </div>
            ))}
            {hero.storyBuffer.length > 0 && (
               <div className="pl-11 text-[#d6d3d1] text-xs animate-pulse tracking-widest mt-4 font-sans">
                 ...
               </div>
            )}
          </div>
        )}

        {/* 2. 状态 (Status) - 替换“侠客” */}
        {activeTab === 'status' && (
           <div className="flex items-center justify-center h-full text-[#d6d3d1] text-xs tracking-widest flex-col gap-2">
             <Icons.Status active={false} />
             <span>生理机能分析中...</span>
           </div>
        )}

        {/* 3. 仓库 (Storage) - 替换“行囊” */}
        {activeTab === 'storage' && (
          <div className="p-5 space-y-3 pb-32">
             <div className="text-xs text-[#a8a29e] uppercase tracking-widest border-b border-[#e5e2d9] pb-2 mb-4">物资储备</div>
             {hero.inventory.length === 0 && <div className="text-center text-[#d6d3d1] py-10 italic">暂无物资</div>}
             {hero.inventory.map((item, i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-white border border-[#e5e2d9] rounded-sm shadow-sm">
                 <div>
                   <span className={`text-sm font-bold ${item.quality === 'rare' ? 'text-[#b45309]' : 'text-[#3a3530]'}`}>{item.name}</span>
                   <p className="text-[10px] text-[#a8a29e] mt-0.5">{item.desc}</p>
                 </div>
                 <span className="text-xs font-sans bg-[#f5f5f4] text-[#78716c] px-2 py-1 rounded-sm">x{item.count}</span>
               </div>
             ))}
          </div>
        )}

        {/* 4. 蓝图 (Blueprint) - 替换“装备” */}
        {activeTab === 'blueprint' && (
           <div className="flex items-center justify-center h-full text-[#d6d3d1] text-xs tracking-widest flex-col gap-2">
             <Icons.Blueprint active={false} />
             <span>制造蓝图未解锁</span>
           </div>
        )}

        {/* 5. 信号 (Signal) - 替换“告示” */}
        {activeTab === 'signal' && (
          <div className="p-5 space-y-4 pb-32">
             <div className="text-xs text-[#a8a29e] uppercase tracking-widest border-b border-[#e5e2d9] pb-2 mb-4">接收信号</div>
             {hero.questBoard.map(quest => (
                <div key={quest.id} onClick={() => acceptQuest(quest.id)} className="bg-white p-4 border border-[#e5e2d9] rounded-sm shadow-sm active:bg-[#f5f5f4] transition-colors cursor-pointer">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-[#3a3530]">{quest.name}</span>
                    <span className="text-[10px] text-[#a8a29e] font-sans border border-[#e5e2d9] px-1.5 py-0.5 rounded-full">{quest.rank}级威胁</span>
                  </div>
                  <p className="text-xs text-[#78716c] leading-relaxed line-clamp-2">{quest.desc}</p>
                </div>
             ))}
          </div>
        )}

      </div>

      {/* --- Floating Action Buttons (生存操作) --- */}
      {/* 仅在日志页显示 */}
      {activeTab === 'log' && (
        <div className="absolute bottom-[60px] left-0 right-0 px-5 pb-4 pt-8 bg-gradient-to-t from-[#fcfbf7] via-[#fcfbf7] to-transparent z-20 flex gap-3">
          {/* 原“天罚”改为“突破” (Expend Energy/Risk for Gain) */}
          <button 
            onClick={() => godAction('punish')}
            className="flex-1 h-12 bg-white border border-[#e5e2d9] rounded-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Icons.Bolt />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-bold text-[#44403c]">突破</span>
              <span className="text-[8px] text-[#a8a29e] font-sans">XP+ / HP-</span>
            </div>
          </button>

          {/* 原“赐福”改为“愈合” (Heal) */}
          <button 
            onClick={() => godAction('bless')}
            className="flex-1 h-12 bg-white border border-[#e5e2d9] rounded-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Icons.Heal />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-bold text-[#44403c]">愈合</span>
              <span className="text-[8px] text-[#a8a29e] font-sans">HP+ / 资-</span>
            </div>
          </button>
        </div>
      )}

      {/* --- Bottom Navigation (生存导航) --- */}
      <div className="flex-none bg-white border-t border-[#e5e2d9] h-[56px] grid grid-cols-5 items-center z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => setActiveTab('log')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Log active={activeTab === 'log'} />
          <span className={`text-[10px] tracking-widest ${activeTab === 'log' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>日志</span>
        </button>
        
        <button onClick={() => setActiveTab('status')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Status active={activeTab === 'status'} />
          <span className={`text-[10px] tracking-widest ${activeTab === 'status' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>状态</span>
        </button>

        <button onClick={() => setActiveTab('storage')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Storage active={activeTab === 'storage'} />
          <span className={`text-[10px] tracking-widest ${activeTab === 'storage' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>仓库</span>
        </button>

        <button onClick={() => setActiveTab('blueprint')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Blueprint active={activeTab === 'blueprint'} />
          <span className={`text-[10px] tracking-widest ${activeTab === 'blueprint' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>蓝图</span>
        </button>

        <button onClick={() => setActiveTab('signal')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Signal active={activeTab === 'signal'} />
          <span className={`text-[10px] tracking-widest ${activeTab === 'signal' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>信号</span>
        </button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}