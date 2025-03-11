/**
 * Pause l'exécution pendant un certain nombre de millisecondes.
 * @param ms Durée en millisecondes
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  