import { NextRequest, NextResponse } from 'next/server';
import { createMCPServer } from '@/lib/mcp/server';
import 'server-only';

/**
 * MCP Server Route Handler with Streamable HTTP Transport
 * Implements MCP Specification 2025-03-26
 *
 * Supports:
 * - HTTP POST with JSON-RPC for client-to-server messages
 * - Server-Sent Events (SSE) for server-to-client streaming
 * - Session management with Mcp-Session-Id header
 */

// Initialize MCP server
const mcpServer = createMCPServer();

// Session storage (in production, use Redis or database)
const sessions = new Map<string, { initialized: boolean; lastActivity: number }>();

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * GET /mcp - Initialize SSE stream or resume session
 * Client sends this to establish/resume SSE connection
 */
export async function GET(request: NextRequest) {
  const sessionId = request.headers.get('mcp-session-id');
  const lastEventId = request.headers.get('last-event-id');

  console.log('[MCP] GET request - Session:', sessionId, 'Last-Event:', lastEventId);

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send session ID if new session
      if (!sessionId) {
        const newSessionId = generateSessionId();
        sessions.set(newSessionId, { initialized: false, lastActivity: Date.now() });

        // SSE event format
        const event = `event: session\ndata: ${JSON.stringify({ sessionId: newSessionId })}\n\n`;
        controller.enqueue(encoder.encode(event));
      }

      // Send keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'));
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * POST /mcp - Handle JSON-RPC messages
 * Client sends JSON-RPC requests, server responds with JSON or SSE stream
 */
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('mcp-session-id');
    const acceptHeader = request.headers.get('accept') || '';
    const wantsSSE = acceptHeader.includes('text/event-stream');

    console.log('[MCP] POST request - Session:', sessionId, 'Wants SSE:', wantsSSE);

    const body = await request.json();

    // Handle JSON-RPC message(s)
    const messages = Array.isArray(body) ? body : [body];
    const responses = [];

    for (const message of messages) {
      const { jsonrpc, id, method, params } = message;

      console.log('[MCP] Processing:', method, params);

      // JSON-RPC 2.0 validation
      if (jsonrpc !== '2.0') {
        responses.push({
          jsonrpc: '2.0',
          id,
          error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' },
        });
        continue;
      }

      try {
        let result;

        switch (method) {
          case 'initialize':
            // Initialize session
            const newSessionId = sessionId || generateSessionId();
            sessions.set(newSessionId, { initialized: true, lastActivity: Date.now() });

            result = {
              protocolVersion: '2025-03-26',
              capabilities: {
                tools: {},
                resources: {},
              },
              serverInfo: {
                name: 'Calcufy',
                version: '1.0.0',
              },
            };

            // Include session ID in response header
            responses.push({
              jsonrpc: '2.0',
              id,
              result,
              _sessionId: newSessionId,
            });
            break;

          case 'tools/list':
            // List available tools
            const tools = await mcpServer.listTools();
            result = { tools };
            responses.push({ jsonrpc: '2.0', id, result });
            break;

          case 'resources/list':
            // List available resources
            const resources = await mcpServer.listResources();
            result = { resources };
            responses.push({ jsonrpc: '2.0', id, result });
            break;

          case 'tools/call':
            // Call a tool
            const { name, arguments: toolArgs } = params;
            const toolResult = await mcpServer.callTool(name, toolArgs || {});

            result = {
              content: toolResult.content,
              isError: false,
              _meta: toolResult._meta,
            };

            if (toolResult.structuredContent) {
              result.structuredContent = toolResult.structuredContent;
            }

            responses.push({ jsonrpc: '2.0', id, result });
            break;

          default:
            responses.push({
              jsonrpc: '2.0',
              id,
              error: { code: -32601, message: `Method not found: ${method}` },
            });
        }
      } catch (error) {
        console.error('[MCP] Error processing method:', method, error);

        const errorMessage = error instanceof Error ? error.message : 'Internal error';
        responses.push({
          jsonrpc: '2.0',
          id,
          error: { code: -32603, message: errorMessage },
        });
      }
    }

    // Determine response format based on Accept header
    if (wantsSSE && responses.length > 0) {
      // Return SSE stream with events
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();

          responses.forEach((response, index) => {
            const eventId = `${Date.now()}_${index}`;
            const event = `id: ${eventId}\nevent: message\ndata: ${JSON.stringify(response)}\n\n`;
            controller.enqueue(encoder.encode(event));
          });

          // Send done event
          controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
          controller.close();
        },
      });

      const headers: Record<string, string> = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      };

      // Include session ID if this was initialize
      const initResponse = responses.find(r => r._sessionId);
      if (initResponse) {
        headers['Mcp-Session-Id'] = initResponse._sessionId;
      }

      return new NextResponse(stream, { headers });
    } else {
      // Return JSON response
      const response = Array.isArray(body) ? responses : responses[0];

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      };

      // Include session ID if this was initialize
      const initResponse = responses.find(r => r._sessionId);
      if (initResponse) {
        headers['Mcp-Session-Id'] = initResponse._sessionId;
      }

      return NextResponse.json(response, { headers });
    }
  } catch (error) {
    console.error('[MCP] Error handling POST:', error);

    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error',
        },
      },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * OPTIONS /mcp - Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, Last-Event-ID',
      'Access-Control-Max-Age': '86400',
    },
  });
}
