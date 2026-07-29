import type { ScoreMultiplier } from '../types'

export const BOARD_SIZE = 15

export const BOARD_MULTIPLIER_GRID: ScoreMultiplier[][] = [
  ['tw', null, null, 'dl', null, null, null, 'tw', null, null, null, 'dl', null, null, 'tw'],
  [null, 'dw', null, null, null, 'tl', null, null, null, 'tl', null, null, null, 'dw', null],
  [null, null, 'dw', null, null, null, 'dl', null, 'dl', null, null, null, 'dw', null, null],
  ['dl', null, null, 'dw', null, null, null, 'dl', null, null, null, 'dw', null, null, 'dl'],
  [null, null, null, null, 'dw', null, null, null, null, null, 'dw', null, null, null, null],
  [null, 'tl', null, null, null, 'tl', null, null, null, 'tl', null, null, null, 'tl', null],
  [null, null, 'dl', null, null, null, 'dl', null, 'dl', null, null, null, 'dl', null, null],
  ['tw', null, null, 'dl', null, null, null, 'star', null, null, null, 'dl', null, null, 'tw'],
  [null, null, 'dl', null, null, null, 'dl', null, 'dl', null, null, null, 'dl', null, null],
  [null, 'tl', null, null, null, 'tl', null, null, null, 'tl', null, null, null, 'tl', null],
  [null, null, null, null, 'dw', null, null, null, null, null, 'dw', null, null, null, null],
  ['dl', null, null, 'dw', null, null, null, 'dl', null, null, null, 'dw', null, null, 'dl'],
  [null, null, 'dw', null, null, null, 'dl', null, 'dl', null, null, null, 'dw', null, null],
  [null, 'dw', null, null, null, 'tl', null, null, null, 'tl', null, null, null, 'dw', null],
  ['tw', null, null, 'dl', null, null, null, 'tw', null, null, null, 'dl', null, null, 'tw']
]
