const UserModel = require("../models/userModel");

const usersController = {
  getLoginPage: (req, res) => {
    res.render("users/login");
  },

  getRegisterPage: (req, res) => {
    res.render("users/register");
  },

  getAccountPage: async (req, res) => {
    const { id } = req.params;
    const user = await UserModel.findById(id).lean().exec();
    const userInfo = {
      email: user.email,
      avatar: user.avatar ? user.avatar : "avatar.png",
      name: user.name,
      phone: user.phone,
      designation: user.designation,
    };
    res.render("users/account", { userInfo });
  },

  registerUserFunction: async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await UserModel.findOne({ email: email });
    if (!existingUser) {
      const newUser = new UserModel({ email, password });
      newUser.save().then((savedUser) => {
        if (newUser === savedUser) {
          res.redirect("/users/login");
        } else {
          res.json("Error while saving the user");
        }
      });
    } else {
      res.json("User Already Exist");
    }
  },

  loginUserFunction: async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      req.flash("error", "Email or Password is incorrect");
      res.redirect("/users/login");
    } else {
      user.comparePassword(password, (err, isMatch) => {
        if (err) {
          console.log(err);
          req.flash("error", "Something Went wrong, please try agian");
          res.redirect("/users/login");
        }
        if (isMatch) {
          let redirectUrl = req.session.redirectUrl || "/";
          req.session.regenerate(function (err) {
            if (err) return next(err);
            req.session.user = {
              id: user._id,
              email: user.email,
              isAdmin: user.isAdmin,
            };
            req.session.save((err) => {
              if (err) return next(err);
              return res.redirect(redirectUrl);
            });
          });
        } else {
          req.flash("error", "Email or Password is incorrect");
          res.redirect("/users/login");
        }
      });
    }
  },

  logoutUserFunction: (req, res) => {
    req.session.user = null;
    res.redirect("/");
  },
};

module.exports = usersController;
