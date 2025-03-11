import { exec } from "child_process";
import { delay } from "./src/utils";

const BASE_PORT = 3000;

/**
 * Lance plusieurs nœuds du réseau.
 * @param totalNodes Nombre total de nœuds à lancer
 * @param faultyNodes Nombre de nœuds fautifs
 * @param initialValues Valeurs initiales des nœuds
 * @param faultyArray Tableau indiquant quels nœuds sont fautifs (true/false)
 */
export async function launchNetwork(
  totalNodes: number,
  faultyNodes: number,
  initialValues: number[],
  faultyArray: boolean[]
) {
  console.log(`🚀 Launching ${totalNodes} nodes...`);

  for (let i = 0; i < totalNodes; i++) {
    const initialState = initialValues[i];
    const isFaulty = faultyArray[i] ? "faulty" : "honest";

    const command = `node ./src/nodes/node.ts ${i} ${initialState} ${totalNodes} ${isFaulty}`;
    const process = exec(command);

    process.stdout?.on("data", (data) => console.log(`🟢 Node ${i}: ${data}`));
    process.stderr?.on("data", (data) => console.error(`🔴 Node ${i} ERROR: ${data}`));
  }

  // Attendre 500ms pour s'assurer que tous les nœuds sont bien lancés
  await delay(500);
}
