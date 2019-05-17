# WS Anywhere

#### Customizable WebSocket test server in 3 easy steps:
- [Fork me](https://github.com/c-hive/ws-anywhere/fork)
- Deploy somewhere
- Set responses on the server's UI

#### Heroku setup

If the target deployment service is Heroku, you should also add `mLab` to the plugins list.

```bash
export HEROKU_APP=ws-anywhere

heroku apps:destroy --confirm $HEROKU_APP
heroku create $HEROKU_APP

heroku addons:create mongolab

heroku git:remote
git push heroku master

heroku ps:scale web=1
```

## Features

- Send custom message on message received
- Send custom message periodically
- Disconnect from clients
