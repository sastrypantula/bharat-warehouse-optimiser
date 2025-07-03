import { CellType } from "../../../shared/schema.js";

// A* pathfinding algorithm implementation
export class PathfindingService {
  constructor(grid, gridSize) {
    this.grid = grid;
    this.gridSize = gridSize;
  }

  findPath(start, end) {
    const openSet = [];
    const closedSet = new Set();

    const startNode = {
      position: start,
      gCost: 0,
      hCost: this.calculateHeuristic(start, end),
      fCost: 0,
    };
    startNode.fCost = startNode.gCost + startNode.hCost;

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest fCost
      let currentNode = openSet[0];
      let currentIndex = 0;

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fCost < currentNode.fCost) {
          currentNode = openSet[i];
          currentIndex = i;
        }
      }

      openSet.splice(currentIndex, 1);
      closedSet.add(this.positionToKey(currentNode.position));

      // ✅ Reached destination
      if (this.positionsEqual(currentNode.position, end)) {
        return this.reconstructPath(currentNode);
      }

      const neighbors = this.getNeighbors(currentNode.position);

      for (const neighborPos of neighbors) {
        const neighborKey = this.positionToKey(neighborPos);

        // ✅ Modified to allow shelf if it's the goal
        if (closedSet.has(neighborKey) || this.isObstacle(neighborPos, end)) {
          continue;
        }

        const gCost = currentNode.gCost + 1;
        const hCost = this.calculateHeuristic(neighborPos, end);
        const fCost = gCost + hCost;

        const existingNode = openSet.find(node =>
          this.positionsEqual(node.position, neighborPos)
        );

        if (!existingNode) {
          openSet.push({
            position: neighborPos,
            gCost,
            hCost,
            fCost,
            parent: currentNode,
          });
        } else if (gCost < existingNode.gCost) {
          existingNode.gCost = gCost;
          existingNode.fCost = fCost;
          existingNode.parent = currentNode;
        }
      }
    }

    return []; // ❌ No path found
  }

  calculateHeuristic(pos1, pos2) {
    // Manhattan distance heuristic
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  getNeighbors(position) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, // North
      { x: 1, y: 0 },  // East
      { x: 0, y: 1 },  // South
      { x: -1, y: 0 }, // West
    ];

    for (const dir of directions) {
      const newPos = {
        x: position.x + dir.x,
        y: position.y + dir.y,
      };

      if (this.isValidPosition(newPos)) {
        neighbors.push(newPos);
      }
    }

    return neighbors;
  }

  isValidPosition(position) {
    return (
      position.x >= 0 &&
      position.x < this.gridSize &&
      position.y >= 0 &&
      position.y < this.gridSize
    );
  }

  // ✅ Modified to allow goal shelf access
  isObstacle(position, goal = null) {
    if (!this.isValidPosition(position)) return true;

    const cellType = this.grid[position.y][position.x];

    // Allow shelf if it's the goal
    if (goal && this.positionsEqual(position, goal)) {
      return false;
    }

    return cellType === CellType.OBSTACLE || cellType === CellType.SHELF;
  }

  positionsEqual(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  positionToKey(position) {
    return `${position.x},${position.y}`;
  }

  reconstructPath(endNode) {
    const path = [];
    let currentNode = endNode;

    while (currentNode) {
      path.unshift(currentNode.position);
      currentNode = currentNode.parent;
    }

    return path;
  }

  calculatePathDistance(path) {
    if (path.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      totalDistance += Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y);
    }

    return totalDistance * 100; // Convert to centimeters
  }

  calculateTravelTime(distance, robotSpeed) {
    const distanceInMeters = distance / 100;
    return Math.round(distanceInMeters / robotSpeed);
  }
}
