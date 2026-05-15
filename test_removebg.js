const fs = require('fs');
const https = require('https');

const API_KEY = '6mWyyuJLJ7auz9NT6StuVaXL';

// Create a small placeholder 1x1 transparent png in base64
const smallImageB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const postData = JSON.stringify({
  image_file_b64: smallImageB64,
  size: 'auto'
});

const options = {
  hostname: 'api.remove.bg',
  port: 443,
  path: '/v1.0/removebg',
  method: 'POST',
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status HTTP:', res.statusCode);
    console.log('Response Body:', body.substring(0, 200));
  });
});

req.on('error', (e) => {
  console.error('Network Error:', e);
});

req.write(postData);
req.end();
