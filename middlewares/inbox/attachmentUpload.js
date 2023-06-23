const uploader = require("../../utilities/multipleUploader");

function attachmentUpload(req, res, next) {
  const upload = uploader(
    "attachments",
    ["image/jpeg", "image/jpg", "image/png"],
    10000,
    2,
    "only .jpg, jpeg or .png format allowed!"
  );

  upload.any()(req, res, (err) => {
    if (err) {
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
