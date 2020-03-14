// AWS CONFIG VARIABLES

var albumBucketName = "webcamphoto";
var bucketRegion = "EU-CENTRAL-1";
var IdentityPoolId = "eu-central-1:72a7285b-4adc-4966-8f58-0416e5c36d62";
var albumName ="samples";
var textFormData;
/*
AWS.config.region = bucketRegion;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
});

// Inicializar el proveedor de credenciales de Amazon Cognito
AWS.config.region = bucketRegion; // Región
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
});
*/
AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});


// AWS BUCKETS METHODS

function addPhoto() {

if(!fd) 
  {
    return alert("Please choose a file to upload first.");
  }
  var numberOfPictures;
  // get number of pictures
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  s3.listObjects({ Prefix: albumPhotosKey }, function(err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + "/";

    var photos = data.Contents.map(function(photo) {
    var photosampleKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photosampleKey);
    });
    numberOfPictures = photos.length;

// OBTAIN image to upload
//var base64image = document.getElementById("newsample").src;

  if (fd.entries().next().done) {
      return alert("Please choose a file to upload first.");
  }
  base64image = fd.get("image");
  
  var file = base64image;
  var fileName = numberOfPictures + ".jpg";
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  var photoKey = albumPhotosKey + fileName;

  // Use S3 ManagedUpload class as it supports multipart uploads
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: albumBucketName,
      Key: photoKey,
      Body: file,
      ACL: "public-read",
      ContentType: 'image/jpeg'
    }
  });

  var promise = upload.promise();

  promise.then(
    function(data) {
      console.log("Successfully uploaded photo.");
      saveCheckboxData(numberOfPictures);
    },
    function(err) {
      return alert("There was an error uploading your photo: ", err.message);
    }
  );
  });
}

function saveCheckboxData(name) {
  
  /* Run script after DOMContentLoaded event to ensure form element is 
present */

  /* Obtain form element via querySelector */
  const form = document.querySelector('form[name="addtext"]');

  /* Bind listener to forms submit event */
    /* Prevent browsers default submit and page-reload behavior */
    event.preventDefault();

    /* Obtain values from each field in form */
    var positivo = document.getElementById("cbox2").checked;
    var esperando = document.getElementById("cbox3").checked;
    var negativo = document.getElementById("cbox4").checked;
    var no = document.getElementById("cbox5").checked;
    var filename = name + ".txt";

    /* Compose text file content */
    var text = "-positivo:" + positivo + "-esperando:" + esperando + "-negativo:" + negativo + "-no:" + no;

    /* Create temporary link element and trigger file download  */
    //const link = document.createElement("a");
    //const href = "data:text/plain;charset=utf-8," + text;

    var blobfile = new Blob([text], {type: 'text/plain'});
    textFormData = new FormData();
    textFormData.append("info", blobfile, "name.txt");

  //blobfile = dataURLtoBlob(href);
    
  //textFormData = new FormData();
  //textFormData.append("image", blobfile, "filename.png");



    //link.setAttribute("href", href);
    //link.id= "textToDownload";
    //link.setAttribute("download", textFormData);



    //document.body.appendChild(link);

  //link.click();
  saveDocumentTxt(filename);
  //document.body.removeChild(link);
}

function saveDocumentTxt(name) {
  //console.log(document.getElementById("textToDownload"));
  var files = textFormData;

  if (files.entries().next().done) {
      return alert("Please choose a file to upload first.");
  }
  console.log(files.get("info"));
  var file = files.get("info");
  var fileName = name;
  var albumPhotosKey = encodeURIComponent(albumName) + "/";

  var photoKey = albumPhotosKey + fileName;

  // Use S3 ManagedUpload class as it supports multipart uploads
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: albumBucketName,
      Key: photoKey,
      Body: file,
      ACL: "public-read",
      ContentType: 'text/plain'
    }
  });

  var promise = upload.promise();

  promise.then(
    function(data) {
      alert("Successfully uploaded photo and info. Thanks!");
      //viewAlbum(albumName);
    },
    function(err) {
      return alert("There was an error uploading your photo: ", err.message);
    }
  );
}

function listAlbums() {
  s3.listObjects({ Delimiter: "/" }, function(err, data) {
    if (err) {
      return alert("There was an error listing your albums: " + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace("/", ""));
        return getHtml([
          "<li>",
          "<span onclick=\"deleteAlbum('" + albumName + "')\">X</span>",
          "<span onclick=\"viewAlbum('" + albumName + "')\">",
          albumName,
          "</span>",
          "</li>"
        ]);
      });
      var message = albums.length
        ? getHtml([
            "<p>Click on an album name to view it.</p>",
            "<p>Click on the X to delete the album.</p>"
          ])
        : "<p>You do not have any albums. Please Create album.";
      var htmlTemplate = [
        "<h2>Albums</h2>",
        message,
        "<ul>",
        getHtml(albums),
        "</ul>",
        "<button onclick=\"createAlbum(prompt('Enter Album Name:'))\">",
        "Create New Album",
        "</button>"
      ];
      document.getElementById("app").innerHTML = getHtml(htmlTemplate);
    }
  });
}

/*

function createAlbum(albumName) {
  albumName = albumName.trim();
  if (!albumName) {
    return alert("Album names must contain at least one non-space character.");
  }
  if (albumName.indexOf("/") !== -1) {
    return alert("Album names cannot contain slashes.");
  }
  var albumKey = encodeURIComponent(albumName) + "/";
  s3.headObject({ Key: albumKey }, function(err, data) {
    if (!err) {
      return alert("Album already exists.");
    }
    if (err.code !== "NotFound") {
      return alert("There was an error creating your album: " + err.message);
    }
    s3.putObject({ Key: albumKey }, function(err, data) {
      if (err) {
        return alert("There was an error creating your album: " + err.message);
      }
      alert("Successfully created album.");
      viewAlbum(albumName);
    });
  });
}

function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  s3.listObjects({ Prefix: albumPhotosKey }, function(err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + "/";

    var photos = data.Contents.map(function(photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        "<span>",
        "<div>",
        '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
        "</div>",
        "<div>",
        "<span onclick=\"deletePhoto('" +
          albumName +
          "','" +
          photoKey +
          "')\">",
        "X",
        "</span>",
        "<span>",
        photoKey.replace(albumPhotosKey, ""),
        "</span>",
        "</div>",
        "</span>"
      ]);
    });
    var message = photos.length
      ? "<p>Click on the X to delete the photo</p>"
      : "<p>You do not have any photos in this album. Please add photos.</p>";
    var htmlTemplate = [
      "<h2>",
      "Album: " + albumName,
      "</h2>",
      message,
      "<div>",
      getHtml(photos),
      "</div>",
      '<input id="photoupload" type="file" accept="image/*">',
      '<button id="addphoto" onclick="addPhoto(\'' + albumName + "')\">",
      "Add Photo",
      "</button>",
      '<button onclick="listAlbums()">',
      "Back To Albums",
      "</button>"
    ];
    document.getElementById("app").innerHTML = getHtml(htmlTemplate);
  });
}

*/