import { ScrabbleGameUI } from 'components'
import { GameProvider } from 'context'
import { DictionaryProvider } from 'context/DictionaryContext'

export const App = () => {
  return (
    <DictionaryProvider dictionaryPath="/dictionary.txt">
      <GameProvider>
        <main className="min-h-screen bg-gray-700">
          <ScrabbleGameUI />
        </main>
      </GameProvider>
    </DictionaryProvider>
  )
}
