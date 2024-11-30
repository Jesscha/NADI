export const isElementNotCovered = (element: HTMLElement | null) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const topElement = document.elementFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );
  return topElement === element;
};
