'use client';
import { useGame } from '@/hooks/useGame';
import { useEffect, useRef, useState } from 'react';
import { ScrollText, Zap, Cloud, MapPin, User, Package, Shield, Sword, Gem, Footprints, Shirt, HardHat } from 'lucide-react';
import { ItemType } from '@/app/lib/constants';

export default function Home() {
  const { hero, login, godAction, loading } = useGame();
  const [inputName, setInputName] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'hero' | 'bag' | 'equip'>('logs');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'logs') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hero?.logs, activeTab]);

  if (!hero) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#fcf9f2] text-stone-800 p-6 relative overflow-hidden">
        <div className="z-10 flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-stone-800 rounded-full flex items-center justify-center mb-6 shadow-lg bg-white">
             <span className="font-serif text-4xl font-bold">侠</span>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2 tracking-[0.5em] text-stone-900">云游江湖</h1>
          <p className="text-stone-500 text-sm mb-12 font-serif tracking-widest">一剑 · 一酒 · 一江湖</p>
          <input type="text" placeholder="请赐道号" className="w-64 bg-transparent border-b-2 border-stone-300 p-2 text-center text-xl outline-none focus:border-stone-800 transition-colors mb-8 font-serif placeholder:text-stone-300" value={inputName} onChange={e => setInputName(e.target.value)} />
          <button onClick={() => inputName && login(inputName)} disabled={loading} className="px-8 py-3 bg-stone-800 text-[#fcf9f2] font-serif text-lg rounded shadow-lg hover:bg-stone-700 active:scale-95 transition-all">{loading ? '墨研中...' : '入世修行'}</button>
        </div>
      </div>
    );
  }

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

  const LogsView = () => (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-5 space-y-3 scroll-smooth">
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
      <div className="p-4 bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent">
         <div className="flex justify-between gap-4">
          <button onClick={() => godAction('punish')} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-red-800"><Zap size={14} /> 天罚</span>
            <span className="text-[10px] text-stone-400">扣血 / 涨经验</span>
          </button>
          <button onClick={() => godAction('bless')} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-emerald-800"><Cloud size={14} /> 赐福</span>
            <span className="text-[10px] text-stone-400">回满状态</span>
          </button>
        </div>
      </div>
    </div>
  );

  const HeroView = () => (
    <div className="p-6 overflow-y-auto h-full space-y-6">
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
    </div>
  );

  // 行囊：显示堆叠数量
  const BagView = () => (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="font-bold text-stone-800 mb-4 px-2">行囊 ({hero.inventory.length}/20)</h3>
      {hero.inventory.length === 0 ? (
        <div className="text-center text-stone-400 mt-20">空空如也</div>
      ) : (
        <div className="space-y-2">
          {hero.inventory.map((item, idx) => (
            <div key={idx} className="bg-white border border-stone-100 p-3 rounded flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-stone-50 rounded flex items-center justify-center text-stone-300 relative">
                    <Package size={16}/>
                    {item.count > 1 && <span className="absolute -top-1 -right-1 bg-amber-100 text-amber-800 text-[9px] px-1 rounded-full border border-amber-200">x{item.count}</span>}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-700">{item.name}</div>
                    <div className="text-xs text-stone-400">{item.desc}</div>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] px-2 py-1 bg-stone-50 text-stone-500 rounded inline-block mb-1">
                    价值 {item.price}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 text-center text-xs text-stone-400 px-8">
        包满了侠客会自动去城镇卖掉，不用操心。
      </div>
    </div>
  );

  // 装备：6个槽位
  const EquipView = () => {
    const slots: {key: ItemType, label: string, icon: any}[] = [
      { key: 'head', label: '头饰', icon: <HardHat size={18}/> },
      { key: 'weapon', label: '兵器', icon: <Sword size={18}/> },
      { key: 'body',  label: '衣甲', icon: <Shirt size={18}/> },
      { key: 'legs', label: '护腿', icon: <Shield size={18}/> },
      { key: 'feet', label: '鞋靴', icon: <Footprints size={18}/> },
      { key: 'accessory', label: '饰品', icon: <Gem size={18}/> },
    ];

    return (
      <div className="p-4 h-full overflow-y-auto">
         <h3 className="font-bold text-stone-800 mb-4 px-2">当前装备</h3>
         <div className="grid grid-cols-2 gap-3">
            {slots.map((slot) => {
              const item = hero.equipment[slot.key as keyof typeof hero.equipment];
              return (
                <div key={slot.key} className="bg-white border border-stone-100 p-3 rounded-lg flex flex-col items-center gap-2 shadow-sm text-center">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${item ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-stone-50 border-stone-100 text-stone-300'}`}>
                      {slot.icon}
                   </div>
                   <div className="flex-1 w-full">
                      <div className="text-[10px] text-stone-400 mb-0.5">{slot.label}</div>
                      {item ? (
                        <>
                          <div className="font-bold text-stone-800 text-sm truncate w-full">{item.name}</div>
                        </>
                      ) : (
                        <div className="text-stone-300 italic text-xs">空</div>
                      )}
                   </div>
                </div>
              );
            })}
         </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#fcf9f2] text-stone-800 font-serif max-w-md mx-auto shadow-2xl relative">
      <Header />
      <main className="flex-1 overflow-hidden bg-[#fcf9f2]">
        {activeTab === 'logs' && <LogsView />}
        {activeTab === 'hero' && <HeroView />}
        {activeTab === 'bag' && <BagView />}
        {activeTab === 'equip' && <EquipView />}
      </main>
      <nav className="h-16 bg-white border-t border-stone-200 flex justify-around items-center px-2 flex-none z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center gap-1 p-2 w-16 ${activeTab === 'logs' ? 'text-stone-800' : 'text-stone-400'}`}><ScrollText size={20} strokeWidth={activeTab === 'logs' ? 2.5 : 2} /><span className="text-[10px] font-bold">江湖</span></button>
        <button onClick={() => setActiveTab('hero')} className={`flex flex-col items-center gap-1 p-2 w-16 ${activeTab === 'hero' ? 'text-stone-800' : 'text-stone-400'}`}><User size={20} strokeWidth={activeTab === 'hero' ? 2.5 : 2} /><span className="text-[10px] font-bold">侠客</span></button>
        <button onClick={() => setActiveTab('bag')} className={`flex flex-col items-center gap-1 p-2 w-16 ${activeTab === 'bag' ? 'text-stone-800' : 'text-stone-400'}`}><Package size={20} strokeWidth={activeTab === 'bag' ? 2.5 : 2} /><span className="text-[10px] font-bold">行囊</span></button>
        <button onClick={() => setActiveTab('equip')} className={`flex flex-col items-center gap-1 p-2 w-16 ${activeTab === 'equip' ? 'text-stone-800' : 'text-stone-400'}`}><Shield size={20} strokeWidth={activeTab === 'equip' ? 2.5 : 2} /><span className="text-[10px] font-bold">装备</span></button>
      </nav>
    </div>
  );
}