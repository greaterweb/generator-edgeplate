#!/bin/bash
# @company Daily Raisin
# @author Joe Kovach
# @role show streaming remote logs with tail over ssh
# @usage: ./tail-log.sh {dev|www} {apache|express}";

#get target directory and port numbers from config file - created by grunt build and package.json values
source ./.config.sh

case "$1" in
www)
    PORT=$WWW_PORT;
    PREFIX="www"
;;
dev)
    PORT=$DEV_PORT;
    PREFIX="dev"
;;
*)
    echo "Usage: $0 {dev|www} {apache|express}";
    exit 1
esac

case "$2" in
express)
    LOG="/var/tmp/server.js-$PORT.out"
;;
apache)
    LOG="/var/log/httpd/$PREFIX.$BASEDOMAIN"
;;
*)
    echo "Usage: $0 {dev|www} {apache|express}";
    exit 1
esac

ssh $HOST "/usr/bin/tail -f $LOG"
