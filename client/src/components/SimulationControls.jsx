import { Play, Pause, Square, RotateCcw, Zap } from "lucide-react";

export default function SimulationControls({
  simulationState,
  onStart,
  onPause,
  onStop,
  onReset,
  robotSpeed,
  setRobotSpeed,
}) {
  return (
    <div className="flex items-center space-x-2">
      {!simulationState.isRunning ? (
        <button 
          onClick={onStart} 
          className="px-4 py-2 rounded-lg flex items-center text-white font-medium transition-all duration-200 hover:opacity-90 hover:scale-105 bg-green-600 hover:bg-green-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Simulation
        </button>
      ) : (
        <button 
          onClick={onPause} 
          className={`px-4 py-2 rounded-lg flex items-center text-white font-medium transition-all duration-200 hover:opacity-90 ${
            simulationState.isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'
          }`}
        >
          {simulationState.isPaused ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          )}
        </button>
      )}
      
      <button 
        onClick={onStop} 
        className="px-3 py-2 rounded-lg hover:opacity-75 transition-all duration-200 border border-warehouse-300 bg-white text-warehouse-700 hover:bg-warehouse-50"
        title="Stop Simulation"
      >
        <Square className="w-4 h-4" />
      </button>
      
      <button 
        onClick={onReset} 
        className="px-3 py-2 rounded-lg hover:opacity-75 transition-all duration-200 border border-warehouse-300 bg-white text-warehouse-700 hover:bg-warehouse-50"
        title="Reset Simulation"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Simulation Speed Control */}
      <div className="flex items-center space-x-2 ml-4 border-l border-warehouse-300 pl-4">
        <Zap className="w-4 h-4 text-warehouse-500" />
        <label className="text-sm font-medium text-warehouse-700">
          Speed:
        </label>
        <select 
          className="text-sm border border-warehouse-300 rounded px-2 py-1 bg-white text-warehouse-700"
          value={robotSpeed}
          onChange={e => setRobotSpeed(Number(e.target.value))}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={5}>5x</option>
        </select>
      </div>
    </div>
  );
}