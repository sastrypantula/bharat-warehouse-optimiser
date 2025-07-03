import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, BarChart3, TrendingUp, Clock, Target, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AnalyticsDashboard({ layouts, onClose }) {
  const [selectedLayout, setSelectedLayout] = useState(null);

  // Sample analytics data - in a real app this would come from the backend
  const analyticsData = [
    { name: 'Layout 1', efficiency: 85, distance: 2400, time: 36 },
    { name: 'Layout 2', efficiency: 92, distance: 2100, time: 32 },
    { name: 'Layout 3', efficiency: 78, distance: 2800, time: 42 },
    { name: 'Layout 4', efficiency: 95, distance: 1900, time: 28 },
    { name: 'Layout 5', efficiency: 88, distance: 2200, time: 33 },
  ];

  const timeSeriesData = [
    { time: '9:00', efficiency: 85, distance: 2400 },
    { time: '9:30', efficiency: 87, distance: 2300 },
    { time: '10:00', efficiency: 92, distance: 2100 },
    { time: '10:30', efficiency: 89, distance: 2250 },
    { time: '11:00', efficiency: 94, distance: 1950 },
    { time: '11:30', efficiency: 91, distance: 2050 },
  ];

  return (
    <div className="min-h-screen bg-warehouse-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-warehouse-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-warehouse-900">Analytics Dashboard</h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-warehouse-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-warehouse-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warehouse-600">Avg Efficiency</p>
                <p className="text-3xl font-bold text-warehouse-900">88%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warehouse-600">Avg Distance</p>
                <p className="text-3xl font-bold text-warehouse-900">22.4m</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warehouse-600">Avg Time</p>
                <p className="text-3xl font-bold text-warehouse-900">34s</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warehouse-600">Best Layout</p>
                <p className="text-3xl font-bold text-warehouse-900">#4</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Efficiency Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
            <h3 className="text-lg font-semibold text-warehouse-900 mb-4">Efficiency Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Layout Comparison */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
            <h3 className="text-lg font-semibold text-warehouse-900 mb-4">Layout Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distance Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
            <h3 className="text-lg font-semibold text-warehouse-900 mb-4">Distance Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="distance" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Layout Rankings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
            <h3 className="text-lg font-semibold text-warehouse-900 mb-4">Top Performing Layouts</h3>
            <div className="space-y-4">
              {analyticsData
                .sort((a, b) => b.efficiency - a.efficiency)
                .slice(0, 5)
                .map((layout, index) => (
                  <div key={layout.name} className="flex items-center justify-between p-3 bg-warehouse-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-warehouse-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-warehouse-900">{layout.name}</p>
                        <p className="text-sm text-warehouse-600">{layout.efficiency}% efficiency</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-warehouse-900">{(layout.distance / 100).toFixed(1)}m</p>
                      <p className="text-xs text-warehouse-600">{layout.time}s</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-warehouse-200">
          <h3 className="text-lg font-semibold text-warehouse-900 mb-4">Optimization Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Best Practice</h4>
              <p className="text-sm text-green-700">Layout #4 shows optimal shelf placement near packing station</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Improvement Opportunity</h4>
              <p className="text-sm text-yellow-700">Layouts #1 and #3 could benefit from reducing obstacle density</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Efficiency Tip</h4>
              <p className="text-sm text-blue-700">Consider clustering frequently ordered items together</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}