#!/usr/bin/env bash
set -e

# GLSS mod build - compiles locations/*.qsrc into glss.qsp.
# Uses the qsp-cli from the reference Girl Life checkout.
QSPCLI=../reference/nightly/tools/qsp-cli

if [ ! -f "$QSPCLI" ]; then
	echo "ERROR: $QSPCLI not found. Adjust QSPCLI in this script." >&2
	exit 1
fi

"$QSPCLI" --compile locations glss.qsp glss.qproj --no-builddate

echo
echo "Built glss.qsp"
echo "Copy it into your game's \"mod\" folder and enable it in Settings > Mods (mod name: glss)."
