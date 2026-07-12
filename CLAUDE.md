# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**GLSS = Girl Life School Skip** — this repository is the GLSS project. The root
`D:\Github\GLSS-Rolling` is not (yet) a git repository; GLSS work happens here at
the root.

`reference/` is exactly what its name says: **read-only reference material**. It
contains `reference/nightly/`, a git clone of the upstream Girl Life QSP game
(`https://gitlab.com/kevinsmartstfg/girl-life.git`, branch `master`). Consult it to
understand game systems, conventions, and tooling — do not treat it as the working
codebase, and do not modify it unless explicitly asked.

Girl Life is a life-simulation text game for the QSP engine. Its source is ~1,400
`.qsrc` files in `locations/` (one QSP "location" per file) that get merged and
compiled into a single `glife.qsp` binary played with a QSP player.

## The GLSS Mod (`glss/`)

GLSS is implemented as a runtime mod (loaded via `inclib` from the game's `mod/`
folder, enabled in Settings → Mods). Source in `glss/locations/`, manifest
`glss/glss.qproj`, built with `glss/Make_mod.bat` (calls the reference `qsp-cli`).
New `.qsrc` files must be registered in `glss.qproj` or they are silently excluded.

Features (see `glss/README.md`): one-click auto-attendance of the school day, and
"ghost attendance" that credits school in the background — both off by default,
toggled on the mod's Options page.

