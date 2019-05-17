# WS Anywhere

#### Customizable WebSocket test server in 3 easy steps:
- [Fork me](https://github.com/c-hive/ws-anywhere/fork)
- [Deploy me](https://github.com/c-hive/ws-anywhere#deployment)
- Set responses on the server's UI

## Features

- Send custom message on message received
- Send custom message periodically
- Disconnect from clients

## Deployment

Use this script te (re)set the app in an idempotent way on Heroku.

```bash
export HEROKU_APP=ws-anywhere

heroku apps:destroy --confirm $HEROKU_APP
heroku create $HEROKU_APP

heroku addons:create mongolab

heroku git:remote
git push heroku master

heroku ps:scale web=1
```