// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const simpleParser = require('mailparser').simpleParser;
const Firestore = require('@google-cloud/firestore');
// Set the region

AWS.config.update({ region: 'us-east-1' });

const firestore = new Firestore({
  projectId: 'counterclassifieds',
  keyFilename: './keyfile.json',
  timestampsInSnapshots: true
});


// Create the SQS service object
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

var sqsQueueURl = 'https://sqs.us-east-1.amazonaws.com/105390194305/mailboxsqs';
var receiveMessageParams = {
  QueueUrl: sqsQueueURl,
  MaxNumberOfMessages: 10,
  VisibilityTimeout: 10,
  WaitTimeSeconds: 10
};

var receiveMessage = function() {
  sqs.receiveMessage(receiveMessageParams, function(err, data) {
    if (err) {
      console.log(err);
    }
    if (data.Messages) {
      for (var i = 0; i < data.Messages.length; i++) {
        var message = data.Messages[i];
        var body = JSON.parse(message.Body);
        // execute logic

        console.dir(body, { depth: 4, colors: true });
        console.dir(body.Records[0].s3.object.key, { depth: 4, colors: true });

        const s3key = body.Records[0].s3.object.key;
        getFile(s3key);
        removeFromQueue(message);
      }
      receiveMessage();
    } else {
      setTimeout(function() {
        receiveMessage();
      }, 60 * 1000);
    }
  });
};

var removeFromQueue = function(message) {
  sqs.deleteMessage(
    {
      QueueUrl: sqsQueueURl,
      ReceiptHandle: message.ReceiptHandle
    },
    function(err, data) {
      err && console.log(err);
    }
  );
};

var lookupRecipient = function() {
  const document = firestore.doc('ads/8uri6rR2xFmCV5iSRkVB');
  document.get().then(doc => {
    console.dir(doc.data(), { depth: null, colors: true });
  });
}

var getFile = function(key) {
  var bucketInstance = new AWS.S3();
  var getParams = {
    Bucket: 'nyweek-mailbox',
    Key: key
  };
  bucketInstance.getObject(getParams, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      simpleParser(data.Body.toString(), (err, parsed) => {
        console.dir(parsed, { depth: 5, colors: true });
        console.dir(parsed.to, { depth: null, colors: true });
        console.dir(parsed.from, { depth: null, colors: true });
        lookupRecipient();
      });

   
    }
  });
};

receiveMessage();
