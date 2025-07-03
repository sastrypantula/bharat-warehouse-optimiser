import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
}

export async function apiRequest(method, url, data) {
  const config = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, config);
  await throwIfResNotOk(response);
  return response;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0]);
        await throwIfResNotOk(response);
        return response.json();
      },
    },
  },
});