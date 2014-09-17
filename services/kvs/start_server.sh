#!/bin/bash

traceur --symbols true --out compiled_server.js --script server.js
node compiled_server.js