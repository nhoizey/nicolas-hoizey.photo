#!/bin/sh
glyphhanger https://nicolas-hoizey.photo/tools/subset --subset=./assets/font/*.ttf --formats=woff2,woff --output=./src/ui/fonts/ | head -1

