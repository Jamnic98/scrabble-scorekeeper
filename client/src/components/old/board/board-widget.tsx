import { useEffect, useState } from 'react'

import { Board, type Player, SideBar } from 'components'
import { getLetterValue, INITIAL_BOARD_STATE, STARTING_LETTER_COUNTS } from 'utils'
import type {
  BoardState,
  Coords,
  Letter,
  LetterCounts,
  Row,
  Square,
  WordDirection,
  Word,
  TileLetter
} from 'types/global'

import engishWords from 'an-array-of-english-words'

// TODO: move
const calculateWordPoints = (
  // TODO: review type
  wordObj: Square[]
): number => {
  let points = 0
  let twCount = 0
  let dwCount = 0

  for (const obj of wordObj) {
    const letterValue = obj.isBlank ? 0 : getLetterValue(obj.letter)
    switch (obj.scoreMultiplier) {
      case 'dl':
        points += letterValue * 2
        break
      case 'tl':
        points += letterValue * 3
        break
      case 'dw':
        dwCount += 1
        points += letterValue
        break
      case 'tw':
        twCount += 1
        points += letterValue
        break
      default:
        points += letterValue
    }
  }
  if (twCount !== 0) {
    points *= twCount * 3
  }
  if (dwCount !== 0) {
    points *= dwCount * 2
  }
  return points
}

