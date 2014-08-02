#!/bin/bash
# @company Daily Raisin LLC
# @author Joe Kovach
# @role rsync the distribution code to the server
# @usage: ./deploy.sh {dev|www}

#get target directory and port numbers from config file - created by grunt build and package.json values
CONFIG=./.config.sh

if ! [ -e $CONFIG ]
then
    echo "$(tput setaf 1)>>>$(tput sgr0) Missing $(tput setaf 3)" $CONFIG "$(tput sgr0) file. Let's generate one using $(tput setaf 2)gulp config.sh$(tput sgr0)"
    gulp config.sh
    if ! [ -e $CONFIG ]
        then
        echo "$(tput setaf 1)Something went wrong :-($(tput sgr0)"
        exit 1
    else
        echo "Attempting to deploy project"
    fi
fi

source $CONFIG

case "$1" in
www)
    PORT=$WWW_PORT;
;;
dev)
    PORT=$DEV_PORT;
;;
*)
    echo "$(tput setaf 1)>>>$(tput sgr0) Usage: $(tput setaf 2)$0 {dev|www}$(tput sgr0)";
    exit 1
esac
DST_PATH="/www/$DIR/$1"

#stop the node service
ssh $HOST "mkdir -pv $DST_PATH; /usr/local/bin/node-ctrl.sh $DST_PATH/server/server.js $PORT stop; exit" ;

#rsync
rsync -avz --delete-excluded --exclude-from=.excludes dist/$1/ -e ssh $HOST:$DST_PATH ;

#start the node service
ssh $HOST "cd $DST_PATH && npm install --production; /usr/local/bin/node-ctrl.sh $DST_PATH/server/server.js $PORT start; exit" ;
