#!/bin/sh

all:
	node pkgmodules.js > buildConfig.js
	r.js -o buildConfig.js out=famous.lib.js
	sh makeSite.sh

clean:
	rm -f buildConfig.js famous.lib.js wrapper.js
