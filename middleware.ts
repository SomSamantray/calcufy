import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle CORS and authentication
 * Runs on every request before route handlers
 */

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const pathname = request.nextUrl.pathname;

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const allowHeaders = [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-MCP-Version',
      'Mcp-Session-Id',
      'Last-Event-ID',
    ].join(', ');

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': allowHeaders,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Create response
  const response = NextResponse.next();

  // Add CORS headers to all responses
  response.headers.set('Access-Control-Allow-Origin', origin || '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-MCP-Version',
      'Mcp-Session-Id',
      'Last-Event-ID',
    ].join(', ')
  );

  // Add security headers
  response.headers.set('X-Frame-Options', 'ALLOWALL');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Add custom headers for debugging
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Debug-Path', pathname);
  }

  return response;
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
