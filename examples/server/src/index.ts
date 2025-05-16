import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createRequestHandler } from "react-router";
import { createHtmlResource } from "@mcp-ui/server";

declare module "react-router" {
	export interface AppLoadContext {
	  cloudflare: {
		env: CloudflareEnvironment;
		ctx: ExecutionContext;
	  };
	}
  }
  
  const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
  );

  
// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Authless Calculator",
		version: "1.0.0",
	});

	async init() {
		const requestUrl = this.props.requestUrl as string;
		const url = new URL(requestUrl);
		const requestHost = url.host;

		this.server.tool(
			"nudge_team_member",
			{ name: z.string() },
			async ({ name }) => ({
				content: [{ type: "text", text: "Nudged " + name + "!" }],
			})
		);

		this.server.tool(
			"show_task_status",
			"Displays a UI for the user to see the status of tasks",
			async () => {
				const scheme = requestHost.includes('localhost') || requestHost.includes('127.0.0.1') ? 'http' : 'https';
				
				const pickerPageUrl = `${scheme}://${requestHost}/task`;
		  
				// Generate a unique URI for this specific invocation of the file picker UI.
				// This URI identifies the resource block itself, not the content of the iframe.
				const uniqueUiAppUri = `ui-app://task-manager/${Date.now()}`;
				const resourceBlock = createHtmlResource({
				  uri: uniqueUiAppUri,
				  content: { type: "externalUrl", iframeUrl: pickerPageUrl },
				  delivery: "text" // The URL itself is delivered as text
				});
		  
				return {
				  content: [resourceBlock]
				};
			  }
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		if (request.method === 'OPTIONS') {
			return new Response(null, {
			  headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
				'Access-Control-Allow-Headers': '*',
			  }
			})
		  }

		const url = new URL(request.url);
		ctx.props.requestUrl = request.url;

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return requestHandler(request, {
			cloudflare: { env, ctx },
		  });
		// return new Response("Not found", { status: 404 });
	},
};
