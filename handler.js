'use strict';
const https = require('https');

var mysql = require('mysql');

let host = 'https://graph.facebook.com/v10.0';
let appId = '2535433576750588';
let secretId = '0f4c9738c1e749e4ac168bd0a5f9b891';
let redirect_uri = 'https://example.com/';
var accessToken;
module.exports.hello = async (event, context, callback) => {
  // context.callbackWaitsForEmptyEventLoop = false;

  console.log(`My first log ${event}`);
  var connection = mysql.createConnection({
    host: 'igdatabase.cq6tppj9wtkz.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Neelansh123',
    database: 'dummy'
});
    let dataString = '';
    
    //FETCHING THE ACCESS TOKEN
    const response = await new Promise((resolve, reject) => {
        const { queryStringParameters } = event;
        if (!queryStringParameters || !queryStringParameters.code) {
            resolve({
                statusCode: 400,
                message: 'Please provide the code!'
            })
        }
        const url = `${host}/oauth/access_token?client_id=${appId}&redirect_uri=${redirect_uri}&client_secret=${secretId}&code=${queryStringParameters.code}`;
        const req = https.get(url, function(res) { 
          if(res.statusCode!=200){
            resolve({
                statusCode: 400,
                body: 'Code was not correct!'
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
    

    if(response.body && response.body.access_token){
        accessToken = response.body.access_token;
        console.log(`Got the accessToken--->>> ${response.body.access_token}`);
    }
    
    //FETCHING THE USER NAME AND ID
        dataString = ''; 
        const userDataResponse = await new Promise((resolve, reject) => {
        
        const url = `${host}/me?access_token=${accessToken}`;
        const req = https.get(url, function(res) {
          if(res.statusCode!=200){
            resolve({
                statusCode: 400,
                body: 'Code was not correct!',
                url: url
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
    
    if(userDataResponse && userDataResponse.body){
    console.log(`Got the userData--->>> ${JSON.stringify(userDataResponse)}`);
    console.log(`Got the userData--->>> ${JSON.stringify(userDataResponse.body.name)}`);
    console.log(`Got the userData--->>> ${userDataResponse.body.name}`);
    console.log(`Got the userData--->>> ${userDataResponse.body.id}`);
    }
    
    console.log('heyyypppa!!');
    connection.connect(function(err) {
        if (err) {
            console.error('Database connection failed: ' + err.stack);
            // context.fail();
            return;
        }
      else{ 
            console.log('Connected to database.');
        }
    });

    connection.query(`INSERT INTO USERS VALUES ('${userDataResponse.body.name}', ${userDataResponse.body.id}, '${accessToken}')`, function (error, results, fields) {
        if (error) {
            console.log("error inserting values: connection failed with db!");
            // connection.destroy();
            console.log(error);
        } else {
            // connected!
            console.log("info: connection ok with db!");
            console.log(results);
            // context.succeed("done");
            // callback(error, results);
        }
    });
    connection.query('show tables', function (error, results, fields) {
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
        }
    });

    connection.end();
    //Send API Response
    callback(null, {
        statusCode: '200',
        body: JSON.stringify({
          'user': userDataResponse
        }),
        headers: {
          'Content-Type': 'application/json',
        },
    });
  

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
}
