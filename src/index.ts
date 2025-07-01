import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
import { WeatherDataClient } from "./types.js";
import WeatherHttpDataClient from "./weatherDataClient.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

function setUpServer({ weatherDataClient = WeatherHttpDataClient() }: { weatherDataClient?: WeatherDataClient}) {
    const server = new McpServer({
        name: "weathe",
        version: "1.0.0",
        description: "A simple weather app that uses the National Weather Service API",
        capabilities: {
            resources: {},
            tools: {},
        }
    });

    server.tool(
        "get-alerts",
        "Get weather alerts for a state",
        {
            state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
        },
        async({ state }) => {
            const stateCode = state.toUpperCase();
            const { data: alerts} = await weatherDataClient.getAlerts(stateCode)

            if(alerts.length === 0) {
                return textReponse(("No active alerts for " + stateCode));
            }

            return textReponse(`Active alerts for ${stateCode}:\n\n${alerts.join("\n")}`);
        }
    )
}

const server = setUpServer({})

function textReponse(alertsText: string): CallToolResult {
    return {
        content: [
            {
                type: "text",
                text: alertsText,
            },
        ],
    }
}