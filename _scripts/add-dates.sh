#!/bin/bash

find src/galleries -name "*.md" | while read fileName; do
  fileBasename=$(basename "$fileName")
  if [ ! "$fileBasename" == "index.md" ]
  then
    dateAlreadyThere=$(grep -c "date:" "$fileName")
    if [ "$dateAlreadyThere" == "0" ]
    then
      yfmAlreadyThere=$(grep -c "\-\-\-" "$fileName")
      # https://stackoverflow.com/a/32894198/717195
      photoDate=$(git log --all --diff-filter=A --pretty=%x0a%ci --name-only | awk '
/^$/        { dateline=!dateline; next }
dateline    { date=$0; next }
!seen[$0]++ { print date,$0 }
' | grep "$fileBasename" | head -1)
      photoDate="${photoDate:0:23}:00"
      if [ "$yfmAlreadyThere" == "0" ]
      then
        echo "---" >> "$fileName"
      fi
      echo "date: $photoDate" >> "$fileName"
      if [ "$yfmAlreadyThere" == "0" ]
      then
        echo "---" >> "$fileName"
      fi
      echo "$fileBasename"
      echo " -> $photoDate"
      echo ""
    fi
  fi
done
