import { z } from 'zod';
import { getFullUrl } from '@/baseUrl';
import { ToolDefinition, ToolResult } from './types';
import { calculatorTools } from './tools';

/**
 * MCPServer Class
 * Manages tool registration and execution
 */
export class MCPServer {
  private tools: Map<string, ToolDefinition> = new Map();
  private resources: Map<string, any> = new Map();

  /**
   * Register a tool with the server
   */
  registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
    console.log(`[MCP] Registered tool: ${tool.name}`);
  }

  /**
   * Register a resource with the server
   */
  registerResource(name: string, resource: any): void {
    this.resources.set(name, resource);
    console.log(`[MCP] Registered resource: ${name}`);
  }

  /**
   * List all available tools
   */
  async listTools(): Promise<any[]> {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: zodToJsonSchema(tool.inputSchema),
      _meta: tool.metadata,
    }));
  }

  /**
   * List all available resources
   */
  async listResources(): Promise<any[]> {
    return Array.from(this.resources.entries()).map(([name, resource]) => ({
      name,
      ...resource,
    }));
  }

  /**
   * Call a specific tool
   */
  async callTool(toolName: string, args: any): Promise<ToolResult> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // Validate arguments
    const validatedArgs = tool.inputSchema.parse(args);

    // Call tool handler
    const result = await tool.handler(validatedArgs);

    return result;
  }
}

/**
 * Convert Zod schema to JSON Schema
 */
function zodToJsonSchema(schema: z.ZodType<any>): any {
  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape();
    const properties: any = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const fieldSchema = value as z.ZodType<any>;
      properties[key] = zodToJsonSchema(fieldSchema);

      // Check if field is required
      if (!(fieldSchema instanceof z.ZodOptional) && !(fieldSchema instanceof z.ZodDefault)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  if (schema instanceof z.ZodString) {
    return {
      type: 'string',
      description: schema.description
    };
  }

  if (schema instanceof z.ZodNumber) {
    return {
      type: 'number',
      description: schema.description
    };
  }

  if (schema instanceof z.ZodBoolean) {
    return {
      type: 'boolean',
      description: schema.description
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema._def.values,
      description: schema.description,
    };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema._def.type),
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema._def.innerType);
  }

  if (schema instanceof z.ZodDefault) {
    const innerSchema = zodToJsonSchema(schema._def.innerType);
    innerSchema.default = schema._def.defaultValue();
    return innerSchema;
  }

  return { type: 'string' };
}

/**
 * Create and configure MCP server instance
 */
export function createMCPServer(): MCPServer {
  const server = new MCPServer();

  // Register all calculator tools
  calculatorTools.forEach(tool => {
    server.registerTool(tool);
  });

  // Register widget resources
  server.registerResource('calculator-carousel-widget', {
    type: 'widget',
    url: getFullUrl('/widgets/calculator-carousel.html'),
    description: 'Calculator operation selection carousel',
  });

  server.registerResource('calculator-input-widget', {
    type: 'widget',
    url: getFullUrl('/widgets/calculator-input.html'),
    description: 'Calculator number input form',
  });

  server.registerResource('result-card-widget', {
    type: 'widget',
    url: getFullUrl('/widgets/result-card.html'),
    description: 'Calculator result display card',
  });

  console.log('[MCP] Server initialized with calculator tools');

  return server;
}
