import { createRoot } from 'react-dom/client'

import { App } from './App'

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

createRoot(document.getElementById('root')!).render(<App />)
