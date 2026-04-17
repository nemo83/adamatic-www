# AdaMatic — "Ledger" design direction (v2)

A lighter take on the ledger idea: editorial accents, clean grotesque body, stepper-led setup. Built for blockchain trust, but with the warmth of a good notebook instead of a tax form.

---

## What changed vs v1

- **Tailwind + Radix primitives**, MUI dropped from the design. More styling freedom, unstyled accessible primitives for Dialog/Checkbox, custom inputs we fully control.
- **Stepper for setup** — four discrete steps instead of one long form. One focused question per screen.
- **Lighter tone** — Fraunces is now reserved for page titles and the hero. Body type is Mona Sans only. Margin numerals replaced with a slim top progress rail.
- **Blockchain-appropriate clarity** — headings are questions (“Where does the money go?”, “When does it run?”), not labels. Helper text lives under each field, not in a left rail.

Palette, fonts (three still), and the paper/ink/amber signature are unchanged.

---

## Tokens

### Palette

```
--ink:          #0F0E0B      /* primary */
--ink-soft:     #1F1D18      /* hover */
--paper:        #F4EEE4      /* background */
--paper-raised: #E8DFD1      /* raised surface */
--rule:         rgba(15,14,11,0.12)
--marginalia:   rgba(15,14,11,0.55)

--amber:        #C44A1A      /* the one accent */
--amber-ink:    #7A2A0F      /* amber readable on paper */
--amber-soft:   #F0C9B4
--jade:         #2F6B4A      /* scheduled, confirmed */
--jade-soft:    #CFE0D6
--rust:         #8B2C1C      /* error, destructive */
--rust-soft:    #EFD0C9
```

Exposed as Tailwind colors (`bg-amber`, `text-jade`, …) and as CSS vars for anything outside Tailwind.

### Typography

```
display — Fraunces   (variable, used only for page titles, hero, key numbers)
body    — Mona Sans  (variable, all UI copy)
mono    — JetBrains Mono  (addresses, amounts, hashes, tx IDs, timestamps)
```

Loaded from Google Fonts in `design/globals.css`. Tabular numerals for anything numeric via `.num`.

### Shape / motion

```
rounded-sharp  2px   /* default on everything interactive */
rounded-card   8px   /* cards, dialog, table container */
shadow-dialog        /* the single elevation */
shadow-pressed       /* inset on the primary ink button */
ease-quill           /* 200–360ms, cubic-bezier(0.2, 0.65, 0.2, 1) */
```

---

## Visual signatures (retained)

1. **Hairline rules** separate major sections.
2. **Stamped statuses** — mono small-caps pills with an outlined box. Every row shows one.
3. **Amber is reserved.** Active step dot, the "next run" timestamp on the schedules table, the one primary-amber CTA shape (used sparingly). Everything else is ink on paper.
4. **Mono for everything on-chain.** Addresses, hashes, token names, amounts, epoch numbers — never in Fraunces.

---

## Setup flow

The setup flow is now a **four-step wizard**:

```
 ● 1 Payee & amount     →  Payee address, asset chip selector, amount
 ○ 2 Source wallets     →  Validated, addable/removable list
 ○ 3 Cadence            →  Start, end (optional), frequency, max fee
 ○ 4 Review & sign      →  Signable statement card + consent + submit
```

One focused screen at a time. The top has a slim progress rail (clickable for already-completed steps). Each step opens with a question as the heading and a one-line explainer, then the fields beneath at full width with generous vertical rhythm. The bottom has a `[Back]   [Next]` bar; the last step's primary button reads `Sign & submit`.

This is what the user called out — the old layout put titles in a left rail and dense fields in a right rail, which got cluttered when several inputs sat in the same step. The stepper makes each decision stand alone.

---

## Voice

- Headings are questions, not labels.
- Errors are stated (`Address not delegated to any Hosky Pool`), not apologised for.
- Amounts always carry a unit (`25.00 ADA`, not `25.00`).
- Timestamps always in UTC, local shown parenthetically if needed.
- Addresses always truncated `addr1q…a3kz` with a copy affordance nearby.

---

## What we are NOT

- Not generic MUI. The component library is swapped entirely.
- Not a one-page scrolling mega-form.
- Not over-formal — Fraunces is an accent, not the everyday voice.
- Not crypto-garish — no neon, no gradients-with-particles, no glossy coin 3D.
- Not 750px desktop-only — mobile-first, fluid up to 1200px content.

---

## File map

```
design/
  design.md                      # this file
  globals.css                    # Tailwind + fonts + scoped resets
  index.tsx                      # the reference page
  lib/cn.ts                      # tailwind-merge + clsx helper
  ui/
    Button.tsx                   # CVA-variant button
    Field.tsx                    # label + helper + error wrapper, plain <input>
    Dialog.tsx                   # Radix dialog wrapped with the token system
    Checkbox.tsx                 # Radix checkbox with mono label
    Stamp.tsx                    # status stamps (amber/jade/rust/mist/neutral)
    Segmented.tsx                # tab-style chooser (mode selector)
  components/
    AppShell.tsx                 # navbar + footer + ouroboros + network stamp
    WalletPicker.tsx             # CIP-30 wallet dialog
    Landing.tsx                  # hero + mode segmented + stats
    Stepper.tsx                  # top progress rail
    PaymentSetup.tsx             # stepper container
    steps/
      types.ts                   # form model
      StepPayeeAmount.tsx
      StepWallets.tsx
      StepCadence.tsx
      StepReview.tsx             # signable statement + consent
    PaymentsTable.tsx            # desktop table + mobile cards
    PaymentDetailsDialog.tsx     # record detail dialog
```

Phase 3 copies these files into `src/features/*` and wires them to the `ChainAdapter` from the refactor plan.

---

## What's also configured outside `/design/`

- `tailwind.config.js` — token extensions, `content` scoped to `design/` so the live app is unaffected. `corePlugins.preflight: false` so Tailwind's global reset doesn't touch the existing Mesh/MUI flow.
- `postcss.config.js` — tailwindcss + autoprefixer.
- `pages/_app.tsx` — imports `design/globals.css`, and respects `Component.standalone` so the design page opts out of the Mesh/Tour/Layout shell.
- `pages/design.tsx` — thin re-export that sets `standalone = true`.
