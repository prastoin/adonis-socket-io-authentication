# Adonis & Socket-io authentication example

This repo illustrates the following article `ARTICLE_LINK`.
It contains a working and tested `socket-io` + `adonis` authentication implementation. For both `Web Auth` and `API tokens` Adonis authentication modes.

## [Web Auth](https://docs.adonisjs.com/guides/auth/web-guard)

You can find `web auth` verification code here [start/socket.ts](start/socket.ts) →

Related tests here [test/WebAuthSocketAuthentication.spec.ts](test/WebAuthSocketAuthentication.spec.ts) →

## [API Tokens](https://docs.adonisjs.com/guides/auth/api-tokens-guard)

You can find `API token` verification code here [start/socket.ts](start/socket.ts) →

Related tests here [test/ApiTokensSocketAuthentication.spec.ts](test/ApiTokensSocketAuthentication.spec.ts) →

## Setup

### Install deps

Install dependencies with yarn by running

```
yarn
```

### Database

Before running any commands you will need to launch the database by running:

```bash
docker-compose up -d
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command     | Action                                      |
| :---------- | :------------------------------------------ |
| `yarn test` | Run tests                                   |
| `yarn dev`  | Starts local dev server at `localhost:3333` |
