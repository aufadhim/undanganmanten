import http from 'http';

const data = JSON.stringify({
  type: "akad",
  date: "",
  startTime: "",
  endTime: "",
  venueName: "",
  address: "",
  googleMapsUrl: "",
  lat: "",
  lng: ""
});

const req = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/api/invitations/me/events',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.write(data);
req.end();
