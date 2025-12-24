'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { LogEntry } from './lib/constants';

// ------------------------------------------------------------------
// 图标组件库 (App 底部导航栏专用)
// ------------------------------------------------------------------
const Icons = {
  Jianghu: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h6"/><path d="M22 12h-6"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m5 7 14 10"/><path d="m19 7-14 10"/></svg>
  ),
  Xiake: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Xingnang: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-10"/></svg>
  ),
  Zhuangbei: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Gaoshi: ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#3a3530" : "#d6d3d1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/></svg>
  ),
  Bolt: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Cloud: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3s1.3 3 3 3h11c1.7 0 3-1.3 3-3z"/></svg>
};

export default function Game() {
  const { hero, login, godAction, loading, error, acceptQuest } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'jianghu' | 'xiake' | 'xingnang' | 'zhuangbei' | 'gaoshi'>('jianghu');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 保持滚动在底部
  useEffect(() => {
    if (activeTab === 'jianghu' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [hero?.logs, hero?.storyBuffer, activeTab]);

  // 🎨 主题色：米纸色 + 墨色
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
    story: "text-[#3a3530] leading-relaxed" // 纯净阅读体验
  };

  // ------------------------------------------------------------------
  // 1. 登录界面 (App 启动页风格)
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
              <h1 className="text-3xl font-bold tracking-[0.2em] text-[#3a3530]">生存：进化</h1>
              <p className="text-[10px] text-[#a8a29e] tracking-[0.3em] uppercase">The Last Survivor</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-8 px-4">
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="代号" 
                className="w-full py-3 bg-transparent border-b border-[#d6d3d1] text-center focus:outline-none focus:border-[#3a3530] transition-colors placeholder-[#d6d3d1] text-base tracking-widest"
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />
              <input 
                type="password" 
                placeholder="密语" 
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
              {loading ? "WAKING UP..." : "开始求生"}
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-8 text-[10px] text-[#d6d3d1] tracking-widest">
          v1.0.4 • MOBILE
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 2. 主界面 (App 布局)
  // 使用 h-[100dvh] 解决 iOS Safari 地址栏问题
  // ------------------------------------------------------------------
  return (
    <div className={`flex flex-col h-[100dvh] w-full ${THEME.bg} ${THEME.textMain} font-serif overflow-hidden overscroll-none`}>
      
      {/* --- Top Bar (状态栏) --- */}
      <div className="flex-none px-5 pt-4 pb-2 bg-[#fcfbf7]/95 backdrop-blur-sm z-30 border-b border-[#e5e2d9]">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-wide">{hero.name}</h1>
            <span className="text-[10px] bg-[#e5e2d9] text-[#78716c] px-1.5 py-0.5 rounded-sm">{hero.title}</span>
          </div>
          <div className="flex items-center gap-3 font-sans text-xs font-bold">
             <div className="flex items-center gap-1 text-[#059669]">
               <span className="w-1.5 h-1.5 bg-[#059669] rounded-full"></span>
               {hero.hp}
             </div>
             <div className="flex items-center gap-1 text-[#d97706]">
               <span>⚡</span>
               {hero.stamina}
             </div>
          </div>
        </div>

        {/* 任务进度条 (极简) */}
        {hero.currentQuest && (
          <div className="relative pt-1">
            <div className="flex justify-between items-center text-[10px] text-[#a8a29e] mb-1">
              <span className="tracking-wider truncate max-w-[70%] font-bold text-[#57534e]">{hero.currentQuest.name}</span>
              <span className="font-sans">{Math.floor((hero.currentQuest.progress / hero.currentQuest.total) * 100)}%</span>
            </div>
            <div className="w-full h-1 bg-[#e5e2d9] rounded-full overflow-hidden">
              <div className="h-full bg-[#d97706] transition-all duration-1000" style={{width: `${(hero.currentQuest.progress / hero.currentQuest.total) * 100}%`}}></div>
            </div>
          </div>
        )}
      </div>

      {/* --- Content Area (可滚动) --- */}
      <div className="flex-1 overflow-y-auto relative no-scrollbar" ref={scrollRef}>
        
        {/* 1. 江湖 (日志流) */}
        {activeTab === 'jianghu' && (
          <div className="px-5 py-4 pb-32 space-y-6">
            {hero.logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                {/* 时间轴装饰 */}
                <div className="flex flex-col items-center pt-1.5 gap-1">
                   <span className="text-[9px] text-[#d6d3d1] font-sans w-8 text-right">{log.time.slice(0,5)}</span>
                </div>
                
                {/* 文本块 */}
                <div className={`text-[15px] leading-relaxed tracking-wide ${LOG_STYLES[log.type] || LOG_STYLES.normal} font-serif`}>
                  {log.text}
                </div>
              </div>
            ))}
            
            {/* 输入中... */}
            {hero.storyBuffer.length > 0 && (
               <div className="pl-11 text-[#d6d3d1] text-xs animate-pulse tracking-widest mt-4 font-sans">
                 ...
               </div>
            )}
          </div>
        )}

        {/* 2. 行囊 (背包) */}
        {activeTab === 'xingnang' && (
          <div className="p-5 space-y-3 pb-32">
             <div className="text-xs text-[#a8a29e] uppercase tracking-widest border-b border-[#e5e2d9] pb-2 mb-4">Inventory</div>
             {hero.inventory.length === 0 && <div className="text-center text-[#d6d3d1] py-10 italic">空空如也</div>}
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

        {/* 3. 告示 (任务) */}
        {activeTab === 'gaoshi' && (
          <div className="p-5 space-y-4 pb-32">
             <div className="text-xs text-[#a8a29e] uppercase tracking-widest border-b border-[#e5e2d9] pb-2 mb-4">Quests</div>
             {hero.questBoard.map(quest => (
                <div key={quest.id} onClick={() => acceptQuest(quest.id)} className="bg-white p-4 border border-[#e5e2d9] rounded-sm shadow-sm active:bg-[#f5f5f4] transition-colors cursor-pointer">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-[#3a3530]">{quest.name}</span>
                    <span className="text-[10px] text-[#a8a29e] font-sans border border-[#e5e2d9] px-1.5 py-0.5 rounded-full">{quest.rank}★</span>
                  </div>
                  <p className="text-xs text-[#78716c] leading-relaxed line-clamp-2">{quest.desc}</p>
                </div>
             ))}
          </div>
        )}

        {/* 4. 侠客 & 装备 (占位) */}
        {(activeTab === 'xiake' || activeTab === 'zhuangbei') && (
           <div className="flex items-center justify-center h-full text-[#d6d3d1] text-xs tracking-widest">
             功能开发中
           </div>
        )}

      </div>

      {/* --- Floating Action Buttons (悬浮操作) --- */}
      {/* 仅在江湖/日记页显示 */}
      {activeTab === 'jianghu' && (
        <div className="absolute bottom-[60px] left-0 right-0 px-5 pb-4 pt-8 bg-gradient-to-t from-[#fcfbf7] via-[#fcfbf7] to-transparent z-20 flex gap-3">
          <button 
            onClick={() => godAction('punish')}
            className="flex-1 h-12 bg-white border border-[#e5e2d9] rounded-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Icons.Bolt />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-bold text-[#44403c]">天罚</span>
              <span className="text-[8px] text-[#a8a29e] font-sans">EXP+</span>
            </div>
          </button>

          <button 
            onClick={() => godAction('bless')}
            className="flex-1 h-12 bg-white border border-[#e5e2d9] rounded-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Icons.Cloud />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-bold text-[#44403c]">赐福</span>
              <span className="text-[8px] text-[#a8a29e] font-sans">HP+</span>
            </div>
          </button>
        </div>
      )}

      {/* --- Bottom Navigation (底部导航) --- */}
      <div className="flex-none bg-white border-t border-[#e5e2d9] h-[56px] grid grid-cols-5 items-center z-40 pb-safe">
        <button onClick={() => setActiveTab('jianghu')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Jianghu active={activeTab === 'jianghu'} />
          <span className={`text-[9px] ${activeTab === 'jianghu' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>江湖</span>
        </button>
        
        <button onClick={() => setActiveTab('xiake')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Xiake active={activeTab === 'xiake'} />
          <span className={`text-[9px] ${activeTab === 'xiake' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>侠客</span>
        </button>

        <button onClick={() => setActiveTab('xingnang')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Xingnang active={activeTab === 'xingnang'} />
          <span className={`text-[9px] ${activeTab === 'xingnang' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>行囊</span>
        </button>

        <button onClick={() => setActiveTab('zhuangbei')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Zhuangbei active={activeTab === 'zhuangbei'} />
          <span className={`text-[9px] ${activeTab === 'zhuangbei' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>装备</span>
        </button>

        <button onClick={() => setActiveTab('gaoshi')} className="flex flex-col items-center justify-center space-y-1 active:opacity-70">
          <Icons.Gaoshi active={activeTab === 'gaoshi'} />
          <span className={`text-[9px] ${activeTab === 'gaoshi' ? 'text-[#3a3530] font-bold' : 'text-[#d6d3d1]'}`}>告示</span>
        </button>
      </div>

      {/* CSS Utils for Hiding Scrollbars */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* 针对 iOS 底部安全区的 padding (Tailwind class pb-safe 占位) */
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}