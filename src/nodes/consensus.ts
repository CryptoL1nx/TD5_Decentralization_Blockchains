import axios from "axios";
import { delay } from "./utils";

const BASE_NODE_PORT = 3000;

/**
 * Démarre le consensus sur tous les nœuds.
 * @param totalNodes Nombre total de nœuds dans le réseau
 */
export async function startConsensus(totalNodes: number) {
  console.log("⚡ Starting Ben-Or Consensus Algorithm...");

  let decidedNodes = 0;

  while (decidedNodes < totalNodes) {
    decidedNodes = 0;

    for (let i = 0; i < totalNodes; i++) {
      try {
        const response = await axios.get(`http://localhost:${BASE_NODE_PORT + i}/getState`);
        const { decided } = response.data;

        if (decided) decidedNodes++;
      } catch (error) {
        console.error(`❌ Erreur en vérifiant l'état du nœud ${i}: ${error.message}`);
      }
    }

    console.log(`✅ ${decidedNodes}/${totalNodes} nodes have reached consensus`);

    await delay(500); // Attendre 500ms avant de vérifier à nouveau
  }

  console.log("🎉 All nodes have reached consensus!");
}
