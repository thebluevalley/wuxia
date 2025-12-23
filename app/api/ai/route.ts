import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS, WORLD_ARCHIVE } from "@/app/lib/constants";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];
    const loreSnippet = WORLD_ARCHIVE[Math.floor(Math.random() * WORLD_ARCHIVE.length)];

    const stage = context.storyStage || "私生子";
    const tags = context.tags ? context.tags.join("、") : "无";
    
    // 识别任务类型
    const isMainQuest = context.questScript?.title && context.questScript.title.includes("【主线】");
    const npcName = context.questScript?.npc || "神秘人";

    // 1. 确定基调 (中文)
    let toneInstruction = "";
    if (stage === "私生子") {
        toneInstruction = "基调：残酷、写实、底层生存。世界是冰冷且无情的。";
    } else if (stage === "侍从") {
        toneInstruction = "基调：愤世嫉俗、观察敏锐。看透了骑士光鲜盔甲下的肮脏。";
    } else if (stage === "骑士") {
        toneInstruction = "基调：荣誉与现实的冲突。充满了铁锈与血腥味。";
    } else {
        toneInstruction = "基调：宏大、沉重、权谋。欲戴王冠，必承其重。";
    }

    // 2. 核心人设 (中文 Prompt)
    const baseInstruction = `
      你是一位精通《冰与火之歌》风格的中文小说家。
      语言要求：【简体中文】，严禁出现任何英文单词。
      写作风格：史诗感、黑暗奇幻、极度写实、强调感官描写（气味、温度、触感）。
      
      当前背景: 
      - 主角: ${context.name} (身份: ${stage})。标签: [${tags}]。
      - 地点: ${context.location}。
      - 当前篇章: ${context.mainSaga || "乱世浮生"}。
      - 世界背景: ${loreSnippet}。
      
      核心规则:
      1. 【禁止英文】：绝对不要输出任何英文字符。
      2. 【细节为王】：不要只说"他很冷"，要说"寒风像剔骨刀一样刮过他的脸颊"。
      3. 【沉浸感】：多描写食物、纹章、家族历史、盔甲的材质。
      4. 【完整性】：输出必须是一段完整的剧情，不要断句。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `
          任务：为这个角色写一段史诗般的【开场序章】。
          要求：
          1. 字数：150-200字。
          2. 内容：描写 ${context.location} 的环境细节（气味、声音、天气）。交代主角微不足道的身份，以及远处战争或异鬼的阴影。
          3. 结尾：以主角的一个微小动作（如拉紧斗篷、握住剑柄）作为结束。
          4. 氛围：凛冬将至，压抑且充满宿命感。
        `;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：接受任务 "${context.questScript?.title}"。
        详情：${context.questScript?.description}。
        指令：描写主角与 NPC【${npcName}】的会面。描述 NPC 的神态、语气，以及主角接下任务时内心的权衡（是为了金龙，还是为了生存？）。
        字数要求：${isMainQuest ? '长段落（150字以上），极尽详实。' : '中等篇幅（80-120字），氛围感强。'}
        `;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        事件：旅途中。
        指令：写一段旅途见闻。也许是路边的冻死骨，也许是远处的狼嚎，也许是遭遇了一队兰尼斯特的巡逻兵。
        强制包含元素：${envFlavor}。
        字数要求：100-150字，侧重环境描写。
        `;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        事件：与宿敌【${context.questScript?.antagonist}】决战。
        反转：${context.questScript?.twist}。
        指令：写一段残酷的战斗描写。强调钢铁碰撞的声音、血腥味、泥泞的地面以及体力的流失。不要有华丽的魔法，只有冷兵器的搏杀。
        字数要求：120-180字，紧张激烈。
        `;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        事件：任务完成。目标：${context.questScript?.objective}。
        指令：描写任务结束后的状态。主角是精疲力竭，还是对着沾血的金币冷笑？
        字数要求：80-120字，收尾有力。
        `;
        break;
        
      case 'idle_event':
        prompt = `${baseInstruction} 
        事件：在 ${context.location} 闲逛/休息。
        指令：写一个生活化的片段。比如在酒馆喝着酸涩的红酒听流言，或者看着城墙下的乞丐，或者擦拭武器。
        字数要求：80-120字，体现世态炎凉。
        `;
        break;

      case 'recruit_companion':
        prompt = `${baseInstruction} 
        事件：招募了一位新同伴。
        指令：详细描写这位同伴的外貌、装备细节以及眼神。他们为什么加入？是为了钱，还是为了逃避什么？
        字数要求：100-150字。
        `;
        break;

      case 'god_action':
        prompt = `${baseInstruction} 
        事件：命运的转折（旧神或七神的干预）。
        指令：描写一种无法解释的好运或厄运。仿佛是鱼梁木的眼睛在注视着主角。
        字数要求：短小精悍，充满神秘感。
        `;
        break;
        
      case 'generate_rumor':
        prompt = `写一条关于维斯特洛大陆的黑暗流言（如五王之战的战况、绝境长城的异动）。格式："【标题】内容"。纯中文。`;
        break;

      case 'generate_description':
        prompt = `任务：根据标签 [${tags}] 写一段角色的外貌侧写。纯中文，80字以内。强调沧桑感和生存痕迹。`;
        break;

      case 'generate_equip_desc':
        const weapon = context.equipment?.weapon?.name || "空手";
        const body = context.equipment?.body?.name || "布衣";
        prompt = `任务：根据装备（武器：${weapon}，护甲：${body}）描写角色的战斗英姿。纯中文，60字以内。`;
        break;

      default:
        prompt = `${baseInstruction} 描写主角在乱世中生存的一个瞬间。`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, 
      max_tokens: 1024, 
    });

    let text = completion.choices[0]?.message?.content || "";
    
    // 二次清洗：移除可能残留的英文前缀（虽然用了中文Prompt，但为了保险）
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:).*/gi, '').trim();
    // 移除首尾引号
    text = text.replace(/^["']|["']$/g, ''); 

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}