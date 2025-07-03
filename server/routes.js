import { createServer } from "http";
import { storage } from "./storage.js";

export async function registerRoutes(app) {
  // Layout routes
  app.get("/api/layouts", async (req, res) => {
    try {
      const layouts = await storage.getAllLayouts();
      res.json(layouts);
    } catch (error) {
      console.error("Error fetching layouts:", error);
      res.status(500).json({ message: "Failed to fetch layouts" });
    }
  });

  app.get("/api/layouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const layout = await storage.getLayout(id);
      if (!layout) {
        return res.status(404).json({ message: "Layout not found" });
      }
      res.json(layout);
    } catch (error) {
      console.error("Error fetching layout:", error);
      res.status(500).json({ message: "Failed to fetch layout" });
    }
  });

  app.post("/api/layouts", async (req, res) => {
    try {
      const layout = await storage.createLayout(req.body);
      res.status(201).json(layout);
    } catch (error) {
      console.error("Error creating layout:", error);
      res.status(500).json({ message: "Failed to create layout" });
    }
  });

  app.put("/api/layouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const layout = await storage.updateLayout(id, req.body);
      if (!layout) {
        return res.status(404).json({ message: "Layout not found" });
      }
      res.json(layout);
    } catch (error) {
      console.error("Error updating layout:", error);
      res.status(500).json({ message: "Failed to update layout" });
    }
  });

  app.delete("/api/layouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLayout(id);
      if (!deleted) {
        return res.status(404).json({ message: "Layout not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting layout:", error);
      res.status(500).json({ message: "Failed to delete layout" });
    }
  });

  // Simulation routes
  app.get("/api/simulations", async (req, res) => {
    try {
      const layoutId = req.query.layoutId ? parseInt(req.query.layoutId) : null;
      const simulations = layoutId 
        ? await storage.getSimulationsByLayout(layoutId)
        : await storage.getAllSimulations();
      res.json(simulations);
    } catch (error) {
      console.error("Error fetching simulations:", error);
      res.status(500).json({ message: "Failed to fetch simulations" });
    }
  });

  app.get("/api/simulations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const simulation = await storage.getSimulation(id);
      if (!simulation) {
        return res.status(404).json({ message: "Simulation not found" });
      }
      res.json(simulation);
    } catch (error) {
      console.error("Error fetching simulation:", error);
      res.status(500).json({ message: "Failed to fetch simulation" });
    }
  });

  app.post("/api/simulations", async (req, res) => {
    try {
      const simulation = await storage.createSimulation(req.body);
      res.status(201).json(simulation);
    } catch (error) {
      console.error("Error creating simulation:", error);
      res.status(500).json({ message: "Failed to create simulation" });
    }
  });

  app.delete("/api/simulations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSimulation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Simulation not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting simulation:", error);
      res.status(500).json({ message: "Failed to delete simulation" });
    }
  });

  // Order item routes
  app.get("/api/order-items", async (req, res) => {
    try {
      const orderItems = await storage.getAllOrderItems();
      res.json(orderItems);
    } catch (error) {
      console.error("Error fetching order items:", error);
      res.status(500).json({ message: "Failed to fetch order items" });
    }
  });

  app.post("/api/order-items", async (req, res) => {
    try {
      const orderItem = await storage.createOrderItem(req.body);
      res.status(201).json(orderItem);
    } catch (error) {
      console.error("Error creating order item:", error);
      res.status(500).json({ message: "Failed to create order item" });
    }
  });

  app.put("/api/order-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderItem = await storage.updateOrderItem(id, req.body);
      if (!orderItem) {
        return res.status(404).json({ message: "Order item not found" });
      }
      res.json(orderItem);
    } catch (error) {
      console.error("Error updating order item:", error);
      res.status(500).json({ message: "Failed to update order item" });
    }
  });

  app.delete("/api/order-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteOrderItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Order item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order item:", error);
      res.status(500).json({ message: "Failed to delete order item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}