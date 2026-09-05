import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'gsk_placeholder_key_for_build',
});

// Mock implementations of the MCP tools for the Hackathon Prototype
const mcpTools = {
  get_inventory_status: (args: any) => ({
    phc: args.phc_id,
    medicine: args.medicine_id || "All",
    status: "LOW",
    current_stock: 120,
    days_remaining: 1.8,
    predicted_consumption: 65,
    message: "Stock critically low, projected stockout in 1.8 days."
  }),
  get_patient_forecast: (args: any) => ({
    phc: args.phc_id,
    forecast_days: args.days,
    trend: "INCREASING",
    growth_rate: "+32%",
    projected_surge: true,
    predicted_daily_patients: [150, 165, 180, 205, 230, 245, 260]
  }),
  get_phc_risk: (args: any) => ({
    phc: args.phc_id,
    risk_score: 84,
    status: "CRITICAL",
    factors: [
      "Paracetamol stock covers only 1.8 days",
      "Patient demand increased 32%",
      "Bed occupancy is 91%",
      "Nurse availability is below required level (72%)"
    ]
  }),
  find_surplus_medicine: (args: any) => ({
    medicine: args.medicine_id,
    region: args.region,
    surplus_phcs: [
      { phc_id: "PHC012", name: "Patna PHC 12", surplus_units: 1500, distance_km: 42 },
      { phc_id: "PHC015", name: "Patna PHC 15", surplus_units: 800, distance_km: 65 }
    ]
  }),
  recommend_transfer: (args: any) => ({
    status: "RECOMMENDATION_GENERATED",
    transfer_id: "TRF-98234",
    from: args.from_phc,
    to: args.to_phc,
    medicine: args.medicine_id,
    quantity: args.quantity,
    priority: "HIGH",
    estimated_transit_time: "1.5 hours",
    impact: "Will resolve stockout risk at receiving PHC for 7 days."
  })
};

const groqTools = [
  {
    type: "function",
    function: {
      name: "get_inventory_status",
      description: "Get the inventory status of a specific medicine at a specific PHC",
      parameters: {
        type: "object",
        properties: {
          phc_id: { type: "string", description: "The ID or Name of the PHC" },
          medicine_id: { type: "string", description: "Optional medicine name or ID" }
        },
        required: ["phc_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_patient_forecast",
      description: "Get the patient footfall forecast for the next N days",
      parameters: {
        type: "object",
        properties: {
          phc_id: { type: "string", description: "The ID or Name of the PHC" },
          days: { type: "number", description: "Number of days to forecast" }
        },
        required: ["phc_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_phc_risk",
      description: "Get the overall risk score and contributing factors for a PHC",
      parameters: {
        type: "object",
        properties: {
          phc_id: { type: "string", description: "The ID or Name of the PHC" }
        },
        required: ["phc_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "find_surplus_medicine",
      description: "Find nearby PHCs with surplus stock of a specific medicine",
      parameters: {
        type: "object",
        properties: {
          medicine_id: { type: "string", description: "The name or ID of the medicine" },
          region: { type: "string", description: "District or State to search in" }
        },
        required: ["medicine_id", "region"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "recommend_transfer",
      description: "Generate a recommendation to transfer medicine from a surplus PHC to a deficit PHC",
      parameters: {
        type: "object",
        properties: {
          from_phc: { type: "string" },
          to_phc: { type: "string" },
          medicine_id: { type: "string" },
          quantity: { type: "number" }
        },
        required: ["from_phc", "to_phc", "medicine_id", "quantity"]
      }
    }
  }
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const systemPrompt = {
      role: 'system',
      content: `You are the HealthGrid AI Health Copilot, an expert operations assistant for public healthcare supply chains.
      Your goal is to help government users optimize resources, predict shortages, and manage emergencies.
      You have access to tools to fetch real-time operational data. ALWAYS use the tools to answer questions about PHC risk, inventory, or forecasting.
      Keep answers concise, professional, and data-driven. Do not use generic AI greetings.`
    };

    let currentMessages = [systemPrompt, ...messages];

    // First call to Groq to see if it wants to use a tool
    let response = await groq.chat.completions.create({
      messages: currentMessages as any,
      model: "llama3-8b-8192", // Fast model for tool calling
      temperature: 0.1,
      tools: groqTools as any,
      tool_choice: "auto",
    });

    let responseMessage = response.choices[0]?.message;

    // Handle tool calls if any
    while (responseMessage?.tool_calls) {
      currentMessages.push(responseMessage as any);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        let functionResponse;
        if (functionName in mcpTools) {
          functionResponse = (mcpTools as any)[functionName](functionArgs);
        } else {
          functionResponse = { error: "Tool not found" };
        }

        currentMessages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(functionResponse),
        });
      }

      // Second call to Groq with tool results
      response = await groq.chat.completions.create({
        messages: currentMessages as any,
        model: "llama3-8b-8192",
        temperature: 0.1,
      });
      responseMessage = response.choices[0]?.message;
    }

    return NextResponse.json({ 
      success: true, 
      message: responseMessage?.content || ""
    });
  } catch (error: any) {
    console.error('Copilot Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
