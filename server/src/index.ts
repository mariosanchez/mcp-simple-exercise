import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {setUpServer} from "./server.js";

const server = setUpServer({})

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
})