# claude-code-rtl-fix

A Claude Code mod that fixes the reading direction and alignment of assistant replies that mix Persian or Arabic with English.

[فارسی](#فارسی)

## The problem

Claude's apps decide the direction of each paragraph from its first letter. A Persian paragraph that opens with an English word is therefore drawn left to right and left-aligned, and a list whose items open with an English term ends up with its bullets on the wrong side.

Markdown like this is drawn in the wrong direction without the mod:

```markdown
React یک کتابخانه برای ساخت رابط کاربری است.

- **Docker** را نصب کنید
- فایل config.json را ویرایش کنید
```

With the mod, both the paragraph and the list are right-aligned and read right to left, while English paragraphs in the same reply stay left-aligned.

## What it does

- Decides the direction of each paragraph, list item, heading and table cell on its own, from the share of right-to-left letters in it (about 30% or more counts as right to left).
- Where a block would be read in the wrong direction, puts one invisible Unicode direction mark (U+200F or U+200E) before its first letter. Blocks that already read correctly are left exactly as written.
- Leaves code blocks, and replies with no right-to-left text, untouched.
- Changes only how a reply is drawn. The stored message is not modified, and your own messages are not touched.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install rtl-fix --marketplace Qaemi66/claude-code-rtl-fix
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install rtl-fix --marketplace Qaemi66/claude-code-rtl-fix
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `Qaemi66/claude-code-rtl-fix`, then Add plugin.

The mod takes effect in sessions started after it is installed. If you see no change, close the app and open it again.

## Limitations

- It works in Claude Code only (terminal, desktop app, IDE extensions). Other tools have no equivalent hook.
- Direction is decided per block. A single line that mixes both scripts heavily can still read awkwardly.
- A terminal that reorders bidirectional text by itself draws the text its own way; the mod cannot override that.

## Development

The logic is in `hooks/register.ts` (the `fixDirection` function), with tests in `hooks/register.test.ts`:

```
claude plugin validate .
claude plugin test .
```

## License

MIT

---

## فارسی

یک mod برای Claude Code که جهت و تراز پاسخ‌های ترکیبی فارسی/عربی و انگلیسی را درست می‌کند.

### مشکل

برنامه‌های Claude جهت هر پاراگراف را از روی اولین حرف آن تعیین می‌کنند. برای همین پاراگراف فارسی‌ای که با یک کلمهٔ انگلیسی شروع شود چپ‌چین و چپ‌به‌راست رسم می‌شود، و لیستی که آیتم‌هایش با اصطلاح انگلیسی شروع شوند، نشانه‌هایش سمت اشتباه می‌افتد.

### چه کاری می‌کند

- جهت هر پاراگراف، آیتم لیست، تیتر و خانهٔ جدول را جداگانه و از روی سهم حروف راست‌به‌چپ تعیین می‌کند (حدود ۳۰٪ یا بیشتر یعنی راست‌به‌چپ).
- فقط جایی که بلوک در جهت اشتباه خوانده می‌شود، یک نویسهٔ نامرئی جهت قبل از اولین حرف می‌گذارد.
- بلوک‌های کد و پاسخ‌های کاملاً انگلیسی را دست نمی‌زند.
- فقط نمایش را تغییر می‌دهد؛ متن ذخیره‌شدهٔ پیام و پیام‌های خود شما عوض نمی‌شوند.

### نصب

در Claude Code:

```
/plugin install rtl-fix --marketplace Qaemi66/claude-code-rtl-fix
```

در برنامهٔ دسکتاپ: + کنار کادر پیام، بعد Plugins، بعد Add marketplace با `Qaemi66/claude-code-rtl-fix`، بعد Add plugin.

mod در جلسه‌های جدید فعال می‌شود؛ اگر تغییری ندیدید برنامه را یک بار ببندید و باز کنید.
