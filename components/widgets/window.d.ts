/**
 * Type declarations for window.openai API
 * Available in ChatGPT iframe widgets
 */

interface WindowOpenAI {
  // Data from tool invocation
  toolOutput: any;

  // Persist widget state
  setWidgetState: (state: any) => Promise<void>;

  // Get persisted widget state
  getWidgetState: () => Promise<any>;

  // Navigate to URL
  navigate: (url: string) => void;

  // Trigger a new tool call
  callTool: (toolName: string, args: any) => Promise<any>;
}

declare global {
  interface Window {
    openai: WindowOpenAI;
    NEXT_PUBLIC_BASE_URL?: string;
  }
}

export {};
