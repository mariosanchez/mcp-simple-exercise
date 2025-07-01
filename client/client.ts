import {Anthropic} from "@anthropic-ai/sdk";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {Tool, MessageParam} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import * as readline from "node:readline/promises";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

guardMissingAPIKey(ANTHROPIC_API_KEY);

interface MCPClient {
    connectToServer: (serverScriptPath: string) => Promise<void>;
    processQuery: (query: string) => Promise<string>;
    chatLoop: () => Promise<void>;
    cleanup: () => Promise<void>;
}

export default class AnthropicMCPClient implements MCPClient {
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

    async processQuery(query: string) {
        const messages: MessageParam[] = [
            {
                role: "user",
                content: query,
            },
        ];

        const response = await this.anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            messages,
            tools: this.tools,
            max_tokens: 1000,
        });

        const finalText = [];

        for (const content of response.content) {
            if (content.type === "text") {
                finalText.push(content.text);
            } else if (content.type === "tool_use") {
                const toolName = content.name;
                const toolArgs = content.input as {[x: string]: unknown} | undefined;

                const result = await this.mcp.callTool({
                    name: toolName,
                    arguments: toolArgs,
                });
                finalText.push(`[Calling tool: ${toolName} with args ${JSON.stringify(toolArgs)}]`);

                messages.push({
                    role: "user",
                    content: result.content as string,
                })

                const response = await this.anthropic.messages.create({
                    model: "claude-3-5-sonnet-20241022",
                    messages,
                    max_tokens: 1000,
                })

                finalText.push(response.content[0].type === "text" ? response.content[0].text : "");
            }
        }

        return finalText.join("\n");
    }

    // this should be a specific implementation of a chat loop passed as a construction dependency/collaborator
    // will keep it simple for now
    async chatLoop() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        try {
            console.log("\nMCP Client Started!");
            console.log("Type your queries or 'quit' to exit.");

            while (true) {
                const message = await rl.question("\nQuery: ");
                if (message.toLowerCase() === "quit") {
                    break;
                }
                const response = await this.processQuery(message);
                console.log("\n" + response);
            }
        } finally {
            rl.close();
        }
    }

    async cleanup() {
        await this.mcp.close();
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