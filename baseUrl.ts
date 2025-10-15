/**
 * Dynamic base URL configuration for different environments
 * This ensures assets load correctly in ChatGPT iframe
 */

// Get base URL from environment or infer from deployment
export const baseURL = (() => {
  // 1. Check explicit environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 2. Check Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Check for other cloud providers
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }

  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL;
  }

  // 4. Fallback to localhost for development
  return 'http://localhost:3000';
})();

// Export as default for easier imports
export default baseURL;

// Helper function to construct full URLs
export function getFullUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${cleanPath}`;
}

// Helper function to get widget URL
export function getWidgetUrl(widgetName: string): string {
  return getFullUrl(`/widgets/${widgetName}`);
}
