# WS Anywhere

#### Customizable WebSocket test server in 3 easy steps:
- [Fork me](https://github.com/c-hive/ws-anywhere/fork)
- Deploy somewhere(MongoDB is required)
- Set responses on the server's UI

#### Heroku setup

If the target deployment service is Heroku, here is an example script that sets up the environment automatically.

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
