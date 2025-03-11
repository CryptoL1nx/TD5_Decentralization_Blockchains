import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { NodeState, ConsensusMessage, Value } from "../types";

const app = express();
app.use(bodyParser.json());

const BASE_NODE_PORT = 3000;

class Node {
  private state: NodeState;
  private faulty: boolean;
  private app: express.Application;

  constructor(nodeId: number, initialState: NodeState, faulty: boolean = false) {
    this.state = initialState;
    this.faulty = faulty;
    this.app = express();
    this.setupRoutes();
    this.app.listen(BASE_NODE_PORT + nodeId, () => {
      console.log(`Node ${nodeId} listening on port ${BASE_NODE_PORT + nodeId}`);
    });
  }

  private setupRoutes() {
    this.app.get('/status', (req, res) => {
      if (this.faulty) {
        res.status(500).send('faulty');
      } else {
        res.status(200).send('live');
      }
    });

    this.app.get('/getState', (req, res) => {
      res.status(200).json(this.state);
    });

    this.app.post('/message', (req, res) => {
      // Handle incoming messages for the Ben-Or algorithm
      res.status(200).send('Message received');
    });

    this.app.get('/start', (req, res) => {
      // Start the Ben-Or algorithm
      res.status(200).send('Algorithm started');
    });

    this.app.get('/stop', (req, res) => {
      this.state.killed = true;
      res.status(200).send('Node stopped');
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public setFaulty(faulty: boolean): void {
    this.faulty = faulty;
  }
}

// Example usage
const initialState: NodeState = {
  killed: false,
  x: null,
  decided: null,
  k: null,
};

const node = new Node(0, initialState);

export { Node, NodeState };
