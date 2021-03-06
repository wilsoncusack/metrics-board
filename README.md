## Hi!

I built this because the metrics boards I wanted to use were too expensive. It's pretty shoddy right now, but it does the job, and I'm sure with a little community effort we could make this really useful. 

To get it working:
If you're already setup on Heroku, skip these steps

Sign up on [Heroku](http://heroku.com/)
Download the [Heroku Toolbelt](https://devcenter.heroku.com/articles/heroku-command-line)

Then

Clone the repo
```
git clone https://github.com/wilsoncusack/metrics-board.git
```
Change directory into the app and create a heroku app 
```
cd metrics-board
heroku apps:create your-app-name
```

Provision a Postgres Database
```
heroku addons:create heroku-postgresql:hobby-dev
```
(More info [here](https://devcenter.heroku.com/articles/heroku-postgresql#provisioning-the-add-on))

Provision a Redis Database
```
heroku plugins:install heroku-redis
heroku addons:create heroku-redis:hobby-dev -a your-app-name
```
(This will require a credit card, but you won't be billed below a certain usage. More info [here](https://devcenter.heroku.com/articles/heroku-redis))

Write the credentials to your enviroment
```
source env.sh
```

Then, to run locally (which will run a migration)
```
npm run dev
```

There is currently nothing setup client side to add to the accounts or users table. 

You can add to the accounts by using the Heroku Postgres CLI
```
heroku pg:psql DATABASE_URL
```
And then once you're in 
```
INSERT INTO accounts (name, mixpanel_api_secret) values (YOUR_NAME, YOUR_MIXPANEL_API_SECRET);
```
Or, with the server running
```
curl --data "accountName=YOUR-ACCOUNT-NAME&mixpanelAPISecret=YOUR-MIXPANEL-API-SECRET" localhost:3001/api/account
```

To add a user, with the server running, cURL (sorry there isn't a better way yet)
```
curl --data "username=YOUR-USERNAME&password=YOUR-PASSWORD&accountID=1&accountAdmin=true" localhost:3001/api/user
```
Account ID should be 1, unless you already created an account some other way.

To deploy, first build
```
cd client
npm run build
```

Then add the build
``` 
cd ..
git add client/build
git add .
git commit -m "adding build"
```
and push
```
git push
git push heroku master
```

It's built to run on [Heroku](http://heroku.com). Used [this](https://github.com/fullstackreact/food-lookup-demo) example for the client/server setup.

New to React, so I'm sure I'm not using it well.

New to Node, so I closely followed PG pool example
https://github.com/brianc/node-postgres/wiki/Example

Note: the demo site is insecure, so you should not use sensitive data on it. 

To Do:
- [ ] Add account invite/new authentication. Right now anyone can add themselves to an account via a cURL request. 
- [ ] Add ability to edit/delete widgets
- [ ] Add more integrations (right now only mixpanel)
- [ ] Add more widgets/display options (like graphs). Will also then need to add widget type to the widget table in the db.
- [ ] Add ability to compute formulas
- [ ] Drag and drop UI
- [ ] Add ability to create an account, client side
- [ ] Add ability to add and remove users from account, client side
