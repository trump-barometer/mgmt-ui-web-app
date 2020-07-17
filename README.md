# mgmt-ui-web-app

> Trump Barometer Web UI


First, create a .env like this in the root of the repo:
```
db_host=...
db_port=...
db_user=...
db_pw=...
db_name=...
port=...    --> optional!
```
It will be used by both the frontend and backend

## Build UI

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Build Backend

Then use the commands to run the application
```bash
# to make the frontend available via backend generate the ui first like described above!

# install dependencies
$ npm install

# serve with live reload on port 3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```
