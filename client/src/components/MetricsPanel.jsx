import { useState } from "react";
import { Route, Clock, Gauge, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils.js";

export default function MetricsPanel({ currentMetrics, layouts, simulationState }) {
  const [selectedMetric, setSelectedMetric] = useState('distance');
  
  const formatDistance = (distance) => `${(distance / 100).toFixed(1)}m`;
  const formatTime = (time) => `${time}s`;
  const formatEfficiency = (efficiency) => `${efficiency}%`;

  const metrics = [
    {
      id: 'distance',
      name: 'Total Distance',
      icon: Route,
      value: currentMetrics ? formatDistance(currentMetrics.totalDistance) : '--',
      color: '#3b82f6',
      description: 'Total distance robot travels'
    },
    {
      id: 'time',
      name: 'Total Time',
      icon: Clock,
      value: currentMetrics ? formatTime(currentMetrics.totalTime) : '--',
      color: '#8b5cf6',
      description: 'Time to complete all orders'
    },
    {
      id: 'efficiency',
      name: 'Efficiency',
      icon: Gauge,
      value: currentMetrics ? formatEfficiency(currentMetrics.efficiency) : '--',
      color: '#10b981',
      description: 'Path optimization percentage'
    }
  ];

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 80) return '#10b981'; // Green
    if (efficiency >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="space-y-6">
      {/* Current Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-warehouse-900">
            Simulation Metrics
          </h3>
          {simulationState.isRunning && (
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: '#10b981' }}
              title="Simulation Running"
            />
          )}
        </div>
        
        <div className="space-y-4">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div 
                key={metric.id}
                className={cn(
                  "p-4 rounded-lg cursor-pointer transition-all duration-200 border",
                  selectedMetric === metric.id ? 'ring-2 border-primary' : 'border-warehouse-200 hover:border-warehouse-300'
                )}
                onClick={() => setSelectedMetric(metric.id)}
                style={{ 
                  background: 'linear-gradient(to bottom right, white, hsl(var(--warehouse-50)))',
                  ...(selectedMetric === metric.id && {
                    boxShadow: `0 0 0 2px ${metric.color}33`
                  })
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-warehouse-700">
                    {metric.name}
                  </span>
                  <IconComponent className="w-4 h-4" style={{ color: metric.color }} />
                </div>
                <div 
                  className="text-2xl font-bold mb-1 text-warehouse-900"
                >
                  {metric.value}
                </div>
                <div className="text-xs text-warehouse-500">
                  {metric.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulation Status */}
        <div className="mt-6 p-3 rounded bg-warehouse-50 border border-warehouse-200">
          <h4 className="text-sm font-semibold mb-2 text-warehouse-700">
            Simulation Status:
          </h4>
          <div className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: simulationState.isRunning ? '#10b981' : '#6b7280'
              }}
            />
            <span className="text-sm text-warehouse-600">
              {simulationState.isRunning 
                ? (simulationState.isPaused ? 'Paused' : 'Running') 
                : 'Stopped'
              }
            </span>
          </div>
          {simulationState.isRunning && (
            <div className="mt-2 text-xs text-warehouse-500">
              Step {simulationState.currentStep} of {simulationState.totalSteps}
              {simulationState.currentOrderItem && (
                <div className="mt-1">
                  Current: {simulationState.currentOrderItem?.item?? 'N/A'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-warehouse-200">
        <h4 className="text-md font-semibold mb-3 text-warehouse-900">
          Quick Stats
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 rounded bg-warehouse-50 border border-warehouse-200">
            <div className="font-semibold text-warehouse-700">Layouts</div>
            <div className="text-lg font-bold text-warehouse-900">{layouts.length}</div>
          </div>
          <div className="text-center p-2 rounded bg-warehouse-50 border border-warehouse-200">
            <div className="font-semibold text-warehouse-700">Robot Pos</div>
            <div className="text-lg font-bold text-warehouse-900">
  {simulationState.robotPosition
    ? `(${simulationState.robotPosition.x}, ${simulationState.robotPosition.y})`
    : "Not placed"}
</div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-warehouse-200">
        <h4 className="text-md font-semibold mb-2 text-warehouse-900 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-primary" />
          Optimization Tips
        </h4>
        <ul className="text-xs space-y-1 text-warehouse-600">
          <li>• Place shelves closer to packing station</li>
          <li>• Minimize obstacles in main pathways</li>
          <li>• Group frequently ordered items together</li>
          <li>• Keep robot start position central</li>
        </ul>
      </div>
    </div>
  );
}