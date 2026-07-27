import { createRoot } from 'react-dom/client'

import { App } from './App'

import './styles/main.css'
// TODO: add back
// import { StrictMode } from 'react'

window.addEventListener(
  'keydown',
  (e) => {
    switch (e.keyCode) {
      case 37:
      case 38:
      case 39:
      case 40:
        e.preventDefault()
        break
      default:
        break
    }
  },
  false
)

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <App />
  // </StrictMode>
)
