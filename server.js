var proxy = require('express-http-proxy');
var fetch = require('isomorphic-fetch');
var spdy = require("spdy");

var fs = require('fs');
var path = require('path');

const express = require('express');
let cors = require('cors');
const { start } = require('repl');
const RequestIp = require('@supercharge/request-ip');
const bodyParser = require("body-parser");

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// app.use(cors());


var logger = (req, res, next) => {
  console.log("\n\nREQ HEADERS before start => ", req.headers);
  next();
};

app.post('/download-aadhar', logger, function(req, res) {
  console.log("INSIDE download-aadhar");
  const file = fs.createWriteStream("aadhar.zip");
  req.pipe(file);
  res.send("downloaded!").status(200);
});

//send APP
// app.get('/send-ping', logger, proxy('https://uidai-proxy.herokuapp.com', {
//     proxyReqPathResolver(req) {
//       console.log("\n\nREQ IP(send-ping) => ", req.connection.remoteAddress);
//       console.log("\n\nREQ IP(RequestIp)(send-ping) => ", RequestIp.getClientIp(req));
//       console.log("\nHEADERS inside REQ(send-ping) => ", req.headers);
//       return `/receive-ping`;
//     },
//     proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
//       proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
//         "referer": "https://uidai-proxy.herokuapp.com",
//         "host": "uidai-proxy.herokuapp.com"
//       });
//       console.log("\nHEADERS inside REQ proxyReqOptDecorator(send-ping) => ", proxyReqOpts.headers);
//       return proxyReqOpts;
//     },
//     userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
//       console.log("\n\nREQ IP inside RES(send-ping) => ", userReq.connection.remoteAddress);
//       console.log("\n\nREQ IP inside RES(RequestIp)(send-ping) => ", RequestIp.getClientIp(userReq));
//       console.log("\nHEADERS inside RES(send-ping) => ", proxyRes.headers);
//       return proxyResData;
//     }
//   })
// );

// //receive APP
// app.get('/receive-ping', logger, function(req, res) {
//   console.log("\n\nREQ IP(receive-ping) => ", req.connection.remoteAddress);
//   console.log("\n\nREQ IP(RequestIp)(receive-ping) => ", RequestIp.getClientIp(req));
//   console.log("\nHEADERS inside REQ(receive-ping) => ", req.headers);
//   res.send("pinged!").status(200);
// });


// app.get('/request-bin/*', logger, proxy('http://requestbin.net', {
//     proxyReqPathResolver(req) {
//       return `/r/1hahg8g1`;
//     },
//     proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
//       proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
//         "referer": "http://requestbin.net",
//         "host": "requestbin.net"
//       });
//       return proxyReqOpts;
//     },
//     userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
//       console.log("\n\nREQ IP inside RES(request-bin) => ", userReq.connection.remoteAddress);
//       return proxyResData;
//     }
//   })
// );

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   next();
// });

app.get(
  "/uidai-proxy/*", logger,
  proxy("https://resident.uidai.gov.in", {
    proxyReqPathResolver(req) {
      req.headers = Object.assign({}, req.headers, {
        "referer": "https://resident.uidai.gov.in",
        "host": "resident.uidai.gov.in",
        "x-forwarded-for": "",
        "x-forwarded-port": "",
        "x-request-id": "",
        "x-forwarded-proto": "",
        "via": "",
        "connect-time": "",
        "x-request-start": "",
        "total-route-time": ""
      });
      if (req.url.includes("offline-kyc")) {
        console.log(
          "\n\nproxyReqPathResolver(remoteAddress) => ",
          req.connection.remoteAddress,
          "\nproxyReqPathResolver(RequestIp) => ",
          RequestIp.getClientIp(req),
          "\nproxyReqPathResolver(Method) => ",
          req.method,
          "\nproxyReqPathResolver(Headers) => ",
          req.headers,
          "\nproxyReqOptDecorator(rawHeaders) => ", req['rawHeaders'].join("=======")
        );
      }
      return `${req.url.split("/uidai-proxy")[1]}`;
    },
    proxyReqOptDecorator: function(req, srcReq) {
      let modifiedReq = req;
      modifiedReq.headers = Object.assign({}, req.headers, {
        "referer": "https://resident.uidai.gov.in",
        "host": "resident.uidai.gov.in",
        "x-forwarded-for": "",
        "x-forwarded-port": "",
        "x-request-id": "",
        "x-forwarded-proto": "",
        "via": "",
        "connect-time": "",
        "x-request-start": "",
        "total-route-time": ""
      });
      return modifiedReq;
    },
    proxyErrorHandler: function(err, res, next) {
      console.log("\n\nOKYC RESPONSE ERROR => ", err);
      next(err);
    },
    // userResDecorator: function(proxyRes, proxyResData, req, res) {
    //   if (req.url.includes("offline-kyc")) {
    //     console.log(
    //       "\n\nREQ IP inside userResDecorator(remoteAddress) => ",
    //       req.connection.remoteAddress,
    //       "\nREQ IP inside userResDecorator(RequestIp) => ",
    //       RequestIp.getClientIp(req),
    //       "\nREQ METHOD inside userResDecorator => ",
    //       req.method,
    //       "\nREQ HEADERS inside userResDecorator => ",
    //       req.headers
    //     );
    //   }
    //   return proxyResData;
    // }
  })
);

app.post('/uidai-proxy/*', logger, proxy('https://resident.uidai.gov.in', {
    proxyReqPathResolver(req) {
      return `${req.url.split("/uidai-proxy")[1]}`;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
        "referer": "https://resident.uidai.gov.in",
        "host": "resident.uidai.gov.in"
      });
      return proxyReqOpts;
    },
    userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
      //check HEADER to detect content as attachment
      if(headers['content-disposition']) {
        // modify HEADERS to stop file download
        headers['content-disposition'] = 'inline';
        headers['content-type'] = 'text/plain';
      }
      return headers;
    },
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
      //check HEADER to detect content as attachment
      if(proxyRes.headers['content-disposition']) {
        return new Promise(function (resolve, reject) {
          //send attachment
          fetch('https://127.0.0.1:8000/download-aadhar', {
            method: "POST",
            headers: {
              'Content-Type': 'application/zip'
            },
            body: proxyResData
          })
            .then(function(res) {
              console.log("AADHAR ZIP DOWNLOADED :)");
              resolve("AADHAR ZIP DOWNLOADED :)");
            })
            .catch(function(err) {
              console.log("AADHAR ZIP DOWNLOAD FAILED :(");
              reject("AADHAR ZIP DOWNLOAD FAILED :(");
            });
        });
      }
      return proxyResData;
    }
  })
);


app.use('/public/*', logger, express.static(path.join(__dirname, 'public')))

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 8000;

var options = {
  key: fs.readFileSync(__dirname + "/server.key"),
  cert: fs.readFileSync(__dirname + "/server.crt")
};

// spdy.createServer(options, app).listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});