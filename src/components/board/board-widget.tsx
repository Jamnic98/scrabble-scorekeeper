import React, { useEffect, useState } from 'react'
import { Board } from './board'
import { SideBar } from '../side-bar/side-bar'
import { getLetterValue } from '../../utils/helpers'
import { Player } from '../../App'
import './board-widget.css'

import dict from 'an-array-of-english-words'

export interface BoardWidgetProps {
  players: any
  setPlayers: any
  getCurrentPlayer: () => any
  turnCount: number
  setTurnCount: (currentTurnCount: number) => void
  setTurnScore: (currentPoints: number) => void
}

export const BoardWidget: React.FC<BoardWidgetProps> = ({
  players,
  setPlayers,
  getCurrentPlayer,
  turnCount,
  setTurnCount,
  setTurnScore
}) => {
  const [letters, setLetters] = useState<any>([])
  const [skipCount, setSkipCount] = useState<number>(0)
  const [mainWord, setMainWord] = useState<any>([])
  const [previousMainWords, setPreviousMainWords] = useState<any>([])
  const [words, setWords] = useState<any>([])
  const [activeSquareCoords, setActiveSquareCoords] = useState<any>([])
  const [wordDirection, setWordDirection] = useState<any>('')
  const [boardState, setBoardState] = useState<any>([])
  const [previousBoardStates, setPreviousBoardStates] = useState<any>([])
  const [lastBoardState, setLastBoardState] = useState<any>([
    [
      // ROW 1
      [
        { letter: '', scoreMultiplier: 'tw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tw', isBlank: false, isFocused: false }
      ],
      // ROW 2
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 3
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 4
      [
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false }
      ],
      // ROW 5
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 6
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 7
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 8
      [
        { letter: '', scoreMultiplier: 'tw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tw', isBlank: false, isFocused: false }
      ],
      // ROW 9
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 10
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 11
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 12
      [
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false }
      ],
      // ROW 13
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 14
      [
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false }
      ],
      // ROW 15
      [
        { letter: '', scoreMultiplier: 'tw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tw', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'dl', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: '', isBlank: false, isFocused: false },
        { letter: '', scoreMultiplier: 'tw', isBlank: false, isFocused: false }
      ]
    ]
  ])

  const [remainingLetters, setRemainingLetters] = useState<any>({
    a: 9,
    b: 2,
    c: 2,
    d: 4,
    e: 12,
    f: 2,
    g: 3,
    h: 2,
    i: 9,
    j: 1,
    k: 1,
    l: 4,
    m: 2,
    n: 6,
    o: 8,
    p: 2,
    q: 1,
    r: 6,
    s: 4,
    t: 6,
    u: 4,
    v: 2,
    w: 2,
    x: 1,
    y: 2,
    z: 1,
    ' ': 2
  })

  // set the focus of the square in board state when the active square changes
  useEffect(() => {
    if (activeSquareCoords.length !== 0) {
      const [x, y] = activeSquareCoords
      const updatedBoardArray = boardState.map((row, rowIndex) => {
        return row.map((square, squareIndex) => {
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

  const increaseNumberOfSkips = () => {
    setSkipCount(skipCount + 1)
    setTurnCount(turnCount + 1)
    setLastBoardState([
      ...lastBoardState,
      lastBoardState[lastBoardState.length - 1]
    ])
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

  const calculateWordPoints = (wordObj) => {
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

  const makeLetterMove = (letter, isBlank = false) => {
    const [x, y] = activeSquareCoords
    const letterObject = {
      letter: letter,
      scoreMultiplier: boardState[y][x].scoreMultiplier,
      isBlank: isBlank
    }
    updateBoard(letterObject)
    getWordsFormed(letterObject)
    setPreviousBoardStates([...previousBoardStates, boardState])
    setLetters([...letters, letterObject])
    shiftFocus()
  }

  const getWordsFormed = (letterObject) => {
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
        const wordsArray: any[] = []
        if (horizontalSquares.length !== 0) {
          wordsArray.push(horizontalSquares)
        }
        if (verticalSquares.length !== 0) {
          wordsArray.push(verticalSquares)
        }
        setLetters([letterObject])
        setWords([...wordsArray])
        break
    }
  }

  const appendHorizontalSquares = (letterObject) => {
    const lettersToRight = getSquaresToRight(
      activeSquareCoords[0],
      activeSquareCoords[1]
    )
    const squaresToRight = lettersToRight.map((letter) => {
      return {
        letter: letter.letter,
        scoreMultiplier: '',
        isBlank: letter.isBlank
      }
    })

    const lettersToLeft = getSquaresToLeft(
      activeSquareCoords[0],
      activeSquareCoords[1]
    ).reverse()
    const squaresToLeft = lettersToLeft.map((letter) => {
      return {
        letter: letter.letter,
        scoreMultiplier: '',
        isBlank: letter.isBlank
      }
    })

    if (squaresToLeft.length !== 0 || squaresToRight.length !== 0) {
      return [...squaresToLeft, letterObject, ...squaresToRight]
    }
    return []
  }

  const appendVerticalSquares = (letterObject) => {
    const lettersBelow = getSquaresBelow(
      activeSquareCoords[0],
      activeSquareCoords[1]
    )
    const squaresBelow = lettersBelow.map((letter) => {
      return {
        letter: letter.letter,
        scoreMultiplier: '',
        isBlank: letter.isBlank
      }
    })

    const lettersAbove = getSquaresAbove(
      activeSquareCoords[0],
      activeSquareCoords[1]
    ).reverse()
    const squaresAbove = lettersAbove.map((letter) => {
      return {
        letter: letter.letter,
        scoreMultiplier: '',
        isBlank: letter.isBlank
      }
    })

    if (squaresAbove.length !== 0 || squaresBelow.length !== 0) {
      return [...squaresAbove, letterObject, ...squaresBelow]
    }
    return []
  }

  const getSquaresToRight = (x, y) => {
    const nextX = x + 1
    if (x < 14) {
      const square = boardState[y][nextX]
      const { isFocused, scoreMultiplier, ...letterObj } = square
      if (letterObj.letter !== '') {
        return [letterObj, ...getSquaresToRight(nextX, y)]
      }
    }
    return []
  }

  const getSquaresToLeft = (x, y) => {
    if (wordDirection !== 'right' || mainWord.length === 0) {
      const nextX = x - 1
      if (x > 0) {
        const square = boardState[y][nextX]
        const { isFocused, scoreMultiplier, ...letterObj } = square
        if (letterObj.letter !== '') {
          return [letterObj, ...getSquaresToLeft(nextX, y)]
        }
      }
    }
    return []
  }

  const getSquaresBelow = (x, y) => {
    const nextY = y + 1
    if (y < 14) {
      const square = boardState[nextY][x]
      const { isFocused, scoreMultiplier, ...letterObj } = square
      if (letterObj.letter !== '') {
        return [letterObj, ...getSquaresBelow(x, nextY)]
      }
    }
    return []
  }

  const getSquaresAbove = (x, y) => {
    if (wordDirection !== 'down' || mainWord.length === 0) {
      const nextY = y - 1
      if (y > 0) {
        const square = boardState[nextY][x]
        const { isFocused, scoreMultiplier, ...letterObj } = square
        if (letterObj.letter !== '') {
          return [letterObj, ...getSquaresAbove(x, nextY)]
        }
      }
    }
    return []
  }

  const isSquareEmpty = (x, y) => {
    return boardState[y][x].letter === ''
  }

  const handleRightArrow = (e) => {
    e.preventDefault()
    if (letters.length < 1) {
      setWordDirection('right')
    }
  }

  const handleDownArrow = (e) => {
    e.preventDefault()
    if (letters.length < 1) {
      setWordDirection('down')
    }
  }

  const shiftFocus = () => {
    if (wordDirection !== '') {
      const newCoords = getNextAvailableSquare(
        activeSquareCoords[0],
        activeSquareCoords[1]
      )
      setActiveSquareCoords(newCoords)
    }
  }

  const getNextAvailableSquare = (x: number, y: number) => {
    switch (wordDirection) {
      case 'right':
        if (x < 14) {
          const nextX = x + 1
          if (isSquareEmpty(nextX, y)) {
            return [nextX, y]
          } else {
            return getNextAvailableSquare(nextX, y)
          }
        }
        break
      case 'down':
        if (y < 14) {
          const nextY = y + 1
          if (isSquareEmpty(x, nextY)) {
            return [x, nextY]
          } else {
            return getNextAvailableSquare(x, nextY)
          }
        }
        break
      default:
        break
    }
    return activeSquareCoords
  }

  const clearFocus = () => {
    setActiveSquareCoords([])
    const updatedBoardArray = boardState.map((row) =>
      row.map((square) => {
        return { ...square, isFocused: false }
      })
    )
    setBoardState(updatedBoardArray)
  }

  const updateRemainingLetters = (letterToRemove) => {
    const [x, y] = activeSquareCoords
    const currentLetter = boardState[y][x].letter.toLowerCase()
    const lowerCaseLetterToRemove = letterToRemove.toLowerCase()
    const updatedRemainingLetters = { ...remainingLetters }

    if (currentLetter === '') {
      updatedRemainingLetters[lowerCaseLetterToRemove] -= 1
    } else if (currentLetter !== letterToRemove) {
      updatedRemainingLetters[currentLetter] += 1
      updatedRemainingLetters[lowerCaseLetterToRemove] -= 1
    }
    setRemainingLetters(updatedRemainingLetters)
  }

  // retuns an array of the board with a letter placed at coords x, y
  const updateBoard = (letterObject) => {
    const [x, y] = activeSquareCoords
    const updatedBoardArray = boardState.map((row, rowIndex) =>
      row.map((square, squareIndex) => {
        if (rowIndex === y && squareIndex === x) {
          return letterObject
        } else {
          return square
        }
      })
    )
    setBoardState(updatedBoardArray)
  }

  const isLetterAvailable = (letter) => {
    const letterCount = remainingLetters[letter.toLowerCase()]
    if (letterCount > 0) {
      return true
    } else {
      alert(
        `'${
          letter === ' ' ? 'BLANK' : letter.toUpperCase()
        }' tile is not available.`
      )
      return false
    }
  }

  const getFocusedSquareCoords = (board) => {
    let coords: any = []
    board.map((row, y) => {
      row.map((square, x) => {
        if (square.isFocused) {
          coords = [x, y]
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

  const invalidWordsAlert = (invalidWords) => {
    const message = invalidWords
      .slice(0, invalidWords.length - 1)
      .map((word, index) => {
        if (index <= invalidWords.length - 1) {
          return ` '${word}'`
        }
      })
    alert(
      `${message} ${invalidWords.length > 1 ? 'and' : ''} '${
        invalidWords[invalidWords.length - 1]
      }' ${
        invalidWords.length === 1 ? 'is' : 'are'
      } not in the english dictionary!`
    )
  }

  const getInvalidWords = () => {
    let invalidWords: string[] = []
    let allWords
    if (letters.length === 1 && wordDirection !== '') {
      allWords = [...words]
    } else if (letters.length === 1 && wordDirection === '') {
      allWords = [...words]
    } else {
      allWords = [mainWord, ...words]
    }

    for (const wordObj of allWords) {
      const wordArray = wordObj.map((obj) => obj.letter)
      const word = wordArray.join('')
      const regex = new RegExp(`^${word}$`)
      const matches = dict.filter((d) => regex.test(d))

      if (matches.length === 0) {
        invalidWords.push(word)
      }
    }
    return invalidWords
  }

  const isMoveValid = () => {
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

  const areWordsValid = () => {
    const invalidWords = getInvalidWords()
    if (invalidWords.length === 0) {
      return true
    } else {
      invalidWordsAlert(invalidWords)
      return false
    }
  }

  const handleSpaceKey = () => {
    if (isLetterAvailable(' ')) {
      let standInLetter: string | null = ''
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

  const handleBackSpaceKey = () => {
    if (letters.length > 0) {
      const previousLetter = letters[letters.length - 1]
      setLetters(letters.slice(0, letters.length - 1))

      setBoardState(previousBoardStates[previousBoardStates.length - 1])
      setPreviousBoardStates(
        previousBoardStates.slice(0, previousBoardStates.length - 1)
      )

      // update the possible playable letters
      if (previousLetter.isBlank) {
        remainingLetters[' '] = remainingLetters[' '] + 1
      } else {
        remainingLetters[`${previousLetter.letter}`] =
          remainingLetters[`${previousLetter.letter}`] + 1
      }

      const focusedSquareCoords = getFocusedSquareCoords(
        previousBoardStates[previousBoardStates.length - 1]
      )

      switch (wordDirection) {
        case 'down':
          if (
            getSquaresToLeft(focusedSquareCoords[0], focusedSquareCoords[1])
              .length !== 0 ||
            getSquaresToRight(focusedSquareCoords[0], focusedSquareCoords[1])
              .length !== 0
          ) {
            setWords([...words.slice(0, words.length - 1)])
          }
          setActiveSquareCoords(focusedSquareCoords)
          break
        case 'right':
          if (
            getSquaresAbove(focusedSquareCoords[0], focusedSquareCoords[1])
              .length !== 0 ||
            getSquaresBelow(focusedSquareCoords[0], focusedSquareCoords[1])
              .length !== 0
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
        setPreviousMainWords([
          ...previousMainWords.slice(0, previousMainWords.length - 1)
        ])
      } else {
        setMainWord(mainWord.slice(0, mainWord.length - 1))
      }
    } else {
      generalReset()
    }
  }

  const handleEnterKey = () => {
    if (letters.length > 0) {
      if (isMoveValid()) {
        setTurnCount(turnCount + 1)
        const clearedBoard = boardState.map((row) => {
          return row.map((square) => {
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

  const handleKeyPressed = (e) => {
    const keyCode = e.keyCode
    if (activeSquareCoords.length !== 0) {
      if (
        isSquareEmpty(activeSquareCoords[0], activeSquareCoords[1]) &&
        letters.length < 7
      ) {
        // key with a letter pressed
        if (keyCode >= 65 && keyCode <= 90) {
          const letter = String.fromCharCode(keyCode + 32)
          if (isLetterAvailable(letter)) {
            makeLetterMove(letter)
            updateRemainingLetters(letter)
          }
        }
        // space bar pressed
        if (keyCode === 32) {
          handleSpaceKey()
        }
      }
      // right arrow key pressed
      if (keyCode === 39) {
        handleRightArrow(e)
      }
      // down arrow key pressed
      if (keyCode === 40) {
        handleDownArrow(e)
      }
      // enter key pressed
      if (keyCode === 13) {
        handleEnterKey()
      }
      // backspace key pressed
      if (keyCode === 8) {
        handleBackSpaceKey()
      }
      // escape key pressed
      if (keyCode === 27) {
        if (letters.length === 0) {
          generalReset()
        }
      }
    }
  }

  return players.length !== 0 ? (
    <div id='board-widget' onKeyUp={(e) => handleKeyPressed(e)}>
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
        increaseNumberOfSkips={increaseNumberOfSkips}
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
  ) : null
}
