'use client';
import { useGame } from '@/hooks/useGame';
import { useEffect, useRef, useState } from 'react';
import { ScrollText, Zap, Cloud, MapPin, User, Package, Shield, Sword, Gem, Footprints, Shirt, HardHat, Target, Star, History, Brain, BicepsFlexed, Heart, Clover, Wind } from 'lucide-react';
import { ItemType } from '@/app/lib/constants';

export default function Home() {
  const { hero, login, godAction, loading } = useGame();
  const [inputName, setInputName] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'hero' | 'bag' | 'equip'>('logs');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'logs') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hero?.logs, activeTab]);

  if (!hero) {
    // (登录界面保持不变，为了节省篇幅省略，请保留原来的登录代码)
    return (
       <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#fcf9f2] text-stone-800 p-6 relative overflow-hidden">
        <div className="z-10 flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-stone-800 rounded-full flex items-center justify-center mb-6 shadow-lg bg-white"><span className="font-serif text-4xl font-bold">侠</span></div>
          <h1 className="text-4xl font-serif font-bold mb-2 tracking-[0.5em] text-stone-900">云游江湖</h1>
          <button onClick={() => login('无名氏')} disabled={loading} className="px-8 py-3 bg-stone-800 text-[#fcf9f2] font-serif text-lg rounded shadow-lg">{loading ? '...' : '快速开始'}</button>
        </div>
      </div>
    );
  }

  // --- 头部：任务进度与状态 ---
  const Header = () => (
    <header className="p-4 pb-2 flex-none z-10 bg-[#fcf9f2]/90 backdrop-blur-sm border-b border-stone-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-stone-900 tracking-wide mb-1">{hero.name}</h2>
            <div className="text-xs bg-stone-800 text-white px-1.5 py-0.5 rounded opacity-80">{hero.title}</div>
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <span className="border border-stone-300 px-1 rounded bg-white">Lv.{hero.level}</span>
            <span className="flex items-center gap-1"><MapPin size={10}/> {hero.location}</span>
          </div>
        </div>
        <div className="text-right">
            <div className="text-xl font-bold text-stone-800">{hero.gold} <span className="text-xs font-normal text-stone-500">文</span></div>
        </div>
      </div>
      
      {/* 任务条 */}
      <div className="bg-white border border-stone-200 rounded p-2 shadow-sm flex flex-col gap-1">
         <div className="flex justify-between text-[10px] text-stone-500">
            <span className="flex items-center gap-1 font-bold text-stone-700">
              <Target size={10} className="text-amber-600"/> {hero.currentQuest.name}
              <span className="text-stone-400 font-normal">({hero.currentQuest.type === 'search' ? '寻宝' : hero.currentQuest.type === 'hunt' ? '讨伐' : hero.currentQuest.type === 'train' ? '修行' : '生活'})</span>
            </span>
            <span className="font-mono">{hero.currentQuest.progress}%</span>
         </div>
         <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-700 rounded-full" style={{ width: `${hero.currentQuest.progress}%` }} />
         </div>
      </div>
    </header>
  );

  // --- 1. 江湖日志 ---
  const LogsView = () => (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
        {hero.logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-700 flex gap-2 items-baseline">
            <span className="text-[10px] text-stone-300 font-sans shrink-0 w-8 text-right">{log.time}</span>
            <span className={`text-[14px] leading-6 text-justify ${log.type === 'highlight' ? 'text-red-800 font-bold' : log.type === 'ai' ? 'text-stone-900 font-medium' : 'text-stone-600'}`}>
              {log.type === 'ai' && <span className="inline-block text-[9px] text-amber-600 mr-1 px-1 border border-amber-200 rounded bg-amber-50 align-middle">灵感</span>}
              {log.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
      {/* God Action Bar (保持不变) */}
      <div className="p-4 bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent">
         <div className="flex justify-between gap-4">
          <button onClick={() => godAction('punish')} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-red-800"><Zap size={14} /> 天罚</span>
          </button>
          <button onClick={() => godAction('bless')} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-emerald-800"><Cloud size={14} /> 赐福</span>
          </button>
        </div>
      </div>
    </div>
  );

  // --- 2. 侠客属性 (全新 RPG 风格) ---
  const HeroView = () => (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      {/* 基础档案 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><User size={16}/> 侠客档案</h3>
        <div className="flex items-center justify-between mb-4">
           <div className="text-center flex-1 border-r border-stone-100">
              <div className="text-xs text-stone-400">性格</div>
              <div className="font-bold text-stone-700">{hero.personality}</div>
           </div>
           <div className="text-center flex-1 border-r border-stone-100">
              <div className="text-xs text-stone-400">善恶</div>
              <div className="font-bold text-stone-700">{hero.alignment > 0 ? '侠义' : hero.alignment < 0 ? '邪狂' : '中立'}</div>
           </div>
           <div className="text-center flex-1">
              <div className="text-xs text-stone-400">岁数</div>
              <div className="font-bold text-stone-700">{hero.age}</div>
           </div>
        </div>
      </div>

      {/* 五维属性 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
         <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Star size={16}/> 天赋资质</h3>
         <div className="space-y-3">
            <div className="flex items-center justify-between">
               <span className="flex items-center gap-2 text-sm text-stone-600"><Heart size={14}/> 体魄 (根骨)</span>
               <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-red-400" style={{width: `${Math.min(100, hero.attributes.constitution * 2)}%`}}></div></div>
                  <span className="font-mono text-xs w-6 text-right">{hero.attributes.constitution}</span>
               </div>
            </div>
            <div className="flex items-center justify-between">
               <span className="flex items-center gap-2 text-sm text-stone-600"><BicepsFlexed size={14}/> 臂力 (武力)</span>
               <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{width: `${Math.min(100, hero.attributes.strength * 2)}%`}}></div></div>
                  <span className="font-mono text-xs w-6 text-right">{hero.attributes.strength}</span>
               </div>
            </div>
            <div className="flex items-center justify-between">
               <span className="flex items-center gap-2 text-sm text-stone-600"><Wind size={14}/> 身法 (闪避)</span>
               <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-blue-400" style={{width: `${Math.min(100, hero.attributes.dexterity * 2)}%`}}></div></div>
                  <span className="font-mono text-xs w-6 text-right">{hero.attributes.dexterity}</span>
               </div>
            </div>
            <div className="flex items-center justify-between">
               <span className="flex items-center gap-2 text-sm text-stone-600"><Brain size={14}/> 悟性 (学习)</span>
               <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-purple-400" style={{width: `${Math.min(100, hero.attributes.intelligence * 2)}%`}}></div></div>
                  <span className="font-mono text-xs w-6 text-right">{hero.attributes.intelligence}</span>
               </div>
            </div>
            <div className="flex items-center justify-between">
               <span className="flex items-center gap-2 text-sm text-stone-600"><Clover size={14}/> 福源 (运气)</span>
               <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{width: `${Math.min(100, hero.attributes.luck * 2)}%`}}></div></div>
                  <span className="font-mono text-xs w-6 text-right">{hero.attributes.luck}</span>
               </div>
            </div>
         </div>
      </div>

      {/* 大事记 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><History size={16}/> 江湖传闻 (大事记)</h3>
        <div className="space-y-3 pl-2 border-l-2 border-stone-100">
           {hero.majorEvents.slice(0, 10).map((event, i) => (
             <div key={i} className="text-xs text-stone-500 relative">
               <div className="absolute -left-[13px] top-1 w-2 h-2 rounded-full bg-stone-300"></div>
               {event}
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  // --- 3. 装备与行囊 (保持列表风格，代码简略) ---
  // (请直接使用之前版本 列表风格 的 EquipView 和 BagView 代码，此处为了不超长省略)
  const BagView = () => (<div className="p-4"><div className="text-center text-stone-400 mt-10">行囊功能同前...</div></div>);
  const EquipView = () => (<div className="p-4"><div className="text-center text-stone-400 mt-10">装备功能同前...</div></div>);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#fcf9f2] text-stone-800 font-serif max-w-md mx-auto shadow-2xl relative">
      <Header />
      <main className="flex-1 overflow-hidden bg-[#fcf9f2]">
        {activeTab === 'logs' && <LogsView />}
        {activeTab === 'hero' && <HeroView />}
        {activeTab === 'bag' && <BagView />} 
        {activeTab === 'equip' && <EquipView />} 
      </main>
      <nav className="h-16 bg-white border-t border-stone-200 flex justify-around items-center px-2 flex-none z-20">
         {/* 底部导航栏保持不变 */}
         <button onClick={() => setActiveTab('logs')} className="p-2 text-stone-800"><ScrollText/></button>
         <button onClick={() => setActiveTab('hero')} className="p-2 text-stone-800"><User/></button>
         <button onClick={() => setActiveTab('bag')} className="p-2 text-stone-800"><Package/></button>
         <button onClick={() => setActiveTab('equip')} className="p-2 text-stone-800"><Shield/></button>
      </nav>
    </div>
  );
}