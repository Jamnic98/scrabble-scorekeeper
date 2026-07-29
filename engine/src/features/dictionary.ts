export class WordDictionary {
  private words: Set<string> = new Set()
  private isLoaded: boolean = false

  /**
   * Initializes the dictionary from a raw array or word list string.
   */
  public loadWords(wordList: string[]): void {
    this.words = new Set(wordList.map((w) => w.trim().toUpperCase()))
    this.isLoaded = true
  }

  /**
   * Checks if a single word exists in the dictionary.
   */
  public isValidWord(word: string): boolean {
    if (!word || word.length < 2) return false
    return this.words.has(word.toUpperCase())
  }

  /**
   * Validates an array of words. Returns invalid words if any fail.
   */
  public validateWords(words: string[]): { isValid: boolean; invalidWords: string[] } {
    const invalidWords = words.filter((w) => !this.isValidWord(w))
    return {
      isValid: invalidWords.length === 0,
      invalidWords
    }
  }

  public get size(): number {
    return this.words.size
  }

  public get ready(): boolean {
    return this.isLoaded
  }
}

// Export a singleton instance for app-wide use
export const dictionary = new WordDictionary()
