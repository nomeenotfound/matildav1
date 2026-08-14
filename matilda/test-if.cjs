const https = require('https');
https.get('https://cdn.iframe.ly/api/iframe?url=https://jumpshare.com/v/amgavbNZhiAwzQ2pQ9ci&api_key=428945fa641176b6', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => console.log(data));
});
