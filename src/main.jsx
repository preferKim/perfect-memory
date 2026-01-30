import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import './index.css'
import App from './App.jsx'
import { PlayerProvider } from './context/PlayerContext.jsx'; // Add PlayerProvider import

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PlayerProvider> {/* Wrap App with PlayerProvider */}
        <App />
      </PlayerProvider>
    </BrowserRouter>
  </StrictMode>,
)
