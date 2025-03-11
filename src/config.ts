export const BASE_NODE_PORT = 3000; // Port de base pour les nœuds

export const TOTAL_NODES = 10; // Nombre total de nœuds dans le réseau

// Configuration des nœuds fautifs (true = fautif, false = honnête)
export const FAULTY_NODES = [true, true, true, true, false, false, false, false, false, false];

// Valeurs initiales attribuées aux nœuds (0 ou 1)
export const INITIAL_VALUES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

// Délai entre les cycles de vérification du consensus (en ms)
export const CONSENSUS_DELAY = 500;
