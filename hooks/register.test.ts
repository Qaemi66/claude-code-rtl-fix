import { expect, test } from 'claude-code/testing'

const RLM = '‏'
const LRM = '‎'

const FENCED = ['```ts', 'const x = "سلام"', '```'].join('\n')

const REPLY = [
  'React یک کتابخانه برای ساخت رابط کاربری است.',
  '',
  '- TypeScript را نصب کنید',
  '- این مورد فارسی است',
  '',
  '## API جدید',
  '',
  'سلام means hello in Persian, a common greeting word.',
  '',
  'Plain English paragraph.',
  '',
  '**Docker** را اجرا کنید',
  '',
  FENCED,
].join('\n')

const EXPECTED = [
  `${RLM}React یک کتابخانه برای ساخت رابط کاربری است.`,
  '',
  `- ${RLM}TypeScript را نصب کنید`,
  '- این مورد فارسی است',
  '',
  `## ${RLM}API جدید`,
  '',
  `${LRM}سلام means hello in Persian, a common greeting word.`,
  '',
  'Plain English paragraph.',
  '',
  `**${RLM}Docker** را اجرا کنید`,
  '',
  FENCED,
].join('\n')

const message = (text: string) =>
  ({
    plugin: 'rtl-fix',
    component: 'AssistantMessage',
    requestId: 'm1',
    surface: 'desktop',
    props: { text, isFirstOfReply: true },
  }) as const

test('each block gets the mark of its dominant direction', async ($, on) => {
  // Stands for the engine: draws the text the mod handed down.
  on('ui.render', ($, e) => {
    const { Markdown } = $.ui.resolve(e)

    return Markdown({ text: (e.props as { text: string }).text })
  })

  const ui = await $.ui.mount(message(REPLY))
  const drawn = (await ui.find({ type: 'Markdown' }))?.text ?? ''

  expect(drawn).toBe(EXPECTED)
  await ui.unmount()

  // Already marked text passes through unchanged.
  const again = await $.ui.mount(message(drawn))

  expect((await again.find({ type: 'Markdown' }))?.text).toBe(EXPECTED)
  await again.unmount()
})

test('a reply with no right-to-left text is left alone', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Markdown } = $.ui.resolve(e)

    return Markdown({ text: (e.props as { text: string }).text })
  })

  const text = '# Title\n\n- one\n- two'
  const ui = await $.ui.mount(message(text))

  expect((await ui.find({ type: 'Markdown' }))?.text).toBe(text)
  await ui.unmount()
})
