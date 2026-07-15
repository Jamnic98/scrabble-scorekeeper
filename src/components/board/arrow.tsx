import { ChevronDown, ChevronRight } from 'lucide-react'

import { type WordDirection } from 'types/global'

interface ArrowProps {
  square: { letter: string; isFocused: false }
  wordDirection: WordDirection
}

const Arrow: React.FC<ArrowProps> = ({ square, wordDirection }) => {
  if (square.letter === '' && square.isFocused) {
    if (wordDirection === 'right') {
      return (
        <span className="flex justify-center">
          <ChevronRight size={20} />
        </span>
      )
    } else if (wordDirection === 'down') {
      return (
        <span className="flex justify-center ">
          <ChevronDown size={20} />
        </span>
      )
    }
  }
}

export default Arrow
