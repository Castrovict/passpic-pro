/**
 * Stub para TypeScript / Web / Expo Go sin módulo nativo.
 * En entorno nativo real se usa AdRewarded.native.tsx.
 */
export function useRewardedAd() {
  return {
    showRewardedAd: async (): Promise<boolean> => true,
  };
}
