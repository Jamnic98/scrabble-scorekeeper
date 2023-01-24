import React from 'react'
import { render, screen } from '@testing-library/react'
import { Tile, TileProps } from './tile'

const defaultLetter = 'j'
const defaultIsBlank = false

const drawTile = (props?: TileProps) => {
  const finalProps = {
    letter: defaultLetter,
    isBlank: defaultIsBlank,
    ...props
  }
  render(<Tile {...finalProps} />)
}

describe('Tile should render correctly', () => {
  test('should render with empty props', () => {
    render(<Tile {...({} as TileProps)} />)
  })

  test('should render default data', () => {
    drawTile()
    expect(screen.getByText(defaultLetter)).toBeInTheDocument()
  })

  test('should render correct data when passed as props', () => {
    drawTile()
  })
})