export interface BoardWidgetProps {
  turnCount: number
  players: Player[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  getCurrentPlayer: () => Player
  setTurnCount: React.Dispatch<React.SetStateAction<number>>
  setTurnScore: React.Dispatch<React.SetStateAction<number>>
}

const BoardWidget: React.FC<BoardWidgetProps> = ({
  players,
  setPlayers,
  getCurrentPlayer,
  turnCount,
  setTurnCount,
  setTurnScore
}) => {
  const [letters, setLetters] = useState<Word>([])
  const [remainingLetters, setRemainingLetters] = useState<LetterCounts>({
    ...STARTING_LETTER_COUNTS
  })
  const [skipCount, setSkipCount] = useState<number>(0)
  // TODO: remove any
  const [previousMainWords, setPreviousMainWords] = useState<Word[]>([])
  const [mainWord, setMainWord] = useState<any[]>([])
  const [words, setWords] = useState<any[]>([])
  const [activeSquareCoords, setActiveSquareCoords] = useState<Coords>({ x: -1, y: -1 })
  const [wordDirection, setWordDirection] = useState<WordDirection>('')
  const [boardState, setBoardState] = useState<BoardState>([])
  const [previousBoardStates, setPreviousBoardStates] = useState<BoardState[]>([])
  const [lastBoardState, setLastBoardState] = useState<BoardState[]>(INITIAL_BOARD_STATE)

  // set the focus of the square in board state when the active square changes
  useEffect(() => {
    // TODO: FIX!
    if (activeSquareCoords.x !== -1 || activeSquareCoords.y !== -1) {
      const { x, y } = activeSquareCoords
      const updatedBoardArray = boardState.map((row: Row, rowIndex: number) => {
        return row.map((square: Square, squareIndex: number) => {
          return rowIndex === y && squareIndex === x
            ? { ...square, isFocused: true }
            : { ...square, isFocused: false }
        })
      })
      setBoardState([...updatedBoardArray])
    }
  }, [activeSquareCoords])

  useEffect(() => {
    if (letters.length === 0) {
      setMainWord([])
      setWords([])
    }
  }, [letters])

  const increaseSkipCount = (): void => {
    setSkipCount(skipCount + 1)
    setTurnCount(turnCount + 1)
    setLastBoardState([...lastBoardState, lastBoardState[lastBoardState.length - 1]])
  }

  const calculateMovePoints = () => {
    let totalPoints = 0
    if (mainWord.length > 1) {
      totalPoints += calculateWordPoints(mainWord)
    }
    for (const wordObj of words) {
      totalPoints += calculateWordPoints(wordObj)
    }
    if (letters.length === 7) {
      totalPoints += 50
    }
    setTurnScore(totalPoints)
  }

  const makeLetterMove = (letter: string, isBlank = false): void => {
    const { x, y } = activeSquareCoords
    const letterObject = {
      letter: letter,
      scoreMultiplier: boardState[y][x].scoreMultiplier,
      isBlank: isBlank,
      isFocused: false
    }
    updateBoard(letterObject)
    getWordsFormed(letterObject)
    setPreviousBoardStates([...previousBoardStates, boardState])
    setLetters([...letters, letterObject])
    shiftFocus()
  }

  const getWordsFormed = (letterObject: Square): void => {
    const horizontalSquares = appendHorizontalSquares(letterObject)
    const verticalSquares = appendVerticalSquares(letterObject)
    let newMainWord
    switch (wordDirection) {
      case 'right':
        if (horizontalSquares.length !== 0) {
          newMainWord = [...mainWord, ...horizontalSquares]
          setMainWord(newMainWord)
          setPreviousMainWords([...previousMainWords, newMainWord])
        } else {
          newMainWord = [...mainWord, letterObject]
          setMainWord(newMainWord)
          setPreviousMainWords([...previousMainWords, newMainWord])
        }
        if (verticalSquares.length !== 0) {
          setWords([...words, verticalSquares])
        }
        break
      case 'down':
        if (verticalSquares.length !== 0) {
          newMainWord = [...mainWord, ...verticalSquares]
          setMainWord(newMainWord)
          setPreviousMainWords([...previousMainWords, newMainWord])
        } else {
          newMainWord = [...mainWord, letterObject]
          setMainWord(newMainWord)
          setPreviousMainWords([...previousMainWords, newMainWord])
        }
        if (horizontalSquares.length !== 0) {
          setWords([...words, horizontalSquares])
        }
        break
      case '':
        const wordsArray: Word[] = []
        if (horizontalSquares.length !== 0) {
          wordsArray.push(horizontalSquares)
        }
        if (verticalSquares.length !== 0) {
          wordsArray.push(verticalSquares)
        }
        setLetters([letterObject])
        setWords([...wordsArray])
        break
      default:
    }
  }

  const appendHorizontalSquares = (letterObject: Letter): Letter[] => {
    const lettersToRight = getSquaresToRight(activeSquareCoords.x, activeSquareCoords.y)
    const squaresToRight = lettersToRight.map((letter: Letter) => {
      return {
        letter: letter.letter,
        scoreMultiplier: '',
        isBlank: letter.isBlank
      } as Square
    })

    const lettersToLeft = getSquaresToLeft(activeSquareCoords.x, activeSquareCoords.y).reverse()
    const squaresToLeft = lettersToLeft.map((letter: Letter) => {
      return {
        letter: letter.letter,
        scoreMultiplier: '',
        isBlank: letter.isBlank
      } as Square
    })

    if (squaresToLeft.length !== 0 || squaresToRight.length !== 0) {
      return [...squaresToLeft, letterObject, ...squaresToRight]
    }
    return []
  }

  const appendVerticalSquares = (letterObject: Square): Square[] => {
    const lettersBelow = getSquaresBelow(activeSquareCoords.x, activeSquareCoords.y)
    const squaresBelow = lettersBelow.map((letter: Square) => {
      return {
        letter: letter.letter,
        scoreMultiplier: '',
        isBlank: letter.isBlank
      } as Square
    })

    const lettersAbove = getSquaresAbove(activeSquareCoords.x, activeSquareCoords.y).reverse()
    const squaresAbove = lettersAbove.map((letter: Square) => {
      return {
        letter: letter.letter,
        scoreMultiplier: '',
        isBlank: letter.isBlank
      } as Square
    })

    if (squaresAbove.length !== 0 || squaresBelow.length !== 0) {
      return [...squaresAbove, letterObject, ...squaresBelow]
    }
    return []
  }

  const getSquaresToRight = (x: number, y: number): Square[] => {
    const nextX = x + 1
    if (x < 14) {
      const square = boardState[y][nextX]
      const { ...letterObj } = square
      if (letterObj.letter !== '') {
        return [letterObj, ...getSquaresToRight(nextX, y)]
      }
    }
    return []
  }

  const getSquaresToLeft = (x: number, y: number): Square[] => {
    if (wordDirection !== 'right' || mainWord.length === 0) {
      const nextX = x - 1
      if (x > 0) {
        const square = boardState[y][nextX]
        const { ...letterObj } = square
        if (letterObj.letter !== '') {
          return [letterObj, ...getSquaresToLeft(nextX, y)]
        }
      }
    }
    return []
  }

  const getSquaresBelow = (x: number, y: number): Square[] => {
    const nextY = y + 1
    if (y < 14) {
      const square = boardState[nextY][x]
      const { ...letterObj } = square
      if (letterObj.letter !== '') {
        return [letterObj, ...getSquaresBelow(x, nextY)]
      }
    }
    return []
  }

  const getSquaresAbove = (x: number, y: number): Square[] => {
    if (wordDirection !== 'down' || mainWord.length === 0) {
      const nextY = y - 1
      if (y > 0) {
        const square = boardState[nextY][x]
        const { ...letterObj } = square
        if (letterObj.letter !== '') {
          return [letterObj, ...getSquaresAbove(x, nextY)]
        }
      }
    }
    return []
  }

  const isSquareEmpty = (x: number, y: number): boolean => {
    if (x === -1 || y === -1) {
      return false
    }
    return boardState[y][x].letter === ''
  }

  const handleRightArrow = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (letters.length < 1) {
      setWordDirection('right')
    }
  }

