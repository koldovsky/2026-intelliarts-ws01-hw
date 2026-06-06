export const parseCodeBlock = (
  text: string,
): { code: string } | null => {
  const match = text.match(/^```(?:\w+)?\n([\s\S]*?)\n```$/);
  return match ? { code: match[1] } : null;
};

export const getRenderableText = (text: string): string => {
  const codeBlock = parseCodeBlock(text);
  return codeBlock ? codeBlock.code : text;
};
