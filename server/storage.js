import { createSampleLayout, createSampleOrderItems } from "../shared/schema.js";

// In-memory storage implementation for MFU Simulator
export class MemStorage {
  constructor() {
    this.layouts = new Map();
    this.simulations = new Map();
    this.orderItems = new Map();
    this.currentLayoutId = 1;
    this.currentSimulationId = 1;
    this.currentOrderItemId = 1;
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Create default order items
    const defaultOrderItems = createSampleOrderItems();
    console.log("Default Order Items Loaded:", defaultOrderItems);
    defaultOrderItems.forEach(item => {
      const id = this.currentOrderItemId++;
      const orderItem = { ...item, id };
      this.orderItems.set(id, orderItem);
    });

    // Create a default warehouse layout
    // const defaultLayout = createSampleLayout();

    // const id = this.currentLayoutId++;
    // const layout = { 
    //   ...defaultLayout, 
    //   id,
    //   createdAt: new Date().toISOString()
    // };
    // this.layouts.set(id, layout);
  }

  // Layout operations
  async getLayout(id) {
    return this.layouts.get(id);
  }

  async getAllLayouts() {
    return Array.from(this.layouts.values());
  }

  async createLayout(insertLayout) {
    const id = this.currentLayoutId++;
    const layout = { 
      ...insertLayout, 
      id,
      createdAt: new Date().toISOString()
    };
    this.layouts.set(id, layout);
    return layout;
  }

  async updateLayout(id, updateData) {
    const layout = this.layouts.get(id);
    if (!layout) return undefined;
    const updatedLayout = { ...layout, ...updateData };
    this.layouts.set(id, updatedLayout);
    return updatedLayout;
  }

  async deleteLayout(id) {
    return this.layouts.delete(id);
  }

  // Simulation operations
  async getSimulation(id) {
    return this.simulations.get(id);
  }

  async getSimulationsByLayout(layoutId) {
    return Array.from(this.simulations.values()).filter(sim => sim.layoutId === layoutId);
  }

  async createSimulation(insertSimulation) {
    const id = this.currentSimulationId++;
    const simulation = { 
      ...insertSimulation, 
      id,
      createdAt: new Date().toISOString()
    };
    this.simulations.set(id, simulation);
    return simulation;
  }

  async deleteSimulation(id) {
    return this.simulations.delete(id);
  }

  // Order item operations
  async getAllOrderItems() {
    console.log("Fetching all order items");
    return Array.from(this.orderItems.values());
  }

  async createOrderItem(insertOrderItem) {
    const id = this.currentOrderItemId++;
    const orderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async updateOrderItem(id, updateData) {
    const orderItem = this.orderItems.get(id);
    if (!orderItem) return undefined;
    const updatedOrderItem = { ...orderItem, ...updateData };
    this.orderItems.set(id, updatedOrderItem);
    return updatedOrderItem;
  }

  async deleteOrderItem(id) {
    return this.orderItems.delete(id);
  }
}

export const storage = new MemStorage();