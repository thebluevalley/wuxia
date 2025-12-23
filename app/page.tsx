'use client';
import { useGame } from '@/hooks/useGame';
import { useEffect, useRef, useState } from 'react';
import { ScrollText, Zap, Cloud, MapPin, User, Package, Shield, Sword, Gem, Footprints, Shirt, HardHat, Target, Star, History, Brain, BicepsFlexed, Heart, Clover, Wind, Lock, PawPrint, Trophy, Quote, BookOpen, Stethoscope, Bell, MessageSquare, Info, Beer, RefreshCw, UserPlus, Scroll } from 'lucide-react';
import { ItemType, Quality, QuestRank } from '@/app/lib/constants';

export default function Home() {
  // ⚠️ 引入 acceptQuest, refreshQuestBoard
  const { hero, login, godAction, loading, error, clearError, refreshTavern, hireCompanion, acceptQuest, refreshQuestBoard } = useGame();
  const [inputName, setInputName] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  // ⚠️ 新增 'quests' 状态
  const [activeTab, setActiveTab] = useState<'logs' | 'quests' | 'hero' | 'bag' | 'equip' | 'messages' | 'tavern'>('logs');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'logs') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [hero?.logs, activeTab]);

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
      case '初出茅庐': return 'text-stone-500 bg-stone-100 border-stone-200';
      case '锋芒初露': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case '名动一方': return 'text-blue-700 bg-blue-50 border-blue-200';
      case '开宗立派': return 'text-purple-800 bg-purple-50 border-purple-200';
      case '一代宗师': return 'text-orange-800 bg-orange-50 border-orange-200';
      case '破碎虚空': return 'text-red-800 bg-red-50 border-red-200';
      default: return 'text-stone-500 bg-stone-100 border-stone-200';
    }
  };

  // ⚠️ 任务星级颜色
  const getRankColor = (rank: QuestRank) => {
    switch (rank) {
      case 5: return 'border-orange-200 bg-orange-50/50';
      case 4: return 'border-purple-200 bg-purple-50/50';
      case 3: return 'border-blue-200 bg-blue-50/50';
      case 2: return 'border-emerald-200 bg-emerald-50/50';
      default: return 'border-stone-200 bg-white';
    }
  };

  const getJobIcon = (job: string) => {
    if (!job) return <User size={24} className="text-stone-800"/>;
    if (job.includes('刀') || job.includes('剑') || job.includes('侠') || job.includes('痞') || job.includes('圣')) return <Sword size={24} className="text-stone-800"/>;
    if (job.includes('僧') || job.includes('镖')) return <Shield size={24} className="text-stone-800"/>;
    if (job.includes('医') || job.includes('花')) return <Heart size={24} className="text-stone-800"/>;
    return <ScrollText size={24} className="text-stone-800"/>;
  };

  if (!hero) {
    return (
       <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#fcf9f2] text-stone-800 p-6 relative overflow-hidden">
        <div className="z-10 flex flex-col items-center w-full max-w-xs">
          <div className="w-20 h-20 border-4 border-stone-800 rounded-full flex items-center justify-center mb-6 shadow-lg bg-white"><span className="font-serif text-4xl font-bold">侠</span></div>
          <h1 className="text-4xl font-serif font-bold mb-8 tracking-[0.5em] text-stone-900">云游江湖</h1>
          <div className="flex flex-col gap-4 w-full">
            <input type="text" placeholder="大侠尊姓大名" className="w-full bg-white/50 border-b-2 border-stone-300 p-3 text-center text-lg outline-none focus:border-stone-800 transition-colors font-serif placeholder:text-stone-400 rounded-t" value={inputName} onChange={e => {setInputName(e.target.value); clearError();}} />
            <input type="password" placeholder="输入密令" className="w-full bg-white/50 border-b-2 border-stone-300 p-3 text-center text-lg outline-none focus:border-stone-800 transition-colors font-serif placeholder:text-stone-400 rounded-b" value={inputPassword} onChange={e => {setInputPassword(e.target.value); clearError();}} />
          </div>
          {error && <div className="text-red-600 text-xs mt-3 bg-red-50 px-2 py-1 rounded border border-red-200">{error}</div>}
          <button onClick={() => inputName && inputPassword && login(inputName, inputPassword)} disabled={loading || !inputName || !inputPassword} className="mt-8 px-10 py-3 bg-stone-800 text-[#fcf9f2] font-serif text-lg rounded shadow-lg hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full">{loading ? '正在读取江湖存档...' : '入世 / 继续'}</button>
        </div>
      </div>
    );
  }

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
             <div className="w-4 h-4 rounded-full border border-amber-900 flex items-center justify-center text-[10px]">文</div>
             {hero.gold}
           </div>
           <div className="flex items-center gap-1 text-amber-900 font-bold text-xs"><Zap size={12} fill="currentColor"/> {Math.floor(hero.godPower)}%</div>
           <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden"><div className="h-full bg-amber-900 transition-all duration-500" style={{width: `${hero.godPower}%`}}></div></div>
        </div>
      </div>
      <div className="bg-white border border-stone-200 rounded p-2 shadow-sm flex flex-col gap-1 mb-2">
         <div className="flex justify-between text-[10px] text-stone-500">
            {/* ⚠️ 显示当前任务或无任务状态 */}
            <span className="flex items-center gap-1 font-bold text-stone-700 truncate max-w-[200px]">
              <Target size={10} className="text-stone-800 shrink-0"/> 
              {hero.currentQuest ? hero.currentQuest.name : "暂无委托 (请前往悬赏榜)"}
            </span>
            <span className="font-mono">{hero.currentQuest ? `${hero.currentQuest.progress}%` : "0%"}</span>
         </div>
         <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
           <div className={`h-full transition-all duration-700 rounded-full ${hero.currentQuest ? 'bg-amber-600' : 'bg-stone-200'}`} style={{ width: hero.currentQuest ? `${hero.currentQuest.progress}%` : '0%' }} />
         </div>
      </div>
      <div className="space-y-1">
        <div className="h-[2px] w-full bg-stone-200 rounded-full"><div className="h-full bg-stone-800 transition-all duration-500 rounded-full" style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} /></div>
      </div>
    </header>
  );

  const LogsView = () => (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
        {hero.logs.map((log) => (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-700 flex gap-2 items-baseline">
            <span className="text-[10px] text-stone-300 font-sans shrink-0 w-8 text-right">{log.time}</span>
            <span className={`text-[14px] leading-6 text-justify ${log.type === 'highlight' ? 'text-amber-900 font-bold' : log.type === 'system' ? 'text-stone-400 italic text-xs' : 'text-stone-700'}`}>{log.text}</span>
          </div>
        ))}
        <div ref={bottomRef} className="h-4" />
      </div>
      <div className="p-4 bg-gradient-to-t from-[#fcf9f2] via-[#fcf9f2] to-transparent">
         <div className="flex justify-between gap-4">
          <button onClick={() => godAction('punish')} disabled={hero.godPower < 25} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-red-900"><Zap size={14} /> 天罚</span>
            <span className="text-[10px] text-stone-400">消耗 25%</span>
          </button>
          <button onClick={() => godAction('bless')} disabled={hero.godPower < 25} className="flex-1 h-12 border border-stone-200 rounded flex flex-col items-center justify-center gap-0 text-stone-600 hover:bg-stone-100 active:scale-95 bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group">
            <span className="flex items-center gap-1 text-sm font-bold group-hover:text-amber-800"><Cloud size={14} /> 赐福</span>
            <span className="text-[10px] text-stone-400">消耗 25%</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ⚠️ 新增：悬赏榜视图
  const QuestBoardView = () => (
    <div className="p-4 h-full overflow-y-auto">
       <div className="flex justify-between items-center mb-6 px-1">
          <div>
             <h3 className="font-bold text-stone-800 flex items-center gap-2 text-xl"><Scroll size={20}/> 悬赏榜</h3>
             <div className="text-[10px] text-stone-400">揭榜行侠，生死有命</div>
          </div>
          <button 
            onClick={() => refreshQuestBoard()}
            className="flex items-center gap-1 text-[10px] bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full text-stone-600 transition-colors"
          >
            <RefreshCw size={10}/> 刷新 (50文)
          </button>
       </div>

       <div className="space-y-4">
          {hero.questBoard.map((quest) => (
             <div key={quest.id} className={`border p-4 rounded-xl shadow-sm relative overflow-hidden group transition-all hover:shadow-md ${getRankColor(quest.rank)}`}>
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <span className="text-lg">{quest.category === 'combat' ? '⚔️' : '🍵'}</span>
                      <span className="font-bold text-stone-800">{quest.name}</span>
                   </div>
                   <div className="flex gap-0.5 text-amber-500">
                      {[...Array(quest.rank)].map((_, i) => <Star key={i} size={10} fill="currentColor"/>)}
                   </div>
                </div>
                
                <div className="text-xs text-stone-500 mb-3 leading-relaxed">{quest.desc}</div>
                
                <div className="flex justify-between items-end border-t border-stone-100 pt-3">
                   <div className="text-[10px] text-stone-400 space-y-1">
                      <div>建议等级: Lv.{quest.reqLevel}</div>
                      <div>赏金: <span className="font-bold text-stone-600">{quest.rewards.gold}文</span> / 经验: <span className="font-bold text-stone-600">{quest.rewards.exp}</span></div>
                   </div>
                   <button 
                     onClick={() => acceptQuest(quest.id)}
                     disabled={!!hero.currentQuest}
                     className={`px-4 py-1.5 rounded text-xs font-bold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${hero.currentQuest ? 'bg-stone-200 text-stone-400' : 'bg-stone-800 text-white hover:bg-stone-700'}`}
                   >
                      {hero.currentQuest ? '有任务在身' : '揭榜'}
                   </button>
                </div>
             </div>
          ))}
       </div>
       <div className="text-center text-[10px] text-stone-300 mt-8 mb-4">
          提示：高难度任务可能需要特定属性才能完成。
       </div>
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
           <div className="text-center flex-1 border-r border-stone-100"><div className="text-xs text-stone-400">善恶</div><div className="font-bold text-stone-700">{hero.alignment}</div></div>
           <div className="text-center flex-1"><div className="text-xs text-stone-400">岁数</div><div className="font-bold text-stone-700">{hero.age}</div></div>
        </div>
        {hero.unlockedFeatures.includes('motto') && (
           <div className="mt-4 p-3 bg-stone-50 rounded border border-stone-100 relative"><Quote size={12} className="absolute top-2 left-2 text-stone-300"/><div className="text-center text-sm font-serif italic text-stone-600">“{hero.motto}”</div></div>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100 relative overflow-hidden">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><UserPlus size={16}/> 随行伙伴</h3>
        {hero.companion ? (
           <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center border-2 border-stone-100 shadow-sm shrink-0">
                 {getJobIcon(hero.companion.archetype)}
              </div>
              <div className="flex-1 min-w-0">
                 <div className={`font-bold truncate ${getQualityColor(hero.companion.quality)}`}>{hero.companion.title} <span className="text-xs font-normal text-stone-500">| {hero.companion.name}</span></div>
                 <div className="text-xs text-stone-500 mb-2 truncate">性格：{hero.companion.personality}</div>
                 <div className="text-[10px] text-stone-400 bg-stone-50 p-2 rounded leading-relaxed italic">"{hero.companion.desc}"</div>
                 <div className="mt-2 text-[10px] text-amber-700 flex items-center gap-1"><Info size={10}/> 羁绊剩余: {Math.max(0, Math.floor((hero.companionExpiry - Date.now()) / (1000 * 60 * 60)))} 小时</div>
              </div>
           </div>
        ) : (
           <div className="text-center py-6 text-stone-400 text-xs">江湖路远，暂无知己同行。<br/>去酒馆碰碰运气？</div>
        )}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
         <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><BookOpen size={16}/> 武学修养</h3>
         <div className="space-y-3">
            {hero.martialArts.map((skill, i) => (
              <div key={i} className="flex justify-between items-center border-b border-stone-50 pb-2 last:border-0 last:pb-0">
                 <div><div className="font-bold text-stone-700 text-sm">{skill.name} <span className="text-xs font-normal text-stone-400 bg-stone-100 px-1 rounded">Lv.{skill.level}</span></div><div className="text-[10px] text-stone-400">{skill.desc}</div></div>
                 <div className="text-xs text-stone-300">{skill.type === 'inner' ? '内功' : skill.type === 'speed' ? '轻功' : '外功'}</div>
              </div>
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
    </div>
  );

  const AttributeRow = ({icon, label, val, color}: any) => (<div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-stone-600">{icon} {label}</span><div className="flex items-center gap-2"><div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden"><div className="h-full bg-stone-400" style={{width: `${Math.min(100, val * 2)}%`}}></div></div><span className="font-mono text-xs w-6 text-right">{val}</span></div></div>);

  const BagView = () => (<div className="p-4 h-full overflow-y-auto"><h3 className="font-bold text-stone-800 mb-4 px-2">行囊 ({hero.inventory.length}/20)</h3><div className="space-y-2">{hero.inventory.map((item,i)=><div key={i} className="bg-white border border-stone-100 p-3 rounded flex justify-between"><span className={`text-sm ${getQualityColor(item.quality)}`}>{item.name}</span><div className="text-right"><span className="text-xs text-stone-400 block">x{item.count}</span><span className="text-[10px] bg-stone-100 px-1 rounded text-stone-500">价{item.price}</span></div></div>)}</div></div>);
  const EquipView = () => { const slots: {key: ItemType, label: string, icon: any}[] = [{ key: 'head', label: '头饰', icon: <HardHat size={18}/> }, { key: 'weapon', label: '兵器', icon: <Sword size={18}/> }, { key: 'body',  label: '衣甲', icon: <Shirt size={18}/> }, { key: 'legs', label: '护腿', icon: <Shield size={18}/> }, { key: 'feet', label: '鞋靴', icon: <Footprints size={18}/> }, { key: 'accessory', label: '饰品', icon: <Gem size={18}/> }]; return (<div className="p-4 h-full overflow-y-auto"><div className="space-y-3">{slots.map((slot) => { const item = hero.equipment[slot.key as keyof typeof hero.equipment]; return (<div key={slot.key} className="bg-white border border-stone-100 p-4 rounded-lg flex items-center gap-4 shadow-sm"><div className={`w-10 h-10 rounded-full flex items-center justify-center border ${item ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-stone-50 border-stone-100 text-stone-300'}`}>{slot.icon}</div><div className="flex-1"><div className="text-xs text-stone-400 mb-1">{slot.label}</div>{item ? <div className={`text-sm ${getQualityColor(item.quality)}`}>{item.name}</div> : <div className="text-stone-300 italic text-sm">空</div>}</div></div>)})}</div></div>);};
  const MessagesView = () => { const rumors = hero.messages.filter(m => m.type === 'rumor'); const systems = hero.messages.filter(m => m.type === 'system'); return (<div className="p-4 h-full overflow-y-auto space-y-6"><div><h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 px-1"><MessageSquare size={16}/> 江湖风声</h3>{rumors.length === 0 ? <div className="text-center text-stone-300 text-xs italic">暂无风声</div> : <div className="space-y-3">{rumors.map((msg)=><div key={msg.id} className="bg-amber-50 border border-amber-100 p-3 rounded-lg shadow-sm"><div className="flex justify-between items-start mb-1"><div className="font-bold text-amber-900 text-sm">{msg.title}</div><div className="text-[10px] text-amber-400">{msg.time}</div></div><div className="text-xs text-amber-800 leading-relaxed text-justify">{msg.content}</div></div>)}</div>}</div><div><h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2 px-1"><Info size={16}/> 系统记录</h3>{systems.length === 0 ? <div className="text-center text-stone-300 text-xs italic">暂无记录</div> : <div className="bg-white border border-stone-100 rounded-lg overflow-hidden">{systems.map((msg,i)=><div key={msg.id} className={`p-3 border-b border-stone-50 last:border-0 ${i%2===0?'bg-white':'bg-stone-50/50'}`}><div className="flex justify-between mb-1"><span className="font-bold text-stone-700 text-xs">{msg.title}</span><span className="text-[10px] text-stone-400">{msg.time}</span></div><div className="text-xs text-stone-500">{msg.content}</div></div>)}</div>}</div></div>);};
  const TavernView = () => (
    <div className="p-4 h-full overflow-y-auto">
       <div className="flex justify-between items-center mb-6 px-1">
          <div><h3 className="font-bold text-stone-800 flex items-center gap-2 text-xl"><Beer size={20}/> 悦来客栈</h3><div className="text-[10px] text-stone-400">三教九流，皆聚于此</div></div>
          <button onClick={() => refreshTavern(true)} className="flex items-center gap-1 text-[10px] bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full text-stone-600 transition-colors"><RefreshCw size={10}/> 换一批 (50文)</button>
       </div>
       <div className="space-y-4">
          {hero.tavern.visitors.map((visitor) => (
             <div key={visitor.id} className={`bg-white border p-4 rounded-xl shadow-sm relative overflow-hidden group transition-all hover:shadow-md ${getQualityBadgeClass(visitor.quality).replace('bg-', 'border-').replace('text-', 'hover:border-')}`}>
                <div className={`absolute top-0 right-0 px-2 py-1 text-[9px] font-bold rounded-bl-lg border-b border-l ${getQualityBadgeClass(visitor.quality)}`}>{visitor.quality.toUpperCase()}</div>
                <div className="flex gap-4 mt-2">
                   <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100 shrink-0">{getJobIcon(visitor.archetype)}</div>
                   <div className="flex-1">
                      <div className={`text-sm ${getQualityColor(visitor.quality)}`}>{visitor.title}</div>
                      <div className="text-xs text-stone-500 mb-1">{visitor.name} <span className="font-serif italic text-stone-400">| {visitor.personality}</span></div>
                      <div className="text-[10px] text-stone-400 mb-3 line-clamp-2">{visitor.desc}</div>
                      <div className="flex justify-between items-center"><div className="text-[10px] text-stone-400">加成: <span className="text-stone-700 font-bold">{visitor.buff.type.toUpperCase()} +{visitor.buff.val}</span></div><button onClick={() => hireCompanion(visitor.id)} disabled={!!hero.companion} className={`px-4 py-1.5 rounded text-xs font-bold active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${hero.companion ? 'bg-stone-200 text-stone-500' : 'bg-stone-800 text-white hover:bg-stone-700'}`}>{hero.companion ? '已有伙伴' : `招募 (${visitor.price}文)`}</button></div>
                   </div>
                </div>
             </div>
          ))}
       </div>
       <div className="text-center text-[10px] text-stone-300 mt-8 mb-4">每天只能邀请一位伙伴同行，持续24小时。</div>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#fcf9f2] text-stone-800 font-serif max-w-md mx-auto shadow-2xl relative">
      <Header />
      <main className="flex-1 overflow-hidden bg-[#fcf9f2]">
        {activeTab === 'logs' && <LogsView />}
        {activeTab === 'quests' && <QuestBoardView />}
        {activeTab === 'hero' && <HeroView />}
        {activeTab === 'bag' && <BagView />}
        {activeTab === 'equip' && <EquipView />}
        {activeTab === 'messages' && <MessagesView />}
        {activeTab === 'tavern' && <TavernView />}
      </main>
      <nav className="h-16 bg-white border-t border-stone-200 flex justify-around items-center px-1 flex-none z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
         <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'logs' ? 'text-stone-800' : 'text-stone-400'}`}><ScrollText size={18} strokeWidth={activeTab === 'logs' ? 2.5 : 2} /><span className="text-[9px] font-bold">江湖</span></button>
         <button onClick={() => setActiveTab('quests')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'quests' ? 'text-stone-800' : 'text-stone-400'}`}><Scroll size={18} strokeWidth={activeTab === 'quests' ? 2.5 : 2} /><span className="text-[9px] font-bold">悬赏</span></button>
         <button onClick={() => setActiveTab('hero')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'hero' ? 'text-stone-800' : 'text-stone-400'}`}><User size={18} strokeWidth={activeTab === 'hero' ? 2.5 : 2} /><span className="text-[9px] font-bold">侠客</span></button>
         <button onClick={() => setActiveTab('tavern')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'tavern' ? 'text-stone-800' : 'text-stone-400'}`}><Beer size={18} strokeWidth={activeTab === 'tavern' ? 2.5 : 2} /><span className="text-[9px] font-bold">酒馆</span></button>
         <button onClick={() => setActiveTab('bag')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'bag' ? 'text-stone-800' : 'text-stone-400'}`}><Package size={18} strokeWidth={activeTab === 'bag' ? 2.5 : 2} /><span className="text-[9px] font-bold">行囊</span></button>
         <button onClick={() => setActiveTab('equip')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'equip' ? 'text-stone-800' : 'text-stone-400'}`}><Shield size={18} strokeWidth={activeTab === 'equip' ? 2.5 : 2} /><span className="text-[9px] font-bold">装备</span></button>
         <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center gap-1 p-2 min-w-[3.5rem] ${activeTab === 'messages' ? 'text-stone-800' : 'text-stone-400'}`}><Bell size={18} strokeWidth={activeTab === 'messages' ? 2.5 : 2} /><span className="text-[9px] font-bold">告示</span></button>
      </nav>
    </div>
  );
}