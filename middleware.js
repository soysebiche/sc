import { redirectLocation } from './src/domain/publicRedirects.js';

export const config = {
  matcher: [
    '/((?!api(?:/|$)|assets(?:/|$)|fonts(?:/|$)|icons(?:/|$)|og(?:/|$)|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};

export default function middleware(request) {
  const url = new URL(request.url);
  const location = redirectLocation(url.pathname, url.search);
  if (!location) return;
  return Response.redirect(new URL(location, url.origin), 308);
}
