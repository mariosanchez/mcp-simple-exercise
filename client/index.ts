import {Anthropic} from "@anthropic-ai/sdk";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {Tool,} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

guardMissingAPIKey(ANTHROPIC_API_KEY);

interface MCPClient {
    connectToServer: (serverScriptPath: string) => Promise<void>;
}

class AnthropicMCPClient implements MCPClient {
    private mcp: Client;
    private anthropic: Anthropic;
    private transport: StdioClientTransport | null = null;
    private tools: Tool[] = [];

    constructor() {
        this.anthropic = new Anthropic({
            apiKey: ANTHROPIC_API_KEY,
        });
        this.mcp = new Client({name: "mcp-client-cli", version: "1.0.0"});
    }

    async connectToServer(serverScriptPath: string) {
        try {
            const command = getCommand(serverScriptPath);
            this.transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });

            await this.mcp.connect(this.transport);

            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.inputSchema,
                };
            });
            console.log(
                "Connected to server with tools:",
                this.tools.map(({name}) => name)
            );
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }
}



function getCommand(serverScriptPath: string) {
    guardWrongServerScriptExtension(serverScriptPath);

    return isPy(serverScriptPath)
        ? process.platform === "win32"
            ? "python"
            : "python3"
        : process.execPath;
}

function guardWrongServerScriptExtension(serverScriptPath: string) {
    if (!isJs(serverScriptPath) && !isPy(serverScriptPath)) {
        throw new Error("Server script must be a .js or .py file");
    }
}

function guardMissingAPIKey(apiKey: string | undefined) {
    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not set");
    }
}

function isJs(serverScriptPath: string) {
    return serverScriptPath.endsWith(".js");
}

function isPy(serverScriptPath: string) {
    return serverScriptPath.endsWith(".py");
}