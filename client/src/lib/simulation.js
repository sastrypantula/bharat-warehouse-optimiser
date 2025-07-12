import { CellType } from "../../../shared/schema.js";
import { PathfindingService } from "./pathfinding.js";

export class SimulationEngine {
  constructor(grid, gridSize, robotSpeed = 5, season = 'normal') {
    this.pathfindingService = new PathfindingService(grid, gridSize);
    this.robotSpeed = robotSpeed;
    this.gridSize = gridSize;
    this.season = season; // 'normal', 'black-friday', 'christmas', 'holiday'
    this.seasonMultipliers = {
      'normal': { orderVolume: 1, efficiency: 1, robotSpeed: 1 },
      'black-friday': { orderVolume: 2.5, efficiency: 0.85, robotSpeed: 1.2 },
      'christmas': { orderVolume: 2.0, efficiency: 0.9, robotSpeed: 1.1 },
      'holiday': { orderVolume: 1.8, efficiency: 0.95, robotSpeed: 1.05 }
    };
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

  // Walmart-specific holiday optimization
  optimizeForHolidaySeason(shelfPositions) {
    const multiplier = this.seasonMultipliers[this.season];
    
    // During peak seasons, prioritize high-demand items
    const prioritizedShelves = shelfPositions.map(shelf => ({
      ...shelf,
      priority: this.calculateHolidayPriority(shelf),
      demandMultiplier: multiplier.orderVolume
    }));

    // Sort by priority (high-demand items first)
    return prioritizedShelves.sort((a, b) => b.priority - a.priority);
  }

  calculateHolidayPriority(shelf) {
    // Simulate holiday demand patterns
    const holidayItems = {
      'electronics': 10,
      'toys': 9,
      'clothing': 8,
      'home': 7,
      'food': 6,
      'default': 5
    };

    // Extract item type from shelf name (in real implementation, this would come from inventory data)
    const itemType = this.extractItemType(shelf.item);
    return holidayItems[itemType] || holidayItems.default;
  }

  extractItemType(itemName) {
    if (!itemName) return 'default';
    const name = itemName.toLowerCase();
    
    if (name.includes('toy') || name.includes('game')) return 'toys';
    if (name.includes('phone') || name.includes('laptop') || name.includes('tv')) return 'electronics';
    if (name.includes('shirt') || name.includes('pants') || name.includes('dress')) return 'clothing';
    if (name.includes('furniture') || name.includes('decor')) return 'home';
    if (name.includes('food') || name.includes('milk') || name.includes('bread')) return 'food';
    
    return 'default';
  }

  // --- TSP Solver for optimal shelf order ---
  solveTSP(start, shelves, end) {
    // Brute-force for small N (N <= 7 is reasonable)
    if (shelves.length <= 1) return shelves;
    const perms = this.permute(shelves);
    let minDist = Infinity;
    let bestOrder = shelves;
    for (const perm of perms) {
      let dist = 0;
      let curr = start;
      for (const shelf of perm) {
        dist += this.manhattanDistance(curr, { x: shelf.gridX, y: shelf.gridY });
        curr = { x: shelf.gridX, y: shelf.gridY };
      }
      dist += this.manhattanDistance(curr, end);
      if (dist < minDist) {
        minDist = dist;
        bestOrder = perm;
      }
    }
    return bestOrder;
  }

  permute(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      for (const perm of this.permute(rest)) {
        result.push([arr[i], ...perm]);
      }
    }
    return result;
  }

