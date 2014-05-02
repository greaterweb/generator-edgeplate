#!/bin/bash
# @company Daily Raisin LLC
# @author Joe Kovach
# @role Starts or stops a remote node service that is running with node-ctrl.sh
# @usage: ./remote.sh {dev|www} {start|stop}

#get target directory and port numbers from config file - created by grunt build and package.json values
source ./.config.sh

case "$1" in
www)
    PORT=$WWW_PORT;
;;
dev)
    PORT=$DEV_PORT;
;;
*)
    echo "Usage: $0 {dev|www} {start|stop}";
    exit 1
esac
DST_PATH="/www/$DIR/$1"

case "$2" in
start)
    #ok to pass through
;;
stop)
    #ok to pass through
;;
*)
    echo "Usage: $0 {dev|www} {start|stop}";
    exit 1
esac

echo ssh $HOST "/usr/local/bin/node-ctrl.sh $DST_PATH/app.js $PORT $2; exit" ;
ssh $HOST "/usr/local/bin/node-ctrl.sh $DST_PATH/app.js $PORT $2; exit" ;
