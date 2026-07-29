import { ScrabbleGameUI } from 'components'
import { DictionaryProvider, GameProvider } from 'context'

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
