import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "OpenAI-Beta": "assistants=v2",
  },
});

export async function POST(req: Request) {
  try {
    const { message, userId, lat, lon, previousResponseId } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'message' field" }), { status: 400 });
    }

    // Build input messages array. We prepend a system message when extra context is provided.
    const input: any[] = [];
    if (lat != null && lon != null) {
      input.push({
        role: "system",
        content: `User location: (${lat}, ${lon}). Provide hydration advice accordingly.`,
      });
    }
    input.push({ role: "user", content: message });

    // --- TOOLS array: single file_search tool and explicit function tools ---
    const TOOLS = [
      {
        type: "file_search",
        file_ids: [
          "file-5SBw81z9Ra8dYtwkozHTUn", // system_prompt.md
          "file-BpN221sNGiVmxgoNV3eG1Q", // db_field_cheatsheet.md
          "file-GUvQK6ky6d8znidDQggSGz", // osmole_cheatsheet.md
          "file-SWgvWv6wuquibApJjENE35", // deepdive.txt
          "file-6FasNDxJg73nuWUY2hKzEQ", // hydrationTips.md
          "file-FojBunJv2dztghrfZ7Vnqa", // weather_hydration_kb.md
          "file-LaYJSVBuUo7jjvP5QX2sQD"  // hydration_osmole_kb.md
        ]
      },
      // Explicit schema-based function tools
      {
        type: "function",
        function: {
          name: "log_food_intake",
          description: "Log a user's food intake to the food_logs table.",
          parameters: {
            user_id: { type: "string", description: "User's unique identifier" },
            food: { type: "string", description: "Food or drink consumed" },
            calories: { type: "number", description: "Calories consumed" },
            timestamp: { type: "string", description: "ISO timestamp of intake" }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "log_activity",
          description: "Log a user's activity to the activity_logs table.",
          parameters: {
            user_id: { type: "string", description: "User's unique identifier" },
            activity: { type: "string", description: "Type of activity" },
            duration_min: { type: "number", description: "Duration in minutes" },
            timestamp: { type: "string", description: "ISO timestamp of activity" }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Fetch current weather for a given latitude and longitude.",
          parameters: {
            lat: { type: "number", description: "Latitude" },
            lon: { type: "number", description: "Longitude" }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_hydration_stats",
          description: "Compute and return the user's hydration statistics (percent hydrated, gaps, etc.).",
          parameters: {
            user_id: { type: "string", description: "User's unique identifier" }
          }
        }
      }
    ];

    // Call Responses API. Using GPT-4o-mini by default for cost efficiency.
    const response = await (openai as any).responses.create({
      model: "gpt-4o-mini",
      temperature: 0.25,
      previous_response_id: previousResponseId ?? undefined,
      input,
      tools: TOOLS // <-- Pass your tools here!
    });
    console.log("OpenAI raw response:", JSON.stringify(response, null, 2));

    // Tool orchestration: handle tool calls if present
    if (response.tool_calls && response.tool_calls.length > 0) {
      // Import backend handlers
      const { default: log_food_intake, log_activity, get_weather, get_hydration_stats } = await import("./dispatch");
      const call = response.tool_calls[0];
      let result: any = { ok: true };
      try {
        if (call.name === "log_food_intake") result = await log_food_intake(call.arguments);
        if (call.name === "log_activity") result = await log_activity(call.arguments);
        if (call.name === "get_weather") result = await get_weather(call.arguments);
        if (call.name === "get_hydration_stats") result = await get_hydration_stats(call.arguments);
      } catch (err: any) {
        result = { error: err.message || "Tool handler error" };
      }
      // Call responses.create again with function_call
      const follow = await (openai as any).responses.create({
        model: "gpt-4o-mini",
        previous_response_id: response.id,
        function_call: { name: call.name, arguments: result }
      });
      let followText = "[No response]";
      if (
        follow.output &&
        follow.output.length > 0 &&
        follow.output[0].content &&
        follow.output[0].content.length > 0 &&
        follow.output[0].content[0].text
      ) {
        followText = follow.output[0].content[0].text;
      }
      return Response.json({
        response: followText,
        responseId: follow.id,
        toolCalls: [call]
      });
    }

    // No tool call → plain reply
    let responseText = "[No response]";
    if (
      response.output &&
      response.output.length > 0 &&
      response.output[0].content &&
      response.output[0].content.length > 0 &&
      response.output[0].content[0].text
    ) {
      responseText = response.output[0].content[0].text;
    }

    return Response.json({
      response: responseText,
      responseId: response.id, // send back so the client can keep context if desired
      toolCalls: []
    });
  } catch (error: any) {
    console.error("master-agent error", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}

