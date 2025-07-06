import { Play, Pause, Square, RotateCcw, Settings, Calendar, TrendingUp } from "lucide-react";

export default function SimulationControls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onReset,
  robotSpeed,
  onSpeedChange,
  currentMetrics,
  season,
  onSeasonChange
}) {
  const seasons = [
    { value: 'normal', label: 'Normal Season', icon: '📅' },
    { value: 'black-friday', label: 'Black Friday', icon: '🛍️' },
    { value: 'christmas', label: 'Christmas', icon: '🎄' },
    { value: 'holiday', label: 'Holiday Season', icon: '🎁' }
  ];

  const getSeasonMultiplier = (season) => {
    const multipliers = {
      'normal': { orderVolume: 1, efficiency: 1 },
      'black-friday': { orderVolume: 2.5, efficiency: 0.85 },
      'christmas': { orderVolume: 2.0, efficiency: 0.9 },
      'holiday': { orderVolume: 1.8, efficiency: 0.95 }
    };
    return multipliers[season] || multipliers.normal;
  };

  const currentMultiplier = getSeasonMultiplier(season);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-warehouse-900 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Simulation Controls
        </h3>
        <div className="flex items-center gap-2 text-sm text-warehouse-600">
          <Calendar className="w-4 h-4" />
          <span>Walmart Supply Chain Optimization</span>
        </div>
      </div>

      {/* Season Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-warehouse-700 mb-3">
          🎄 Season Configuration
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {seasons.map((s) => (
            <button
              key={s.value}
              onClick={() => onSeasonChange(s.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                season === s.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-warehouse-200 hover:border-warehouse-300'
              }`}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xs font-medium">{s.label}</div>
              <div className="text-xs text-warehouse-500">
                {currentMultiplier.orderVolume}x orders
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onStart}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          Start Simulation
        </button>
        
        <button
          onClick={onPause}
          disabled={!isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Pause className="w-4 h-4" />
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        
        <button
          onClick={onStop}
          disabled={!isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Square className="w-4 h-4" />
          Stop
        </button>
        
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Robot Speed Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-warehouse-700 mb-2">
          🤖 Robot Speed: {robotSpeed}x
        </label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={robotSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-warehouse-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-warehouse-500 mt-1">
          <span>0.5x (Slow)</span>
          <span>1x (Normal)</span>
          <span>3x (Fast)</span>
        </div>
      </div>

      {/* Real-time Metrics */}
      {currentMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-warehouse-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-warehouse-600">Efficiency</span>
            </div>
            <div className="text-lg font-bold text-warehouse-900">
              {currentMetrics.efficiency}%
            </div>
          </div>
          
          <div className="bg-warehouse-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 text-blue-600">📏</div>
              <span className="text-xs font-medium text-warehouse-600">Distance</span>
            </div>
            <div className="text-lg font-bold text-warehouse-900">
              {(currentMetrics.totalDistance / 100).toFixed(1)}m
            </div>
          </div>
          
          <div className="bg-warehouse-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 text-purple-600">⏱️</div>
              <span className="text-xs font-medium text-warehouse-600">Time</span>
            </div>
            <div className="text-lg font-bold text-warehouse-900">
              {currentMetrics.totalTime.toFixed(1)}s
            </div>
          </div>
          
          <div className="bg-warehouse-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 text-orange-600">💰</div>
              <span className="text-xs font-medium text-warehouse-600">Savings</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              ${currentMetrics.costSavings || 0}
            </div>
          </div>
        </div>
      )}

      {/* Season Impact Warning */}
      {season !== 'normal' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-yellow-600">⚠️</div>
            <div>
              <div className="text-sm font-medium text-yellow-800">
                {seasons.find(s => s.value === season)?.label} Mode Active
              </div>
              <div className="text-xs text-yellow-700">
                Order volume: {currentMultiplier.orderVolume}x | 
                Efficiency adjustment: {((currentMultiplier.efficiency - 1) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Walmart Integration Status */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="text-blue-600">🏪</div>
          <div>
            <div className="text-sm font-medium text-blue-800">
              Walmart Supply Chain Integration Ready
            </div>
            <div className="text-xs text-blue-700">
              Compatible with 4,700+ stores | Real-time WMS integration | Holiday optimization enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}