import { CellType } from "../../../shared/schema.js";
import { PathfindingService } from "./pathfinding.js";

export class SimulationEngine {
  constructor(grid, gridSize, robotSpeed = 5) {
    this.pathfindingService = new PathfindingService(grid, gridSize);
    this.robotSpeed = robotSpeed;
    this.gridSize = gridSize;
  }

  findRobotStartPosition(grid) {
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === CellType.ROBOT_START) {
          return { x, y };
        }
      }
    }
    return null;
  }

  findPackingStationPosition(grid) {
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === CellType.PACKING_STATION) {
          return { x, y };
        }
      }
    }
    return null;
  }

  planSimulation(grid, shelfPositions) {
    const robotStart = this.findRobotStartPosition(grid);
    const packingStation = this.findPackingStationPosition(grid);

    if (!robotStart || !packingStation) {
      throw new Error("❌ Robot start position or packing station not found");
    }

    console.log(`✅ Robot start: (${robotStart.x}, ${robotStart.y})`);
    console.log(`📦 Packing station: (${packingStation.x}, ${packingStation.y})`);

    let currentPosition = robotStart;
    let totalPath = [robotStart];
    let totalDistance = 0;

    for (const shelf of shelfPositions) {
      if (shelf.gridX !== null && shelf.gridY !== null) {
        const shelfPosition = { x: shelf.gridX, y: shelf.gridY };
        console.log(`🧭 Finding path to shelf at (${shelf.gridX}, ${shelf.gridY})`);

        const pathToShelf = this.pathfindingService.findPath(currentPosition, shelfPosition);
        console.log("📍 Path to shelf:", pathToShelf.map(p => `(${p.x},${p.y})`).join(" -> "));

        if (pathToShelf.length > 0) {
          const lastStep = totalPath[totalPath.length - 1];
          const sameStart = lastStep && lastStep.x === pathToShelf[0].x && lastStep.y === pathToShelf[0].y;

          totalPath.push(...(sameStart ? pathToShelf.slice(1) : pathToShelf));
          totalDistance += this.pathfindingService.calculatePathDistance(pathToShelf);
          currentPosition = shelfPosition;
        } else {
          console.warn(`⚠️ No path found to shelf at (${shelf.gridX}, ${shelf.gridY})`);
        }
      } else {
        console.warn(`⚠️ Skipping shelf with no grid position`);
      }
    }

    const pathToPacking = this.pathfindingService.findPath(currentPosition, packingStation);
    console.log("📦 Path to packing station:", pathToPacking.map(p => `(${p.x},${p.y})`).join(" -> "));

    if (pathToPacking.length > 0) {
      const lastStep = totalPath[totalPath.length - 1];
      const sameStart = lastStep && lastStep.x === pathToPacking[0].x && lastStep.y === pathToPacking[0].y;

      totalPath.push(...(sameStart ? pathToPacking.slice(1) : pathToPacking));
      totalDistance += this.pathfindingService.calculatePathDistance(pathToPacking);
    } else {
      console.warn("⚠️ No path to packing station found");
    }

    const totalTime = this.pathfindingService.calculateTravelTime(totalDistance, this.robotSpeed);
    const optimalDistance = this.calculateOptimalDistance(robotStart, shelfPositions, packingStation);
    console.log('[SimulationEngine] optimalDistance:', optimalDistance);
    const efficiency = Math.round((optimalDistance / totalDistance) * 100);

    return {
      totalPath,
      totalDistance,
      totalTime,
      efficiency: Math.min(efficiency, 100),
      optimalDistance,
    };
  }

  calculateOptimalDistance(start, shelfPositions, packingStation) {
    // Calculate Manhattan distance for optimal path
    let optimalDistance = 0;
    let currentPos = start;

    for (const shelf of shelfPositions) {
      if (shelf.gridX !== null && shelf.gridY !== null) {
        const shelfPos = { x: shelf.gridX, y: shelf.gridY };
        optimalDistance += this.manhattanDistance(currentPos, shelfPos) * 100;
        currentPos = shelfPos;
      }
    }

    optimalDistance += this.manhattanDistance(currentPos, packingStation) * 100;
    return optimalDistance;
  }

  manhattanDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  generateSimulationSteps(totalPath, shelfPositions) {
    const steps = [];
    let currentShelfIndex = 0;
    let currentTarget = shelfPositions[currentShelfIndex];

    for (let i = 0; i < totalPath.length; i++) {
      const position = totalPath[i];
      let action = "Moving";
      let targetItem = currentTarget?.item;

      // Check if we're at a shelf position
      if (currentTarget && 
          currentTarget.gridX === position.x && 
          currentTarget.gridY === position.y) {
        action = `Picking up at shelf (${currentTarget.gridX},${currentTarget.gridY})`;
        currentShelfIndex++;
        currentTarget = shelfPositions[currentShelfIndex];
      } else if (i === totalPath.length - 1) {
        action = "Delivering to packing station";
        targetItem = undefined;
      }

      steps.push({
        step: i + 1,
        position,
        action,
        targetItem,
      });
    }

    return steps;
  }
}