#!/bin/bash

find src/galleries -name "*.md" | while read fname; do
  if [[ ! "$fname" =~ .*"index.md" ]]
  then
    dateAlreadyThere=$(grep -c "date:" "$fname")
    if [ "$dateAlreadyThere" == "0" ]
    then
      yfmAlreadyThere=$(grep -c "\-\-\-" "$fname")
      photoDate=$(git log --diff-filter=A --follow --format=%aI -- "$fname" | tail -1 | sed -e "s/T/ /" | sed -e "s/+/ +/")
      echo "$fname"
      echo " -> $photoDate"
      if [ "$yfmAlreadyThere" == "0" ]
      then
        echo "---" >> "$fname"
      fi
      echo "date: $photoDate" >> "$fname"
      if [ "$yfmAlreadyThere" == "0" ]
      then
        echo "---" >> "$fname"
      fi
    fi
  fi
done
