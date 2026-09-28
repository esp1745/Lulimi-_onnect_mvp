// Converts a flag emoji (e.g. "🇰🇪") into a Twemoji CDN image URL.
// Needed because Windows doesn't render regional-indicator flag emoji as
// actual flags in its default emoji font — it falls back to plain letters.
export function flagEmojiToTwemojiUrl(flag: string): string {
  const codePoints = Array.from(flag)
    .map((char) => char.codePointAt(0)!.toString(16))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoints}.png`;
}
