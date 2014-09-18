#!/bin/bash

traceur --symbols true --out compiled_admin.js --script admin.js
node compiled_admin.js "$@"