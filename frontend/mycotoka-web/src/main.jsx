import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FluentProvider theme={webLightTheme}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FluentProvider>
    </BrowserRouter>
  </StrictMode>,
)
