export function getRecomendedWallets(config) {
  const wallets = Object.values(config.recommendedWallets || {});
  // …
} 