const nodemailer = require('nodemailer');
let aws = require('aws-sdk');
const uuidv3 = require('uuid/v3');
const fs = require('fs');
const swig = require('swig-templates');

const emailTemplate = swig.compileFile(`./template.html`);

const swigPrint = ({ replyTo, date }) => {
  return emailTemplate({
    replyTo,
    date
  });
};

aws.config.update({ region: 'us-east-1' });

// configure AWS SDK
// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01'
  })
});

const replyTo = uuidv3('jengstrm@gmail.com', uuidv3.DNS);
const date = new Date().toString();

const swigOutput = swigPrint({ replyTo, date });

// send some mail
transporter.sendMail(
  {
    from: `"NYWeek Box Mailer" <${replyTo}@box.nyweek.io>`,
    to: 'jengstrm@gmail.com',
    subject: 'Message',
    text: `Original NYWeek post:
https://nyweek.io/classified/
About NYWeek mail:\nhttps://nyweek.io/box
Please flag unwanted messages (spam, scam, other): 
https://nyweek.io/report/${replyTo}`,
    html: swigOutput,
    attachments: [
      {
        // utf-8 string as an attachment
        filename: 'text1.txt',
        content: 'hello world!'
      },
      {
        // binary buffer as an attachment
        filename: 'text2.txt',
        content: new Buffer.from('hello world!')
      },
      {
        // file on disk as an attachment
        filename: 'text3.txt',
        path: './file.txt' // stream this file
      },
      {
        // filename and content type is derived from path
        path: './file.txt'
      },
      {
        // stream as an attachment
        filename: 'text4.txt',
        content: fs.createReadStream('file.txt')
      },
      {
        // define custom content type for the attachment
        filename: 'text.bin',
        content: 'hello world!',
        contentType: 'text/plain'
      },
      {
        // use URL as an attachment
        filename: 'license.txt',
        path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
      },
      {
        // encoded string as an attachment
        filename: 'text1.txt',
        content: 'aGVsbG8gd29ybGQh',
        encoding: 'base64'
      },
      {
        // data uri as an attachment
        path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
      },
      {
        // use pregenerated MIME node
        raw:
          'Content-Type: text/plain\r\n' +
          'Content-Disposition: attachment;\r\n' +
          '\r\n' +
          'Hello world!'
      }
    ],
    ses: {
      // optional extra arguments for SendRawEmail
      Tags: [
        {
          Name: 'relay',
          Value: 'true'
        }
      ]
    }
  },
  (err, info) => {
    console.log(info);
    console.log(err);
  }
);
