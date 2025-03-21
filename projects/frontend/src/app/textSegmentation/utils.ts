export function getTextNodeOffset(node: Node, offset: number): number | null {
  const range = document.createRange();
  range.selectNodeContents(document.body);
  range.setEnd(node, offset);
  return range.toString().length;
} 