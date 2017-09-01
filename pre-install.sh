#!/bin/sh

# Check OS version must be minimum 10.12
versions=$(sw_vers)
echo ${versions}
if [[ ! $versions =~ ProductVersion\:.10\.1[2-9] ]]; then
    osascript <<'END'
        tell app "System Events"
            display dialog "Minimum operating system version is OS X Sierra 10.12.\n\nAborting install" buttons {"OK"} default button 1 with icon caution with title "Fortify"
            return  -- Suppress result
        end tell
END
    exit 1
fi

# Kill Fortify app
pkill Fortify || true