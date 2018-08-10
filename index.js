(function() {
  let express       = require('express');
  let circularJSON  = require('circular-json');
  let util          = require('util');
  let im            = require('imagemagick');
  let download      = require('image-downloader');
  let path          = require('path');

  let app = express();

  app.use(express.json());

  app.use((err, req, res, next) => {
    if (err) {
      console.log('Invalid Request data ' + circularJSON.stringify(req, null, 2));
      res.send('Invalid Request data');
    } else {
      next();
    }
  })

  app.get('/', (req, res) => {
    console.log('GET /');
    res.send('Resizer 1.0');
  });

  app.post('/resize', (req, res) => {
    console.log('POST /resize');
    console.log('   body ' + util.inspect(req.body));

    if (req.body && req.body.remote_image) {
      // console.log('remote_image ' + req.body.remote_image);

      const optionsFeatures = {
        url: req.body.remote_image,
        dest: './tmp'
      }

      download.image(optionsFeatures).then(({ filename, image }) => {
        im.identify(filename, function (err, features) {
          if (err) res.status(500).send(`quebrou véi... ${util.inspect(err)}`);

          // console.log(util.inspect(features));

          let destPath = `./tmp/${new Date().valueOf()}.${features.format}`;
          const optionsResize = {
            srcPath: filename,
            dstPath: destPath
          }

          if (req.body.width) optionsResize.width = req.body.width;
          if (req.body.height) optionsResize.height = req.body.height;

          // console.log("options resize", util.inspect(optionsResize));

          im.resize(optionsResize, (err, stdout, stderr) => {
            if (err) console.error("error resize ", util.inspect(err)); // res.status(500).send(`quebrou véi... ${util.inspect(err)}`);

            im.identify(destPath, function (err, featuresResized) {
              console.log(`Original size (WxH):${features.width}x${features.height} - resized size (WxH):${featuresResized.width}x${featuresResized.height}`);
            });

            res.sendFile(path.join(process.cwd(), destPath));
          });
        });
      }).catch((err) => {
        res.status(500).send(`quebrou véi... ${util.inspect(err)}`);
      });
    } else {
      res.json();
    }
  });

  app.listen(5555, () => {
    console.log('Example app listening on port 5555!');
  });
})();