#!/bin/bash
# @company Daily Raisin LLC
# @author Joe Kovach
# @role generate the favicon images needed nowadays
# @usage: ./favicon.sh

#dependencies:
#   brew install imagemagick
#   brew install pngcrush
#   brew install png2ico
#   (a file named app/images/favicon-master.png)
FAVPATH="app/images/favicon"

# create these sizes from a large source image favicon-master.png
for DIM in 16 32 48 57 64 72 96 114 120 128 144 152 195 228
do
    convert -resize ${DIM}x${DIM} ${FAVPATH}/favicon-master.png favicon-${DIM}.png
    pngcrush -rem allb -brute -reduce favicon-${DIM}.png favicon-${DIM}-crushed.png
    mv favicon-${DIM}-crushed.png favicon-${DIM}.png
done

#put png icons into the ico
png2ico --colors 16 favicon.ico favicon-16.png favicon-32.png favicon-48.png favicon-64.png

#move pngs and ico to root directory
for DIM in 16 32 57 72 96 114 120 128 144 152 195 228
do
    mv favicon-${DIM}.png $FAVPATH
done
mv favicon.ico app/

# don’t need 64 and 48 sizes outright, only part of the ico file, so remove them
for DIM in 48 64
do
    rm favicon-${DIM}.png
done
