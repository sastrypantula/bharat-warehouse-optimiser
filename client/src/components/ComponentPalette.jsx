import { CellType } from "../../../shared/schema";
import { cn } from "../lib/utils.js";
import { useQuery } from "@tanstack/react-query";

export default function ComponentPalette({ selectedComponent, onComponentSelect }) {
  const { data: orderItems = [], isLoading } = useQuery({ 
    queryKey: ["http://localhost:5000/api/order-items"] 
  });

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
      <h3 className="text-lg font-semibold mb-4 text-warehouse-900">
        Component Palette
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
          Selected Tool:
        </h4>
        <p className="text-sm text-warehouse-600">
          {selectedComponent ? 
            `${components.find(c => c.type === selectedComponent)?.name || 'Unknown'}` : 
            'None selected'
          }
        </p>
      </div>
      
      {/* Order Configuration */}
      <div className="mt-6 pt-6 border-t border-warehouse-200">
        <h4 className="font-semibold mb-3 text-warehouse-900">
          Current Order Items
        </h4>
        
        {isLoading ? (
          <div className="text-sm text-warehouse-500">
            Loading order items...
          </div>
        ) : (
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-2 rounded text-sm bg-warehouse-50 border border-warehouse-200"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base">📦</span>
                  <span className="font-medium text-warehouse-800">{item.item}</span>
                </div>
                {/* <span className="text-xs px-2 py-1 rounded bg-warehouse-100 text-warehouse-600">
                  {item.shelfLocation}
                </span> */}
              </div>
            ))}
            
            {orderItems.length === 0 && (
              <div className="text-sm text-center p-3 rounded bg-warehouse-50 border border-warehouse-200 text-warehouse-500">
                No order items found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 rounded text-xs bg-warehouse-50 border border-warehouse-200">
        <strong className="text-warehouse-700">Instructions:</strong>
        <ul className="mt-1 space-y-1 text-warehouse-600">
          <li>• Select a component above</li>
          <li>• Click on grid cells to place</li>
          <li>• Use eraser to clear cells</li>
          <li>• Only one robot start & packing station allowed</li>
        </ul>
      </div>
    </div>
  );
}