  const handleDownArrow = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (letters.length < 1) {
      setWordDirection('down')
    }
  }

  const shiftFocus = () => {
    if (wordDirection !== '') {
      const newCoords = getNextAvailableSquare(activeSquareCoords.x, activeSquareCoords.y)
      setActiveSquareCoords(newCoords)
    }
  }

  const getNextAvailableSquare = (x: number, y: number): Coords => {
    if (wordDirection === 'right') {
      if (x < 14) {
        const nextX = x + 1
        if (isSquareEmpty(nextX, y)) {
          return { x: nextX, y }
        } else {
          return getNextAvailableSquare(nextX, y)
        }
      }
    }
    if (wordDirection === 'down') {
      if (y < 14) {
        const nextY = y + 1
        if (isSquareEmpty(x, nextY)) {
          return { x, y: nextY }
        } else {
          return getNextAvailableSquare(x, nextY)
        }
      }
    }

    return activeSquareCoords
  }

  const clearFocus = () => {
    setActiveSquareCoords({ x: -1, y: -1 })
    const updatedBoardArray = boardState.map((row: Row) =>
      row.map((square: Square) => {
        return { ...square, isFocused: false }
      })
    )
    setBoardState(updatedBoardArray)
  }

  const updateRemainingLetters = (letterToRemove: string) => {
    const { x, y } = activeSquareCoords
    const currentLetter = boardState[y][x].letter.toLowerCase() as TileLetter | ''
    const lowerCaseLetterToRemove = letterToRemove.toLowerCase() as TileLetter

    setRemainingLetters((prev) => {
      const updated = { ...prev }

      if (currentLetter === '') {
        updated[lowerCaseLetterToRemove] = (updated[lowerCaseLetterToRemove] ?? 0) - 1
      } else if (currentLetter !== lowerCaseLetterToRemove) {
        if (currentLetter in updated) {
          updated[currentLetter as TileLetter] = (updated[currentLetter as TileLetter] ?? 0) + 1
        }
        updated[lowerCaseLetterToRemove] = (updated[lowerCaseLetterToRemove] ?? 0) - 1
      }

      return updated
    })
  }

  // retuns an array of the board with a letter placed at coords x, y
  const updateBoard = (letterObject: Square) => {
    const { x, y } = activeSquareCoords
    const updatedBoardArray = boardState.map((row: Row, rowIndex: number) =>
      row.map((square: Square, squareIndex: number) => {
        if (rowIndex === y && squareIndex === x) {
          return letterObject
        } else {
          return square
        }
      })
    )
    setBoardState(updatedBoardArray)
  }

  const isLetterAvailable = (letter: string): boolean => {
    const key = letter.toLowerCase() as TileLetter
    const letterCount = remainingLetters[key] ?? 0

    if (letterCount > 0) {
      return true
    } else {
      alert(`'${letter === ' ' ? 'BLANK' : letter.toUpperCase()}' tile is not available.`)
      return false
    }
  }

  const getFocusedSquareCoords = (board: BoardState): Coords => {
    let coords: Coords = { x: -1, y: -1 }
    board.map((row: Row, y: number) => {
      row.map((square: Square, x: number) => {
        if (square.isFocused) {
          coords = { x, y }
        }
      })
    })
    return coords
  }

  const generalReset = () => {
    setMainWord([])
    setWords([])
    clearFocus()
    setWordDirection('')
    setLetters([])
    setPreviousMainWords([])
  }

  const invalidWordsAlert = (invalidWords: string[]): boolean => {
    const message = invalidWords
      .slice(0, invalidWords.length - 1)
      .map((word: string, index: number) => {
        if (index <= invalidWords.length - 1) {
          return ` '${word}'`
        }
      })
    return !confirm(
      `${message} ${invalidWords.length > 1 ? 'and' : ''} '${
        invalidWords[invalidWords.length - 1]
      }' ${invalidWords.length === 1 ? 'is' : 'are'} not in the english dictionary!`
    )
  }

  const getInvalidWords = () => {
    let invalidWords: string[] = []
    let allWords: Word[]
    if (letters.length === 1 && wordDirection !== '') {
      allWords = [...words]
    } else if (letters.length === 1 && wordDirection === '') {
      allWords = [...words]
    } else {
      allWords = [mainWord, ...words]
    }

    for (const wordObj of allWords) {
      const wordArray = wordObj.map((obj: Letter) => obj.letter)
      const word = wordArray.join('')
      const regex = new RegExp(`^${word}$`)
      const matches = engishWords.filter((d) => regex.test(d))

      if (matches.length === 0) {
        invalidWords.push(word)
      }
    }
    return invalidWords
  }

  const isMoveValid = (): boolean => {
    if (turnCount - skipCount === 0) {
      if (boardState[7][7].letter === '') {
        alert('Word must pass through the center square.')
        return false
      }
      if (letters.length < 2) {
        alert('Not enough letters.')
        return false
      }
    } else {
      // check that the word is connected to other words
      if (mainWord.length === letters.length && words.length === 0) {
        alert('Word must connect to existing tiles.')
        return false
      }
      if (wordDirection === '' && words.length === 0) {
        alert('Tiles must connect to existing tiles.')
        return false
      }
    }
    if (!areWordsValid()) {
      return false
    }
    return true
  }

  const areWordsValid = (): boolean => {
    const invalidWords = getInvalidWords()
    if (invalidWords.length === 0) {
      return true
    } else {
      return invalidWordsAlert(invalidWords)
    }
  }

  const handleSpaceKey = () => {
    if (isLetterAvailable(' ')) {
      let standInLetter: string | null = ''
      // Ask for input letter until valid input made
      while (true) {
        const regex = /[a-z]/
        standInLetter = prompt('Input a letter for the blank tile:')
        if (standInLetter !== null) {
          if (regex.test(standInLetter) && standInLetter.length === 1) {
            makeLetterMove(standInLetter, true)
            updateRemainingLetters(' ')
            break
          } else {
            alert(`"${standInLetter}" is not a valid letter.`)
            return
          }
        } else {
          break
        }
      }
    }
  }

  const handleBackSpaceKey = (): void => {
    if (letters.length > 0) {
      const previousLetter = letters[letters.length - 1]
      setLetters(letters.slice(0, letters.length - 1))

      setBoardState(previousBoardStates[previousBoardStates.length - 1])
      setPreviousBoardStates(previousBoardStates.slice(0, previousBoardStates.length - 1))

      // Update the possible playable letters (in handleBackSpaceKey)
      setRemainingLetters((prev) => {
        const key = (
          previousLetter.isBlank ? ' ' : previousLetter.letter.toLowerCase()
        ) as TileLetter

        return {
          ...prev,
          [key]: (prev[key] ?? 0) + 1
        }
      })

      const focusedSquareCoords = getFocusedSquareCoords(
        previousBoardStates[previousBoardStates.length - 1]
      )

      switch (wordDirection) {
        case 'down':
          if (
            getSquaresToLeft(focusedSquareCoords.x, focusedSquareCoords.y).length !== 0 ||
            getSquaresToRight(focusedSquareCoords.x, focusedSquareCoords.y).length !== 0
          ) {
            setWords([...words.slice(0, words.length - 1)])
          }
          setActiveSquareCoords(focusedSquareCoords)
          break
        case 'right':
          if (
            getSquaresAbove(focusedSquareCoords.x, focusedSquareCoords.y).length !== 0 ||
            getSquaresBelow(focusedSquareCoords.x, focusedSquareCoords.y).length !== 0
          ) {
            setWords([...words.slice(0, words.length - 1)])
          }
          setActiveSquareCoords(focusedSquareCoords)
          break
        case '':
          setWords([])
          break
        default:
          break
      }

      if (previousMainWords.length > 1) {
        setMainWord(previousMainWords[previousMainWords.length - 2])
        setPreviousMainWords([...previousMainWords.slice(0, previousMainWords.length - 1)])
      } else {
        setMainWord(mainWord.slice(0, mainWord.length - 1))
      }
    } else {
      generalReset()
    }
  }

  const handleEnterKey = (): void => {
    if (letters.length > 0) {
      if (isMoveValid()) {
        setTurnCount(turnCount + 1)
        const clearedBoard = boardState.map((row: Row) => {
          return row.map((square: Square) => {
            square.isFocused = false
            return square
          })
        })
        setLastBoardState([...lastBoardState, clearedBoard])
        calculateMovePoints()
        generalReset()
      }
    }
  }

  const handleKeyPressed = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    const { key } = e

    if (isSquareEmpty(activeSquareCoords.x, activeSquareCoords.y) && letters.length < 7) {
      // Check for a-z or A-Z (matches single characters)
      if (/^[a-zA-Z]$/.test(key)) {
        const letter = key.toLowerCase()
        if (isLetterAvailable(letter)) {
          makeLetterMove(letter)
          updateRemainingLetters(letter)
        }
      }

      // Space bar
      if (key === ' ') {
        handleSpaceKey()
      }
    }

    // Navigation and Action keys
    switch (key) {
      case 'ArrowRight':
        handleRightArrow(e)
        break
      case 'ArrowDown':
        handleDownArrow(e)
        break
      case 'Enter':
        handleEnterKey()
        break
      case 'Backspace':
        handleBackSpaceKey()
        break
      case 'Escape':
        if (letters.length === 0) {
          generalReset()
        }
        break
    }
  }

  if (players.length === 0) return null
  return (
    <div
      id="board-widget"
      className="float-left min-w-200"
      onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPressed(e)}
    >
      <Board
        boardState={boardState}
        setBoardState={setBoardState}
        wordDirection={wordDirection}
        setWordDirection={setWordDirection}
        activeSquareCoords={activeSquareCoords}
        setActiveSquareCoords={setActiveSquareCoords}
        letters={letters}
      />
      <SideBar
        turnCount={turnCount}
        setTurnCount={setTurnCount}
        activeSquareCoords={activeSquareCoords}
        setActiveSquareCoords={setActiveSquareCoords}
        wordDirection={wordDirection}
        handleRightArrow={handleRightArrow}
        handleDownArrow={handleDownArrow}
        letters={letters}
        setLetters={setLetters}
        generalReset={generalReset}
        increaseSkipCount={increaseSkipCount}
        lastBoardState={lastBoardState}
        setLastBoardState={setLastBoardState}
        setBoardState={setBoardState}
        players={players}
        setPlayers={setPlayers}
        getCurrentPlayer={getCurrentPlayer}
        skipCount={skipCount}
        setSkipCount={setSkipCount}
        remainingLetters={remainingLetters}
        setRemainingLetters={setRemainingLetters}
      />
    </div>
  )
}

export default BoardWidget