  planSimulation(grid, shelfPositions) {
    const robotStart = this.findRobotStartPosition(grid);
    const packingStation = this.findPackingStationPosition(grid);

    if (!robotStart || !packingStation) {
      throw new Error("❌ Robot start position or packing station not found");
    }

    console.log(`✅ Robot start: (${robotStart.x}, ${robotStart.y})`);
    console.log(`📦 Packing station: (${packingStation.x}, ${packingStation.y})`);
    console.log(`🎄 Season: ${this.season} - Order volume: ${this.seasonMultipliers[this.season].orderVolume}x`);

    let orderedShelves;
    if (this.season === 'normal') {
      // Use TSP for optimal order
      orderedShelves = this.solveTSP(robotStart, shelfPositions, packingStation);
    } else {
      // Use demand/priority order for holiday/demand seasons
      orderedShelves = this.optimizeForHolidaySeason(shelfPositions);
    }

    let currentPosition = robotStart;
    let totalPath = [robotStart];
    let totalDistance = 0;
    let totalOrders = 0;

    for (const shelf of orderedShelves) {
      if (shelf.gridX !== null && shelf.gridY !== null) {
        const shelfPosition = { x: shelf.gridX, y: shelf.gridY };
        console.log(`🧭 Finding path to ${shelf.item} at (${shelf.gridX}, ${shelf.gridY})`);

        const pathToShelf = this.pathfindingService.findPath(currentPosition, shelfPosition);
        console.log("📍 Path to shelf:", pathToShelf.map(p => `(${p.x},${p.y})`).join(" -> "));

        if (pathToShelf.length > 0) {
          const lastStep = totalPath[totalPath.length - 1];
          const sameStart = lastStep && lastStep.x === pathToShelf[0].x && lastStep.y === pathToShelf[0].y;

          totalPath.push(...(sameStart ? pathToShelf.slice(1) : pathToShelf));
          totalDistance += this.pathfindingService.calculatePathDistance(pathToShelf);
          currentPosition = shelfPosition;
          totalOrders += shelf.demandMultiplier || 1;
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

    // Apply season-specific adjustments
    const seasonMultiplier = this.seasonMultipliers[this.season];
    const adjustedRobotSpeed = this.robotSpeed * seasonMultiplier.robotSpeed;
    const totalTime = this.pathfindingService.calculateTravelTime(totalDistance, adjustedRobotSpeed);
    const optimalDistance = this.calculateOptimalDistance(robotStart, orderedShelves, packingStation);
    console.log('[SimulationEngine] optimalDistance:', optimalDistance);
    
    // Calculate efficiency with season adjustment
    const baseEfficiency = Math.round((optimalDistance / totalDistance) * 100);
    const seasonEfficiency = Math.round(baseEfficiency * seasonMultiplier.efficiency);

    // Calculate cost savings based on Walmart's metrics
    const costSavings = this.calculateCostSavings(totalDistance, optimalDistance, totalOrders, this.season);
    const carbonReduction = this.calculateCarbonReduction(totalDistance, optimalDistance);

    return {
      totalPath,
      totalDistance,
      totalTime,
      efficiency: Math.min(seasonEfficiency, 100),
      optimalDistance,
      totalOrders,
      costSavings,
      carbonReduction,
      season: this.season,
      seasonMultiplier: seasonMultiplier.orderVolume
    };
  }

  calculateCostSavings(actualDistance, optimalDistance, totalOrders, season) {
    // Walmart-specific cost calculations
    const costPerMeter = 0.15; // Estimated cost per meter of travel
    const laborCostPerHour = 25; // Average warehouse worker cost
    const robotCostPerHour = 15; // Robot operational cost
    
    const distanceSavings = optimalDistance - actualDistance;
    const timeSavings = distanceSavings / 100; // Convert cm to meters, then to time
    
    const fuelSavings = distanceSavings * costPerMeter;
    const laborSavings = timeSavings * laborCostPerHour;
    const robotSavings = timeSavings * robotCostPerHour;
    
    // Season multiplier for cost impact
    const seasonCostMultiplier = {
      'normal': 1,
      'black-friday': 2.5,
      'christmas': 2.0,
      'holiday': 1.8
    }[season] || 1;
    
    // Clamp to zero to avoid negative savings
    return Math.max(0, Math.round((fuelSavings + laborSavings + robotSavings) * seasonCostMultiplier));
  }

  calculateCarbonReduction(actualDistance, optimalDistance) {
    // Calculate carbon footprint reduction
    const carbonPerMeter = 0.0002; // kg CO2 per meter
    const distanceReduction = Math.max(0, actualDistance - optimalDistance);
    const carbonReduction = (distanceReduction / 100) * carbonPerMeter; // Convert cm to meters
    
    // Convert to percentage (assuming 100% reduction is 50% of current)
    const maxPossibleReduction = actualDistance * carbonPerMeter * 0.5;
    return Math.round((carbonReduction / maxPossibleReduction) * 100);
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

  // Walmart-specific method for holiday season planning
  generateHolidayRecommendations(shelfPositions) {
    const recommendations = [];
    
    // Analyze shelf distribution
    const shelfCount = shelfPositions.length;
    const avgDistance = shelfPositions.reduce((sum, shelf) => {
      return sum + (shelf.gridX + shelf.gridY);
    }, 0) / shelfCount;

    if (avgDistance > 10) {
      recommendations.push({
        type: 'warning',
        message: 'High average shelf distance detected. Consider clustering frequently ordered items.',
        impact: 'Could reduce travel time by 15-20%'
      });
    }

    // Check for holiday item distribution
    const holidayItems = shelfPositions.filter(shelf => 
      this.extractItemType(shelf.item) === 'toys' || 
      this.extractItemType(shelf.item) === 'electronics'
    );

    if (holidayItems.length < shelfCount * 0.3) {
      recommendations.push({
        type: 'info',
        message: 'Consider increasing holiday item allocation during peak seasons.',
        impact: 'Could improve order fulfillment speed by 25%'
      });
    }

    return recommendations;
  }
}