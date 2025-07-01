import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "weathe",
    version: "1.0.0",
    description: "A simple weather app that uses the National Weather Service API",
    capabilities: {
        resources: {},
        tools: {},
    }
});
