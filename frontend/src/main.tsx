import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={new QueryClient()}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
}
bootstrap();