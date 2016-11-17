export $(heroku config -s | grep DATABASE_URL)
export $(heroku config -s | grep REDIS_URL)