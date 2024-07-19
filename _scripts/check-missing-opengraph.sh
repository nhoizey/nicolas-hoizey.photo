#!/bin/sh

missing_opengraph=$(find src/collections/photos/ -mindepth 1 -type d '!' -exec test -e "{}/opengraph.jpg" ';' -print | wc -l)
missing_opengraph="$((missing_opengraph + 0))"
if [ ! "$missing_opengraph" -eq "0" ]
then
  echo "Run ./_scripts/generate-opengraph-images.js to generate missing opengraph.jpg files"
  exit 1
fi
exit 0
