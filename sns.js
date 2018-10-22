/// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
const TOPIC_ARN = "arn:aws:sns:us-east-1:105390194305:mailbox"
// Set region
AWS.config.update({region: 'us-east-1'});


const params = {
  Protocol: 'https',
  TopicArn: TOPIC_ARN,
  Endpoint: 'https://nyweek.io/box/'
};
               

// Create promise and SNS service object
var subscribePromise = new AWS.SNS({apiVersion: '2010-03-31'}).subscribe(params).promise();

// Handle promise's fulfilled/rejected states
subscribePromise.then(
  function(data) {
    console.log("Subscription ARN is " + data.SubscriptionArn);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });