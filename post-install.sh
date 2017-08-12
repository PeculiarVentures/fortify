#!/bin/sh

# Switch back to user

/usr/bin/sudo -u $USER

# Launch app
# We need to set TMPDIR variable for MAC's commands
# create new tmp dir, because we are in sandbox 
DIR_APP=$HOME/.fortify
if [ ! -f $HOME ]; then
    mkdir $DIR_APP
    chown -R $USER $DIR_APP
fi
TMPDIR=$DIR_APP open /Applications/Fortify.app
# launchctl start com.peculiarventures.fortify

exit 0