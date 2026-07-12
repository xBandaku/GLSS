# GLSS — Girl Life School Skip

A mod for Girl Life (English Community Version) that makes the Pavlovsk school routine optional. Two independent features, both **off by default**, toggled in-game:

- **One-click school day** — a new hallway action, *"GLSS: Attend the rest of the school day automatically"*, sits Sveta through every remaining lesson with average participation and jumps the clock to the end of the school day (14:00). Attendance, homework, and grade gains are all credited. Available in the morning hallway and between classes.
- **Ghost attendance** — school happens without you. On every school day from 8:00, attendance and average grades are credited automatically no matter where Sveta is. No absences accrue, the mother confrontation ladder never fires, and truancy can no longer get you expelled.

## Design notes

- Grade credit follows the real lesson dispatcher (`gschool_lessons` 'schedule'): the correct subjects for each weekday get `attend_class` plus one intellect-modified participation activity via the standard `grades` API. Automated days are solid but never beat playing lessons yourself.
- The absence system is left untouched: the hourly `+1` tick still fires, and GLSS mirrors the same `-1` credit that real attendance applies, so absences net to zero.
- The one-click action is only injected when the regular hallway actions are on screen (checked via `$curacts`), so special morning scenes — principal summons, grade check, game night invites, cheerleading follow-ups — are never bypassed.
- Automated days deliberately skip the school social layer (`gschool_socialchg`, gossip, classroom events): friendships and school arcs only progress when you attend in person.
- Grade credit runs at most once per game day, guarding against double-dipping between the two features.

## Building

Requires the reference Girl Life checkout at `../reference/nightly` (for `tools/qsp-cli`).

- Windows: run `Make_mod.bat`
- Linux/macOS: run `./Make_mod.sh`

Either produces `glss.qsp`.

## Installing

1. Copy `glss.qsp` (built above, or downloaded from the [Releases page](https://github.com/xBandaku/Girl-Life-School-Skip/releases)) into the `mod` folder of your Girl Life install (create the folder next to `glife.qsp` if it doesn't exist).
2. In game: Settings → Mods → install new mod → enter `glss`.
3. Click the mod's **Options** link to enable the features you want.

Both features only apply to the schoolgirl start, during term time, while enrolled and not expelled.
