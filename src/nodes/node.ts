import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// Port de base des nœuds
const BASE_NODE_PORT = 3000;

// Type représentant l'état d'un nœud
type NodeState = {
  killed: boolean;
  x: 0 | 1 | "?" | null;
  decided: boolean | null;
  k: number | null;
};

class Node {
  id: number;
  x: 0 | 1 | "?" | null;
  decided: boolean;
  k: number;
  isFaulty: boolean;
  killed: boolean;
  totalNodes: number;
  receivedMessages: { x: number | null; k: number }[];

  constructor(id: number, initialState: 0 | 1 | "?" | null, totalNodes: number, isFaulty: boolean = false) {
    this.id = id;
    this.x = initialState;
    this.decided = false;
    this.k = 0;
    this.isFaulty = isFaulty;
    this.killed = false;
    this.totalNodes = totalNodes;
    this.receivedMessages = [];
  }

  // Route /status : indique si le nœud est en panne ou actif
  getStatus(req: express.Request, res: express.Response) {
    if (this.isFaulty) {
      return res.status(500).json({ message: "faulty" });
    }
    return res.status(200).json({ message: "live" });
  }

  // Route /getState : renvoie l'état actuel du nœud
  getState(req: express.Request, res: express.Response) {
    return res.json({
      killed: this.killed,
      x: this.isFaulty ? null : this.x,
      decided: this.isFaulty ? null : this.decided,
      k: this.isFaulty ? null : this.k
    });
  }

  // Route /message : permet aux nœuds de communiquer entre eux
  receiveMessage(req: express.Request, res: express.Response) {
    const { x, k } = req.body;

    if (this.killed || this.isFaulty) {
      return res.status(400).json({ message: "Node is not active" });
    }

    this.receivedMessages.push({ x, k });

    return res.status(200).json({ message: "Message received" });
  }

  // Route /start : démarre l'algorithme de consensus
  async startConsensus(req: express.Request, res: express.Response) {
    if (this.killed || this.isFaulty) {
      return res.status(400).json({ message: "Node cannot start" });
    }

    this.k = 0;
    while (!this.decided) {
      await this.runConsensusRound();
    }

    return res.status(200).json({ message: "Consensus reached", x: this.x });
  }

  // Route /stop : arrête l'activité du nœud
  stopNode(req: express.Request, res: express.Response) {
    this.killed = true;
    return res.status(200).json({ message: "Node stopped" });
  }

  // Fonction pour exécuter un tour du consensus
  async runConsensusRound() {
    this.k += 1;
    await this.broadcastMessages();

    // Attente pour s'assurer que tous les messages sont reçus
    await new Promise(resolve => setTimeout(resolve, 500));

    const counts = { "0": 0, "1": 0 };
    this.receivedMessages.forEach(({ x }) => {
      if (x === 0 || x === 1) counts[x]++;
    });

    // Prise de décision basée sur la majorité
    const majority = Object.keys(counts).find(key => counts[key] > this.totalNodes / 2);

    if (majority !== undefined) {
      this.x = Number(majority); // Prendre la valeur majoritaire
    } else {
      this.x = Math.random() < 0.5 ? 0 : 1; // Choisir aléatoirement
    }

    if (counts[this.x] > (2 * this.totalNodes) / 3) {
      this.decided = true;
    }

    // Réinitialiser les messages reçus pour le prochain tour
    this.receivedMessages = [];
  }

  // Fonction pour envoyer des messages aux autres nœuds
  async broadcastMessages() {
    for (let i = 0; i < this.totalNodes; i++) {
      if (i !== this.id) {
        try {
          await axios.post(`http://localhost:${BASE_NODE_PORT + i}/message`, {
            x: this.x,
            k: this.k
          });
        } catch (error) {
          console.log(`Erreur lors de l'envoi du message au nœud ${i}`);
        }
      }
    }
  }
}

// Initialisation du nœud avec les paramètres adéquats
const nodeId = parseInt(process.argv[2], 10);
const initialState: 0 | 1 | "?" | null = parseInt(process.argv[3], 10) as 0 | 1 | "?";
const totalNodes = parseInt(process.argv[4], 10);
const isFaulty = process.argv[5] === "faulty";

const node = new Node(nodeId, initialState, totalNodes, isFaulty);

// Routes
app.get("/status", (req, res) => node.getStatus(req, res));
app.get("/getState", (req, res) => node.getState(req, res));
app.post("/message", (req, res) => node.receiveMessage(req, res));
app.get("/start", (req, res) => node.startConsensus(req, res));
app.get("/stop", (req, res) => node.stopNode(req, res));

// Lancer le serveur
const PORT = BASE_NODE_PORT + nodeId;
app.listen(PORT, () => {
  console.log(`Node ${nodeId} running on port ${PORT}`);
});
