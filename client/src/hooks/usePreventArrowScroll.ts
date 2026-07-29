import { useEffect } from 'react'

/**
 * Prevents default arrow key behavior (page scrolling) when interacting with the board.
 */
export function usePreventArrowScroll(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scroll on Arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        // Option: Don't block if the user is typing in a text input or textarea
        const activeElement = document.activeElement
        const isTyping =
          activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement

        if (!isTyping) {
          e.preventDefault()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])
}
