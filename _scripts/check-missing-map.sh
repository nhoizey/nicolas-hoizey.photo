#!/bin/sh

missing_map=$(find src/collections/photos/ -mindepth 1 -type d '!' -exec test -e "{}/map.png" ';' -print | wc -l)
missing_map="$((missing_map + 0))"
if [ ! "$missing_map" -eq "0" ]
then
  echo "Run ./_scripts/generate-map-images.js to generate missing map.png files"
  exit 1
fi
exit 0
