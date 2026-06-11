/**
 * Parses a page range string (e.g., "1-3,5") into a Set of individual page numbers.
 */
export function parsePageRangeToSet(rangeStr: string, totalPages: number): Set<number> {
  const pages = new Set<number>()
  if (!rangeStr || rangeStr.toLowerCase() === 'all') {
    for (let i = 1; i <= totalPages; i++) {
      pages.add(i)
    }
    return pages
  }

  const parts = rangeStr.split(',')
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) pages.add(i)
        }
      }
    } else {
      const p = Number(part)
      if (!isNaN(p) && p >= 1 && p <= totalPages) pages.add(p)
    }
  }

  // Fallback if parsing failed
  if (pages.size === 0) {
    for (let i = 1; i <= totalPages; i++) {
      pages.add(i)
    }
  }

  return pages
}

/**
 * Formats a Set of page numbers back into a compacted string (e.g., "1-3,5").
 */
export function formatSetToPageRange(pages: Set<number>, totalPages: number): string {
  if (pages.size === 0) return ''
  if (pages.size === totalPages) return 'All'

  const sorted = Array.from(pages).sort((a, b) => a - b)
  const ranges: string[] = []
  
  let start = sorted[0]
  let prev = start

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i]
    if (current === prev + 1) {
      prev = current
    } else {
      if (start === prev) {
        ranges.push(`${start}`)
      } else {
        ranges.push(`${start}-${prev}`)
      }
      start = current
      prev = current
    }
  }

  return ranges.join(',')
}
