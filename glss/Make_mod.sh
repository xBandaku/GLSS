#!/usr/bin/env bash
set -e

# GLSS mod build - compiles locations/*.qsrc into glss.qsp.
# Uses the qsp-cli from the reference Girl Life checkout, which ships one binary per OS.
case "$OSTYPE" in
	linux-gnu*) QSPCLI=../reference/nightly/tools/qsp-cli ;;
	darwin*) QSPCLI=../reference/nightly/tools/qsp-cli-mac ;;
	*) echo "ERROR: unsupported OSTYPE '$OSTYPE'. Use Make_mod.bat on Windows." >&2; exit 1 ;;
esac

if [ ! -f "$QSPCLI" ]; then
	echo "ERROR: $QSPCLI not found. Adjust QSPCLI in this script." >&2
	exit 1
fi

"$QSPCLI" --compile locations glss.qsp glss.qproj --no-builddate

echo
echo "Built glss.qsp"
echo "Copy it into your game's \"mod\" folder and enable it in Settings > Mods (mod name: glss)."
