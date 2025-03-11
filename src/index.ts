import { launchNetwork } from "./launchNodes";
import { startConsensus } from "./consensus";
import { TOTAL_NODES, FAULTY_NODES, INITIAL_VALUES } from "./config";
import { delay } from "./utils";

async function main() {
  console.log("🚀 Initialisation du réseau...");

  // Vérification des paramètres
  if (INITIAL_VALUES.length !== FAULTY_NODES.length) {
    throw new Error("❌ Les longueurs des valeurs initiales et des nœuds fautifs ne correspondent pas !");
  }

  if (FAULTY_NODES.filter(faulty => faulty).length > TOTAL_NODES / 2) {
    throw new Error("❌ Trop de nœuds fautifs pour atteindre un consensus !");
  }

  // Lancer le réseau
  await launchNetwork(TOTAL_NODES, FAULTY_NODES.filter(el => el).length, INITIAL_VALUES, FAULTY_NODES);

  // Attendre que tous les nœuds soient prêts
  await delay(500);

  // Démarrer le processus de consensus
  await startConsensus(TOTAL_NODES);
}

main().catch(err => console.error("❌ Erreur dans `index.ts` :", err));
