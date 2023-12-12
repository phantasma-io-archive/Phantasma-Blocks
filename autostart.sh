#!/bin/bash

# Setup the user path so you can have access to the bun command
#PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
cd /home/jnovo/Phantasma/Phantasma-Blocks/
while :
do
    # If the command exits (either successfully or due to an error), the following line will be executed
    bun run run-bun
done
