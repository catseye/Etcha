#!/bin/sh

if [ `which java`x = x ]; then
    echo "java not found, skipping tests."
else
    make java || exit 1
    falderal test README.markdown
fi


