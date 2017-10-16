#  Setting up and getting started
## Installations

In order to get started, we need to install all the required depenedencies listed in the package and bower files. Before doing either of these you will need to ensure you have installed NodeJS server, as was indicated in the getting started guide

```
npm install
bower install
```

## Run the App

To run the app, we need to start our file with NodeJS service:
```
npm run start
```

## Deploy the app

If you want to deploy this application to your Predix Space, we need to use gulp to create our built application and then cloud foundry to push the application to Predix:
```
gulp build
cf push
```

## Need Help

If you get stuck, either ask one of the team, or see if you can tackle the problem yourself

## Endpoint Testing

To test your endpoints, simply click the cog on any of the cards, and enter your endpoint URL in its respective field, click update and see if it works!
