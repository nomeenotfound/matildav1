const https = require('https');
https.get('https://iframely.com/docs/autoplay', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // try to extract text inside paragraph or code tags around autoplay
    const match = data.match(/autoplay.*?allow=["'][^"']+["']/gi);
    console.log(match);
  });
});
