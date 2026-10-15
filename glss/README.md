# GLSS: Girl Life School Skip

A mod for Girl Life (English Community Version) that makes the Pavlovsk school routine and the university routine optional. Independent features, all **off by default**, toggled in-game:

## School

- **One-click school day**: a new hallway action, *"GLSS: Attend the rest of the school day automatically"*, sits Sveta through every remaining lesson with the selected participation level and jumps the clock to the end of the school day (14:00). Attendance, homework, and grade gains are all credited. Available in the morning hallway and between classes.
- **Ghost attendance**: school happens without you. On every school day from 8:00, attendance and lesson credit are recorded automatically no matter where Sveta is. No absences accrue, the mother confrontation ladder never fires, and truancy can no longer get you expelled.
- **Auto-lunch**: on automated days Sveta eats a bagged lunch from home when available, otherwise buys cafeteria food (50 ₽) when affordable, otherwise skips. Uses the game's silent `_stats` food handlers and the same money API as the real cafeteria. Off by default.

## University

- **One-click university day**: a new campus/lecture-hall action, *"GLSS: Attend the rest of your university day automatically"*, credits every remaining lecture and any due exam with the selected participation level and advances the clock to match. Covers both degree programs (nursing, teaching studies), semesters 1-4: no lecture content exists for later semesters in the current game build.
- **Ghost university attendance**: university happens without you. Lectures and any due exam are credited automatically wherever Sveta is. Due exams are marked completed. Passing still requires a grade above 40 in every subject; automation does not guarantee passing or prevent expulsion for low grades.
- **Auto-attend electives**: optional, only takes effect together with one of the two features above. Electives (Computers, Art, Psychology, African/Asian Studies) carry no grade weight and have no exam in the real game, so this just collects the minor skill-point reward the "listen attentively" choice grants.

## Design notes

- School and university have separate participation settings: listening (default), active participation, and attendance only. Listening and active participation pay the normal listening willpower cost once per lesson. If unaffordable, only attendance is credited. Active school bonuses use the real subject attributes or skills; PE receives attendance only. Experience, academic-trait progress and social rewards remain part of manual lessons. Electives retain their separate rewards and costs.
- School absence credit mirrors ordinary attendance. University automation marks due exams completed, but every subject still needs a grade above 40 to pass.
- If manual school work adds classroom credit later that day, GLSS removes its own recorded grade contribution for that subject and refunds its participation cost at the next location or sleep hook. Manual classroom scenes remain available. This cannot correct credit awarded by older versions before the tracking data existed.
- Automated lunch is limited to one successful meal per day. Ghost lunch waits for a location or sleep hook between 12:00 and 14:00. Manual meals are not tracked by this guard.
- One-click actions are only injected when the regular class/exam actions are on screen (checked via `$curacts`), so special morning scenes, campus random events, and interactive NPC hooks are never bypassed.
- Automated days deliberately skip the social layer of each life stage (`gschool_socialchg`, gossip, classroom events for school; campus events and elective NPC content for university): friendships and story arcs only progress when you attend in person.
- Grade/exam credit runs at most once per game day per period, guarding against double-dipping between features that could both fire the same day.

## Building

Requires the reference Girl Life checkout at `../reference/nightly` (for `tools/qsp-cli`).

- Windows: run `Make_mod.bat`
- Linux/macOS: run `./Make_mod.sh`

Either produces `glss.qsp`.

## 0.3 changes

Separate participation settings replace the previous fixed bonuses. Listening is the default, including in existing saves, and now costs willpower. School grade records let later manual lessons replace automated credit without blocking scenes. Automated lunch has a daily guard, with ghost lunch deferred to midday. University action checks inspect destinations, electives no longer run during exam weeks, and the descriptions explain that exam completion does not guarantee passing.

## Regression tests

Install Node.js and run these commands from the repository root:

```text
npm install --prefix glss/tests
node glss/tests/automation.mjs reference/nightly
```

The suite runs both source scripts and the compiled `glss.qsp` in QSP WASM. It uses the supplied checkout for real grading, willpower, scheduling and Russian lesson code. Clock, money, meals and peripheral scene services are fixtures. It covers participation costs, manual/automated grade overlap, partial days, day rollover, lunch guards, late arrivals, electives and exams. It does not replace a full-game test or a 5.7 player test.

## Installing

1. Copy `glss.qsp` (built above, or downloaded from the [Releases page](https://github.com/xBandaku/GLSS/releases)) into the `mod` folder of your Girl Life install (create the folder next to `glife.qsp` if it doesn't exist).
2. In game: Settings → Mods → install new mod → enter `glss`.
3. Click the mod's **Options** link to enable the features you want.

The school features only apply to the schoolgirl start, during term time, while enrolled and not expelled; the university features only apply while enrolled at the university.
