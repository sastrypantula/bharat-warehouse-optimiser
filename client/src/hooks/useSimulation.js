import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient.js";
import { SimulationEngine } from "../lib/simulation.js";

export function useSimulation(layoutId) {
  const [simulationState, setSimulationState] = useState({
    isRunning: false,
    isPaused: false,
    currentStep: 0,
    totalSteps: 0,
    robotPosition: { x: 0, y: 0 },
    targetPosition: null,
    currentOrderItem: null,
    path: [],
  });

  const [simulationResults, setSimulationResults] = useState(null);

  // Fetch layout data
  const { data: layout } = useQuery({
    queryKey: [`/api/layouts/${layoutId}`],
    enabled: !!layoutId,
  });

  // Fetch order items
  const { data: orderItems = [] } = useQuery({
    queryKey: ["/api/order-items"],
  });

  // Create simulation mutation
  const createSimulationMutation = useMutation({
    mutationFn: async (simulationData) => {
      const response = await apiRequest("POST", "/api/simulations", simulationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
    },
  });

  // Start simulation
  const startSimulation = useCallback(() => {
    if (!layout || !layout.gridData || orderItems.length === 0) {
      console.error("Cannot start simulation: missing layout or order items");
      return;
    }

    try {
      const engine = new SimulationEngine(layout.gridData, layout.gridSize);
      const results = engine.planSimulation(layout.gridData, orderItems);
      const steps = engine.generateSimulationSteps(results.totalPath, orderItems);

      setSimulationResults(results);
      setSimulationState({
        isRunning: true,
        isPaused: false,
        currentStep: 0,
        totalSteps: results.totalPath.length,
        robotPosition: results.totalPath[0] || { x: 0, y: 0 },
        targetPosition: results.totalPath[1] || null,
        currentOrderItem: orderItems[0]?.name || null,
        path: results.totalPath,
      });

      // Save simulation to backend
      createSimulationMutation.mutate({
        layoutId: layout.id,
        orderItems: orderItems,
        totalDistance: results.totalDistance,
        totalTime: results.totalTime,
        efficiency: results.efficiency,
        pathData: results.totalPath,
      });

    } catch (error) {
      console.error("Error starting simulation:", error);
    }
  }, [layout, orderItems, createSimulationMutation]);

  // Pause/Resume simulation
  const pauseSimulation = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentStep: 0
    }));
  }, []);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setSimulationState({
      isRunning: false,
      isPaused: false,
      currentStep: 0,
      totalSteps: 0,
      robotPosition: { x: 0, y: 0 },
      targetPosition: null,
      currentOrderItem: null,
      path: [],
    });
    setSimulationResults(null);
  }, []);

  // Step through simulation
  const stepSimulation = useCallback(() => {
    if (!simulationState.isRunning || simulationState.isPaused || !simulationResults) {
      return;
    }

    setSimulationState(prev => {
      const nextStep = prev.currentStep + 1;
      if (nextStep >= simulationResults.totalPath.length) {
        return {
          ...prev,
          isRunning: false,
          currentStep: simulationResults.totalPath.length - 1
        };
      }

      const nextPosition = simulationResults.totalPath[nextStep];
      const targetPosition = nextStep + 1 < simulationResults.totalPath.length 
        ? simulationResults.totalPath[nextStep + 1] 
        : null;

      return {
        ...prev,
        currentStep: nextStep,
        robotPosition: nextPosition,
        targetPosition: targetPosition
      };
    });
  }, [simulationState.isRunning, simulationState.isPaused, simulationResults]);

  return {
    simulationState,
    simulationResults,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    resetSimulation,
    stepSimulation,
    isCreatingSimulation: createSimulationMutation.isPending,
    simulationError: createSimulationMutation.error,
  };
}