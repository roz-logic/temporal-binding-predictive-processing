import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/temporal-binding-predictive-processing">
      <Routes>
        <Route path="/" element={<App />} />
        {/* Results route - add after creating src/results/App.tsx */}
        {/* <Route path="/results" element={<ResultsApp />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
