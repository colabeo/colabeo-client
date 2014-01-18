This contains tools to package famo.us for distribution.

Place this repository in project root to use.

Usage: 
---------
( From project root: )
```
cd pkgtool
make
cd ../build
```

At this point, you have a fully minified demo ready for uploading to amazon's S3. 


Exceptions: 
---------
- If you have any extra css files, please ensure that they are included in build/index.html


Uploading to amazon: 
---------

(inside of build folder)
```
aws s3 sync . s3://demo.famo.us/folderName --acl public-read
```
Docs on s3 sync: 
http://docs.aws.amazon.com/cli/latest/reference/s3/sync.html?tag=ecosia-20



To clean:
---------
```
make clean
```


Installing Amazon's CLI:
---------
http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html#install-with-pip

```
# (if you do not have pip)
sudo easy_install pip

sudo pip install awscli
```


Configuring Amazon's CLI:
---------
http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#d0e726
```
aws configure
```
