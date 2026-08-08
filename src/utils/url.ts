export const getAppOrWebUrl = (url: string): string => {
  if (typeof window === 'undefined') return url;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return url;

  try {
    const parsed = new URL(url);
    if (/x\.com|twitter\.com/i.test(parsed.hostname)) {
      const match = parsed.pathname.match(/\/status\/(\d+)/);
      if (match && match[1]) {
        return `twitter://status?id=${match[1]}`;
      }
    }
    if (/tiktok\.com/i.test(parsed.hostname)) {
      const match = parsed.pathname.match(/\/video\/(\d+)/);
      if (match && match[1]) {
        return `snssdk1128://feed?detail_id=${match[1]}`;
      }
      // Alternate fallback scheme
      return `tiktok://video/${match[1] || ''}`;
    }
  } catch (e) {
    // Ignore invalid URLs
  }
  return url;
};
