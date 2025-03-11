/**
 * État d'un nœud dans le réseau
 */
export type NodeState = {
  killed: boolean;  // Indique si le nœud a été arrêté
  x: 0 | 1 | "?" | null; // Valeur actuelle du nœud dans le consensus
  decided: boolean | null; // Indique si le nœud a atteint un consensus
  k: number | null; // Numéro de l'étape actuelle
};

/**
 * Message échangé entre les nœuds pour le consensus
 */
export type ConsensusMessage = {
  x: 0 | 1 | null; // Valeur envoyée
  k: number; // Numéro de l'étape du consensus
};

export type Value = 0 | 1 | "?";