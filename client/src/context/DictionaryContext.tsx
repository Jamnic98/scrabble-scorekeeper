import React, { createContext, useState, useEffect } from 'react'

import { WordDictionary } from '@scrabble/engine'

export type DictionaryContextType = {
  dictionary: WordDictionary
  isLoaded: boolean
  error: string | null
}

export const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined)

export interface DictionaryProviderProps {
  children: React.ReactNode
  /** Path to the text file in the public directory (defaults to '/dictionary.txt') */
  dictionaryPath?: string
}

export function DictionaryProvider({
  children,
  dictionaryPath = '/dictionary.txt'
}: DictionaryProviderProps) {
  // Retain a stable reference to the dictionary instance
  const [dictionary] = useState(() => new WordDictionary())
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchAndLoadDictionary() {
      try {
        const response = await fetch(dictionaryPath)

        if (!response.ok) {
          throw new Error(`Failed to load dictionary file: ${response.statusText}`)
        }

        const rawText = await response.text()

        // Split on line breaks (handles both Unix \n and Windows \r\n)
        const wordList = rawText.split(/\r?\n/)

        dictionary.loadWords(wordList)

        if (isMounted) {
          setIsLoaded(true)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error loading dictionary')
        }
      }
    }

    fetchAndLoadDictionary()

    return () => {
      isMounted = false
    }
  }, [dictionaryPath, dictionary])

  return (
    <DictionaryContext.Provider value={{ dictionary, isLoaded, error }}>
      {children}
    </DictionaryContext.Provider>
  )
}
