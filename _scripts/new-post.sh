#!/bin/sh

if [ -z "$1" ]; then
  echo "Usage: provide a title argument."
  exit -1
else
  title="$@"
fi

# Slugify, inspired by https://github.com/benlinton/bash-slugify/blob/master/slugify
slug=$(echo "$title" | tr "[:upper:]" "[:lower:]")
slug=$(echo "$slug" | sed "y/āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛ/aaaaeeeeiiiioooouuuuuuuuAAAAEEEEIIIIOOOOUUUUUUUU/")
slug=$(echo "$slug" | tr "[:punct:]" " ")
slug=$(echo "$slug" | tr _ " ")
slug=$(echo "$slug" | tr - " ")
slug=$(echo "$slug" | tr -s " ")
slug=$(echo "$slug" | tr "[:space:]" "-")
slug="${slug:0:${#slug}-1}"

year=$(date +"%Y")
month=$(date +"%m")
day=$(date +"%d")
hour=$(date +"%H")
minute=$(date +"%M")
second=$(date +"%S")

# Create year folder if it doesn't exist yet
folder="./src/blog/$year/$month/$day/$slug"
mkdir -p "$folder"

post="$folder/index.md"

if [ -f $post ]; then
   echo "File $post already exists."
   exit 1
fi

body=""
read -d '' body <<EOF
---
date: $year-$month-$day $hour:$minute:$second +02:00
title: '$title'
lang: en
tags: [ ]
---

EOF

echo "$body" > "$post"

/usr/local/bin/code "$post" &
