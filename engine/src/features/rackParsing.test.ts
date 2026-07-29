import { describe, it, expect } from 'vitest'
import { parseRackString, calculateFinalGameScores } from './scrabbleLogic'

describe('End Game Manual Tile String Parsing', () => {
  it('should parse "adksz " using LETTER_DISTRIBUTION values', () => {
    const input = 'adksz '
    const tiles = parseRackString(input)

    expect(tiles).toHaveLength(6)

    // a = 1 pt
    expect(tiles[0].letter).toBe('A')
    expect(tiles[0].points).toBe(1)
    expect(tiles[0].isBlank).toBe(false)

    // d = 2 pts
    expect(tiles[1].letter).toBe('D')
    expect(tiles[1].points).toBe(2)

    // k = 5 pts
    expect(tiles[2].letter).toBe('K')
    expect(tiles[2].points).toBe(5)

    // s = 1 pt
    expect(tiles[3].letter).toBe('S')
    expect(tiles[3].points).toBe(1)

    // z = 10 pts
    expect(tiles[4].letter).toBe('Z')
    expect(tiles[4].points).toBe(10)

    // ' ' = 0 pts (Blank)
    expect(tiles[5].letter).toBe(' ')
    expect(tiles[5].points).toBe(0)
    expect(tiles[5].isBlank).toBe(true)
  })

  it('should handle uppercase, lowercase, and ignore invalid characters', () => {
    const tiles = parseRackString('A-B C!')

    expect(tiles).toHaveLength(4) // 'a', 'b', ' ', 'c'
    expect(tiles.map((t) => t.letter)).toEqual(['A', 'B', ' ', 'C'])
  })

  it('should calculate correct score deductions when combined with calculateFinalGameScores', () => {
    // Player 1 remaining rack: 'adksz ' -> a(1)+d(2)+k(5)+s(1)+z(10)+' '(0) = 19 pts
    const p1Rack = parseRackString('adksz ')
    const p2Rack = parseRackString('') // Player 2 went out

    const players = [
      { id: 'p1', score: 200, rack: p1Rack },
      { id: 'p2', score: 180, rack: p2Rack }
    ]

    const result = calculateFinalGameScores(players, 'p2')

    expect(result.deductions['p1']).toBe(19)
    expect(result.playerScores['p1']).toBe(181) // 200 - 19
    expect(result.playerScores['p2']).toBe(199) // 180 + 19 bonus
  })
})
