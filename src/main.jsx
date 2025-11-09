import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'
import App from './App'
import { suppressMonacoStorageWarnings } from './utils/monacoConfig'

// Suppress Monaco Editor tracking prevention warnings
// These warnings are expected when using Monaco Editor from CDN
// and don't affect the editor's functionality
suppressMonacoStorageWarnings()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
