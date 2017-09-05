# check if Firefox is running
if  pgrep -x "firefox" > /dev/null
then
    echo "Reopen Firefox"
    osascript <<'END'
        quit app "Firefox"
        repeat
            if application "Firefox" is not running then exit repeat
            delay 3
        end repeat
        open app "Firefox"
END
fi