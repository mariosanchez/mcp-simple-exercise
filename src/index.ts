import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

const server = new McpServer({
    name: "weathe",
    version: "1.0.0",
    description: "A simple weather app that uses the National Weather Service API",
    capabilities: {
        resources: {},
        tools: {},
    }
});
