#!/bin/sh
glyphhanger https://nicolas-hoizey.photo/tools/subset.html --subset=./assets/font/*.ttf --formats=woff2,woff --css
mv ./assets/font/*-subset.woff* ./src/ui/fonts/
