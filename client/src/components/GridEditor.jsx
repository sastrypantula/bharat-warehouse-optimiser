import { useState, useCallback, useEffect } from "react";
import { CellType } from "../../../shared/schema.js";
import { cn } from "../lib/utils.js";

export default function GridEditor({ 
  gridSize, 
  selectedComponent, 
  simulationState, 
  currentLayout,
  onRobotPlaced,
  shelfProductMap,
  setShelfProductMap,
  onGridChange
}) {
  const [gridData, setGridData] = useState(() => 
    Array(gridSize).fill(null).map(() => Array(gridSize).fill(CellType.EMPTY))
  );

  // Initialize grid with layout data if available
  useEffect(() => {
    if (currentLayout && currentLayout.gridData) {
      setGridData(currentLayout.gridData);
    } else {
      setGridData(Array(gridSize).fill(null).map(() => Array(gridSize).fill(CellType.EMPTY)));
    }
  }, [currentLayout, gridSize]);

  const handleCellClick = useCallback((row, col) => {
  if (selectedComponent && selectedComponent !== CellType.EMPTY) {
    setGridData(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...newGrid[row]];

      // Special logic for robot start - only allow one
      if (selectedComponent === CellType.ROBOT_START) {
        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
            if (newGrid[r][c] === CellType.ROBOT_START) {
              newGrid[r][c] = CellType.EMPTY;
            }
          }
        }

        onRobotPlaced?.({ x: col, y: row });
      }

      // Special logic for packing station - only allow one
      if (selectedComponent === CellType.PACKING_STATION) {
        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
            if (newGrid[r][c] === CellType.PACKING_STATION) {
              newGrid[r][c] = CellType.EMPTY;
            }
          }
        }
      }

      if (selectedComponent === CellType.SHELF) {
  const key = `${row},${col}`;
  const productName = prompt("Assign product to this shelf (e.g., milk):");
  if (productName !== "" && productName !== null) {
    setShelfProductMap(prev => ({ ...prev, [key]: productName }));
  }
}

      newGrid[row][col] = selectedComponent;
      return newGrid;
    });
  } else {
    // Clear cell if no component selected
    setGridData(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...newGrid[row]];
      if (newGrid[row][col] === CellType.ROBOT_START) {
        onRobotPlaced?.(null); // Reset robot position
      }
      const key = `${row},${col}`;
    setShelfProductMap(prev => {
    const updated = { ...prev };
    delete updated[key];
    return updated;
  });;
      newGrid[row][col] = CellType.EMPTY;
      return newGrid;
    });
  }
}, [selectedComponent, onRobotPlaced]);


  const getCellIcon = (cellType, row, col) => {
    switch (cellType) {
      case CellType.SHELF: 
        const key = `${row},${col}`;
        const name = shelfProductMap[key];
        return name ? name[0].toUpperCase() : "📦";;
      case CellType.ROBOT_START: return "🤖";
      case CellType.PACKING_STATION: return "📋";
      case CellType.OBSTACLE: return "🚫";
      case CellType.ROBOT_PATH: return "🔵";
      default: return "";
    }
  };

  const getCellStyle = (cellType, row, col) => {
    const isRobotPosition =
    simulationState.robotPosition &&
    simulationState.robotPosition.x === col &&
    simulationState.robotPosition.y === row;
    const isCollectedShelf =
      cellType === CellType.SHELF &&
      simulationState.collectedShelves &&
      simulationState.collectedShelves.some(s => s.gridX === col && s.gridY === row);
    
    let backgroundColor = 'white';
    let borderColor = 'hsl(var(--warehouse-300))';
    let extraClasses = '';
    
    switch (cellType) {
      case CellType.SHELF:
        backgroundColor = isCollectedShelf ? 'rgba(34,197,94,0.25)' : '#fbbf24';
        borderColor = isCollectedShelf ? '#22c55e' : '#f59e0b';
        break;
      case CellType.ROBOT_START:
        backgroundColor = '#4ade80';
        borderColor = '#22c55e';
        break;
      case CellType.PACKING_STATION:
        backgroundColor = '#a78bfa';
        borderColor = '#8b5cf6';
        break;
      case CellType.OBSTACLE:
        backgroundColor = 'hsl(var(--warehouse-400))';
        borderColor = 'hsl(var(--warehouse-500))';
        break;
      case CellType.ROBOT_PATH:
        backgroundColor = 'hsl(var(--primary))';
        extraClasses = 'animate-path-glow';
        break;
      case CellType.EMPTY:
      default:
        backgroundColor = 'white';
        borderColor = '#e5e7eb';
        break;
    }

    if (isRobotPosition) {
      extraClasses += ' animate-robot-pulse';
      borderColor = '#ef4444';
    }

    return {
      backgroundColor,
      border: `2px solid ${borderColor}`,
      className: extraClasses
    };
  };

  const clearGrid = () => {
    setGridData(Array(gridSize).fill(null).map(() => Array(gridSize).fill(CellType.EMPTY)));
  };

  const getGridStats = () => {
    const flatGrid = gridData.flat();
    return {
      shelves: flatGrid.filter(cell => cell === CellType.SHELF).length,
      obstacles: flatGrid.filter(cell => cell === CellType.OBSTACLE).length,
      robotStart: flatGrid.filter(cell => cell === CellType.ROBOT_START).length,
      packingStation: flatGrid.filter(cell => cell === CellType.PACKING_STATION).length,
    };
  };

  const stats = getGridStats();

  useEffect(() => {
  onGridChange?.(gridData);
}, [gridData]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-warehouse-900">
          Warehouse Layout Grid ({gridSize}x{gridSize})
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearGrid}
            className="text-sm px-3 py-1 rounded bg-warehouse-100 text-warehouse-700 border border-warehouse-300 hover:bg-warehouse-200 transition-colors"
          >
            Clear Grid
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mb-4 p-3 rounded bg-warehouse-50 border border-warehouse-200">
        <p className="text-sm text-warehouse-600">
          Select a component from the palette and click on the grid to place it. 
          {selectedComponent ? ` Currently selected: ${selectedComponent}` : ' No component selected.'}
        </p>
      </div>
      
      {/* Grid Container */}
      <div className="rounded-lg p-4 overflow-auto border-2 border-warehouse-300 bg-warehouse-50" style={{ height: "500px" }}>
        <div 
          className="grid gap-1 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: `${gridSize * 36}px`,
            height: `${gridSize * 36}px`
          }}
        >
          {gridData.map((row, rowIndex) =>
            row.map((cellType, colIndex) => {
              const isRobotPosition =
                simulationState.robotPosition &&
                simulationState.robotPosition.x === colIndex &&
                simulationState.robotPosition.y === rowIndex;
              const isCollectedShelf =
                cellType === CellType.SHELF &&
                simulationState.collectedShelves &&
                simulationState.collectedShelves.some(s => s.gridX === colIndex && s.gridY === rowIndex);
              const cellStyle = getCellStyle(cellType, rowIndex, colIndex);
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center text-xs cursor-pointer transition-all duration-200 hover:opacity-80 rounded-sm relative",
                    cellStyle.className
                  )}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  title={`${cellType} (Row: ${rowIndex}, Col: ${colIndex})`}
                  style={{
                    backgroundColor: cellStyle.backgroundColor,
                    border: cellStyle.border,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {isRobotPosition ? "🤖" : getCellIcon(cellType, rowIndex, colIndex)}
                  {isCollectedShelf && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(34,197,94,0.25)', // green-500 with 25% opacity
                      zIndex: 2,
                      pointerEvents: 'none',
                      borderRadius: '0.25rem',
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Grid Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-warehouse-50 p-2 rounded border">
          <strong className="text-warehouse-700">Shelves:</strong> 
          <span className="ml-1 text-warehouse-900">{stats.shelves}</span>
        </div>
        <div className="bg-warehouse-50 p-2 rounded border">
          <strong className="text-warehouse-700">Obstacles:</strong> 
          <span className="ml-1 text-warehouse-900">{stats.obstacles}</span>
        </div>
        <div className="bg-warehouse-50 p-2 rounded border">
          <strong className="text-warehouse-700">Robot Start:</strong> 
          <span className="ml-1 text-warehouse-900">{stats.robotStart}</span>
        </div>
        <div className="bg-warehouse-50 p-2 rounded border">
          <strong className="text-warehouse-700">Packing Station:</strong> 
          <span className="ml-1 text-warehouse-900">{stats.packingStation}</span>
        </div>
      </div>
    </div>
  );
}