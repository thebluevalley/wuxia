'use client';
import { useGame } from '@/hooks/useGame';
import { useEffect, useRef, useState } from 'react';
import { Scroll, Zap, Cloud, MapPin, User, Package, Shield, ScrollText, Sword } from 'lucide-react';

export default function Home() {
  const { hero, login, godAction, testAI, loading } = useGame();
  const [inputName, setInputName] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'hero' | 'bag' | 'equip'>('logs');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'logs') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hero?.logs, activeTab]);

  // --- 登录页 ---
  if (!hero) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#fcf9f2] text-stone-800 p-6 relative overflow-hidden">
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
            className="px-8 py-3 bg-stone-800 text-[#fcf9f2] font-serif text-lg rounded shadow-lg hover:bg-stone-700 active:scale-95 transition-all"
          >
            {loading ? '墨研中...' : '入世修行'}
          </button>
        </div>
      </div>
    );
  }

  // --- 辅助组件：顶部状态栏 ---
  const Header = () => (
    <header className="p-4 pb-2 flex-none z-10 bg-[#fcf9f2]/90 backdrop-blur-sm border-b border-stone-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-wide mb-1">{hero.name}</h2>
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <span className="border border-stone-300 px-1 rounded bg-white">Lv.{hero.level} {hero.cultivation}</span>
            <span className="flex items-center gap-1"><MapPin size={10}/> {hero.location}</span>
          </div>
        </div>
        <div className="text-right">
            <div className="text-xl font-bold text-stone-800">{hero.gold} <span className="text-xs font-normal text-stone-500">文</span></div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="h-[2px] w-full bg-stone-200 rounded-full">
          <div className="h-full bg-stone-800 transition-all duration-500 rounded-full" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} />
        </div>
        <div className="h-[1px] w-full bg-stone-100 rounded-full">
          <div className="h-full bg-red-800/60 transition-all duration-500 rounded-full" style={{ width: `${(hero.exp / hero.maxExp) * 100}%` }} />
        </div>
      </div>
    </header>
  );

  // --- 1. 江湖日志视图 (含天罚赐福) ---
  const LogsView = () => (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-5 space-y-3 scroll-smooth">
        {hero.logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-700 flex gap-2 items-baseline">
            <span className="text-[10px] text-stone-300 font-sans shrink-0 w-8 text-right">{log.time}</span>
            <span className={`text-[14px] leading-6 text-justify ${
              log.type === 'highlight' ? 'text-red-800 font-bold' : 
              log.type === 'ai' ? 'text-stone-900 font-medium' : 'text-stone-600'
            }`}>
              {log.type === 'ai' && <span className="inline-block text-[9px] text-amber-600 mr-1 px-1 border border-amber-200 rounded bg-amber-50 align-middle">灵感</span>}
              {log.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
      
      {/* 悬浮操作栏 (仅在日志页显示) */}
      <div className="p-4 bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent">
         <div className="flex justify-between gap-4">
          <button onClick={() => godAction('punish')} className="flex-1 h-10 border border-stone-200 rounded flex items-center justify-center gap-2 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm">
            <Zap size={14} /> <span className="text-xs">天罚</span>
          </button>
          <button onClick={testAI} className="h-10 px-4 border border-stone-200 rounded text-stone-400 hover:text-stone-600 text-[10px] bg-white">
            测试天道
          </button>
          <button onClick={() => godAction('bless')} className="flex-1 h-10 border border-stone-200 rounded flex items-center justify-center gap-2 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm">
            <Cloud size={14} /> <span className="text-xs">赐福</span>
          </button>
        </div>
      </div>
    </div>
  );

  // --- 2. 英雄属性视图 ---
  const HeroView = () => (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      {/* 基础信息卡片 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><User size={16}/> 侠客档案</h3>
        <div className="grid grid-cols-2 gap-y-3 text-sm text-stone-600">
          <div><span className="text-stone-400">道号：</span>{hero.name}</div>
          <div><span className="text-stone-400">性别：</span>{hero.gender}</div>
          <div><span className="text-stone-400">芳龄：</span>{hero.age} 岁</div>
          <div><span className="text-stone-400">境界：</span>{hero.cultivation}</div>
          <div><span className="text-stone-400">游历：</span>{hero.stats.days} 天</div>
          <div><span className="text-stone-400">击杀：</span>{hero.stats.kills}</div>
        </div>
      </div>

      {/* 武学卡片 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Sword size={16}/> 武学修为</h3>
        <div className="space-y-3">
          {hero.skills.map((skill, i) => (
            <div key={i} className="border-b border-stone-50 pb-2 last:border-0 last:pb-0">
              <div className="flex justify-between">
                <span className="font-medium text-stone-700">{skill.name}</span>
                <span className="text-xs bg-stone-100 px-1 rounded text-stone-500">Lv.{skill.level}</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">{skill.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 生活技能 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Package size={16}/> 生活杂艺</h3>
        <div className="space-y-2">
           {hero.lifeSkills.map((skill, i) => (
             <div key={i} className="flex justify-between text-sm">
                <span className="text-stone-600">{skill.name}</span>
                <span className="text-stone-400 text-xs">{skill.desc}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  // --- 3. 背包视图 ---
  const BagView = () => (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="font-bold text-stone-800 mb-4 px-2">行囊 ({hero.inventory.length}/50)</h3>
      {hero.inventory.length === 0 ? (
        <div className="text-center text-stone-400 mt-20">空空如也，脸比兜干净。</div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {hero.inventory.map((item, idx) => (
            <div key={idx} className="aspect-square bg-white border border-stone-200 rounded flex flex-col items-center justify-center p-2 text-center shadow-sm hover:border-amber-400 transition-colors">
              <Package size={20} className="text-stone-300 mb-1" />
              <span className="text-[10px] text-stone-600 leading-tight line-clamp-2">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --- 4. 装备视图 ---
  const EquipView = () => (
    <div className="p-6 h-full flex flex-col items-center">
       <div className="relative w-64 h-80 bg-stone-100 rounded-xl border border-stone-200 mt-4 flex items-center justify-center">
          {/* 人物剪影 (简单用文字代替) */}
          <div className="text-stone-300 text-6xl opacity-20 font-serif">侠</div>

          {/* 装备槽位 */}
          <div className="absolute top-4 left-4 w-12 h-12 bg-white border border-stone-300 rounded flex items-center justify-center shadow-sm">
             {hero.equipment.weapon ? <Sword size={20} className="text-stone-800"/> : <Sword size={20} className="text-stone-200"/>}
          </div>
          <div className="absolute top-4 right-4 w-12 h-12 bg-white border border-stone-300 rounded flex items-center justify-center shadow-sm">
             {hero.equipment.armor ? <Shield size={20} className="text-stone-800"/> : <Shield size={20} className="text-stone-200"/>}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white border border-stone-300 rounded flex items-center justify-center shadow-sm">
             {hero.equipment.accessory ? <Zap size={20} className="text-stone-800"/> : <Zap size={20} className="text-stone-200"/>}
          </div>
       </div>
       <div className="mt-8 text-center text-stone-500 text-sm">
          <p>当前装备加成</p>
          <p className="text-xs mt-2 text-stone-400">暂无装备，赤手空拳闯江湖。</p>
       </div>
    </div>
  );

  // --- 主界面 ---
  return (
    <div className="flex flex-col h-[100dvh] bg-[#fcf9f2] text-stone-800 font-serif max-w-md mx-auto shadow-2xl relative">
      <Header />
      
      {/* 中间内容区 (根据 Tab 切换) */}
      <main className="flex-1 overflow-hidden bg-[#fcf9f2]">
        {activeTab === 'logs' && <LogsView />}
        {activeTab === 'hero' && <HeroView />}
        {activeTab === 'bag' && <BagView />}
        {activeTab === 'equip' && <EquipView />}
      </main>

      {/* 底部导航栏 */}
      <nav className="h-16 bg-white border-t border-stone-200 flex justify-around items-center px-2 flex-none z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center gap-1 p-2 w-16 ${activeTab === 'logs' ? 'text-stone-800' : 'text-stone-400'}`}>
          <ScrollText size={20} strokeWidth={activeTab === 'logs' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">江湖</span>
        </button>
        <button onClick={() => setActiveTab('hero')} className={`flex flex-col items-center gap-1 p-2 w-16 ${activeTab === 'hero' ? 'text-stone-800' : 'text-stone-400'}`}>
          <User size={20} strokeWidth={activeTab === 'hero' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">侠客</span>
        </button>
        <button onClick={() => setActiveTab('bag')} className={`flex flex-col items-center gap-1 p-2 w-16 ${activeTab === 'bag' ? 'text-stone-800' : 'text-stone-400'}`}>
          <Package size={20} strokeWidth={activeTab === 'bag' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">行囊</span>
        </button>
        <button onClick={() => setActiveTab('equip')} className={`flex flex-col items-center gap-1 p-2 w-16 ${activeTab === 'equip' ? 'text-stone-800' : 'text-stone-400'}`}>
          <Shield size={20} strokeWidth={activeTab === 'equip' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">装备</span>
        </button>
      </nav>
    </div>
  );
}