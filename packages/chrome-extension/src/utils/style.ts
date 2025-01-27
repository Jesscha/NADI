const LikeColors = [
  "gray",
  "darkred",
  "darkorange",
  "goldenrod",
  "darkgreen",
  "darkcyan",
  "darkblue",
  "darkviolet",
  "darkmagenta",
  "darkslateblue",
  "darkorchid",
];
export const getGlowStyle = (likeCount: number) => {
  const colorIndex = Math.min(likeCount, LikeColors.length - 1);
  const color = LikeColors[colorIndex];
  const intensity = Math.min(likeCount * 2, 20); // Cap the glow intensity
  return {
    textShadow: `0 0 ${intensity}px ${color}`,
    color: likeCount > 0 ? color : undefined,
    transition: "text-shadow 0.3s ease, color 0.3s ease",
  };
};
