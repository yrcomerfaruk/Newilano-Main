const ALLOWED_HOSTS = new Set([
  'images.unsplash.com',
  'static.nike.com',
  'images.ctfassets.net',
  'assets.adidas.com',
  'upload.wikimedia.org'
]);

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

export function isAllowedImageUrl(url: string | undefined | null) {
  if (!url) return false;
  if (url.startsWith('data:')) return true;

  try {
    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return false;
    }

    const pathname = parsed.pathname.toLowerCase();
    return IMAGE_EXTENSIONS.some((extension) => pathname.endsWith(extension));
  } catch (error) {
    return false;
  }
}
