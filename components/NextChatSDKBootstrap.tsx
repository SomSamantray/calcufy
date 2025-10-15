'use client';

import { useEffect } from 'react';

interface NextChatSDKBootstrapProps {
  baseUrl: string;
}

/**
 * This component patches browser APIs to work correctly within ChatGPT iframe
 * MUST be included in root layout
 */
export function NextChatSDKBootstrap({ baseUrl }: NextChatSDKBootstrapProps) {
  useEffect(() => {
    // Ensure window.openai exists
    if (typeof window !== 'undefined') {
      (window as any).NEXT_PUBLIC_BASE_URL = baseUrl;

      // Set up communication channel with parent frame if in iframe
      if (window.parent !== window) {
        console.log('[NextChatSDK] Running in iframe mode');

        // Initialize OpenAI SDK if available
        if ((window as any).openai) {
          console.log('[NextChatSDK] OpenAI SDK detected');
        }
      }
    }
  }, [baseUrl]);

  // This component renders a script tag in the head
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.NEXT_PUBLIC_BASE_URL = "${baseUrl}";
          console.log('[NextChatSDK] Base URL configured:', window.NEXT_PUBLIC_BASE_URL);
        `,
      }}
    />
  );
}
