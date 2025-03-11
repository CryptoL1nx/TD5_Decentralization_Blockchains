import { exec } from "child_process";
import { delay } from "./utils";

async function main() {
  // Définition des nœuds : fautifs (true) ou honnêtes (false)
  const faultyArray = [true, true, true, true, false, false, false, false, false, false];

  // Définition des valeurs initiales des nœuds (1 ou 0)
  const initialValues = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  if (initialValues.length !== faultyArray.length)
    throw new Error("Lengths don't match");

  if (faultyArray.filter((faulty) => faulty === true).length > initialValues.length / 2)
    throw new Error("Too many faulty nodes");

  const totalNodes = initialValues.length;
  const BASE_PORT = 3000;

  console.log(`🚀 Launching ${totalNodes} nodes...`);

  // Démarrer les nœuds avec leurs valeurs initiales et leur statut (fautif ou non)
  for (let i = 0; i < totalNodes; i++) {
    const initialState = initialValues[i];
    const isFaulty = faultyArray[i] ? "faulty" : "honest";

    const command = `ts-node ./src/nodes/node.ts ${i} ${initialState} ${totalNodes} ${isFaulty}`;
    const process = exec(command);

    process.stdout?.on("data", data => console.log(`🟢 Node ${i}: ${data}`));
    process.stderr?.on("data", data => console.error(`🔴 Node ${i} ERROR: ${data}`));
  }

  // Attendre 200ms pour s'assurer que les nœuds sont bien lancés
  await delay(200);

  console.log("⚡ Starting consensus process...");
  
  // Lancer le consensus sur tous les nœuds
  for (let i = 0; i < totalNodes; i++) {
    exec(`curl http://localhost:${BASE_PORT + i}/start`);
  }
}

main().catch(err => console.error("❌ Error in start.ts:", err));
