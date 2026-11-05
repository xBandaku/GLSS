# Development requirements

## Fresh Windows installation

This guide starts with a fresh Windows 10/11 x64 installation and no development
tools. You need a browser, an internet connection, permission to install
software, and free disk space for the game reference. Follow the steps in order;
stop and resolve any error before continuing.

GLSS is a QSP mod. This workflow needs Git, Node.js with npm, and the upstream
game reference. Python, Visual Studio, Docker, and a separate compiler install
are not required.

### 1. Install Git

1. Open [Git for Windows](https://git-scm.com/download/win) in your browser and
   download the x64 installer.
2. Run it and accept the Windows permission prompt if one appears. Keep the
   default options, including using Git from the command line and third-party
   software.
3. Finish the installation.

### 2. Install Node.js and npm

1. Open the [Node.js 24.22.1 downloads](https://nodejs.org/dist/v24.22.1/) and
   download `node-v24.22.1-x64.msi`. This is the version verified with GLSS.
2. Run it. Keep the npm package manager and Add to PATH features enabled. The
   optional tools for compiling native modules are not needed.
3. Finish installation and close any terminal windows that were already open.

### 3. Check the tools

Open the Start menu, type **PowerShell**, and open **Windows PowerShell**.
Run these commands one line at a time:

```powershell
git --version
node --version
npm.cmd --version
```

Each command must print a version. The installer above provides Node `v24.22.1`
with npm `11.19.1`. If a command is not recognized, check that installation
completed with PATH enabled, then close and reopen PowerShell.

Use `npm.cmd` as shown below so PowerShell's script execution policy does not
block `npm.ps1`. You do not need to change the execution policy.

### 4. Download GLSS

This example puts the project in a `source` folder under your Windows user
profile. It does not require a `D:` drive. Run each line:

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\source" | Out-Null
Set-Location "$env:USERPROFILE\source"
git clone https://github.com/xBandaku/GLSS.git
Set-Location GLSS
```

If you already downloaded GLSS, open that folder instead of cloning another
copy. The project root contains `README.md`, `REQUIREMENTS.md`, and the `glss`
subfolder. All remaining commands start in that project root.

### 5. Install the reference and packages

The reference supplies both the QSP compiler and game code used by tests.
These commands fetch the exact revision used by this project's CI:

```powershell
git init reference/nightly
git -C reference/nightly fetch --depth 1 https://gitlab.com/kevinsmartstfg/girl-life.git 83b164f64224f1ba88fd409469c1a9379ad34f86
git -C reference/nightly checkout --detach FETCH_HEAD
npm.cmd ci --prefix glss/tests --ignore-scripts
```

These reference setup commands assume a fresh `reference/nightly` directory.
Preserve any existing checkout or local work before switching its revision.
Treat the reference as read-only after setup. Do not substitute the latest game
revision when reproducing CI results.

### 6. Build and test

```powershell
Set-Location glss
cmd /c Make_mod.bat
Set-Location ..
npm.cmd test --prefix glss/tests -- reference/nightly
```

The build should report seven compiled locations, and the test suite should
report `44 regression cases passed`. The output is `glss/glss.qsp`; building
overwrites that tracked file. Tests exercise source and compiled code, but do
not replace manual full-game testing.

For future sessions, open PowerShell, return to your project root, and repeat
step 6. For the example installation above:

```powershell
Set-Location "$env:USERPROFILE\source\GLSS"
```

Repeat `npm.cmd ci --prefix glss/tests --ignore-scripts` when the package
lockfile changes or you need to reinstall packages.

## Dependency reference

| Requirement | Version / source | Purpose |
| --- | --- | --- |
| Git | Git for Windows, available on PATH | Download GLSS and the game reference |
| Node.js with npm | Verified: Node 24.22.1, npm 11.19.1; CI uses Node 24 | Run the regression suite |
| Girl Life reference | Commit `83b164f64224f1ba88fd409469c1a9379ad34f86` | Compiler and real game code |
| `@qsp/converters` | `1.0.1` | Convert QSP sources in tests |
| `@qsp/wasm-engine` | `1.6.1` | Execute QSP regression cases |

The npm packages are declared in `glss/tests/package.json` and pinned with
integrity hashes in `glss/tests/package-lock.json`. `npm ci` installs those exact
versions. No `pip` requirements file is needed. The pinned game revision matches
`.github/workflows/ci.yml`.

## Linux

The fresh-OS walkthrough above targets Windows. On Linux, install Git, Node.js
24 with npm, and Bash following your distribution's instructions. Clone GLSS
and fetch the pinned reference with the Git commands above, then run from the
project root:

```bash
npm ci --prefix glss/tests --ignore-scripts
chmod u+x reference/nightly/tools/qsp-cli
(cd glss && bash Make_mod.sh)
npm test --prefix glss/tests -- reference/nightly
```

The compiler is included in the reference on Windows and Linux. macOS compiler
compatibility has not been verified.

## Existing portable setup in this workspace

This workspace also has an ignored portable Node.js installation at
`.tools/node-v24.22.1-win-x64`, verified against the published SHA-256 list. It
does not change the system PATH and is not included when someone clones GLSS.
New contributors should follow the installation steps above. To use this
existing portable copy from the project root:

```powershell
& ./.tools/node-v24.22.1-win-x64/npm.cmd ci --prefix glss/tests --ignore-scripts
& ./.tools/node-v24.22.1-win-x64/npm.cmd test --prefix glss/tests -- reference/nightly
```

## Playing the mod

To play, you need a Girl Life installation and a compatible QSP player. Git,
Node.js, and the development dependencies are only needed to build or test.
Follow the [README installation steps](README.md#installing) to load `glss.qsp`
in the game. This guide does not install or modify a playable game or save files.
