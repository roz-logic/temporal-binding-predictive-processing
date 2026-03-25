// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'  // Your main app
import ResultsApp from './results/App.tsx'  // Create this or use public-results

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/results" element={<ResultsApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
