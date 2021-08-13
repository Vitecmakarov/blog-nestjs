# Nest js Simple BLog

## Description

[Nest js](https://github.com/nestjs/nest) simple blog app, using TypeORM and MYSQL.

## Installation

```bash
$ npm install
```

## Running the app

Rename .env.example to .env and configure it as you wish

Then:
```bash
# running mysql server
$ docker-compose up

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Generating init migration

Drop folder: migrations

Then:
```bash
# running mysql server
$ docker-compose up

# build app
$ npm run build

# generate migration
$ npm run migration-generate

# rebuild app
$ npm run build
```
Then run app in dev or prod mode.