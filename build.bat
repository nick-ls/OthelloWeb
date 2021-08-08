@echo off
time /T
date /T
node build
tsc
echo "Successfully built..."