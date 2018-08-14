(function() {
  let express       = require('express');
  let circularJSON  = require('circular-json');
  let util          = require('util');
  let im            = require('imagemagick');
  let download      = require('image-downloader');
  let path          = require('path');

  let app = express();

  /**
   * 
   * dimensions = {width : 123, height : 123}
   * 
   */
  let resize = (image, dimensions = {}) => {
    return new Promise((resolve, reject) => {
      if (!image) {
        reject('Required image to resize');
        return;
      }

      if (!dimensions.width && !dimensions.height) {
        reject('Required width OR height to resize image');
        return;
      }

      console.debug(`image ${image} is valid!`);

      const optionsFeatures = {
        url: image,
        dest: './tmp'
      }

      console.debug(`optionsFeatures => ${util.inspect(optionsFeatures)}`);

      download.image(optionsFeatures).then(({ filename, image }) => {
        im.identify(filename, (err, features) => {
          if (err) {
            reject(`error identify ==>> ${util.inspect(err)}`);
            return;
          }

          if (!features.width) reject('this is not valid image');

          // console.log(util.inspect(features));

          let destPath = `./tmp/${new Date().valueOf()}.${features.format}`;
          const optionsResize = {
            srcPath: filename,
            dstPath: destPath
          }

          if (dimensions.width) optionsResize.width = dimensions.width;
          if (dimensions.height) optionsResize.height = dimensions.height;

          // console.log("options resize", util.inspect(optionsResize));

          im.resize(optionsResize, (err, stdout, stderr) => {
            if (err) {
              reject(`error resize ${util.inspect(err)}`);
              return;
            }

            im.identify(destPath, function (err, featuresResized) {
              if (err || !featuresResized) {
                console.error(`error identify resized  ${util.inspect(err)}`);
                reject('this is not valid image');
                return;
              }

              console.log(`Original size (WxH):${features.width}x${features.height} - resized size (WxH):${featuresResized.width}x${featuresResized.height}`);
            });

            resolve(destPath);
          });
        });
      }).catch(err => {
        console.error(`generic error... ${util.inspect(err)}`);
        reject('Não foi possível redimensionar a image');
      });
    });
  }

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


    let dimensions = {};
    if (req.body.width) { dimensions.width = req.body.width }
    if (req.body.height) { dimensions.height = req.body.height }

    resize(req.body.remote_image, dimensions).then(pathImageResized => {
      res.sendFile(path.join(process.cwd(), pathImageResized));
    }).catch(err => res.status(500).send(err));
  });

  app.get('/resize', (req, res) => {
    console.log('GET /resize');
    console.log('   query ' + util.inspect(req.query));


    let dimensions = {};
    if (req.query.width) { dimensions.width = req.query.width }
    if (req.query.height) { dimensions.height = req.query.height }

    resize(req.query.remote_image, dimensions).then(pathImageResized => {
      res.sendFile(path.join(process.cwd(), pathImageResized));
    }).catch(err => res.status(500).send(err));
  });

  app.listen(5555, () => {
    console.log('Resizer listening on port 5555!');
  });
})();