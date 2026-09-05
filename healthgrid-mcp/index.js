const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
require("dotenv").config();

// Create MCP server
const server = new McpServer({
  name: "HealthGrid-MCP",
  version: "1.0.0",
});

// Mock database fetching (in real app, this calls Next.js API or Prisma directly)
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

async function fetchFromApi(endpoint) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return null;
  }
}

// 1. get_inventory_status
server.tool(
  "get_inventory_status",
  "Get the inventory status of a specific medicine at a specific PHC",
  {
    phc_id: z.string().describe("The ID or Name of the PHC"),
    medicine_id: z.string().optional().describe("Optional medicine name or ID"),
  },
  async ({ phc_id, medicine_id }) => {
    // Mock response for the hackathon prototype
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            phc: phc_id,
            medicine: medicine_id || "All",
            status: "LOW",
            current_stock: 120,
            days_remaining: 1.8,
            predicted_consumption: 65,
            message: "Stock critically low, projected stockout in 1.8 days."
          }, null, 2)
        }
      ]
    };
  }
);

// 2. get_patient_forecast
server.tool(
  "get_patient_forecast",
  "Get the patient footfall forecast for the next N days",
  {
    phc_id: z.string().describe("The ID or Name of the PHC"),
    days: z.number().default(7).describe("Number of days to forecast"),
  },
  async ({ phc_id, days }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            phc: phc_id,
            forecast_days: days,
            trend: "INCREASING",
            growth_rate: "+32%",
            projected_surge: true,
            predicted_daily_patients: [150, 165, 180, 205, 230, 245, 260]
          }, null, 2)
        }
      ]
    };
  }
);

// 3. get_phc_risk
server.tool(
  "get_phc_risk",
  "Get the overall risk score and contributing factors for a PHC",
  {
    phc_id: z.string().describe("The ID or Name of the PHC"),
  },
  async ({ phc_id }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            phc: phc_id,
            risk_score: 84,
            status: "CRITICAL",
            factors: [
              "Paracetamol stock covers only 1.8 days",
              "Patient demand increased 32%",
              "Bed occupancy is 91%",
              "Nurse availability is below required level (72%)"
            ]
          }, null, 2)
        }
      ]
    };
  }
);

// 4. find_surplus_medicine
server.tool(
  "find_surplus_medicine",
  "Find nearby PHCs with surplus stock of a specific medicine",
  {
    medicine_id: z.string().describe("The name or ID of the medicine"),
    region: z.string().describe("District or State to search in"),
  },
  async ({ medicine_id, region }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            medicine: medicine_id,
            region: region,
            surplus_phcs: [
              { phc_id: "PHC012", name: "Patna PHC 12", surplus_units: 1500, distance_km: 42 },
              { phc_id: "PHC015", name: "Patna PHC 15", surplus_units: 800, distance_km: 65 }
            ]
          }, null, 2)
        }
      ]
    };
  }
);

// 5. recommend_transfer
server.tool(
  "recommend_transfer",
  "Generate a recommendation to transfer medicine from a surplus PHC to a deficit PHC",
  {
    from_phc: z.string().describe("The PHC sending the medicine"),
    to_phc: z.string().describe("The PHC receiving the medicine"),
    medicine_id: z.string().describe("The medicine to transfer"),
    quantity: z.number().describe("Amount to transfer"),
  },
  async ({ from_phc, to_phc, medicine_id, quantity }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "RECOMMENDATION_GENERATED",
            transfer_id: "TRF-98234",
            from: from_phc,
            to: to_phc,
            medicine: medicine_id,
            quantity: quantity,
            priority: "HIGH",
            estimated_transit_time: "1.5 hours",
            impact: "Will resolve stockout risk at receiving PHC for 7 days."
          }, null, 2)
        }
      ]
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HealthGrid MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
