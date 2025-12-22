'use client';
import { useGame } from '@/hooks/useGame';
import { useEffect, useRef, useState } from 'react';
import { ScrollText, Zap, Cloud, MapPin, User, Package, Shield, Sword, Gem, Footprints, Shirt, HardHat, Target, Star, History, Brain, BicepsFlexed, Heart, Clover, Wind, Lock, PawPrint, Trophy, Quote, BookOpen, Stethoscope, Bell, MessageSquare, Info, Save } from 'lucide-react';
import { ItemType } from '@/app/lib/constants';

export default function Home() {
  const { hero, login, godAction, loading, error, clearError } = useGame();
  const [inputName, setInputName] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'hero' | 'bag' | 'equip' | 'messages'>('logs');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'logs') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hero?.logs, activeTab]);

  // --- 登录界面 (带密码) ---
  if (!hero) {
    return (
       <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#fcf9f2] text-stone-800 p-6 relative overflow-hidden">
        <div className="z-10 flex flex-col items-center w-full max-w-xs">
          <div className="w-20 h-20 border-4 border-stone-800 rounded-full flex items-center justify-center mb-6 shadow-lg bg-white"><span className="font-serif text-4xl font-bold">侠</span></div>
          <h1 className="text-4xl font-serif font-bold mb-8 tracking-[0.5em] text-stone-900">云游江湖</h1>
          
          <div className="flex flex-col gap-4 w-full">
            <input 
              type="text" 
              placeholder="大侠尊姓大名" 
              className="w-full bg-white/50 border-b-2 border-stone-300 p-3 text-center text-lg outline-none focus:border-stone-800 transition-colors font-serif placeholder:text-stone-400 rounded-t" 
              value={inputName} 
              onChange={e => {setInputName(e.target.value); clearError();}} 
            />
            <input 
              type="password" 
              placeholder="输入密令 (防止他人冒充)" 
              className="w-full bg-white/50 border-b-2 border-stone-300 p-3 text-center text-lg outline-none focus:border-stone-800 transition-colors font-serif placeholder:text-stone-400 rounded-b" 
              value={inputPassword} 
              onChange={e => {setInputPassword(e.target.value); clearError();}} 
            />
          </div>

          {error && <div className="text-red-600 text-xs mt-3 bg-red-50 px-2 py-1 rounded border border-red-200">{error}</div>}

          <button 
            onClick={() => inputName && inputPassword && login(inputName, inputPassword)} 
            disabled={loading || !inputName || !inputPassword}
            className="mt-8 px-10 py-3 bg-stone-800 text-[#fcf9f2] font-serif text-lg rounded shadow-lg hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {loading ? '正在读取江湖存档...' : '入世 / 继续'}
          </button>
          
          <p className="text-stone-400 text-xs mt-4">
            * 若名字不存在则自动创建，若存在则验证密令
          </p>
        </div>
      </div>
    );
  }

  // Header
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
        <div className="flex flex-col items-end gap-1">
           <div className="text-sm font-bold text-amber-700 flex items-center gap-1">
             <div className="w-4 h-4 rounded-full border border-amber-600 flex items-center justify-center text-[10px]">文</div>
             {hero.gold}
           </div>
           <div className="flex items-center gap-1 text-amber-600 font-bold text-xs"><Zap size={12} fill="currentColor"/> {Math.floor(hero.godPower)}%</div>
           <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden"><div className="h-full bg-amber-500 transition-all duration-500" style={{width: `${hero.godPower}%`}}></div></div>
        </div>
      </div>
      <div className="bg-white border border-stone-200 rounded p-2 shadow-sm flex flex-col gap-1 mb-2">
         <div className="flex justify-between text-[10px] text-stone-500">
            <span className="flex items-center gap-1 font-bold text-stone-700 truncate max-w-[200px]"><Target size={10} className="text-amber-600 shrink-0"/> {hero.currentQuest.name}</span>
            <span className="font-mono">{hero.currentQuest.progress}%</span>
         </div>
         <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500 transition-all duration-700 rounded-full" style={{ width: `${hero.currentQuest.progress}%` }} /></div>
      </div>
      <div className="space-y-1">
        <div className="h-[2px] w-full bg-stone-200 rounded-full"><div className="h-full bg-stone-800 transition-all duration-500 rounded-full" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} /></div>
      </div>
    </header>
  );

  // 1. 日志
  const LogsView = () => (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
        {hero.logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-700 flex gap-2 items-baseline">
            <span className="text-[10px] text-stone-300 font-sans shrink-0 w-8 text-right">{log.time}</span>
            <span className={`text-[14px] leading-6 text-justify ${log.type === 'highlight' ? 'text-red-800 font-bold' : log.type === 'system' ? 'text-stone-400 italic text-xs' : 'text-stone-700'}`}>{log.text}</span>
          </div>
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
      <div className="p-4 bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent">
         <div className="flex justify-between gap-4">
          <button onClick={() => godAction('punish')} disabled={hero.godPower < 25} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-red-800"><Zap size={14} /> 天罚</span>
            <span className="text-[10px] text-stone-400">消耗 25%</span>
          </button>
          <button onClick={() => godAction('bless')} disabled={hero.godPower < 25} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-emerald-800"><Cloud size={14} /> 赐福</span>
            <span className="text-[10px] text-stone-400">消耗 25%</span>
          </button>
        </div>
      </div>
    </div>
  );

  // 2. 侠客
  const HeroView = () => (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><User size={16}/> 档案</h3>
        <div className="mb-4">
           <div className="flex justify-between text-xs text-stone-500 mb-1"><span>{hero.storyStage} (Lv.{hero.level})</span><span>{hero.exp}/{hero.maxExp}</span></div>
           <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${(hero.exp / hero.maxExp) * 100}%`}}></div></div>
        </div>
        <div className="flex items-center justify-between mb-4">
           <div className="text-center flex-1 border-r border-stone-100"><div className="text-xs text-stone-400">性格</div><div className="font-bold text-stone-700">{hero.personality}</div></div>
           <div className="text-center flex-1 border-r border-stone-100"><div className="text-xs text-stone-400">善恶</div><div className="font-bold text-stone-700">{hero.alignment}</div></div>
           <div className="text-center flex-1"><div className="text-xs text-stone-400">岁数</div><div className="font-bold text-stone-700">{hero.age}</div></div>
        </div>
        {hero.unlockedFeatures.includes('motto') && (
           <div className="mt-4 p-3 bg-stone-50 rounded border border-stone-100 relative">
              <Quote size={12} className="absolute top-2 left-2 text-stone-300"/>
              <div className="text-center text-sm font-serif italic text-stone-600">“{hero.motto}”</div>
           </div>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
         <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><BookOpen size={16}/> 武学修养</h3>
         <div className="space-y-3">
            {hero.martialArts.map((skill, i) => (
              <div key={i} className="flex justify-between items-center border-b border-stone-50 pb-2 last:border-0 last:pb-0">
                 <div>
                    <div className="font-bold text-stone-700 text-sm">{skill.name} <span className="text-xs font-normal text-stone-400 bg-stone-100 px-1 rounded">Lv.{skill.level}</span></div>
                    <div className="text-[10px] text-stone-400">{skill.desc}</div>
                 </div>
                 <div className="text-xs text-stone-300">{skill.type === 'inner' ? '内功' : skill.type === 'speed' ? '轻功' : '外功'}</div>
              </div>
            ))}
         </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
         <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Stethoscope size={16}/> 生活百艺</h3>
         <div className="flex flex-wrap gap-2">
            {hero.lifeSkills.map((skill, i) => (
              <span key={i} className="text-xs border border-stone-200 px-2 py-1 rounded text-stone-600 bg-stone-50">{skill.name} Lv.{skill.level}</span>
            ))}
         </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
         <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Star size={16}/> 天赋资质</h3>
         <div className="space-y-3">
             <AttributeRow icon={<Heart size={14}/>} label="体魄" val={hero.attributes.constitution} color="bg-red-400" />
             <AttributeRow icon={<BicepsFlexed size={14}/>} label="臂力" val={hero.attributes.strength} color="bg-amber-400" />
             <AttributeRow icon={<Wind size={14}/>} label="身法" val={hero.attributes.dexterity} color="bg-blue-400" />
             <AttributeRow icon={<Brain size={14}/>} label="悟性" val={hero.attributes.intelligence} color="bg-purple-400" />
             <AttributeRow icon={<Clover size={14}/>} label="福源" val={hero.attributes.luck} color="bg-emerald-400" />
         </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><History size={16}/> 传闻轶事</h3>
        <div className="space-y-3 pl-2 border-l-2 border-stone-100">
           {hero.majorEvents.slice(0, 5).map((event, i) => (
             <div key={i} className="text-xs text-stone-500 relative pl-2"><div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-stone-300 ring-2 ring-white"></div>{event}</div>
           ))}
        </div>
      </div>
    </div>
  );

  const AttributeRow = ({icon, label, val, color}: any) => (<div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-stone-600">{icon} {label}</span><div className="flex items-center gap-2"><div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full" style={{width: `${Math.min(100, val * 2)}%`, backgroundColor: color.replace('bg-', '') === 'bg-red-400' ? '#f87171' : color === 'bg-amber-400' ? '#fbbf24' : color === 'bg-blue-400' ? '#60a5fa' : color === 'bg-purple-400' ? '#c084fc' : '#34d399'}}></div></div><span className="font-mono text-xs w-6 text-right">{val}</span></div></div>);

  const BagView = () => (<div className="p-4 h-full overflow-y-auto"><h3 className="font-bold text-stone-800 mb-4 px-2">行囊 ({hero.inventory.length}/20)</h3><div className="space-y-2">{hero.inventory.map((item,i)=><div key={i} className="bg-white border border-stone-100 p-3 rounded flex justify-between"><span className="font-bold text-sm text-stone-700">{item.name}</span><div className="text-right"><span className="text-xs text-stone-400 block">x{item.count}</span><span className="text-[10px] bg-stone-100 px-1 rounded text-stone-500">价{item.price}</span></div></div>)}</div></div>);
  const EquipView = () => { const slots: {key: ItemType, label: string, icon: any}[] = [{ key: 'head', label: '头饰', icon: <HardHat size={18}/> }, { key: 'weapon', label: '兵器', icon: <Sword size={18}/> }, { key: 'body',  label: '衣甲', icon: <Shirt size={18}/> }, { key: 'legs', label: '护腿', icon: <Shield size={18}/> }, { key: 'feet', label: '鞋靴', icon: <Footprints size={18}/> }, { key: 'accessory', label: '饰品', icon: <Gem size={18}/> }]; return (<div className="p-4 h-full overflow-y-auto"><div className="space-y-3">{slots.map((slot) => { const item = hero.equipment[slot.key as keyof typeof hero.equipment]; return (<div key={slot.key} className="bg-white border border-stone-100 p-4 rounded-lg flex items-center gap-4 shadow-sm"><div className={`w-10 h-10 rounded-full flex items-center justify-center border ${item ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-stone-50 border-stone-100 text-stone-300'}`}>{slot.icon}</div><div className="flex-1"><div className="text-xs text-stone-400 mb-1">{slot.label}</div>{item ? <div className="font-bold text-stone-800 text-sm">{item.name}</div> : <div className="text-stone-300 italic text-sm">空</div>}</div></div>)})}</div></div>);};

  const MessagesView = () => {
    const rumors = hero.messages.filter(m => m.type === 'rumor');
    const systems = hero.messages.filter(m => m.type === 'system');
    return (
      <div className="p-4 h-full overflow-y-auto space-y-6">
         <div>
            <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 px-1"><MessageSquare size={16}/> 江湖风声</h3>
            {rumors.length === 0 ? <div className="text-center text-stone-300 text-xs italic">暂无风声</div> : (
              <div className="space-y-3">
                 {rumors.map((msg) => (
                   <div key={msg.id} className="bg-amber-50 border border-amber-100 p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                         <div className="font-bold text-amber-900 text-sm">{msg.title}</div>
                         <div className="text-[10px] text-amber-400">{msg.time}</div>
                      </div>
                      <div className="text-xs text-amber-800 leading-relaxed text-justify">{msg.content}</div>
                   </div>
                 ))}
              </div>
            )}
         </div>
         <div>
            <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 px-1"><Info size={16}/> 系统记录</h3>
            {systems.length === 0 ? <div className="text-center text-stone-300 text-xs italic">暂无记录</div> : (
              <div className="bg-white border border-stone-100 rounded-lg overflow-hidden">
                 {systems.map((msg, i) => (
                   <div key={msg.id} className={`p-3 border-b border-stone-50 last:border-0 ${i%2===0?'bg-white':'bg-stone-50/50'}`}>
                      <div className="flex justify-between mb-1">
                         <span className="font-bold text-stone-700 text-xs">{msg.title}</span>
                         <span className="text-[10px] text-stone-400">{msg.time}</span>
                      </div>
                      <div className="text-xs text-stone-500">{msg.content}</div>
                   </div>
                 ))}
              </div>
            )}
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
        {activeTab === 'messages' && <MessagesView />}
      </main>
      <nav className="h-16 bg-white border-t border-stone-200 flex justify-around items-center px-2 flex-none z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
         <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center gap-1 p-2 w-14 ${activeTab === 'logs' ? 'text-stone-800' : 'text-stone-400'}`}><ScrollText size={20} strokeWidth={activeTab === 'logs' ? 2.5 : 2} /><span className="text-[10px] font-bold">江湖</span></button>
         <button onClick={() => setActiveTab('hero')} className={`flex flex-col items-center gap-1 p-2 w-14 ${activeTab === 'hero' ? 'text-stone-800' : 'text-stone-400'}`}><User size={20} strokeWidth={activeTab === 'hero' ? 2.5 : 2} /><span className="text-[10px] font-bold">侠客</span></button>
         <button onClick={() => setActiveTab('bag')} className={`flex flex-col items-center gap-1 p-2 w-14 ${activeTab === 'bag' ? 'text-stone-800' : 'text-stone-400'}`}><Package size={20} strokeWidth={activeTab === 'bag' ? 2.5 : 2} /><span className="text-[10px] font-bold">行囊</span></button>
         <button onClick={() => setActiveTab('equip')} className={`flex flex-col items-center gap-1 p-2 w-14 ${activeTab === 'equip' ? 'text-stone-800' : 'text-stone-400'}`}><Shield size={20} strokeWidth={activeTab === 'equip' ? 2.5 : 2} /><span className="text-[10px] font-bold">装备</span></button>
         <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center gap-1 p-2 w-14 ${activeTab === 'messages' ? 'text-stone-800' : 'text-stone-400'}`}><Bell size={20} strokeWidth={activeTab === 'messages' ? 2.5 : 2} /><span className="text-[10px] font-bold">告示</span></button>
      </nav>
    </div>
  );
}