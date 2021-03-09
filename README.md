# Instagram Analytics Dashboard

### The Javascript files are the aws lambda handlers. 
 - handler.js -> Signs the user in with the access token and saves user details to aws RDS database. 
 - handler2.js -> Getting the user personal data nad insights
 - handler3.js -> Getting another user public media insighhts.
 
 ### Running the project
 - ```npm init```
 - ```serverless``` -> Set up the project using serverless framework.
 - ```serverless deploy```
