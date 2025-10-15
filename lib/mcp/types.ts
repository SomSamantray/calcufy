import { z } from 'zod';

/**
 * Common types for MCP tools
 */

// Tool result content types
export type ContentType = 'text' | 'image' | 'structured' | 'widget';

// Content block interface
export interface ContentBlock {
  type: ContentType;
  text?: string;
  data?: Record<string, any>;
  imageUrl?: string;
  widgetUrl?: string;
}

// Tool result interface
export interface ToolResult {
  content: ContentBlock[];
  structuredContent?: Record<string, any>;
  _meta?: {
    'openai/outputTemplate'?: string;
    [key: string]: any;
  };
}

// Tool handler type
export type ToolHandler<T = any> = (args: T) => Promise<ToolResult>;

// Tool definition interface
export interface ToolDefinition<T = any> {
  name: string;
  description: string;
  inputSchema: z.ZodType<T>;
  handler: ToolHandler<T>;
  metadata?: {
    'openai/outputTemplate'?: string;
    category?: string;
    tags?: string[];
    requiresAuth?: boolean;
  };
}

// Widget metadata interface
export interface WidgetMetadata {
  name: string;
  type: 'widget';
  url: string;
  version?: string;
  dependencies?: string[];
}

// Error types
export class ToolError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ToolError';
  }
}

export class ValidationError extends ToolError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class CalculationError extends ToolError {
  constructor(message: string, details?: any) {
    super(message, 'CALCULATION_ERROR', details);
    this.name = 'CalculationError';
  }
}
