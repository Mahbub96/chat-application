const uploader = require("../../utilities/multipleUploader");

function attachmentUpload(req, res, next) {
  console.log(4);
  const upload = uploader(
    "attachments",
    ["image/jpeg", "image/jpg", "image/png"],
    10000,
    2,
    "only .jpg, jpeg or .png format allowed!"
  );
  console.log(12);
  upload.any()(req, res, (err) => {
    console.log(14);
    if (err) {
      console.log(16, err);
      res.status(500).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
}

module.exports = attachmentUpload;
