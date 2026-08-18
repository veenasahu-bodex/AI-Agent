import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import AgentPage from "./pages/AgentPage";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* AI Agent opens when website starts */}
        <Route
          path="/"
          element={<AgentPage />}
        />

        {/* Home */}
        <Route
          path="/home"
          element={<Home />}
        />

        {/* Anything else */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;