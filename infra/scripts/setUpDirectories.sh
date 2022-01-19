#!/bin/bash
checkThenCreateDir () {
    name=$1
    if [ ! -d $name ]
    then
        echo "create dir: $name"
        mkdir $name
    else
        echo "already exist dir: $name"
    fi
}

cd /home/ubuntu
checkThenCreateDir log

# clean up old source code
if [ -d molink-hierarchy-live ]
then
    echo "clean up: molink-hierarchy-live"
    rm -r molink-hierarchy-live
    mkdir molink-hierarchy-live
else
    echo "create dir: molink-hierarchy-live"
    mkdir molink-hierarchy-live
fi
