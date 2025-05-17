// test-openai.js
const OpenAI = require("openai");
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  const SYSTEM_PROMPT = `You are a hydration and wellness dashboard assistant. Always return a JSON object with at least these fields: { plan: string, advice: string, recommended_liters: number }.`;
  const user_msg = `Given a user born on 1984-10-10 and weighing 70 kg, calculate and recommend an exact daily water intake (in liters) for them. Return a short, friendly "plan" (e.g., "Aim for 2.4L per day") and a motivational "advice" message. Always return a JSON object: { plan: string, advice: string, recommended_liters: number }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: user_msg }
      ],
      temperature: 0.2,
    });
    console.log(response.choices[0].message.content);
  } catch (e) {
    console.error("OpenAI error:", e);
  }
}

test(); 