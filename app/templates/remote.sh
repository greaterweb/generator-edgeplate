#!/bin/bash
# @company Daily Raisin LLC
# @author Joe Kovach
# @role Starts or stops a remote node service that is running with node-ctrl.sh
# @usage: ./remote.sh {dev|www} {start|stop} [--debug]

#get target directory and port numbers from config file - created by grunt build and package.json values
source ./.config.sh

case "$1" in
www)
    ENV="production"
    PORT=$WWW_PORT;
;;
dev)
    ENV="development"
    PORT=$DEV_PORT;
;;
*)
    echo "Usage: $0 {dev|www} {start|stop} [--debug]";
    exit 1
esac
DST_PATH="/www/$DIR/$1/server"

case "$2" in
start)
    #ok to pass through
;;
stop)
    #ok to pass through
;;
*)
    echo "Usage: $0 {dev|www} {start|stop} [--debug]";
    exit 1
esac
COMMAND=$2

DO_DEBUG=""
# get optional --debug as fourth argument, if it’s set then $DO_DEBUG == true
argc="$@ flubber"
x=0
# x=0 for unset variable
for arg in $argc
    do
        case $x in
            "--debug" )
                DO_DEBUG="--debug";;
        esac
        x=$arg
done

echo ssh $HOST "/usr/local/bin/node-ctrl.sh $DST_PATH/server.js $PORT $ENV $COMMAND $DO_DEBUG; exit" ;
ssh $HOST "/usr/local/bin/node-ctrl.sh $DST_PATH/server.js $PORT $ENV $COMMAND $DO_DEBUG; exit" ;