Key mod-framework facts (from `reference/nightly/locations/mod_system.qsrc`):
- `mod_<name>` (the bare dispatcher location) is called on **every location change**
  (via `LOCA.qsrc`, after the destination's code ran) and from sleep-trigger hooks —
  so a mod can inspect `$curloc`/`$curacts` and append `act`s to any screen.
- `mod_<name>_setup` registers `$mod_info[]`; `mod_<name>_options` and
  `mod_<name>_readme` are opened from the Mods settings page;
  `mod_<name>_saveupdater` runs on every save load.
- The `stat`, `stat_display`, `func`, `arousal`, and `outfit` hooks are disabled
  (`exit` at the top) in the current nightly — don't rely on them.
- QSP gotcha the parser catches: an unpaired apostrophe inside a `!!` comment opens
  a string and swallows following lines. Validate with the Chimrod parser (see below).

To validate mod code against the full game: merge both with `txtmerge.py`,
concatenate the two `.txt` files, and run `tools/Parser/qsp_parser.exe --level error`
on the result. The upstream game itself has ~90 pre-existing missing-location errors;
compare against that baseline. Validating the mod `.txt` alone reports false
"location does not exist" errors for core-game locations (`stat`, `grades`, etc.).

Everything below documents the upstream game inside `reference/nightly/`, as
reference for GLSS work.

## Build & Run (from `reference/nightly/`)

- **Interactive menu (Windows):** `MakeQSP.bat` — offers (B)uild, (D)ebug build, (R)un, (F)ull build+run, (Q)Gen editor, (V)alidate.
- **Direct build:** `tools\qsp-cli.exe --compile locations glife.qsp glife.qproj`
- **Two-step build (what `build.sh` does):** `python tools/txtmerge.py locations glife.txt glife.qproj` then `tools\txt2gam64.exe glife.txt glife.qsp`
- **Debug build:** `python tools\build_debug.py locations glife.txt glife.qproj` then `tools\qsp-cli.exe glife.txt`
- **Run:** `tools\Player-video\qspgui.exe glife.qsp`
- **CI** (GitLab): `python3 tools/ci_build.py build-dev|release-dev|build-release`

**Critical:** `glife.qproj` is the build manifest. The merge tools iterate its
`<Location name="..."/>` entries — a new `.qsrc` file in `locations/` is silently
excluded from the build until it is registered in `glife.qproj`. A `$` in a location
name maps to `_` in its filename.

## Validation

- **Syntax/lint (Chimrod parser):** run `python tools/txtmerge.py locations glife.txt glife.qproj`, then `tools\Parser\qsp_parser.exe --level warn glife.txt > validation.log` (this is `MakeQSP.bat` option V).
- **Call validation** (checks every `gt`/`gs` targets an existing location + `$ARGS[0]` handler):
  - Whole project: `python tools\callvalidator.py source=locations`
  - Single file: `python tools\callvalidator.py source=locations file=<name>.qsrc`
  - `Callvalidator.bat` runs it against the list in `tools\glife-validate.qproj`.
- **Media checks:** `Check_media.bat` / `checkpics.bat` verify image/sound references.

## Tests

`MakeTestQSP.bat` builds and launches a test game:
`python tools\testbuilder.py locations test\testsuite-basic.qproj FALSE` followed by
`txt2gam` on the generated file. Tests live in `test/*.qsrc` (see `test/test_file_template`),
use assert helpers from `test/testframework.qsrc` (`assertEqualsString`, `assertEqualsNumber`,
`testsetup` for a canned player character), and are registered in a testsuite `.qproj`
(`test/testsuite-basic.qproj`). To run a subset, point testbuilder at a testsuite file
listing only the tests you want. The framework sets `_ISTEST = 1`.

## QSP Source Conventions (`.qsrc`)

- Each file starts with `# locationname`. Comments are `!!`. String variables are prefixed `$`.
- **Event-dispatch pattern:** a location is a bag of handlers — `if $ARGS[0] = 'eventname': ... end` blocks. Invoke with `gt 'location', 'event'` (goto, replaces screen), `gs 'location', 'event'` (gosub), or `func('location', 'name', args)` / `$func(...)` for return values (`result` / `$result`).
- Indentation: tabs; encoding UTF-8; LF line endings; final newline (enforced by `.editorconfig`).
- File-name prefixes are regions: `pav_` (Pavlovsk), `city_` (St. Petersburg), `gad` (Gadukino), `pushkin` — `core_library.qsrc` `setloc` derives `$region` from them. `_attributes_*` files are clothing-item data. Player-character stats use the `pcs_` prefix.

## Core Architecture

- `locations/cikl.qsrc` — the day-rollover loop (runs at midnight/sleep: schedules, NPC state, recurring events).
- `locations/stat.qsrc` — recalculates and renders the status panel; runs constantly after player actions.
- `locations/core_library.qsrc` — shared location helpers (`setloc`, `stage_title`).
- `locations/shortgs.qsrc` — small utility functions (day-of-week, etc.).
- `locations/begin.qsrc` / `start.qsrc` — game start / new-game flow.
- **Jobs v4 system:** `jobs.qsrc` is the employment API (hire/fire, clock in/out, paychecks, schedules, bookings — a full API reference is in its header comment). Job definitions live in `jobs_list.qsrc` (or custom files registered via `set_job_file`); `jobs_gigs.qsrc` covers gigs.
- **Calendar system:** `calendar.qsrc`, `calendar_list.qsrc` (event definitions), `calendar_events.qsrc`, `calendar_query.qsrc`, `calendar_render.qsrc`, `calendar_schedule.qsrc`. Jobs v4 creates calendar events for scheduled work.
- `locations/saveupdater.qsrc` — save-game migration when variables are renamed. The save version number lives in `saveg.qsrc`; when bumping it, both files must be committed together (see the header of `saveupdater.qsrc` for the required version-check pattern).
- `mods/` contains optional mods (Additional Adventures, Cherrypop Agency, Ibiza); `isample_mod/` is a sample mod template with its own build scripts.

## Active Migration Work

`docs/comprehensive_integration_master_plan.md` is the master document tracking the
ongoing migration of legacy job systems to Jobs v4 and calendar integration: which
jobs are done, the recommended migration order for the remainder, which get thin
wrappers only, and which should not be migrated. Consult it before touching any
employment- or schedule-related code. `docs/calendar_events_integration_summary.md`
tracks which recurring events are already in `calendar_list.qsrc`.
