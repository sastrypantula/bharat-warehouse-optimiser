import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import Simulator from "./pages/simulator.jsx";
import NotFound from "./pages/not-found.jsx";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Simulator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;