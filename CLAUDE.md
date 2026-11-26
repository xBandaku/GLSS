# CLAUDE.md

## What this is

GLSS (Girl Life School Skip) is a runtime mod for Girl Life: English Community Version, a QSP text game. It automates the
Pavlovsk school day and the university routine: one-click attendance, background "ghost" attendance, auto-lunch, and
participation settings, all off by default and toggled on the mod's Options page. Repo: `xBandaku/GLSS`.

## Language, runtime, dependencies

- QSP source (`.qsrc`, one "location" per file), compiled to `glss/glss.qsp` and loaded by the game with `inclib` from its
  `mod/` folder (Settings → Mods → install `glss`).
- Compiler: `qsp-cli` from the upstream game checkout in `reference/nightly/tools/` (`.exe` on Windows, `qsp-cli` on Linux,
  `qsp-cli-mac` on macOS).
- Tests: Node 24 (`engines: >=24`) with `@qsp/wasm-engine` 1.6.1 and `@qsp/converters` 1.0.1, pinned exactly.
- Upstream game pinned at commit `83b164f64224f1ba88fd409469c1a9379ad34f86` (in `ci.yml` and `REQUIREMENTS.md`).

## Layout

```
glss/
  locations/                    mod source (the only game code that is ours)
    mod_glss.qsrc               dispatcher: runs on every location change and sleep hook; gates and injects actions
    mod_glss_setup.qsrc         $mod_info (name, version '00301' = "0.3 fix 1"); must stay first in glss.qproj
    mod_glss_functions.qsrc     school: ghost_credit, auto_lunch, auto_day, day_grades, pay_attention, reconcile_grades
    mod_glss_uni_functions.qsrc university: credit_period/credit_exam, timetable rows ('row'/'field'), auto_uni_day
    mod_glss_uni_electives_functions.qsrc  electives (skill points only, no grades)
    mod_glss_options.qsrc / mod_glss_readme.qsrc  in-game Options and readme pages
  glss.qproj                    build manifest; a .qsrc not listed here is silently left out
  glss.qsp                      compiled mod, committed on purpose (rebuild after any locations/ change)
  Make_mod.bat / Make_mod.sh    build scripts (macOS path untested)
  tests/automation.mjs          regression suite (QSP WASM), runs every case against source and compiled glss.qsp
.github/workflows/              ci.yml (build + test on push/PR), release.yml (v* tag → GitHub release of glss.qsp)
reference/nightly/              third-party upstream game checkout, git-ignored, read-only
REQUIREMENTS.md                 fresh Windows setup (Git, Node 24.22.1, reference fetch)
```

## Commands (from the repo root)

```
git init reference/nightly
git -C reference/nightly fetch --depth 1 https://gitlab.com/kevinsmartstfg/girl-life.git 83b164f64224f1ba88fd409469c1a9379ad34f86
git -C reference/nightly checkout --detach FETCH_HEAD
npm ci --prefix glss/tests --ignore-scripts          # once
cd glss && Make_mod.bat                               # or: bash Make_mod.sh
npm test --prefix glss/tests -- reference/nightly     # 56 cases as of v0.3.1
```

On Windows PowerShell use `npm.cmd` (REQUIREMENTS.md). Direct build: `qsp-cli --compile locations glss.qsp glss.qproj
--no-builddate` from `glss/`. The user asked to be asked before tests are run.

Syntax check (from the old CLAUDE.md, not run this session because auto mode blocked it): merge mod and game with
`reference/nightly/tools/txtmerge.py`, concatenate the two `.txt` files, run `tools/Parser/qsp_parser.exe --level error`.
The game alone has about 90 missing-location errors; compare against that baseline. Checking the mod alone gives false
"location does not exist" errors.

## Conventions

- Location files start with `# name` and end with `--- name ---------------------------------`. Comments are `!!`.
  Handlers are `if $ARGS[0] = 'name': ... exit end` blocks, called with `gs`/`gt`/`func`/`$func`.
- Every mod variable is prefixed `glss` (persistent settings and day stamps live in the `glss[...]` array). Temporaries
  are `killvar`ed at the end of each handler.
- Day guards compare to `daystart` (e.g. `glss['grades_day'] = daystart`). Upstream attendance flags are reused on
  purpose: `gschoolVars['last_attendance']` for school, `uni_period['first'|'second'|'third'|'exam']` for university.
