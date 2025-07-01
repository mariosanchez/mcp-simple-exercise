import {Anthropic} from "@anthropic-ai/sdk";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import dotenv from "dotenv";

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

guardMissingAPIKey(ANTHROPIC_API_KEY);

interface MCPClient {}

class AnthropicMCPClient implements MCPClient{
    private mcp: Client;
    private anthropic: Anthropic;

    constructor() {
        this.anthropic = new Anthropic({
            apiKey: ANTHROPIC_API_KEY,
        });
        this.mcp = new Client({name: "mcp-client-cli", version: "1.0.0"});
    }
}

function guardMissingAPIKey(apiKey: string | undefined) {
    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not set");
    }
}
