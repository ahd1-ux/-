/**
 * 🌐 Smart Client-side Fetch Router
 * Directs API traffic to either the local node server or XAMPP php api.
 */

export function formatPHPUrl(inputUrl: string): string {
  if (!inputUrl) return "";
  let formatted = inputUrl.trim();
  if (!formatted.toLowerCase().includes(".php")) {
    if (!formatted.endsWith("/")) {
      formatted += "/";
    }
    formatted += "api.php";
  }
  return formatted;
}

export function getAutoDetectedPhpUrl(): string {
  const hostname = window.location.hostname;
  // If we are inside the development/staging cloud playground envs:
  const isAistudioEnv = hostname.includes('run.app') || hostname.includes('aistudio');
  if (!isAistudioEnv) {
    const loc = window.location;
    let pathname = loc.pathname;
    
    // Remove any trailing main page name
    if (pathname.endsWith('.html') || pathname.endsWith('.php')) {
      pathname = pathname.substring(0, pathname.lastIndexOf('/'));
    }
    
    // Synthesize proper directory reference
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    
    return `${loc.protocol}//${loc.host}${pathname}api.php`;
  }
  return '';
}

export async function smartFetch(url: string, options?: RequestInit): Promise<Response> {
  const customPhp = localStorage.getItem('custom_php_api_url') || '';
  const autoDetectedPhp = getAutoDetectedPhpUrl();
  const detectedPhp = localStorage.getItem('detected_php_api_url') || '';
  
  const rawPhpUrl = customPhp || autoDetectedPhp || detectedPhp;
  
  if (rawPhpUrl && url.startsWith('/api/')) {
    const phpUrl = formatPHPUrl(rawPhpUrl);
    const parts = url.split('/');
    const endpoint = parts[2]; // 'books', 'articles', etc.
    const id = parts[3]; // if exists
    
    try {
      const targetUrl = new URL(phpUrl);
      targetUrl.searchParams.set('action', endpoint);
      if (id) {
        targetUrl.searchParams.set('id', id);
      }
      
      const phpOptions: RequestInit = {
        ...options,
        mode: 'cors',
        credentials: 'omit'
      };
      
      console.log(`[SmartFetch Direct PHP Route] ${url} -> ${targetUrl.toString()}`);
      return await fetch(targetUrl.toString(), phpOptions);
    } catch (e) {
      console.error('Failed to construct direct browser request to PHP api:', e);
    }
  }
  
  return fetch(url, options);
}