- The dispatcher must stay silent (no text, no screen change) and restores `will_cost` around everything it does.
- Upstream bugs are copied on purpose where noted (teaching-studies "ask a question" stat/subject, Asian/African
  Studies 102 rewards). Don't "fix" them in the mod.
- Tabs, LF line endings for `.qsrc`/`.sh`/`.qproj`, CRLF for `.bat` (`.gitattributes`).
- Feature text is repeated in `README.md`, `glss/README.md`, `mod_glss_options.qsrc` and `mod_glss_readme.qsrc`.
  Change all four together.

## Gotchas

- Mod hooks: `mod_glss` runs after the destination location's code, so it sees the finished `$curacts` and can add
  `act`s. The `stat`, `stat_display`, `func`, `arousal` and `outfit` hooks `exit` immediately in this upstream
  version (`mod_system.qsrc:27-70`). Don't use them.
- `$curacts` text: older players keep the original case, newer ones uppercase it. Compare with `$ucase(...)`.
- School one-click finds hallway actions by their English labels (`mod_glss.qsrc`). Matching on where they lead was
  rejected: the morning and break actions both go to `gschool_lessons 'schedule'`, and so does the detention
  punishment "Leave the school" screen. A label rename upstream disables the button.
- `gschool_lessons 'short_break'` never sets `$menu_arg`, so `$menu_arg` stays `'morning'` all day.
- An unpaired apostrophe inside a `!!` comment opens a string and swallows the following lines.
- QSP `$x` and `x` are the same variable (`killvar 'x'` clears both).
- Tests use fixture stubs for `time`, `stat`, `money`, `food`, `uni_grounds`, `gschool_lessons`, `gschool_grounds`, so
  they can't catch upstream changes to those screens.
- `reference/nightly/` is not ours: don't edit or review it as project code.
- Don't use the latest upstream when reproducing CI. Bump the pin in `ci.yml` and `REQUIREMENTS.md` together.

## Current state (2026-11-26)

- Latest release: v0.3.1 (PR #5, squash-merged as 2b19655). It added:
  - test path fix, suspension gate, one-click at morning/lunch breaks, macOS build script, Node version
  - restored the 8:00-8:59 "Rush to class" on the school grounds when ghost attendance already ran
  - ghost university credits each lecture once it starts (9:00, 11:00, 13:15)
  - suspended-day absence wording, new school tests, SHA-pinned actions
  - university timetables rewritten as data rows (checked equal to the old if-chains on all 1,638 cases)
- Not done: an in-game playtest of v0.3.1 (late "Rush to class" at 8:xx; 11:00 lecture still offered at 10:00 with
  ghost university on), and any 5.7 player test.
- PR #5's merged description still has attribution lines. Auto mode blocked removing them; the user will edit it.
- Planned: `@qsp/converters` 2.0.0 upgrade as its own PR. Dependabot PRs #3 and #4 were closed. #4 failed CI; inferred
  cause: 2.0.0 publishes only ESM/CJS builds via `exports`, while `automation.mjs` imports `dist/index.modern.js` by path.
- Decided: ghost credit keeps the game treating Sveta as at school for archetype points (`archetypes.qsrc:491`).

## Git and PRs

Do not add attribution to pull requests or commits. In PR descriptions, leave out the hidden claude-projects-attribution comment, the "Requested by ... · project thread" line, the "Generated with Claude Code" line, and any claude.ai session link. In commit messages, leave out Co-Authored-By: Claude and Claude-Session trailers.

- Work on a branch and open a PR to `main`. Rebuild and commit `glss/glss.qsp` with any `glss/locations/` change.
- Bump `$mod_info[1]` in `mod_glss_setup.qsrc` and add a changelog entry in `glss/README.md` for behaviour changes.
- Releases come from pushing a `v*` tag. CI rebuilds and tests, then publishes the tested `glss.qsp`.
- Commit or open PRs only when the user asks.

## Keeping docs in sync

After any change that alters features, commands, setup steps, folder structure, dependencies, or behavior, update README.md in the same change so it matches the code. Don't rewrite sections the change didn't touch. After any change that alters what the project is or does, check the GitHub About section (description, website, topics). If it's out of date, update it with `gh repo edit` and tell me exactly what you changed. If `gh` isn't installed or authenticated, give me the exact text to paste instead. Update the "Current state" and folder structure parts of CLAUDE.md too when they stop being true.

The mod's feature text also lives in `glss/README.md`, `mod_glss_options.qsrc` and `mod_glss_readme.qsrc`.
