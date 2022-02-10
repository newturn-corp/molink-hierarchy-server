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
if [ -d hierarchy ]
then
    echo "clean up: hierarchy"
    rm -r hierarchy
    mkdir hierarchy
else
    echo "create dir: hierarchy"
    mkdir hierarchy
fi
