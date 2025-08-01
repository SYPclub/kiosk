import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSampleData } from './lib/sampleData'

// Initialize sample data on first load
initializeSampleData();

createRoot(document.getElementById("root")!).render(<App />);
