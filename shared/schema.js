import { pgTable, text, serial, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const layouts = pgTable("layouts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  gridSize: integer("grid_size").notNull().default(15),
  gridData: json("grid_data").notNull(),
  metrics: json("metrics"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  layoutId: integer("layout_id").references(() => layouts.id),
  orderItems: json("order_items").notNull(),
  totalDistance: integer("total_distance"),
  totalTime: integer("total_time"),
  efficiency: integer("efficiency"),
  pathData: json("path_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shelfLocation: text("shelf_location"),
  gridX: integer("grid_x"),
  gridY: integer("grid_y"),
});

// Zod schemas (can still be used in JS)
export const insertLayoutSchema = createInsertSchema(layouts).omit({
  id: true,
  createdAt: true,
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Enum replacement (no TypeScript enums in JS)
export const CellType = {
  EMPTY: 'empty',
  SHELF: 'shelf',
  ROBOT_START: 'robot-start',
  PACKING_STATION: 'packing-station',
  OBSTACLE: 'obstacle',
  ROBOT_PATH: 'robot-path',
};

// You can still describe these shapes with JSDoc if needed:
/**
 * @typedef {{ x: number, y: number }} GridPosition
 * @typedef {{
 *   isRunning: boolean,
 *   isPaused: boolean,
 *   currentStep: number,
 *   totalSteps: number,
 *   robotPosition: GridPosition,
 *   targetPosition: GridPosition | null,
 *   currentOrderItem: string | null,
 *   path: GridPosition[]
 * }} SimulationState
 */

// Sample layout for memory storage
export function createSampleLayout() {
  return {
    id: 1,
    name: "Default Layout",
    description: "Sample layout for simulator",
    gridSize: 15,
    gridData: Array.from({ length: 15 }, () =>
      Array.from({ length: 15 }, () => 0)
    ),
    createdAt: new Date(),
  };
}

// Sample order items for memory storage
export function createSampleOrderItems() {
  return [
    { id: 1, simulationId: 1, item: "milk"},
    // { id: 2, simulationId: 1, item: "Item B", x: 14, y: 14 },
  ];
}
