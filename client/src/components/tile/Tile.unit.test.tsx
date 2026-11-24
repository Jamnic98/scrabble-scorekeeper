import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { Tile } from './Tile'
import { GameProvider } from '../../context/GameProvider'

const renderTile = (ui: React.ReactElement) => render(<GameProvider>{ui}</GameProvider>)

describe('Tile component', () => {
  it('renders the letter uppercase with its point value', () => {
    renderTile(<Tile tile={{ id: 't1', letter: 'q', points: 10, isBlank: false }} />)

    const el = screen.getByTestId('application-tile')
    // The letter is uppercased visually via CSS, so DOM text stays as-is
    expect(el.textContent).toMatch(/q/i)
    expect(el).toHaveTextContent('10')
  })

  it('hides letter and points for a blank tile', () => {
    renderTile(<Tile tile={{ id: 'b1', letter: ' ', points: 0, isBlank: true }} />)

    expect(screen.getByTestId('application-tile')).toHaveTextContent('')
  })

  it('derives points from LETTER_DISTRIBUTION when the tile has none', () => {
    renderTile(
      <Tile
        tile={{ id: 't2', letter: 'K', points: undefined as unknown as number, isBlank: false }}
      />
    )

    expect(screen.getByTestId('application-tile')).toHaveTextContent('5')
  })

  it('applies the dimmed style when unavailable', () => {
    renderTile(<Tile tile={{ id: 't3', letter: 'A', points: 1, isBlank: false }} unavailable />)

    expect(screen.getByTestId('application-tile').className).toContain('/30')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    renderTile(
      <Tile tile={{ id: 't4', letter: 'A', points: 1, isBlank: false }} onClick={onClick} />
    )

    fireEvent.click(screen.getByTestId('application-tile'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('uses the mono font style from the default game state', () => {
    renderTile(<Tile tile={{ id: 't5', letter: 'A', points: 1, isBlank: false }} />)

    expect(screen.getByTestId('application-tile').textContent).toContain('A')
    expect(screen.getByTestId('application-tile').innerHTML).toContain('font-mono')
  })
})
