rm -rf ../build/
mkdir ../build
mkdir ../build/css
mkdir ../build/img
mkdir ../build/data
mkdir ../build/js

cp ../favicon.ico ../build/favicon.ico
cp -r ../css/ ../build/css/
cp -r ../img/ ../build/img/
cp -r ../data/ ../build/data/
cp index.html ../build/index.html
cp famous.lib.js ../build/famous.lib.js
cp ../js/app.js ../build/app.js

# remove defines : replace the first line of your app.js with Famous(function.. 
sed 1s/.*/Famous\(function\(require\,exports\,module\)\{/ ../build/app.js > tmpFile.js

# copy license into app.js
cat license.js tmpFile.js >> tmpFile2.js
mv tmpFile2.js ../build/app.js
rm tmpFile.js

# famous-ui images
mkdir ../build/js/famous-ui/
mkdir ../build/js/famous-ui/img/
cp ../js/famous-ui/img/arrowRight.svg ../build/js/famous-ui/img/

# november-base-core images
mkdir ../build/js/core
cp ../js/core/famous.svg ../build/js/core/
cp ../js/core/famous_black.svg ../build/js/core/
cp ../js/core/famous_outline.svg ../build/js/core/
cp ../js/core/next.svg ../build/js/core/
cp ../js/core/plus.svg ../build/js/core/
cp ../js/core/x.svg ../build/js/core/
