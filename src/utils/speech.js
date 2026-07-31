const EMOJI_REGEX = /[\u{1F000}-\u{1FAFF}\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu;

export function sanitizeForSpeech(text) {
  if (!text) return '';
  return String(text)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/__ANALYSIS__\{.*?\}__END__/g, '')
    .replace(/^[#]{1,6}\s*/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(EMOJI_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim();
}
