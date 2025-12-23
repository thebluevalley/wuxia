'use client';
import { useGame } from '@/hooks/useGame';
import { useEffect, useRef, useState } from 'react';
import { ScrollText, Zap, Cloud, MapPin, User, Package, Shield, Sword, Gem, Footprints, Shirt, HardHat, Target, Star, History, Brain, BicepsFlexed, Heart, Clover, Wind, Lock, PawPrint, Trophy, Quote, BookOpen, Stethoscope, Bell, MessageSquare, Info, Beer, RefreshCw, UserPlus, Scroll, Clock, Battery } from 'lucide-react';
import { Item, ItemType, Quality, QuestRank, SkillType } from '@/app/lib/constants';

// 打字机组件
const TypewriterText = ({ text, className }: { text: string, className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    // 如果文本太短或已经完全显示，就不重置动画，防止闪烁
    if (text === displayedText) return;

    let index = 0;
    setDisplayedText(''); 
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 80); 

    return () => clearInterval(timer);
  }, [text]); // 仅当 text 内容变化时才触发打字效果

  return <span className={`${className} animate-in fade-in duration-500`}>{displayedText}</span>;
};

export default function Home() {
  const { hero, login, godAction, loading, error, clearError, hireCompanion, acceptQuest } = useGame();
  const [inputName, setInputName] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'hero' | 'bag' | 'messages' | 'tavern'>('logs');
  
  const getQualityColor = (q: Quality) => {
    switch (q) {
      case 'legendary': return 'text-orange-900 font-bold';
      case 'epic': return 'text-purple-800 font-bold';
      case 'rare': return 'text-blue-700 font-bold';
      default: return 'text-stone-600';
    }
  };

  const getQualityBadgeClass = (q: Quality) => {
    switch (q) {
      case 'legendary': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'epic': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'rare': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-stone-50 text-stone-500 border-stone-200';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case '私生子': return 'text-stone-500 bg-stone-100 border-stone-200';
      case '侍从': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case '骑士': return 'text-blue-700 bg-blue-50 border-blue-200';
      case '领主': return 'text-purple-800 bg-purple-50 border-purple-200';
      case '王者': return 'text-orange-800 bg-orange-50 border-orange-200';
      default: return 'text-stone-500 bg-stone-100 border-stone-200';
    }
  };

  const getJobIcon = (job: string) => {
    if (!job) return <User size={24} className="text-stone-800"/>;
    if (job.includes('剑') || job.includes('骑士') || job.includes('刺客') || job.includes('卫兵')) return <Sword size={24} className="text-stone-800"/>;
    if (job.includes('守夜人') || job.includes('铁卫')) return <Shield size={24} className="text-stone-800"/>;
    if (job.includes('学士') || job.includes('祭司')) return <BookOpen size={24} className="text-stone-800"/>;
    return <ScrollText size={24} className="text-stone-800"/>;
  };

  const getSkillLabel = (type: SkillType) => {
    switch (type) {
        case 'combat': return '战技';
        case 'intrigue': return '权谋';
        case 'survival': return '求生';
        case 'knowledge': return '学识';
        case 'command': return '统帅';
        default: return '技能';
    }
  };

  if (!hero) {
    return (
       <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#fcf9f2] text-stone-800 p-6 relative overflow-hidden">
        <div className="z-10 flex flex-col items-center w-full max-w-xs">
          <div className="w-20 h-20 border-4 border-stone-800 rounded-full flex items-center justify-center mb-6 shadow-lg bg-white"><span className="font-serif text-4xl font-bold">权</span></div>
          <h1 className="text-2xl font-serif font-bold mb-8 tracking-[0.2em] text-stone-900 text-center">凡人皆有一死<br/><span className="text-xs font-normal text-stone-500 tracking-normal">Valar Morghulis</span></h1>
          <div className="flex flex-col gap-4 w-full">
            <input type="text" placeholder="家族姓氏 / 名字" className="w-full bg-white/50 border-b-2 border-stone-300 p-3 text-center text-lg outline-none focus:border-stone-800 transition-colors font-serif placeholder:text-stone-400 rounded-t" value={inputName} onChange={e => {setInputName(e.target.value); clearError();}} />
            <input type="password" placeholder="密语" className="w-full bg-white/50 border-b-2 border-stone-300 p-3 text-center text-lg outline-none focus:border-stone-800 transition-colors font-serif placeholder:text-stone-400 rounded-b" value={inputPassword} onChange={e => {setInputPassword(e.target.value); clearError();}} />
          </div>
          {error && <div className="text-red-600 text-xs mt-3 bg-red-50 px-2 py-1 rounded border border-red-200">{error}</div>}
          <button onClick={() => inputName && inputPassword && login(inputName, inputPassword)} disabled={loading || !inputName || !inputPassword} className="mt-8 px-10 py-3 bg-stone-800 text-[#fcf9f2] font-serif text-lg rounded shadow-lg hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full">{loading ? '正在读取渡鸦传信...' : '加入权力的游戏'}</button>
        </div>
      </div>
    );
  }

  const questPercent = hero.currentQuest 
    ? Math.min(100, Math.floor((hero.currentQuest.progress / hero.currentQuest.total) * 100)) 
    : 0;

  const Header = () => (
    <header className="p-4 pb-2 flex-none z-10 bg-[#fcf9f2]/90 backdrop-blur-sm border-b border-stone-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-stone-900 tracking-wide">{hero.name}</h2>
            <div className={`text-[10px] px-2 py-0.5 rounded border ${getStageColor(hero.storyStage)}`}>{hero.storyStage}</div>
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-xs">
            <span className="border border-stone-300 px-1 rounded bg-white font-mono">Lv.{hero.level}</span>
            <span className="flex items-center gap-1"><MapPin size={10}/> {hero.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
           <div className="text-sm font-bold text-amber-900 flex items-center gap-1">
             <div className="w-4 h-4 rounded-full border border-amber-900 flex items-center justify-center text-[10px]">金</div>
             {hero.gold}
           </div>
           <div className="flex items-center gap-2">
             <div className="flex flex-col items-end">
               <div className="flex items-center gap-1 text-emerald-800 font-bold text-[10px]"><Battery size={10}/> {Math.floor(hero.stamina)}</div>
               <div className="w-12 h-1 bg-stone-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{width: `${(hero.stamina / hero.maxStamina) * 100}%`}}></div></div>
             </div>
             <div className="flex flex-col items-end">
               <div className="flex items-center gap-1 text-amber-900 font-bold text-[10px]"><Zap size={10}/> {Math.floor(hero.godPower)}</div>
               <div className="w-12 h-1 bg-stone-200 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{width: `${hero.godPower}%`}}></div></div>
             </div>
           </div>
        </div>
      </div>
      <div className="bg-white border border-stone-200 rounded p-2 shadow-sm flex flex-col gap-1 mb-2">
         <div className="flex justify-between text-[10px] text-stone-500 mb-1">
            <span className="flex items-center gap-1 font-bold text-stone-700 truncate max-w-[200px]">
              <Target size={10} className="text-stone-800 shrink-0"/> 
              {hero.currentQuest ? hero.currentQuest.name : "暂无事务"}
            </span>
            <span className="font-mono">{hero.currentQuest ? `${questPercent}%` : ""}</span>
         </div>
         <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden mb-1">
           <div className={`h-full transition-all duration-700 rounded-full ${hero.currentQuest ? 'bg-amber-600' : 'bg-transparent'}`} style={{ width: `${questPercent}%` }} />
         </div>
         {hero.queuedQuest && (
           <div className="text-[9px] text-stone-400 flex items-center gap-1 border-t border-stone-50 pt-1">
             <Clock size={8}/> 待办: {hero.queuedQuest.name}
           </div>
         )}
      </div>
      <div className="space-y-1">
        <div className="h-[2px] w-full bg-stone-200 rounded-full"><div className="h-full bg-stone-800 transition-all duration-500 rounded-full" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} /></div>
      </div>
    </header>
  );

  const LogsView = () => (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth">
        {hero.logs.map((log, index) => {
          const isLatest = index === 0; 
          const isNarrative = log.type === 'highlight';

          if (!isNarrative) return null;

          return (
            <div key={log.id} className="flex gap-2 items-baseline mb-4">
              <span className="text-[10px] text-stone-300 font-sans shrink-0 w-8 text-right tabular-nums opacity-50">{log.time}</span>
              {isLatest ? (
                 <TypewriterText 
                   text={log.text} 
                   className="text-[15px] leading-8 text-justify font-medium text-black" 
                 />
              ) : (
                 <span className="text-[15px] leading-8 text-justify font-medium text-black opacity-80">
                   {log.text}
                 </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="p-4 bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent">
         <div className="flex justify-between gap-4">
          <button onClick={() => godAction('punish')} disabled={hero.godPower < 25} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-red-900"><Zap size={14} /> 厄运</span>
            <span className="text-[10px] text-stone-400">消耗 25%</span>
          </button>
          <button onClick={() => godAction('bless')} disabled={hero.godPower < 25} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-amber-800"><Cloud size={14} /> 眷顾</span>
            <span className="text-[10px] text-stone-400">消耗 25%</span>
          </button>
        </div>
      </div>
    </div>
  );

  const EquipSlot = ({label, item, icon}: {label: string, item: Item | null, icon: any}) => (
    <div className="flex flex-col items-center bg-white p-2 rounded border border-stone-100">
       <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${item ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-300'}`}>{icon}</div>
       <div className="text-[9px] text-stone-400 mb-0.5">{label}</div>
       <div className={`text-[9px] font-bold truncate max-w-full ${item ? 'text-stone-700' : 'text-stone-300'}`}>{item ? item.name : "空"}</div>
    </div>
  );

  const HeroView = () => (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><User size={16}/> 档案</h3>
        <div className="mb-4">
           <div className="flex justify-between text-xs mb-1">
             <span className={`font-bold border px-1.5 py-0.5 rounded ${getStageColor(hero.storyStage)}`}>{hero.storyStage} <span className="text-stone-400 font-normal">Lv.{hero.level}</span></span>
             <span className="text-stone-400">{hero.exp}/{hero.maxExp}</span>
           </div>
           <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-stone-800 transition-all duration-500" style={{width: `${(hero.exp / hero.maxExp) * 100}%`}}></div></div>
        </div>
        <div className="flex items-center justify-between mb-4">
           <div className="text-center flex-1 border-r border-stone-100"><div className="text-xs text-stone-400">性格</div><div className="font-bold text-stone-700">{hero.personality}</div></div>
           <div className="text-center flex-1 border-r border-stone-100"><div className="text-xs text-stone-400">阵营</div><div className="font-bold text-stone-700">{hero.alignment > 0 ? "守序" : hero.alignment < 0 ? "混乱" : "中立"}</div></div>
           <div className="text-center flex-1"><div className="text-xs text-stone-400">命名日</div><div className="font-bold text-stone-700">{hero.age}</div></div>
        </div>
        
        <div className="mb-4 bg-stone-50 p-3 rounded border border-stone-100 relative">
           <div className="absolute top-2 right-2 text-stone-300 opacity-20"><ScrollText size={48}/></div>
           <div className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1"><Info size={12}/> 风评</div>
           <div className="text-[11px] text-stone-600 leading-relaxed font-serif italic">
             “{hero.description || "无名之辈。"}”
           </div>
        </div>

        <div className="mb-4 bg-stone-50 p-3 rounded border border-stone-100 relative">
           <div className="absolute top-2 right-2 text-stone-300 opacity-20"><Shield size={48}/></div>
           <div className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1"><Shirt size={12}/> 穿戴</div>
           <div className="text-[11px] text-stone-600 leading-relaxed font-serif italic mb-3">
             “{hero.equipmentDescription || "布衣寒剑。"}”
           </div>
           <div className="grid grid-cols-3 gap-2">
              <EquipSlot label="主手" item={hero.equipment.weapon} icon={<Sword size={12}/>} />
              <EquipSlot label="头盔" item={hero.equipment.head} icon={<HardHat size={12}/>} />
              <EquipSlot label="胸甲" item={hero.equipment.body} icon={<Shirt size={12}/>} />
              <EquipSlot label="腿甲" item={hero.equipment.legs} icon={<Shield size={12}/>} />
              <EquipSlot label="战靴" item={hero.equipment.feet} icon={<Footprints size={12}/>} />
              <EquipSlot label="信物" item={hero.equipment.accessory} icon={<Gem size={12}/>} />
           </div>
        </div>

        {hero.unlockedFeatures.includes('motto') && (
           <div className="mt-4 p-3 bg-stone-50 rounded border border-stone-100 relative"><Quote size={12} className="absolute top-2 left-2 text-stone-300"/><div className="text-center text-sm font-serif italic text-stone-600">“{hero.motto}”</div></div>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100 relative overflow-hidden">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><UserPlus size={16}/> 同行者</h3>
        {hero.companion ? (
           <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center border-2 border-stone-100 shadow-sm shrink-0">
                 {getJobIcon(hero.companion.archetype)}
              </div>
              <div className="flex-1 min-w-0">
                 <div className={`font-bold truncate ${getQualityColor(hero.companion.quality)}`}>{hero.companion.title} <span className="text-xs font-normal text-stone-500">| {hero.companion.name} ({hero.companion.gender})</span></div>
                 <div className="text-xs text-stone-500 mb-2 truncate">性格：{hero.companion.personality}</div>
                 <div className="text-[10px] text-stone-400 bg-stone-50 p-2 rounded leading-relaxed italic">"{hero.companion.desc}"</div>
                 <div className="mt-2 text-[10px] text-amber-700 flex items-center gap-1"><Info size={10}/> 契约剩余: {Math.max(0, Math.floor((hero.companionExpiry - Date.now()) / (1000 * 60 * 60)))} 小时</div>
              </div>
           </div>
        ) : (
           <div className="text-center py-6 text-stone-400 text-xs">独行于世。<br/>去酒馆寻找盟友？</div>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
         <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><BookOpen size={16}/> 能力</h3>
         <div className="space-y-3">
            {hero.martialArts.map((skill, i) => (
              <div key={i} className="flex justify-between items-center border-b border-stone-50 pb-2 last:border-0 last:pb-0">
                 <div><div className="font-bold text-stone-700 text-sm">{skill.name} <span className="text-xs font-normal text-stone-400 bg-stone-100 px-1 rounded">Lv.{skill.level}</span></div><div className="text-[10px] text-stone-400">{skill.desc}</div></div>
                 <div className="text-xs text-stone-300">{getSkillLabel(skill.type)}</div>
              </div>
            ))}
         </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
         <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Star size={16}/> 天赋</h3>
         <div className="space-y-3">
             <AttributeRow icon={<Heart size={14}/>} label="体质" val={hero.attributes.constitution} color="bg-red-400" />
             <AttributeRow icon={<BicepsFlexed size={14}/>} label="力量" val={hero.attributes.strength} color="bg-amber-400" />
             <AttributeRow icon={<Wind size={14}/>} label="灵巧" val={hero.attributes.dexterity} color="bg-blue-400" />
             <AttributeRow icon={<Brain size={14}/>} label="智力" val={hero.attributes.intelligence} color="bg-purple-400" />
             <AttributeRow icon={<Clover size={14}/>} label="气运" val={hero.attributes.luck} color="bg-emerald-400" />
         </div>
      </div>
    </div>
  );

  const AttributeRow = ({icon, label, val, color}: any) => (<div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-stone-600">{icon} {label}</span><div className="flex items-center gap-2"><div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-stone-400" style={{width: `${Math.min(100, val * 2)}%`}}></div></div><span className="font-mono text-xs w-6 text-right">{val}</span></div></div>);

  const BagView = () => (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-bold text-stone-800">行囊 ({hero.inventory.length}/20)</h3>
        <span className="text-[10px] text-stone-400 italic">物品将由角色自动使用</span>
      </div>
      <div className="space-y-2">
        {hero.inventory.map((item,i)=> (
          <div key={i} className="bg-white border border-stone-100 p-3 rounded flex justify-between items-center">
            <div>
              <span className={`text-sm font-bold ${getQualityColor(item.quality)}`}>{item.name}</span>
              <div className="text-xs text-stone-400">x{item.count} <span className="ml-2 text-[10px] text-stone-300">{item.desc}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-stone-50 px-1 rounded text-stone-400">价{item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MessagesView = () => { 
    const rumors = hero.messages.filter(m => m.type === 'rumor'); 
    const systems = hero.messages.filter(m => m.type === 'system'); 
    return (<div className="p-4 h-full overflow-y-auto space-y-6"><div><h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 px-1"><MessageSquare size={16}/> 渡鸦传信</h3>{rumors.length === 0 ? <div className="text-center text-stone-300 text-xs italic">暂无消息</div> : <div className="space-y-3">{rumors.map((msg)=><div key={msg.id} className="bg-amber-50 border border-amber-100 p-3 rounded-lg shadow-sm"><div className="flex justify-between items-start mb-1"><div className="font-bold text-amber-900 text-sm">{msg.title}</div><div className="text-[10px] text-amber-400">{msg.time}</div></div><div className="text-xs text-amber-800 leading-relaxed text-justify">{msg.content}</div></div>)}</div>}</div><div><h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 px-1"><Info size={16}/> 学城记录</h3>{systems.length === 0 ? <div className="text-center text-stone-300 text-xs italic">暂无记录</div> : <div className="bg-white border border-stone-100 rounded-lg overflow-hidden">{systems.map((msg,i)=><div key={msg.id} className={`p-3 border-b border-stone-50 last:border-0 ${i%2===0?'bg-white':'bg-stone-50/50'}`}><div className="flex justify-between mb-1"><span className="font-bold text-stone-700 text-xs">{msg.title}</span><span className="text-[10px] text-stone-400">{msg.time}</span></div><div className="text-xs text-stone-500">{msg.content}</div></div>)}</div>}</div></div>);
  };

  const TavernView = () => {
    const refreshTimeLeft = Math.max(0, 6 * 60 * 60 * 1000 - (Date.now() - (hero.lastQuestRefresh || 0)));
    const hours = Math.floor(refreshTimeLeft / (1000 * 60 * 60));
    const mins = Math.floor((refreshTimeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return (
    <div className="p-4 h-full overflow-y-auto">
       <div className="mb-8">
           <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="font-bold text-stone-800 flex items-center gap-2"><Scroll size={16}/> 告示板</h3>
              <div className="text-[10px] text-stone-400 flex items-center gap-1"><Clock size={10}/> 刷新: {hours}小时{mins}分</div>
           </div>
           <div className="space-y-2">
              {hero.questBoard.map((quest) => (
                 <div key={quest.id} className="bg-white border border-stone-200 p-3 rounded-lg shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-1">
                       <div className="flex items-center gap-2">
                          <span className="text-stone-600 text-sm">{quest.category === 'combat' ? <Sword size={14}/> : <Beer size={14}/>}</span>
                          <span className="font-bold text-stone-700 text-sm">{quest.name}</span>
                       </div>
                       <div className="flex gap-0.5 text-stone-300">{[...Array(quest.rank)].map((_, i) => <Star key={i} size={8} fill="currentColor"/>)}</div>
                    </div>
                    <div className="text-[10px] text-stone-400 mb-2">{quest.desc}</div>
                    <div className="flex justify-between items-center border-t border-stone-50 pt-2">
                       <div className="text-[10px] text-stone-500 font-mono flex items-center gap-2">
                         <span>赏{quest.rewards.gold} / 验{quest.rewards.exp}</span>
                         <span className="text-emerald-600 flex items-center gap-0.5"><Battery size={8}/> -{quest.staminaCost}</span>
                       </div>
                       <button onClick={() => acceptQuest(quest.id)} disabled={!!hero.queuedQuest} className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${hero.queuedQuest ? 'bg-stone-100 text-stone-300' : 'bg-stone-800 text-white hover:bg-stone-700 active:scale-95'}`}>{hero.queuedQuest ? '队列已满' : '誓言'}</button>
                    </div>
                 </div>
              ))}
              {hero.questBoard.length === 0 && <div className="text-center text-[10px] text-stone-300 py-4 italic">暂无委托，静待乌鸦...</div>}
           </div>
       </div>

       <div className="flex justify-between items-center mb-6 px-1">
          <div><h3 className="font-bold text-stone-800 flex items-center gap-2 text-xl"><Beer size={20}/> 酒馆</h3><div className="text-[10px] text-stone-400">三教九流，情报与麦酒</div></div>
       </div>
       <div className="space-y-4">
          {hero.tavern.visitors.map((visitor) => (
             <div key={visitor.id} className={`bg-white border p-4 rounded-xl shadow-sm relative overflow-hidden group transition-all hover:shadow-md ${getQualityBadgeClass(visitor.quality).replace('bg-', 'border-').replace('text-', 'hover:border-')}`}>
                <div className={`absolute top-0 right-0 px-2 py-1 text-[9px] font-bold rounded-bl-lg border-b border-l ${getQualityBadgeClass(visitor.quality)}`}>{visitor.quality.toUpperCase()}</div>
                <div className="flex gap-4 mt-2">
                   <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0">{getJobIcon(visitor.archetype)}</div>
                   <div className="flex-1">
                      <div className={`text-sm ${getQualityColor(visitor.quality)}`}>{visitor.title}</div>
                      <div className="text-xs text-stone-500 mb-1">{visitor.name} <span className="font-serif italic text-stone-400">| {visitor.personality} ({visitor.gender})</span></div>
                      <div className="text-[10px] text-stone-400 mb-3 line-clamp-2">{visitor.desc}</div>
                      <div className="flex justify-between items-center"><div className="text-[10px] text-stone-400">加成: <span className="text-stone-700 font-bold">{visitor.buff.type.toUpperCase()} +{visitor.buff.val}</span></div><button onClick={() => hireCompanion(visitor.id)} disabled={!!hero.companion} className={`px-4 py-1.5 rounded text-xs font-bold active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${hero.companion ? 'bg-stone-200 text-stone-500' : 'bg-stone-800 text-white hover:bg-stone-700'}`}>{hero.companion ? '已有同伴' : `招募 (${visitor.price}金)`}</button></div>
                   </div>
                </div>
             </div>
          ))}
       </div>
       <div className="text-center text-[10px] text-stone-300 mt-8 mb-4">每3小时有新客到访。</div>
    </div>
  );};

  return (
    <div className="flex flex-col h-[100dvh] bg-[#fcf9f2] text-stone-800 font-serif max-w-md mx-auto shadow-2xl relative">
      <Header />
      <main className="flex-1 overflow-hidden bg-[#fcf9f2]">
        {/* ⚠️ 核心修复：使用 CSS hidden 而不是条件渲染，保持组件状态 */}
        <div className={activeTab === 'logs' ? 'block h-full' : 'hidden'}><LogsView /></div>
        <div className={activeTab === 'hero' ? 'block h-full' : 'hidden'}><HeroView /></div>
        <div className={activeTab === 'bag' ? 'block h-full' : 'hidden'}><BagView /></div>
        <div className={activeTab === 'messages' ? 'block h-full' : 'hidden'}><MessagesView /></div>
        <div className={activeTab === 'tavern' ? 'block h-full' : 'hidden'}><TavernView /></div>
      </main>
      <nav className="h-16 bg-white border-t border-stone-200 flex justify-around items-center px-1 flex-none z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
         <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'logs' ? 'text-stone-800' : 'text-stone-400'}`}><ScrollText size={18} strokeWidth={activeTab === 'logs' ? 2.5 : 2} /><span className="text-[9px] font-bold">故事</span></button>
         <button onClick={() => setActiveTab('hero')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'hero' ? 'text-stone-800' : 'text-stone-400'}`}><User size={18} strokeWidth={activeTab === 'hero' ? 2.5 : 2} /><span className="text-[9px] font-bold">人物</span></button>
         <button onClick={() => setActiveTab('tavern')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'tavern' ? 'text-stone-800' : 'text-stone-400'}`}><Beer size={18} strokeWidth={activeTab === 'tavern' ? 2.5 : 2} /><span className="text-[9px] font-bold">酒馆</span></button>
         <button onClick={() => setActiveTab('bag')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'bag' ? 'text-stone-800' : 'text-stone-400'}`}><Package size={18} strokeWidth={activeTab === 'bag' ? 2.5 : 2} /><span className="text-[9px] font-bold">行囊</span></button>
         <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'messages' ? 'text-stone-800' : 'text-stone-400'}`}><Bell size={18} strokeWidth={activeTab === 'messages' ? 2.5 : 2} /><span className="text-[9px] font-bold">渡鸦</span></button>
      </nav>
    </div>
  );
}