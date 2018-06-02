butter-test-streamers: test for all your butter streamers
===

A butter streamer should depend on 2 things:
https://github.com/butterstreamers/butter-streamer the base class for
all streamers and this package.

to use this package just add it to your devDependencies

```sh
npm i --dev butter-test-streamer
```

```sh
yarn add -D butter-test-streamer
```

and add it to your `package.json`
```js
    "butter": {
        "testArgs": "streamerName?url=https://google.com&port=2093"
    },
    "scripts": {
        "tests": "mocha node_modules/butter-test-streamer/*.js"
    }
```
