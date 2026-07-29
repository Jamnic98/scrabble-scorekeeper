import { useContext } from 'react'

import { DictionaryContext, DictionaryContextType } from '../context/DictionaryContext'

/**
 * Hook to access the dictionary instance anywhere in your app.
 */
export const useDictionary = (): DictionaryContextType => {
  const context = useContext(DictionaryContext)
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider')
  }
  return context
}
