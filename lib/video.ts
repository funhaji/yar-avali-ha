export function getEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.includes('aparat.com/video/video/embed')) return url;
  const match = url.match(/aparat\.com\/v\/([a-zA-Z0-9]+)/i);
  if (match) return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`;
  return url;
}
