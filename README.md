#FeedHenry.App
FeedHenry App is a Native version of RedHat mobile platform. It could install Apps built on RedHat Mobile Platform directly to connected mobile devices.

#Build

##Pre-requests

Following packages / components are required
* npm install -g electron-packager //packer for the app
* brew install libimobiledevice
* brew install ideviceinstaller
* $ANDROID_HOME env var points to android sdk folder

##Build

Run following script in source folder
```bash
#!/bin/bash
electron-packager ./ FeedHenry --platform=all --arch=x64 --version=0.29.1 --out=./dist --icon=./appIcon.icns --app-bundle-id=com.feedhenry --app-version=1.0.0  --version-string="{CompanyName:'FeedHenry','LegalCopyright':'FeedHenry License'}"

```

It will generate runnable executables in ./dist/ folder.
