import { NextRequest, NextResponse } from 'next/server';
import { createMCPServer } from '@/lib/mcp/server';
import 'server-only';

/**
 * MCP Server Route Handler
 * Handles tool discovery (GET) and tool invocation (POST)
 */

// Initialize MCP server
const mcpServer = createMCPServer();

/**
 * GET /mcp - List available tools and resources
 */
export async function GET(request: NextRequest) {
  try {
    const tools = await mcpServer.listTools();
    const resources = await mcpServer.listResources();

    return NextResponse.json({
      protocol: 'mcp',
      version: '0.1.0',
      server: {
        name: 'Calcufy',
        version: '1.0.0',
        description: 'A beautiful calculator app for ChatGPT',
      },
      capabilities: {
        tools: tools,
        resources: resources,
      },
    });
  } catch (error) {
    console.error('[MCP] Error listing tools:', error);
    return NextResponse.json(
      { error: 'Failed to list tools' },
      { status: 500 }
    );
  }
}

/**
 * POST /mcp - Call a specific tool
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool_name, arguments: toolArgs } = body;

    console.log('[MCP] Tool call request:', { tool_name, arguments: toolArgs });

    if (!tool_name) {
      return NextResponse.json(
        { error: 'tool_name is required' },
        { status: 400 }
      );
    }

    // Call the tool
    const result = await mcpServer.callTool(tool_name, toolArgs || {});

    console.log('[MCP] Tool call success:', tool_name);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[MCP] Error calling tool:', error);

    // Handle different error types
    let statusCode = 500;
    let errorMessage = 'Tool execution failed';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check if it's a Zod validation error
      if (error.name === 'ZodError') {
        statusCode = 400;
        errorMessage = 'Invalid input parameters';
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

/**
 * OPTIONS /mcp - Handle CORS preflight
 * (Already handled by middleware, but included for completeness)
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204 });
}
