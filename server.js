const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static('public'))
const multer = require('multer');
fs = require('fs-extra')
app.use(bodyParser.urlencoded({
  extended: true
}))
require('dotenv').config();

const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];

const MongoClient = require('mongodb').MongoClient
ObjectId = require('mongodb').ObjectId

createAndCleanUploadFolder();

setInterval(createAndCleanUploadFolder, 1000 * 60);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const upload = multer({
  storage: storage
})

MongoClient.connect(process.env.MONGODB_URL, (err, client) => {
  if (err) return console.log(err)
  db = client.db('mproper-image-host')
  app.listen(80, () => {
    console.log('listening on 80')
  })
})

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/html/index.html');
});


app.post('/uploadphoto', upload.single('picture'), (req, res) => {
  const mimeType = req.file.mimetype;
  if (allowedMimeTypes.indexOf(mimeType) == -1) return res.redirect(`/`);

  const img = fs.readFileSync(req.file.path);
  const encode_image = img.toString('base64');

  db.collection('images').findOne({
    'image': new Buffer.from(encode_image, 'base64')
  }, (err, result) => {

    if (result) {
      console.log('Duplicate found!', result._id);
      return res.redirect(`/image/${result._id}`)
    } else {
      const finalImg = {
        contentType: mimeType,
        image: new Buffer.from(encode_image, 'base64'),
        uploaderIP: req.ip,
        timestamp: new Date(),
        size: req.file.size,
        originalName: req.file.originalname
      };
      db.collection('images').insertOne(finalImg, (err, result) => {
        if (err) return console.log(err)
        res.redirect(`/image/${result.insertedId}`)
      })
    }
  });



})

app.get('/image/:id', (req, res) => {
  const filename = req.params.id;
  try {

    db.collection('images').findOne({
      '_id': ObjectId(filename)
    }, (err, result) => {
      if (!result) return res.redirect(`/`);
      if (err) return console.log(err)

      res.contentType('image/jpeg');
      res.send(result.image.buffer)


    });
  } catch (e) {
    res.redirect(`/`)
  }
});


function createAndCleanUploadFolder() {
  try {
    fs.rmdirSync('./uploads', {
      recursive: true
    });

    console.log(`/upload is deleted!`);
  } catch (err) {
    console.error(`Error while deleting /upload.`, err);
  }

  fs.mkdirSync('./uploads')
}