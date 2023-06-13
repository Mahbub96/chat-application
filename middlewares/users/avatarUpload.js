const uploader = require("../../utilities/singleUploder");

function avatarUpload(req, res, next) {
  const upload = uploaderr(
    "avatars",
    ["image/jpeg", "image/jpg", "image/png"],
    100000,
    "Only .jpg .jpeg or .png format allowed!"
  );

  //   call the middleware function
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

module.exports = avatarUpload;
