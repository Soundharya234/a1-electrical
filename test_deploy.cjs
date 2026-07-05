const https = require('https');

https.get('https://a1-electrical.onrender.com/', (res) => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    const match = html.match(/\/assets\/index-[a-zA-Z0-9_-]+\.js/);
    if (match) {
      const jsUrl = 'https://a1-electrical.onrender.com' + match[0];
      console.log('Found JS URL:', jsUrl);
      https.get(jsUrl, (jsRes) => {
        let jsBody = '';
        jsRes.on('data', d => jsBody += d);
        jsRes.on('end', () => {
          if (jsBody.includes("typeof ") && jsBody.includes("startsWith(")) {
            console.log("SUCCESS: Fix is deployed on Render.");
          } else {
            console.log("FAIL: Fix is NOT deployed. The live code is old.");
          }
        });
      });
    } else {
      console.log("Could not find JS bundle in HTML");
    }
  });
});
