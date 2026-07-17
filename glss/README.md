# GLSS — Girl Life School Skip

A mod for Girl Life (English Community Version) that makes the Pavlovsk school routine and the university routine optional. Independent features, all **off by default**, toggled in-game:

## School

- **One-click school day** — a new hallway action, *"GLSS: Attend the rest of the school day automatically"*, sits Sveta through every remaining lesson with average participation and jumps the clock to the end of the school day (14:00). Attendance, homework, and grade gains are all credited. Available in the morning hallway and between classes.
- **Ghost attendance** — school happens without you. On every school day from 8:00, attendance and average grades are credited automatically no matter where Sveta is. No absences accrue, the mother confrontation ladder never fires, and truancy can no longer get you expelled.
- **Auto-lunch** — on automated days Sveta eats a bagged lunch from home when available, otherwise buys cafeteria food (50 ₽) when affordable, otherwise skips. Uses the game's silent `_stats` food handlers and the same money API as the real cafeteria. Off by default.

## University

- **One-click university day** — a new campus/lecture-hall action, *"GLSS: Attend the rest of your university day automatically"*, credits every remaining lecture and any due exam with average participation and advances the clock to match. Covers both degree programs (nursing, teaching studies), semesters 1–4 — no lecture content exists for later semesters in the current game build.
- **Ghost university attendance** — university happens without you. Lectures and any due exam are credited automatically wherever Sveta is. Unlike school, university expulsion is driven by missed/failed exams rather than an absence counter, so this is what actually delivers the "never expelled for skipping" guarantee here.
- **Auto-attend electives** — optional, only takes effect together with one of the two features above. Electives (Computers, Art, Psychology, African/Asian Studies) carry no grade weight and have no exam in the real game, so this just collects the minor skill-point reward the "listen attentively" choice grants.

## Design notes

- Grade credit follows the real lesson dispatchers (`gschool_lessons` 'schedule' for school, `uni_programs`/`uni_lessons1-4` for university): the correct subjects for each weekday get `attend_class` plus intellect/charisma-modified participation activity via the standard `grades` API, replicated verbatim including a handful of upstream bugs in the teaching-studies lecture handlers (wrong subject string on some calls, a duplicated stat instead of the intended one) — automated grades must never diverge from what a manual playthrough would produce.
- The school absence system is left untouched: the hourly `+1` tick still fires, and GLSS mirrors the same `-1` credit that real attendance applies, so absences net to zero. University has no such counter; ghost/one-click university instead auto-completes the due exam, which is what the real pass/fail and expulsion logic actually keys on.
- One-click actions are only injected when the regular class/exam actions are on screen (checked via `$curacts`), so special morning scenes, campus random events, and interactive NPC hooks are never bypassed.
- Automated days deliberately skip the social layer of each life stage (`gschool_socialchg`, gossip, classroom events for school; campus events and elective NPC content for university): friendships and story arcs only progress when you attend in person.
- Grade/exam credit runs at most once per game day per period, guarding against double-dipping between features that could both fire the same day.

## Building

Requires the reference Girl Life checkout at `../reference/nightly` (for `tools/qsp-cli`).

- Windows: run `Make_mod.bat`
- Linux/macOS: run `./Make_mod.sh`

Either produces `glss.qsp`.

## Installing

1. Copy `glss.qsp` (built above, or downloaded from the [Releases page](https://github.com/xBandaku/Girl-Life-School-Skip/releases)) into the `mod` folder of your Girl Life install (create the folder next to `glife.qsp` if it doesn't exist).
2. In game: Settings → Mods → install new mod → enter `glss`.
3. Click the mod's **Options** link to enable the features you want.

The school features only apply to the schoolgirl start, during term time, while enrolled and not expelled; the university features only apply while enrolled at the university.
