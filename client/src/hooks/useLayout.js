import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient.js";

export function useLayout() {
  // Fetch all layouts
  const { data: layouts = [], isLoading: layoutsLoading } = useQuery({
    queryKey: ["/api/layouts"],
  });

  // Create layout mutation
  const createLayoutMutation = useMutation({
    mutationFn: async (layoutData) => {
      const response = await apiRequest("POST", "/api/layouts", layoutData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/layouts"] });
    },
  });

  // Update layout mutation
  const updateLayoutMutation = useMutation({
    mutationFn: async ({ id, ...layoutData }) => {
      const response = await apiRequest("PUT", `/api/layouts/${id}`, layoutData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/layouts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/layouts/${data.id}`] });
    },
  });

  // Delete layout mutation
  const deleteLayoutMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/layouts/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/layouts"] });
    },
  });

  // Helper functions
  const saveLayout = async (layout) => {
    if (layout.id) {
      return updateLayoutMutation.mutateAsync(layout);
    } else {
      return createLayoutMutation.mutateAsync(layout);
    }
  };

  const createNewLayout = async (layoutData) => {
    return createLayoutMutation.mutateAsync(layoutData);
  };

  const deleteLayout = async (id) => {
    return deleteLayoutMutation.mutateAsync(id);
  };

  return {
    layouts,
    layoutsLoading,
    saveLayout,
    createNewLayout,
    deleteLayout,
    isCreating: createLayoutMutation.isPending,
    isUpdating: updateLayoutMutation.isPending,
    isDeleting: deleteLayoutMutation.isPending,
    createError: createLayoutMutation.error,
    updateError: updateLayoutMutation.error,
    deleteError: deleteLayoutMutation.error,
  };
}