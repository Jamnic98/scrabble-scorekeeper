import React from 'react'

import { Tile } from '.'
import type { MoveHistoryItem, BoardState, ScoreMultiplier } from '@scrabble/engine'

interface MoveModalProps {
  isOpen: boolean
  onClose: () => void
  moveData: { move: MoveHistoryItem; turnIndex: number; playerName: string } | null
  boardState: BoardState
}

const getMultiplierBadge = (multiplier: ScoreMultiplier) => {
  switch (multiplier) {
    case 'tw':
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 rounded">
          3×W
        </span>
      )
    case 'tl':
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-300 rounded">
          3×L
        </span>
      )
    case 'dw':
    case 'star':
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-300 rounded">
          2×W
        </span>
      )
    case 'dl':
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-100 text-cyan-700 border border-cyan-300 rounded">
          2×L
        </span>
      )
    default:
      return <span className="text-[10px] text-transparent select-none">&nbsp;</span> // Invisible placeholder to preserve height
  }
}

const MoveModal: React.FC<MoveModalProps> = ({ isOpen, onClose, moveData, boardState }) => {
  if (!isOpen || !moveData) return null
  const { move, turnIndex, playerName } = moveData
  const boardToUse: BoardState = move.boardState ?? boardState

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{playerName}</h3>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Turn {turnIndex + 1} Score Breakdown
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors text-lg font-bold"
          >
            &times;
          </button>
        </div>

        {/* Tiles Placed Visual Section */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
            Tiles Played & Multipliers Hit
          </h4>
          <div className="flex flex-wrap gap-3 bg-neutral-50 p-3.5 rounded-lg border border-gray-200 items-start">
            {move.placements.map((p, idx) => {
              const square = boardToUse[p.row]?.[p.col]
              const multiplier = square?.scoreMultiplier ?? null

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <Tile tile={p.tile} />
                  <div className="flex flex-col items-center justify-between h-[34px]">
                    <span className="text-[10px] font-semibold text-gray-600 leading-none">
                      {p.row + 1},{p.col + 1}
                    </span>
                    <div className="flex items-center justify-center h-[18px]">
                      {getMultiplierBadge(multiplier)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Formed Words Breakdown */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Words Formed
          </h4>
          <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
            {move.words.map((w, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-neutral-50 px-3.5 py-2.5 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase tracking-wide text-gray-900 text-base">
                    {w.word}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      w.isMainWord ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {w.isMainWord ? 'Main Word' : 'Cross Word'}
                  </span>
                </div>
                <span className="font-bold text-emerald-600 text-base">+{w.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Summary Footer */}
        <div className="border-t pt-3.5 flex flex-col gap-2 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-xl border-gray-200">
          {move.placements.length === 7 && (
            <div className="flex justify-between items-center text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 text-sm font-semibold">
              <span>⭐ Bingo Bonus (7 Letters)</span>
              <span>+50 pts</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-bold text-base">Total Turn Score</span>
            <span className="text-emerald-700 text-2xl font-black">
              {move.totalScore} <span className="text-xs font-normal text-gray-500">pts</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoveModal
