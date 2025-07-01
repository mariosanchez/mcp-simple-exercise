import AnthropicMCPClient from "./client.js";

async function main() {
    if(process.argv.length < 3) {
        console.error("Usage: node index.ts <path_to_server_script>");
        return
    }

    const client = new AnthropicMCPClient();

    try {
        await client.connectToServer(process.argv[2]);
        await client.chatLoop();
    } catch (error) {
        console.error("Error in client:", error);
    } finally {
        await client.cleanup();
        process.exit(0);
    }
}

main();
