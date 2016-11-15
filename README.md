## Hi!

I built this because the metrics boards I wanted to use were too expensive. It's pretty shoddy right now, but it does the job, and I'm sure with a little community effort we could make this really useful. 

It's built to run on [Heroku](http://heroku.com). Built off [this](https://github.com/fullstackreact/food-lookup-demo) example, so checkout the "deploying" section there. After you do that, you'll have to provision a Postgres and Redis DB (free tier should be fine), and then set the environment variables for local development. The DB is setup for multiple accounts (each account has a mixpanel token) and multiple users, but there is nothing in the web app for adding that or switching between acounts, so you'll have to add acounts and users via the Heroku CLI and add the functionality to switch accounts, if you want it.

New to Node, so I closely followed PG pool example
https://github.com/brianc/node-postgres/wiki/Example

To Do:
- [ ] Add more integrations (right now only mixpanel)
- [ ] Add more display options (like graphs)
- [ ] Add ability to compute formulas
- [ ] Drag and drop UI
