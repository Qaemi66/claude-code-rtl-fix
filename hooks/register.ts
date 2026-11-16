import type { Register } from 'claude-code'

// Invisible direction marks. A surface reads each row by its first strong
// letter, so a Persian paragraph that opens with "React" is drawn left to
// right. A mark of the paragraph's dominant direction, placed before its
// first letter, fixes the reading order and the alignment.
const RLM = '‏'
const LRM = '‎'

// Share of right-to-left letters from which a paragraph counts as RTL.
const RTL_SHARE = 0.3

const RTL_CLASS = '֐-ࣿיִ-﷿ﹰ-ﻼ'
const LTR_CLASS = 'A-Za-zÀ-ɏ'
const RTL_LETTERS = new RegExp(`[${RTL_CLASS}]`, 'g')
const LTR_LETTERS = new RegExp(`[${LTR_CLASS}]`, 'g')
const FIRST_STRONG = new RegExp(`[${RTL_CLASS}${RLM}]|[${LTR_CLASS}${LRM}]`)
const IS_RTL = new RegExp(`[${RTL_CLASS}${RLM}]`)

const FENCE = /^\s*(?:>\s*)*(`{3,}|~{3,})/
const TABLE_ROW = /^\s*\|/
const TABLE_DELIMITER = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/
// Leading markdown that must stay at the start of the line: quote marks,
// a heading, a bullet (with an optional checkbox) or a list number.
const MARKER = /^(\s*(?:>\s*)*)(#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)?/
// Emphasis that opens the text: the mark goes after it, so it still parses.
const OPENING_EMPHASIS = /^(?:[*_~]+(?=\S))?/

type Direction = 'rtl' | 'ltr' | null

const count = (text: string, letters: RegExp): number =>
  text.match(letters)?.length ?? 0

// What a reader sees of the markdown: link targets and inline code do not
// decide which language a paragraph is written in.
const prose = (text: string): string =>
  text
    .replace(/`[^`]*`/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/https?:\/\/\S+/g, ' ')

const dominant = (text: string): Direction => {
  const visible = prose(text)
  const rtl = count(visible, RTL_LETTERS)
  const ltr = count(visible, LTR_LETTERS)

  if (rtl + ltr === 0) {
    return null
  }

  return rtl / (rtl + ltr) >= RTL_SHARE ? 'rtl' : 'ltr'
}

const firstStrong = (text: string): Direction => {
  const found = FIRST_STRONG.exec(text.replace(/\]\([^)]*\)/g, ']'))

  if (found === null) {
    return null
  }

  return IS_RTL.test(found[0]) ? 'rtl' : 'ltr'
}

// `body` with a mark before its first letter when it would otherwise be read
// in the wrong direction; unchanged when it already reads right.
const marked = (body: string, wanted: Direction): string => {
  if (wanted === null || firstStrong(body) === wanted) {
    return body
  }

  const emphasis = OPENING_EMPHASIS.exec(body)?.[0] ?? ''

  return emphasis + (wanted === 'rtl' ? RLM : LRM) + body.slice(emphasis.length)
}

const fixTableRow = (line: string): string =>
  line
    .split('|')
    .map(cell => {
      const lead = /^\s*/.exec(cell)?.[0] ?? ''

      return lead + marked(cell.slice(lead.length), dominant(cell))
    })
    .join('|')

export const fixDirection = (text: string): string => {
  if (!IS_RTL.test(text)) {
    return text
  }

  const lines = text.split('\n')
  const out: string[] = []
  let fence: string | null = null
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ''
    const opened = FENCE.exec(line)?.[1]

    if (fence !== null) {
      // Inside a code block, an unclosed one included: left as written.
      if (opened !== undefined && opened.startsWith(fence)) {
        fence = null
      }
      out.push(line)
      i += 1
      continue
    }

    if (opened !== undefined) {
      fence = opened
      out.push(line)
      i += 1
      continue
    }

    if (line.trim() === '' || TABLE_DELIMITER.test(line)) {
      out.push(line)
      i += 1
      continue
    }

    if (TABLE_ROW.test(line)) {
      out.push(fixTableRow(line))
      i += 1
      continue
    }

    // A block: this line and the plain lines that continue its paragraph.
    let end = i + 1

    while (end < lines.length) {
      const following = lines[end] ?? ''
      const marker = MARKER.exec(following)
      const startsBlock = marker !== null && marker[0].trim() !== ''

      if (
        following.trim() === '' ||
        startsBlock ||
        FENCE.test(following) ||
        TABLE_ROW.test(following)
      ) {
        break
      }
      end += 1
    }

    const prefix = MARKER.exec(line)?.[0] ?? ''
    const body = line.slice(prefix.length)
    const block = [body, ...lines.slice(i + 1, end)].join('\n')

    out.push(prefix + marked(body, dominant(block)))
    out.push(...lines.slice(i + 1, end))
    i = end
  }

  return out.join('\n')
}

export const register: Register = on => {
  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    const text = fixDirection(e.props.text)

    if (text === e.props.text) {
      return next(e)
    }

    return next({ ...e, props: { ...e.props, text } })
  })
}
