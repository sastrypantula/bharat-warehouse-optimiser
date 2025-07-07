import { CellType } from "../../../shared/schema";
import { cn } from "../lib/utils.js";

export default function ComponentPalette({ selectedComponent, onComponentSelect, shelfProductMap, collectedShelves, currentOrderItem,
  orderItem, setOrderItem
 }) {
  const components = [
    {
      type: CellType.SHELF,
      name: "Shelf",
      icon: "📦",
      description: "Storage shelves for items",
      bgColor: "#fbbf24",
      borderColor: "#f59e0b",
    },
    {
      type: CellType.ROBOT_START,
      name: "Robot Start",
      icon: "🤖",
      description: "Starting position for robot",
      bgColor: "#4ade80",
      borderColor: "#22c55e",
    },
    {
      type: CellType.PACKING_STATION,
      name: "Packing Station",
      icon: "📋",
      description: "Final destination for orders",
      bgColor: "#a78bfa",
      borderColor: "#8b5cf6",
    },
    {
      type: CellType.OBSTACLE,
      name: "Obstacle",
      icon: "🚫",
      description: "Blocks robot movement",
      bgColor: "hsl(var(--warehouse-400))",
      borderColor: "hsl(var(--warehouse-500))",
    },
    {
      type: "eraser",
      name: "Eraser",
      icon: "🗑️",
      description: "Clear cells",
      bgColor: "#f3f4f6",
      borderColor: "#d1d5db",
    },
  ];

  const handleComponentClick = (componentType) => {
    if (componentType === "eraser") {
      onComponentSelect(CellType.EMPTY);
    } else {
      onComponentSelect(componentType);
    }
  };

  console.log(selectedComponent, "selectedComponent");

  const shelfEntries = Object.entries(shelfProductMap);

  const handleAddToOrder = (gridX, gridY, itemName) => {
    setOrderItem((prev) => {
      // Prevent duplicates
      if (prev.some(item => item.gridX === gridX && item.gridY === gridY)) return prev;
      return [...prev, { item: itemName, gridX, gridY }];
    });
  };

  const handleRemoveFromOrder = (gridX, gridY) => {
    setOrderItem((prev) => prev.filter(item => item.gridX !== gridX || item.gridY !== gridY));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
      <h3 className="text-lg font-semibold mb-4 text-warehouse-900">
        🧱 Layout Tools
      </h3>
      
      <div className="space-y-3">
        {components.map((component) => (
          <button
            key={component.type}
            className={cn(
              "w-full rounded-lg p-3 text-center text-sm font-medium transition-all duration-200 cursor-pointer hover:opacity-90 hover:scale-105",
              selectedComponent === component.type && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => handleComponentClick(component.type)}
            style={{
              backgroundColor: component.bgColor,
              border: `2px solid ${component.borderColor}`,
            }}
          >
            <div className="text-lg mb-1">{component.icon}</div>
            <div className="font-semibold text-gray-800">{component.name}</div>
            <div className="text-xs opacity-75 mt-1 text-gray-600">{component.description}</div>
          </button>
        ))}
      </div>
      
      {/* Current Selection */}
      <div className="mt-4 p-3 rounded bg-warehouse-50 border border-warehouse-200">
        <h4 className="text-sm font-semibold mb-2 text-warehouse-700">
          ✏️ Selected Tool:
        </h4>
        <p className="text-sm text-warehouse-600">
          {selectedComponent ? 
            `${components.find(c => c.type === selectedComponent || (selectedComponent === CellType.EMPTY && c.type === "eraser"))?.name || 'None selected'}` : 
            'None selected'
          }
        </p>
      </div>
      
      {/* Order Configuration */}
      <div className="mt-6 pt-6 border-t border-warehouse-200">
  <h4 className="font-semibold mb-3 text-warehouse-900">
    🗃️ Available Shelf Items (Click to add/remove)
  </h4>
  <div className="space-y-2">
    {shelfEntries.length === 0 && (
      <div className="text-sm text-center p-3 rounded bg-warehouse-50 border border-warehouse-200 text-warehouse-500">
        No shelves available
      </div>
    )}
    {shelfEntries.map(([key, itemName]) => {
      const [row, col] = key.split(',').map(Number);
      const isSelected = orderItem.some(item => item.gridX === col && item.gridY === row);
      return (
        <div
          key={key}
          className={`flex items-center justify-between p-2 rounded text-sm bg-warehouse-50 border border-warehouse-200`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-base">📦</span>
            <span className="font-medium text-warehouse-800">{itemName}</span>
            <span className="text-warehouse-500 text-xs">({col},{row})</span>
          </div>
          <button
            className={`text-xs font-semibold px-2 py-1 rounded 
              ${isSelected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            onClick={() => {
              isSelected
                ? handleRemoveFromOrder(col, row)
                : handleAddToOrder(col, row, itemName);
            }}
          >
            {isSelected ? 'Remove' : 'Add'}
          </button>
        </div>
      );
    })}
  </div>
</div>

{/* Currently Selected Order Items */}
<div className="mt-6 pt-6 border-t border-warehouse-200">
  <h4 className="font-semibold mb-3 text-warehouse-900">🧾 Current Order</h4>
  {orderItem.length === 0 ? (
    <div className="text-sm text-center p-3 rounded bg-warehouse-50 border border-warehouse-200 text-warehouse-500">
      No order items selected
    </div>
  ) : (
    <ul className="space-y-1">
      {orderItem.map((item, idx) => (
        <li key={`${item.gridX},${item.gridY}`} className="flex justify-between items-center px-3 py-1 bg-warehouse-50 border border-warehouse-200 rounded text-sm">
          <div className="flex items-center space-x-2">
            <span>📦</span>
            <span className="text-warehouse-800">{item.item}</span>
            <span className="text-warehouse-500 text-xs">({item.gridX},{item.gridY})</span>
          </div>
          <button
            onClick={() => handleRemoveFromOrder(item.gridX, item.gridY)}
            className="text-red-500 text-xs hover:underline"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )}
</div>

      {/* Instructions */}
      <div className="mt-4 p-3 rounded text-xs bg-warehouse-50 border border-warehouse-200">
        <strong className="text-warehouse-700">📌 Instructions:</strong>
<ul className="mt-1 space-y-1 text-warehouse-600 text-xs">
  <li>• Select a tool (shelf, robot, packing station)</li>
  <li>• Click grid cells to place components</li>
  <li>• Use 🗑️ Eraser to remove placed components</li>
  <li>• Only one robot and one packing station allowed</li>
  <li>• Use 🗃️ shelf selector to add/remove order items</li>
</ul>
      </div>
    </div>
  );
}