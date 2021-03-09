'use strict';
const https = require('https');

var mysql = require('mysql');

let host = 'https://graph.facebook.com/v10.0';
let appId = '2535433576750588';
let secretId = '0f4c9738c1e749e4ac168bd0a5f9b891';
let redirect_uri = 'https://example.com/';
var accessToken;
var instaBusinessAccountId;
let dataString = '';
module.exports.hello3 = async (event, context, callback) => {
  // context.callbackWaitsForEmptyEventLoop = false;

  console.log(`My first log ${event}`);
  var connection = mysql.createConnection({
    host: 'igdatabase.cq6tppj9wtkz.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Neelansh123',
    database: 'dummy'
}); 

const { queryStringParameters } = event;
if (!queryStringParameters || !queryStringParameters.username || !queryStringParameters.userId || !queryStringParameters.instaId) {
    callback(null,{
        statusCode: 400,
        message: 'Please provide the username!'
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
            //FETCH OTHER USER ACCOUNT INSIGHTS
            const otherUserAccountDetails = await new Promise((resolve, reject) => {
                const url = `${host}/${queryStringParameters.instaId}?fields=business_discovery.username(${queryStringParameters.username}){followers_count,media_count,media{comments_count,like_count}}&access_token=${accessToken}`;
                const req = https.get(url, function(res) { 
                  console.log(res);
                  if(res.statusCode!=200){
                    resolve({
                        statusCode: 400,
                        message: 'Error getting insta insights!'
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
          'userdetails': otherUserAccountDetails,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
    });
  

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
}
