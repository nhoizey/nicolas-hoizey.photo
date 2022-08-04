#!/bin/bash

found=0

while read fileName; do
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
      if [ "$photoDate" == "" ]
      then
        photoDate=$(date +"%Y-%m-%d %H:%M:%S %z")
      fi
      photoDate="${photoDate:0:23}:00"

      if [ "$yfmAlreadyThere" == "0" ]
      then
        echo "---" >> "$fileName"
        echo "date: $photoDate" >> "$fileName"
        echo "---" >> "$fileName"
      else
        tail -n +2 "$fileName" > "$fileName.tmp"
        echo "---" > "$fileName"
        echo "date: $photoDate" >> "$fileName"
        cat "$fileName.tmp" >> "$fileName"
        rm "$fileName.tmp"
      fi

      echo "$fileBasename"
      echo " -> $photoDate"
      echo ""
      found=1
    fi
  fi
done < <(find src/galleries -name "*.md")
# https://unix.stackexchange.com/a/21749/415372
# https://tldp.org/LDP/abs/html/process-sub.html

exit $found
