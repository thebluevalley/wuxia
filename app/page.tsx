'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { LogEntry } from './lib/constants';

// ------------------------------------------------------------------
// 1. 图标组件库 (复刻截图底部导航)
// ------------------------------------------------------------------
const Icons = {
  // 日记 (Document/Book)
  Diary: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  // 状态 (User)
  Status: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  // 探索 (Location/Pin)
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  // 背包 (Box/Cube)
  Bag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  // 信号 (Bell)
  Signal: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  // 闪电 (Energy)
  Bolt: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  ),
  // 云/棉花 (Bless)
  Cloud: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3s1.3 3 3 3h11c1.7 0 3-1.3 3-3z"/></svg>
  )
};

export default function Game() {
  const { hero, login, godAction, loading, error, acceptQuest } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'log' | 'bag' | 'status' | 'search'>('log');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动
  useEffect(() => {
    if (activeTab === 'log' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [hero?.logs, hero?.storyBuffer, activeTab]);

  // 🎨 样式配置：严格按照 image_7158ce.png
  // 背景：#fcfbf7 (暖白/米纸色)
  // 文字：#3a3530 (深褐灰/墨色)
  // 字体：font-serif (宋体)
  const LOG_STYLES: Record<LogEntry['type'], string> = {
    normal: "text-[#3a3530]",
    highlight: "text-amber-800 font-bold", 
    bad: "text-red-800 font-bold",
    system: "text-gray-400 text-xs italic",
    ai: "text-slate-800",
    // 剧情：普通黑字，但排版更宽松
    story: "text-[#292524] leading-relaxed" 
  };

  // ------------------------------------------------------------------
  // 登录界面 (复刻 image_714648.png)
  // ------------------------------------------------------------------
  if (!hero) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fcfbf7] text-[#3a3530] font-serif">
        <div className="w-full max-w-sm px-10 flex flex-col items-center space-y-12">
          
          {/* 圆形 Logo */}
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 rounded-full border-2 border-[#3a3530] flex items-center justify-center bg-transparent">
              <span className="text-4xl font-serif text-[#3a3530] pb-1 font-bold">生</span>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-[0.1em] text-[#3a3530]">生存：进化</h1>
              <p className="text-[10px] text-gray-400 tracking-wider">文明已死，唯适者生存</p>
            </div>
          </div>

          {/* 表单 - 极简白底框 */}
          <div className="w-full space-y-4">
            <input 
              type="text" 
              placeholder="幸存者代号" 
              className="w-full h-12 bg-white border border-[#e5e5e5] text-center text-gray-600 focus:outline-none focus:border-gray-400 transition-colors placeholder-gray-300 rounded-sm text-sm"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="密语" 
              className="w-full h-12 bg-white border border-[#e5e5e5] text-center text-gray-600 focus:outline-none focus:border-gray-400 transition-colors placeholder-gray-300 rounded-sm text-sm"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            
            {error && <div className="text-red-700/70 text-xs text-center">{error}</div>}
            
            <button 
              onClick={() => login(username, password)} 
              disabled={loading} 
              className="w-full h-12 bg-[#8c867a] hover:bg-[#787369] text-white transition-colors tracking-widest font-bold rounded-sm shadow-sm mt-2 text-sm"
            >
              {loading ? "..." : "开始求生"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 主界面 (复刻 image_7158ce.png)
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col h-screen bg-[#fcfbf7] text-[#3a3530] font-serif overflow-hidden selection:bg-amber-100">
      
      {/* 1. 顶部 Header 区 */}
      <div className="flex-none px-5 pt-6 pb-2 bg-[#fcfbf7] z-20">
        <div className="flex justify-between items-end mb-3">
          {/* 左侧：名字与称号 */}
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-serif text-[#292524]">{hero.name}</h1>
            <span className="bg-[#f0ece9] text-[#78716c] text-[10px] px-2 py-0.5 rounded-sm tracking-wide">
              {hero.title}
            </span>
          </div>
          
          {/* 右侧：资源 (复刻截图右上角) */}
          <div className="flex flex-col items-end gap-1">
             <div className="flex items-center gap-4 text-xs font-sans font-bold">
               <div className="flex items-center gap-1 text-[#10b981]">
                 <span className="w-1.5 h-1.5 rounded-full border border-[#10b981]"></span>
                 {hero.hp}
               </div>
               <div className="flex items-center gap-1 text-[#f59e0b]">
                 <span className="text-[10px]">⚛</span>
                 {hero.stamina}
               </div>
             </div>
             {/* 装饰性短横线 */}
             <div className="flex gap-1 mt-1">
               <div className="w-8 h-1 bg-[#10b981] rounded-full"></div>
               <div className="w-12 h-1 bg-[#f59e0b] rounded-full"></div>
             </div>
          </div>
        </div>

        {/* 等级与地点 */}
        <div className="flex items-center gap-2 text-xs text-[#a8a29e] mb-4 font-sans">
          <span className="border border-[#e7e5e4] px-1 rounded-sm">Lv.{hero.level}</span>
          <span>◎ {hero.location}</span>
        </div>

        {/* 任务进度条 (复刻截图中间的任务条) */}
        {hero.currentQuest && (
          <div className="bg-[#f5f5f4] p-3 rounded-sm border border-[#e7e5e4] relative overflow-hidden">
            <div className="flex justify-between items-center mb-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-[#57534e]"></span>
                <span className="text-xs font-bold text-[#44403c]">{hero.currentQuest.name}</span>
              </div>
              <span className="text-[10px] text-[#a8a29e] font-sans">
                {Math.floor((hero.currentQuest.progress / hero.currentQuest.total) * 100)}%
              </span>
            </div>
            {/* 进度条轨道 */}
            <div className="w-full h-1.5 bg-[#e7e5e4] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#57534e] transition-all duration-1000 ease-out" 
                style={{width: `${(hero.currentQuest.progress / hero.currentQuest.total) * 100}%`}}
              ></div>
            </div>
          </div>
        )}
        
        {/* 分割线 */}
        <div className="h-px w-full bg-[#e7e5e4] mt-4"></div>
      </div>

      {/* 2. 中间滚动内容区 */}
      <div className="flex-1 overflow-y-auto relative" ref={scrollRef}>
        
        {/* 日记视图 */}
        {activeTab === 'log' && (
          <div className="px-5 py-4 pb-24 space-y-6">
            {hero.logs.map((log) => (
              <div key={log.id} className="flex gap-4 group">
                {/* 时间戳 (极淡) */}
                <div className="flex-none text-[10px] text-[#e7e5e4] font-sans pt-1.5 w-8 text-right group-hover:text-[#d6d3d1] transition-colors">
                  {log.time.slice(0, 5)}
                </div>
                
                {/* 文字内容 (宋体，行距大) */}
                <div className={`text-[15px] leading-8 tracking-wide ${LOG_STYLES[log.type] || LOG_STYLES.normal} font-serif`}>
                  {log.text}
                </div>
              </div>
            ))}
            
            {/* 正在输入 */}
            {hero.storyBuffer.length > 0 && (
               <div className="pl-12 text-[#d6d3d1] text-xs animate-pulse font-serif tracking-widest">
                 ... 笔 记 中 ...
               </div>
            )}
            
            {/* 底部垫高 */}
            <div className="h-10"></div>
          </div>
        )}

        {/* 背包视图 */}
        {activeTab === 'bag' && (
          <div className="p-5 grid grid-cols-1 gap-3 pb-24">
             {hero.inventory.length === 0 && <div className="text-center text-gray-300 mt-10 text-sm">行囊空空如也</div>}
             {hero.inventory.map((item, i) => (
               <div key={i} className="flex justify-between items-center p-4 bg-white border border-[#f0ece9] rounded-sm shadow-sm">
                 <div>
                   <span className={`font-bold text-sm ${item.quality === 'rare' ? 'text-amber-700' : 'text-[#44403c]'}`}>{item.name}</span>
                   <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
                 </div>
                 <span className="text-xs font-sans bg-[#f5f5f4] px-2 py-1 rounded text-gray-500">x{item.count}</span>
               </div>
             ))}
          </div>
        )}

        {/* 探索/任务视图 */}
        {activeTab === 'search' && (
          <div className="p-5 space-y-4 pb-24">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-[#e7e5e4] pb-2">可接委托</h3>
             {hero.questBoard.map(quest => (
                <div key={quest.id} onClick={() => acceptQuest(quest.id)} className="bg-white p-4 border border-[#f0ece9] shadow-sm rounded-sm active:scale-[0.98] transition-transform">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-[#44403c] text-sm">{quest.name}</span>
                    <span className="text-[10px] text-gray-400 font-sans border border-gray-200 px-1 rounded">{quest.rank}★</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-serif">{quest.desc}</p>
                </div>
             ))}
          </div>
        )}

      </div>

      {/* 3. 悬浮操作按钮 (复刻截图中的两个大白按钮) */}
      {activeTab === 'log' && (
        <div className="absolute bottom-20 left-0 right-0 px-5 flex gap-4 z-10">
          <button 
            onClick={() => godAction('punish')}
            className="flex-1 h-14 bg-white border border-[#e7e5e4] rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center active:bg-[#fcfbf7] transition-colors"
          >
            <div className="flex items-center gap-1 text-[#44403c] font-bold text-sm">
              <Icons.Bolt /> 磨难
            </div>
            <span className="text-[9px] text-[#a8a29e] font-sans scale-90">消耗 25%</span>
          </button>

          <button 
            onClick={() => godAction('bless')}
            className="flex-1 h-14 bg-white border border-[#e7e5e4] rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center active:bg-[#fcfbf7] transition-colors"
          >
            <div className="flex items-center gap-1 text-[#44403c] font-bold text-sm">
              <Icons.Cloud /> 幸运
            </div>
            <span className="text-[9px] text-[#a8a29e] font-sans scale-90">消耗 25%</span>
          </button>
        </div>
      )}

      {/* 4. 底部导航栏 (极简图标) */}
      <div className="flex-none bg-white border-t border-[#f0ece9] h-16 grid grid-cols-5 items-center pb-2 z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <button onClick={() => setActiveTab('log')} className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'log' ? 'text-[#292524]' : 'text-[#d6d3d1]'}`}>
          <Icons.Diary />
          <span className="text-[10px] font-medium tracking-widest">日记</span>
        </button>
        
        <button className="flex flex-col items-center justify-center space-y-1 text-[#e5e5e5]">
          <Icons.Status />
          <span className="text-[10px] font-medium tracking-widest">状态</span>
        </button>

        <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'search' ? 'text-[#292524]' : 'text-[#d6d3d1]'}`}>
          <Icons.Search />
          <span className="text-[10px] font-medium tracking-widest">探索</span>
        </button>

        <button onClick={() => setActiveTab('bag')} className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'bag' ? 'text-[#292524]' : 'text-[#d6d3d1]'}`}>
          <Icons.Bag />
          <span className="text-[10px] font-medium tracking-widest">背包</span>
        </button>

        <button className="flex flex-col items-center justify-center space-y-1 text-[#e5e5e5]">
          <Icons.Signal />
          <span className="text-[10px] font-medium tracking-widest">信号</span>
        </button>
      </div>

    </div>
  );
}