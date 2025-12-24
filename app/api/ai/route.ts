import OpenAI from "openai";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS } from "@/app/lib/constants";

// 🔧 配置 SiliconFlow
const PROVIDER_CONFIG = {
  baseURL: "https://api.siliconflow.cn/v1",
  apiKey: process.env.SILICONFLOW_API_KEY, 
  model: "deepseek-ai/DeepSeek-V3", 
};

// ⚠️ 核心：植入你提供的“大师级”范文
// 这将作为 AI 的“语气调色板”，强迫它模仿这种冷峻、短促、生理痛感极强的风格
const STYLE_REFERENCE = `
【参考范文风格 - 必须严格模仿】：
1. (描写干渴) "那种感觉不像是什么“喉咙冒烟”，而是整个口腔黏在了一起，每一次吞咽都像是在吞刀片。我管不了那么多，趴下去就把脸埋进水里。水很温，带着土腥味，但流进喉咙的那一刻，我感觉自己终于回到了人间。"
2. (描写生火) "我咬着牙，把全身的重量都压在树枝上，疯狂地搓动。手掌流血了，粘在木棍上打滑。终于，一缕黑烟变浓了。我屏住呼吸...烟越来越大，突然“呼”的一声，火苗窜了起来。"
3. (描写战斗) "第一下砸空了，它的钳子夹住了木棍，“咔嚓”一声，木棍断成两截。我肾上腺素飙升，顾不上怕了。趁它夹住木棍没松开，我举起那块锋利的飞机铁皮，狠狠地插进它背甲连接处的缝隙里。滋啦！"
4. (描写心理) "心凉了一半。全是海。东南西北，全是海。没有船，没有陆地。这是一座孤岛。我坐在石头上喘气，脑子里只有一个念头：别想有人来救了，得靠自己活。"
`;

export async function POST(req: Request) {
  if (!PROVIDER_CONFIG.apiKey) {
      return NextResponse.json({ text: null, error: "Server Config Error: Missing API Key" }, { status: 500 });
  }

  try {
    const { context, eventType } = await req.json();

    const openai = new OpenAI({
      baseURL: PROVIDER_CONFIG.baseURL,
      apiKey: PROVIDER_CONFIG.apiKey,
    });

    // --------------------------------------------------------
    // 🆕 模式 A：剧情批量预生成 (Batch Generation - 范文复刻版)
    // --------------------------------------------------------
    if (eventType === 'generate_script_batch') {
        const questDesc = context.questScript?.description || "";
        const location = context.location || "荒野";
        
        const batchPrompt = `
          你是一位硬核生存小说家。
          请阅读下方的【剧情梗概】，将其扩写成一段**第一人称生存日记**。
          
          ${STYLE_REFERENCE}
          
          【剧情梗概 (你要写的内容)】：
          "${questDesc}"
          
          【必须遵守的写作铁律】：
          1. **模仿范文的短句节奏**：
             - 多用短句。像"心凉了一半"、"全是海"这种有冲击力的短句。
             - **拒绝**长难句，**拒绝**华丽的形容词（如"绚丽多彩"、"令人叹为观止"）。
             - 像一个快死的人在说话，不要像一个诗人在说话。
          
          2. **生理痛感优先**：
             - 不要只写"我很痛"，要写"每一次吞咽都像在吞刀片"。
             - 不要只写"我很累"，要写"手臂酸得抬不起来"。
             - 描写伤口、血泡、饥饿带来的具体肉体感觉。
          
          3. **输出格式**：
             - 返回一个 JSON 字符串数组，包含 **5 到 8 个** 自然段。
             - 必须混合 **极短段落 (15-30字)** 和 **叙事段落 (60-120字)**。
             - 范例格式：["短句段落...", "长描写段落...", "动作段落...", "心理段落..."]
          
          背景：${location}
          现在，完全沉浸在"我"的身体里，开始写作。只返回 JSON 数组。
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: batchPrompt }],
            model: PROVIDER_CONFIG.model,
            temperature: 0.8, 
            max_tokens: 2000, 
        });

        let content = completion.choices[0]?.message?.content || "[]";
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const storyArray = JSON.parse(content);
            if (Array.isArray(storyArray)) {
                return NextResponse.json({ storyBatch: storyArray });
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
            const fallbackArray = content.split('\n').map(s => s.trim()).filter(line => line.length > 10);
            return NextResponse.json({ storyBatch: fallbackArray });
        }
    }

    // --------------------------------------------------------
    // 🔄 模式 B：单条生成 (也要符合范文风格)
    // --------------------------------------------------------
    const isDanger = context.isDanger;
    const taskTarget = context.taskObjective || "生存"; 
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    
    // 随机长短
    const rand = Math.random();
    let lengthInstruction = "";
    if (rand < 0.4) lengthInstruction = "字数：20-40字。短促有力，全是短句。";
    else if (rand < 0.7) lengthInstruction = "字数：40-70字。动作+生理反馈。";
    else lengthInstruction = "字数：70-100字。细节描写。";

    if (isDanger) lengthInstruction = "字数：20-30字。极度短促，窒息感。";

    const baseInstruction = `
      模仿以下风格写一段生存记录：
      "手掌流血了，粘在木棍上打滑。终于，一缕黑烟变浓了。"
      
      【要求】：
      1. 第一人称"我"。
      2. ${lengthInstruction}
      3. 描写动作：【${taskTarget}】。
      4. 必须包含具体的**触觉**或**痛觉**描写。
      5. 避开：[${recentLogsText}]。
      
      背景：${location}
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: baseInstruction }],
      model: PROVIDER_CONFIG.model,
      temperature: 0.85, 
      max_tokens: 200, 
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1|日记|【.*?】).*/gi, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 
    text = text.replace(/\*\*/g, ''); 

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("AI API Error:", error);
    let msg = error.message;
    if (error.status === 401) msg = "API Key 无效。";
    if (error.status === 403) msg = "权限不足 (403)。";
    if (error.status === 429) msg = "请求过快。";
    return NextResponse.json({ text: null, error: msg }, { status: 500 });
  }
}