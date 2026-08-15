const https = require('https');
https.get('https://iframely.com/docs/autoplay', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // extract main text
    const text = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log(text.substring(0, 1000));
    console.log("...");
    console.log(text.match(/.{0,50}autoplay.{0,100}/gi));
  });
});
