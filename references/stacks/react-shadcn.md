# React and shadcn/ui

Read this only when the project uses React with shadcn/ui and Tailwind. shadcn is copied into the repo (usually `src/components/ui/`), so read the component file and `package.json` before claiming what a component renders. Since July 2026 new projects start on Base UI; Radix (`shadcn init -b radix`) and React Aria are the other bases. The imports in `src/components/ui/` tell which one the project has. The notes below describe the Radix build and name the Base UI equivalent where it differs. Do not swap a working component's primitives for taste.

## Tokens and theming

`scripts/tokens.mjs` writes `tokens.css`, `tailwind.preset.cjs` and `tailwind.theme.css`. Import `tokens.css` once.

- Tailwind v3: add the preset. The repo's `theme.extend` wins for the same key, so check the resolved config. Preset colours are `var()` values, so opacity modifiers (`hover:bg-primary/90`) generate nothing, silently; use `hover:opacity-90`.
- Tailwind v4: import `tailwindcss`, then `tailwind.theme.css`, then `tokens.css`. No duration utilities: write `duration-[var(--duration-fast)]`. Opacity modifiers work.
- Map shadcn variables to token roles: `--primary` accent, `--primary-foreground` on-accent, `--ring` focus-ring, `--input` control-border, `--border` separator, `--destructive` destructive, `--background` background, `--foreground` label, `--muted-foreground` label-secondary, `--card` and `--popover` surface or elevated. shadcn's `--accent` is a hover tint: leave it neutral.
- Dark mode: next-themes, system default. Tailwind's `dark:` selector must match the attribute it writes. Keep `suppressHydrationWarning` on `<html>`.

## Buttons and actions

- `asChild` (Base UI: `render`) keeps a link a real link. One `default` primary; the rest `outline`, `secondary`, `ghost`.
- Focus rings are built in once `--ring` is mapped. Forced colours remove `ring-*` (a box shadow); v4's `outline-none` removes the outline, so use `outline-hidden`.
- Icon buttons need `aria-label`; on a button with text it overrides the text.
- `Checkbox` is 16 px: enlarge the hit area with `relative after:absolute after:-inset-1`.

## Menus, selects and commands

- `DropdownMenu` has arrows, typeahead, Escape, focus return and disabled-skipping built in. `Popover` is not a menu.
- `Popover` plus `Command` is the combobox; test roles with a screen reader. Shortcut components render text only; the key handler is yours.
- Tooltip: hover and focus, Escape, hoverable. Touch never opens it; hold nothing essential. `HoverCard` is for sighted pointer users (Radix: screen readers ignore it, keyboard users cannot reach its content); nothing essential in it either.

## Dialogs, sheets and confirmation

- `Dialog` builds in trap, Escape, focus return, `aria-hidden` and scroll lock (not `inert`). Keep `DialogTitle`, even `sr-only`; add a description or `aria-describedby={undefined}`.
- `AlertDialog` ignores outside clicks and focuses Cancel. For async work, `preventDefault` in the action and close on success.
- Dirty forms: `preventDefault()` in `onEscapeKeyDown`, `onInteractOutside` and Close, then ask. Base UI: `onOpenChange(open, eventDetails)` gives `eventDetails.reason`; call `eventDetails.cancel()` to keep it open. `disablePointerDismissal` (on `Root`) stops outside clicks closing it.
- Add `max-h-[90dvh] overflow-y-auto` if the copy lacks a max height. Do not stack dialogs.
- `Sheet` is modal. For a panel beside the work, use `modal={false}` or a layout pane. `SheetTitle` is required; `Drawer` needs a Close button for non-drag.
- Deleting the row that holds the trigger leaves focus nowhere: `onCloseAutoFocus` with `preventDefault()`, then focus the neighbouring row (Base UI: `finalFocus` on `Popup`; `initialFocus` picks where focus starts).

## Forms and fields

- Current docs build forms from react-hook-form's `Controller` and `Field` (`FieldLabel`, `FieldError`): you pass `aria-invalid` to the control and `data-invalid` to `Field` from `fieldState` yourself. Older projects use `Form`, where `FormControl` wires `id`, `aria-invalid` and `aria-describedby`. Check which one the project has.
- Set `autoComplete`, `inputMode`, `enterKeyHint`. `field-sizing-content` on `Textarea` needs a max-height fallback for older browsers.
- `checked="indeterminate"` gives `aria-checked="mixed"`. A `RadioGroup` still needs a visible legend. `Switch` for immediate settings, `Checkbox` in forms, `ToggleGroup` for selection, never action buttons.
- A disabled button gets no focus, so a Tooltip never opens: use `aria-disabled` and inline reason text.

## Tables and lists

- TanStack Table sorts but sets no `aria-sort`: add it on the sorted `TableHead`, with a `Button` inside.
- `data-state="selected"` is colour only; the checked row checkbox is the other cue. Shift-range selection is custom.
- The `Table` wrapper scrolls: add `tabIndex={0}`, `role="region"`, `aria-label`. A sticky header needs a max height on the wrapper.
- `ScrollArea` with nothing focusable inside needs `tabIndex={0}`. `Progress` is a progressbar, not a meter. Count badges need `sr-only` text. dnd-kit needs `KeyboardSensor` and Move up and down items.

## Navigation and sidebar

- `aria-current="page"` comes from the router link, not `isActive` (styling only via `data-active`). `Sidebar` is a `div`: wrap menus in `<nav aria-label>`; check `SidebarInset` renders `<main>`.
- React Router does not move focus: set the title and focus the `<h1>` (`tabIndex={-1}`). `useBlocker` needs a data router.

## Tabs, disclosure and layout

- `Tabs`: semantics and arrows built in; control from a URL param; `activationMode="manual"` for costly panels.
- `Collapsible` and `Accordion` set `aria-expanded`; Accordion headers are `h3`, so match the page level.
- Use `h-dvh`, not `h-screen`; `pb-[env(safe-area-inset-bottom)]` needs `viewport-fit=cover`. v3 needs `hoverOnlyWhenSupported`.

## Feedback: toasts, loading, empty

- Base UI projects may have `Toast` (`@/components/ui/toast`) instead of sonner; check it the same way. sonner is a polite live region (check). Default 4 s; it pauses on hover, not keyboard focus, so `duration: Infinity` for actions. Keep important errors on the page.
- `Skeleton` per region. `animate-pulse`, `animate-in` ignore reduced-motion variables: add `motion-reduce:animate-none`. Avoid `transition-all` on rows.
- Streaming text: `aria-busy` plus a short `role="status"` line, never the text itself. Set `<html lang>` yourself.

## Charts

- `ChartContainer` gives no text summary: add a `figcaption` and a values table.
- Config colours give hue only; add dashes, shapes or direct labels.
- Recharts `accessibilityLayer` is default in v3, opt-in in 2.x; check. `ChartTooltip` is hover-first.

## Where shadcn defaults look machine-made

- A `Card` around every section: use spacing and headings; a card only for an object acted on as a unit (a ticket, a shipment).
- A `Badge` on every table status: plain text for the normal state, a badge only for the exception.
- A selected sidebar item with a coloured edge stripe: never. Use its filled background and heavier weight.
