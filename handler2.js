'use strict';
const https = require('https');

var mysql = require('mysql');

let host = 'https://graph.facebook.com/v10.0';
let appId = '2535433576750588';
let secretId = '0f4c9738c1e749e4ac168bd0a5f9b891';
let redirect_uri = 'https://example.com/';
var accessToken;
var idFromAccounts;
var instaBusinessAccountId;
let dataString = '';
module.exports.hello2 = async (event, context, callback) => {
  // context.callbackWaitsForEmptyEventLoop = false;

  console.log(`My first log ${event}`);
  var connection = mysql.createConnection({
    host: 'igdatabase.cq6tppj9wtkz.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Neelansh123',
    database: 'dummy'
}); 

const { queryStringParameters } = event;
if (!queryStringParameters || !queryStringParameters.userId) {
    callback(null,{
        statusCode: 400,
        message: 'Please provide the userId!'
    });
}

const accessTokenCall = await new Promise((resolve, reject) => {
    connection.connect(function(err) {
        if (err) {
            console.error('Database connection failed: ' + err.stack);
            // context.fail();
            return;
        }
      else{ 
            console.log('Connected to database.');

            connection.query(`SELECT * FROM USERS WHERE ID = ${queryStringParameters.userId}`, function (error, results, fields) {
                if (error) {
                    console.log("error showing tables: connection failed with db!");
                    connection.destroy();
                    console.log(error);
                } else {
                    // connected!
                    console.log("info: connection ok with db!");
                    console.log(results);
                    // context.succeed("done");
                    // callback(error, results);
        
                    accessToken = results[0].TOKEN;
                    console.log(`Got the access token:  ${accessToken}`);
                    resolve(accessToken);
                }
            });
        }
    });
});
            dataString = '';
            //FETCHING MY ACCOUNTS
            const myAccountsResponse = await new Promise((resolve, reject) => {
                
                const url = `${host}/me/accounts?access_token=${accessToken}`;
                const req = https.get(url, function(res) { 
                  if(res.statusCode!=200){
                    console.log(res);
                    resolve({
                        statusCode: res.statusCode,
                        body: 'Error getting accounts!'
                    })
                  }
                  res.on('data', chunk => {
                    dataString += chunk;
                  });
                  res.on('end', () => {
                    resolve({
                        statusCode: 200,
                        body: JSON.parse(dataString),
                        url : url
                    });
                  });
                });
                
                req.on('error', (e) => {
                  reject({
                      statusCode: 500,
                      body: 'Something went wrong!'
                  });
                });
            });
            console.log(JSON.stringify(myAccountsResponse));
            if(myAccountsResponse && myAccountsResponse.body && myAccountsResponse.body.data && myAccountsResponse.body.data[0].id){
                console.log(`Got the id from me/accounts  ${myAccountsResponse.body.data[0].id}`);
                idFromAccounts = myAccountsResponse.body.data[0].id;
            }
            console.log(idFromAccounts);


            dataString = '';
    
            //FETCHING MY ACCOUNTS
            const instaBusinessAccountResponse = await new Promise((resolve, reject) => {
                
                const url = `${host}/${idFromAccounts}?fields=instagram_business_account&access_token=${accessToken}`;
                const req = https.get(url, function(res) { 
                  if(res.statusCode!=200){
                    console.log(res);
                    resolve({
                        statusCode: res.statusCode,
                        body: 'Error getting instagram_business_account id!'
                    })
                  }
                  res.on('data', chunk => {
                    dataString += chunk;
                  });
                  res.on('end', () => {
                    resolve({
                        statusCode: 200,
                        body: JSON.parse(dataString),
                        url : url
                    });
                  });
                });
                
                req.on('error', (e) => {
                  reject({
                      statusCode: 500,
                      body: 'Something went wrong!'
                  });
                });
            });

            console.log(JSON.stringify(instaBusinessAccountResponse));
            if(instaBusinessAccountResponse && instaBusinessAccountResponse.body && instaBusinessAccountResponse.body.instagram_business_account && instaBusinessAccountResponse.body.instagram_business_account.id){
                console.log(`Got the instaBusinessAccount id:  ${instaBusinessAccountResponse.body.instagram_business_account.id}`);
                instaBusinessAccountId = instaBusinessAccountResponse.body.instagram_business_account.id;
            }

            dataString = '';
    
            //FETCHING INSTA ACCOUNTS DETAILS
            const accountDetailResponse = await new Promise((resolve, reject) => {
                
                const url = `${host}/${instaBusinessAccountId}?fields=biography,followers_count,follows_count,media_count,name,username,profile_picture_url&access_token=${accessToken}`;
                const req = https.get(url, function(res) { 
                  if(res.statusCode!=200){
                    resolve({
                        statusCode: 400,
                        body: 'Error getting instagram_business_account id!'
                    })
                  }
                  res.on('data', chunk => {
                    dataString += chunk;
                  });
                  res.on('end', () => {
                    resolve({
                        statusCode: 200,
                        body: JSON.parse(dataString),
                        url : url
                    });
                  });
                });
                
                req.on('error', (e) => {
                  reject({
                      statusCode: 500,
                      body: 'Something went wrong!'
                  });
                });
            });
            
            dataString = '';
            //FETCH ACCOUNT INSIGHTS
            const accountInsights = await new Promise((resolve, reject) => {
                var until = Math.floor(Date.now() /1000);
                var since = Math.floor((new Date().setDate(new Date().getDate() - 30))/1000);
                console.log(until);
                console.log(since);
                const url = `${host}/${instaBusinessAccountId}/insights?until=${until}&since=${since}&period=day&metric=impressions,profile_views,reach&access_token=${accessToken}`;
                const req = https.get(url, function(res) { 
                  console.log(res);
                  if(res.statusCode!=200){
                    resolve({
                        statusCode: 400,
                        body: 'Error getting insta insights!'
                    })
                  }
                  res.on('data', chunk => {
                    dataString += chunk;
                    console.log(dataString);
                  });
                  res.on('end', () => {
                    resolve({
                        statusCode: 200,
                        body: JSON.parse(dataString),
                        url : url
                    });
                  });
                });
                
                req.on('error', (e) => {
                  reject({
                      statusCode: 500,
                      body: 'Something went wrong!'
                  });
                });
            });

    connection.end();
    console.log('reached end');
    //Send API Response
    callback(null, {
        statusCode: '200',
        body: JSON.stringify({
          'account': accountDetailResponse,
          'insights' : accountInsights
        }),
        headers: {
          'Content-Type': 'application/json',
        },
    });
  

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
}
