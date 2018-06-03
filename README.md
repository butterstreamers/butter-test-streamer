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

and add it to your `package.json`, note that we depend on standard, so you
don't have to do it in your package, just devDepend on us and we got you set.
```js
    "butter": {
        "testArgs": "streamerName?url=https://google.com&port=2093"
    },
    "scripts": {
        "lint": "standard --env mocha",
        "tests": "mocha node_modules/butter-test-streamer/*.js"
    }
```
