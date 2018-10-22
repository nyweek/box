var http = require('http');

const handleIncomingMessage = (msgType, msgData) => {
  if (msgType === 'SubscriptionConfirmation') {
    //confirm the subscription.
    sns.confirmSubscription(
      {
        Token: msgData.Token,
        TopicArn: msgData.TopicArn
      },
      onAwsResponse
    );
  } else if (msgType === 'Notification') {
    console.log(msgData);
  } else {
    console.log('Unexpected message type ' + msgType);
  }
};

const server = new http.Server();
server.on('request', (request, response) => {
  request.setEncoding('utf8');

  //concatenate POST data
  var msgBody = '';
  request.on('data', data => {
    msgBody += data;
  });
  request.on('end', function() {
    try {
      var msgData = JSON.parse(msgBody);
      var msgType = request.headers['x-amz-sns-message-type'];
      handleIncomingMessage(msgType, msgData);
    } catch(e) {
      
    }
  });

  // SNS doesn't care about our response as long as it comes
  // with a HTTP statuscode of 200
  response.end('OK');
});

server.listen(3000);
