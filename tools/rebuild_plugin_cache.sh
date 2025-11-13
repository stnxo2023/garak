#!/bin/bash

# Rebuild garak's plugin cache.
# Use from root of garak source checkout
# Invocation: 
#  $ tools/rebuild_plugin_cache.sh
# This script will alter timestamps of files in your garak source,
# and will overwrite the main copy of your garak plugin cache.

# abort on any failure
set -e

if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "This script should be run under GNU Linux only"
    exit 1
fi

rm ~/.cache/garak/resources/plugin_cache.json 
export TZ_GARAK_BAK=$TZ
export TZ=UTC
git ls-files garak/ -z | xargs -0 -I{} -- git log -1 --date=iso-local --format="%ad {}" {} | while read -r udate utime utz ufile ; do
  touch -d "$udate $utime" $ufile
done
touch -d "2024-07-01" garak/resources/plugin_cache.json
python -m garak --list_probes
cp ~/.cache/garak/resources/plugin_cache.json garak/resources/
export TZ=$TZ_GARAK_BAK
