<div align="center">
  
# GLSS (Girl Life School Skip)

[![Version](https://img.shields.io/github/v/release/xBandaku/GLSS?color=%230567ff&label=Latest%20Release&style=for-the-badge)](https://github.com/xBandaku/GLSS/releases/latest)
![Downloads](https://img.shields.io/github/downloads/xBandaku/GLSS/total?label=Total%20Downloads&style=for-the-badge)
[![License](https://img.shields.io/github/license/xBandaku/GLSS?style=for-the-badge)](LICENSE)

</div>

A mod for **[Girl Life — English Community Version](https://gitlab.com/kevinsmartstfg/girl-life)** (an adult 18+ life-sim game for the QSP engine) that makes the Pavlovsk school routine and the university routine optional, so your mornings are yours again.

**Download:** grab `glss.qsp` from the [latest release](https://github.com/xBandaku/GLSS/releases/latest) — every version is published on the [Releases page](https://github.com/xBandaku/GLSS/releases).

Vanilla Girl Life expects Sveta at school every weekday from 8:00 to 14:00, one clicked-through lesson at a time — and skipping it means climbing an absence ladder of angry mother confrontations that ends in expulsion. Later, university adds its own repetitive lecture grind across two degree programs. GLSS gives you a way out of both, all toggleable in-game and **off by default**:

## Features

### School

#### One-click school day

A new action in the school hallway — *"GLSS: Attend the whole/rest of the school day automatically"*. Sveta sits through every remaining lesson with average participation and the clock jumps to the end of the school day. Attendance, homework, and grade gains are credited through the game's own grades system.

#### Ghost attendance

School simply happens without you. On every school day from 8:00, attendance and average grades are credited automatically no matter where Sveta is. No absences accrue, her mother never confronts her, and truancy can no longer get her expelled.

#### Auto-lunch (optional)

On automated school days, Sveta feeds herself: a bagged lunch from home if she lives at her parents' place, otherwise cafeteria food (50 ₽) if she can afford it, otherwise she goes without. Off by default so diets and budgets stay in your hands.

### University

#### One-click university day

A new action on the campus and lecture-hall screens — *"GLSS: Attend the rest of your university day automatically"*. Credits every remaining lecture and any due exam with average participation and advances the clock to match. Covers both degree programs (nursing, teaching studies), semesters 1–4 — no lecture content exists for later semesters in the current game build.

#### Ghost university attendance

University simply happens without you: lectures and any due exam are credited automatically no matter where Sveta is. University expulsion is driven by missed or failed exams rather than an absence counter, so this is what delivers the "never expelled for skipping" guarantee here.

#### Auto-attend electives (optional)

Only takes effect together with one of the two university options above. Electives (Computers, Art, Psychology, African/Asian Studies) carry no grade weight and have no exam in the real game, so this just collects the small skill-point reward the "listen attentively" choice grants.

### What the mod deliberately does *not* do

- Automated days use average participation — attending lessons/lectures yourself remains slightly better for grades.
- The social life of each stage (friendships, gossip, cheerleading, classroom events at school; campus events and elective NPC content at university) only progresses when you attend in person.
- Special morning scenes (principal summons, grade postings, invitations) still play out normally when you show up — the one-click actions never bypass them.

## Installing

1. Download `glss.qsp` from the [latest release](https://github.com/xBandaku/GLSS/releases/latest), or build it yourself (below).
2. Copy it into the `mod` folder of your Girl Life install — create the folder next to `glife.qsp` if it doesn't exist.
3. In game: **Settings → Mods → install new mod** → enter `glss`.
4. Click the mod's **Options** link and enable the features you want.

The school features only apply to the schoolgirl start, during term time, while enrolled and not expelled; the university features only apply while enrolled at the university. The mod adds no new save variables you need to worry about — it can be enabled or disabled mid-playthrough.

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
