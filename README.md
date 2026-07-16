<div align="center">
  
# Girl-Life-School-Skip

[![Version](https://img.shields.io/github/v/release/xBandaku/Girl-Life-School-Skip?color=%230567ff&label=Latest%20Release&style=for-the-badge)](https://github.com/xBandaku/YACFRTGE/releases/latest)
![Downloads](https://img.shields.io/github/downloads/xBandaku/Girl-Life-School-Skip/total?label=Total%20Downloads&style=for-the-badge)
[![License](https://img.shields.io/github/license/xBandaku/Girl-Life-School-Skip?style=for-the-badge)](LICENSE)

</div>

A mod for **[Girl Life — English Community Version](https://gitlab.com/kevinsmartstfg/girl-life)** (an adult 18+ life-sim game for the QSP engine) that makes the Pavlovsk school routine optional, so your mornings are yours again.

**Download:** grab `glss.qsp` from the [latest release](https://github.com/xBandaku/Girl-Life-School-Skip/releases/latest) — every version is published on the [Releases page](https://github.com/xBandaku/Girl-Life-School-Skip/releases).

Vanilla Girl Life expects Sveta at school every weekday from 8:00 to 14:00, one clicked-through lesson at a time — and skipping it means climbing an absence ladder of angry mother confrontations that ends in expulsion. GLSS gives you two ways out, both toggleable in-game and **off by default**:

## Features

### One-click school day
A new action in the school hallway — *"GLSS: Attend the whole/rest of the school day automatically"*. Sveta sits through every remaining lesson with average participation and the clock jumps to the end of the school day. Attendance, homework, and grade gains are credited through the game's own grades system.

### Ghost attendance
School simply happens without you. On every school day from 8:00, attendance and average grades are credited automatically no matter where Sveta is. No absences accrue, her mother never confronts her, and truancy can no longer get her expelled.

### Auto-lunch (optional)
On automated school days, Sveta feeds herself: a bagged lunch from home if she lives at her parents' place, otherwise cafeteria food (50 ₽) if she can afford it, otherwise she goes without. Off by default so diets and budgets stay in your hands.

### What the mod deliberately does *not* do
- Automated days use average participation — playing lessons yourself remains slightly better for grades.
- The school's social life (friendships, gossip, cheerleading, classroom events) only progresses when you attend in person.
- Special morning scenes (principal summons, grade postings, invitations) still play out normally when you show up — the one-click action never bypasses them.

## Installing

1. Download `glss.qsp` from the [latest release](https://github.com/xBandaku/Girl-Life-School-Skip/releases/latest), or build it yourself (below).
2. Copy it into the `mod` folder of your Girl Life install — create the folder next to `glife.qsp` if it doesn't exist.
3. In game: **Settings → Mods → install new mod** → enter `glss`.
4. Click the mod's **Options** link and enable the features you want.

Both features only apply to the schoolgirl start, during term time, while enrolled and not expelled. The mod adds no new save variables you need to worry about — it can be enabled or disabled mid-playthrough.

## Building from source

The mod source lives in [`glss/locations/`](glss/locations/) (standard Girl Life `.qsrc` mod locations, manifest in `glss/glss.qproj`).

Building requires a checkout of the upstream game at `reference/nightly` (not included in this repo):

```
git clone https://gitlab.com/kevinsmartstfg/girl-life.git reference/nightly
```

Then run `glss/Make_mod.bat` (Windows) or `glss/Make_mod.sh` (Linux/macOS). Either compiles the locations with the upstream `qsp-cli` into `glss.qsp`.

See [`glss/README.md`](glss/README.md) for design notes on how the mod hooks the game (dispatcher injection via `$curacts`, absence-counter mirroring, once-per-day grade crediting).

## Credits

- [Girl Life — English Community Version](https://gitlab.com/kevinsmartstfg/girl-life) and its contributors — the base game, its mod framework, and all tooling used to build this mod.

## Note

Girl Life is an adult game intended for players 18 years of age or older. This repository contains no game content or assets — only mod source code.
