const PORT = 3000;

const express = require("express");
const session = require("express-session");
const fs = require("fs");
const multer = require("multer");
const morgan = require("morgan");
const sendMail = require("./utils/mailSender");
const crypto = require("./encryption/encryption")

// Db Imports
const db = require("./database");
const userModel = require("./database/models/users");
const cartModel = require("./database/models/userCart");
const productModel = require("./database/models/products");

db.start();

const app = express();

// Multer Setup

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// MiddleWares

app.use(morgan("dev")); // Logger

app.use(express.json()); // Read JSON data
app.use(express.urlencoded()); // Read Form data

app.use(express.static("public")); // Public Static
app.use(express.static("uploads")); // uploads Static

app.set("view engine", "ejs");
app.set("views", "views");

app.use(
  // Session
  session({
    secret: "keyboard Cat",
  })
);

// Routing
app.get("/", (req, res) => {
  var userId, userName;
  if (!req.session.isLoggedIn) {
    userId = "007";
    userName = "Guest";
    // var userDp = "/defaultDp/dp.png";
  } else {
    userId = req.session.userId;
    userName = req.session.userName;
  }

  getUserDp(userId, function (userDp) {
    // console.log('users DP: ', userDp)

    // Get first 5 products
    getFiveProducts(0, function (arr) {
      req.session.prodIndex = 5;
      var resList = arr[0];
      var more = arr[1];
      res.render("home.ejs", {
        name: userName,
        dp: userDp,
        productList: resList,
        loadMore: more,
      });
    });
  });
});

app
  .route("/signin")
  .get((req, res) => {
    res.render("auth/signin", { error: "" });
  })
  .post((req, res) => {
    var userName = req.body.userName;
    var password = req.body.password;

    var data = {
      userName: userName,
      password: password,
    };
    findUsers({ userName: data.userName }, function (user) {
      if (user && user.password === password) {
        // console.log(`user is logged in: `, user)
        req.session.isLoggedIn = true;
        req.session.userName = userName;
        req.session.userId = user._id;

        if (user.emailVerified) res.redirect("/");
        else
          res.render("auth/signin.ejs", { error: "Please Verify your Email" });
      } else {
        // console.log(`user couldn't log in: `, user);
        res.render("auth/signin.ejs", { error: "Wrong Credentials" });
      }
    });
  });

app
  .route("/signup")
  .get((req, res) => {
    res.render("auth/signup", { error: "" });
  })
  .post(upload.single("displayPic"), (req, res) => {
    // console.log(req.body)
    var userName = req.body.userName;
    var email = req.body.email;
    var password = req.body.password;
    var passwordCheck = req.body.confirmPassword;
    var displayPic = req.file ? req.file.filename : "";

    if (password !== passwordCheck) {
      res.render("auth/signup", { error: "Passwords Don't Match" });
      return;
    }

    var user = {
      userName: userName,
      email: email,
      password: password,
      displayPic: displayPic,
      emailVerified: false,
    };

    findUsers({ userName: user.userName }, function (person) {
      if (person) {
        // console.log(`Duplicate: `, person);
        res.render("auth/signup", { error: "UserName Taken" });
      } else {
        // console.log('insertings user: ', user)

        // Email verification :)

        insertUser(user, function () {
          var html =
            '<h1>Click here to verify your email address: <a href="http://localhost:3000/email-verification/' +
            crypto.encrypt(userName) +
            '">click here</a></h1> <br> <h5>This is for developement purposes only IGNORE if it is irrelevent (must be sent to you by mistake) to you. You do not need to click the link but incase if you do not need to worry since it does nothing ( development site :) ). Sorry for the inconvenience :(</h5>';
          console.log("html: ", html);
          sendMail(email, html, function (error) {
            if (error) {
              console.log(error);
              res.render("auth/signup", { error: error });
            } else {
              console.log("mail has been sent");
              res.redirect("/signin");
            }
          });
        });
      }
    });
  });

app.get("/email-verification/:userName", (req, res) => {
  var userName = crypto.decrypt(req.params.userName);

  userModel
    .findOneAndUpdate({ userName: userName }, { emailVerified: true })
    .then(() => {
      res.redirect("/signin");
    });
});

app
  .route("/forgot-password")
  .get((req, res) => {
    res.render("auth/forgot-password.ejs", { error: "" });
  })
  .post((req, res) => {
    var userEmail = req.body.email;

    findUsers({ email: userEmail }, function (user) {
      var userId = user._id;
      var html =
        '<h1>Click here to Reset your Password: <a href="http://localhost:3000/forgot-password/change-password/' +
        crypto.encrypt(userId + "") +
        '">click here</a></h1> <br> <h5>This is for developement purposes only IGNORE if it is irrelevent (must be sent to you by mistake) to you. You do not need to click the link but incase if you do not need to worry since it does nothing ( development site :) ). Sorry for the inconvenience :(</h5>';
      console.log("html: ", html);
      sendMail(userEmail, html, function (error) {
        if (error) {
          console.log(error);
          res.render("auth/signup", { error: error });
        } else {
          console.log("mail has been sent");
          res.render("auth/forgot-password", { error: "check Email" });
        }
      });
    });
  });

app
  .route("/forgot-password/change-password/:userId")
  .get((req, res) => {
    // var userId = getUserId(req.params.email)
    // sb user detail
    var userId = crypto.decrypt(req.params.userId)
    console.log("user ID at get forgot/change: ", userId, typeof userId);
    
    res.render("settings/changePassword.ejs", {
      error: false,
      postLogin: false,
      userId: String(userId),
    });
  })
  .post((req, res) => {
    var userId = req.params.userId;
    console.log();
    var newPassword = req.body.newPassword;
    var confirmPassword = req.body.confirmPassword;

    if (newPassword !== confirmPassword) {
      res.render("settings/changePassword.ejs", {
        postLogin: false,
        error: "Password Dont Match",
        userId: userId,
      });
      return;
    }

    updateUser(userId, { password: newPassword }, function () {
      res.redirect("/logout");
    });
  });

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/signin");
});

app.get("/settings", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/logout");
    return;
  }
  var userId = req.session.userId;
  console.log("userID: ", userId, req.session.userName);

  getUserDp(userId, function (userDp) {
    res.render("settings/setting.ejs", {
      name: req.session.userName,
      dp: userDp,
      error: false,
    });
  });
});

app.post("/updatePassword", (req, res) => {
  var userId = req.session.userId;
  var newPassword = req.body.newPassword;
  var confirmPassword = req.body.confirmPassword;

  if (newPassword !== confirmPassword) {
    getUserDp(userId, function (userDp) {
      res.render("settings/setting.ejs", {
        name: req.session.userName,
        dp: userDp,
        error: "Password Dont Match",
      });
    });
    return;
  }

  getUserDp(userId, function (userDp) {
    updateUser(userId, { password: newPassword }, function () {
      res.redirect("/logout");
    });
  });
});

app
  .route("/cart")
  .get((req, res) => {
    if (!req.session.isLoggedIn) {
      res.redirect("/logout");
      return;
    }
    var userId = req.session.userId;
    getUserDp(userId, (userDp) => {
      getCartList({ userId: userId }, (productList) => {
        // console.log("log products: ",typeof productList)
        res.render("partials/myCart.ejs", {
          userName: req.session.userName,
          userDp: userDp,
          productList: productList,
          loadMore: false,
        });
      });
    });
  })
  .post((req, res) => {
    var productItem = req.body;
    if (!req.session.isLoggedIn) {
      res.status(400);
      console.log("Please Login first");
      res.end();
      return;
    }
    productItem.userId = req.session.userId;
    console.log("log product added to cart: ", productItem);

    addToCart(productItem, function () {
      res.status(200);
      console.log("product has been added");
      res.end();
    });
  });

app.route("/remove-from-cart").post((req, res) => {
  var cartItem = req.body;
  console.log("log test: ", cartItem.cartId);

  deleteProductFromCarts(cartItem.cartId, function () {
    res.end();
  });
});

app.route("/update-cart").post((req, res) => {
  var cartItem = req.body;
  console.log("cart Id: ", cartItem);
  updateCartList(
    cartItem.cartId,
    { productQuantity: Number(cartItem.quantity) },
    function () {
      console.log("Product quantity has been updated");
      res.end();
    }
  );
});

app.get("/loadMore", (req, res) => {
  getFiveProducts(req.session.prodIndex, function (arr) {
    // console.log("type check: ", arr);
    req.session.prodIndex = req.session.prodIndex + 5;
    res.send(JSON.stringify(arr));
  });
  // res.end("hello")
});

// Admin

app.route("/admin").get((req, res) => {

  if(!req.session.userId){
    res.redirect("*");
    return;
  }

  isAdmin(req.session.userId, function(user){
    if(user === null){
      res.redirect("*")
      return;
    }
    var userId = user._id;
    var pageType = req.query.pageType;
    getUserDp(userId, function (userDp) {
      getProductList({ adminId: req.session.userId }, function (productList) {
        res.render("admin/admin.ejs", {
          name: req.session.userName,
          dp: userDp,
          productList: productList,
          pageType: pageType,
        });
      });
    });
  })
  
});

app
  .route("/addProduct")
  .post(upload.single("image"), (req, res) => {
    var productItem = req.body;
    console.log("product Item: ", productItem, req.file);
    productModel.create({
      productName: productItem.name,
      productImg: req.file.filename,
      productPrice: productItem.price,
      productDescription: productItem.description,
      productQuantity: productItem.quantity,
      adminId: req.session.userId,
    });
    res.redirect("/admin?pageType=add-a-product");
  })
  .get((req, res) => {
    var productItem = req.query;
    var key = productItem.key;
    console.log("log lmao: ", key);
    getProductList({ _id: key }, function (productList) {
      var productPrice = productList[0].productPrice;
      console.log("got the price :)");
      res.end(JSON.stringify(productPrice));
    });
  });

app.route("/update-product").post(upload.single("image"), (req, res) => {
  var productItem = req.body;

  console.log("log product update check: ", productItem);
  updateProduct(
    req.body.key,
    {
      productName: productItem.name,
      productPrice: productItem.price,
      productQuantity: Number(productItem.quantity),
      productDescription: productItem.description,
    },
    function () {
      console.log("Product has been updated");
      res.end();
    }
  );
});

app.route("/delete-product").post((req, res) => {
  deleteProduct(req.body.key, function () {
    console.log("product has been deleted");
    res.end();
  });
});

// Wrong Endpoint
app.get("*", (req, res) => {
  res.render("error/500.ejs");
});

// Functions: -

// Registers a new user and saves to DB
function insertUser(data, callback) {
  userModel.create(data).then(() => {
    callback();
  });
}

function findUsers(findCondition, callback) {
  // console.log('log at findusers: ', data)
  userModel.findOne(findCondition).then((user) => {
    callback(user);
  });
}

function updateUser(userId, updateValue, callback) {
  userModel.findByIdAndUpdate(userId, updateValue).then(() => {
    callback();
  });
}

function getUserDp(userId, callback) {
  userModel
    .findOne({ _id: userId })
    .then((user) => {
      var userDp = user.displayPic;
      if (!userDp.length) userDp = "/defaultDp/dp.png";
      callback(userDp);
    })
    .catch((error) => {
      callback("/defaultDp/dp.png");
    });
}

function addToCart(productItem, callback) {
  cartModel.create(productItem).then(() => {
    callback();
  });
}

function getCartList(condition, callback) {
  // console.log("hell :)");
  cartModel
    .find(condition)
    .populate("productId")
    .then((userCart) => {
      // console.log("backend products: ", userCart);
      callback(userCart);
    });
}

function updateCartList(cartId, updateValue, callback) {
  cartModel.findByIdAndUpdate(cartId, updateValue).then(() => {
    callback();
  });
}

function deleteProductFromCarts(cartId, callback) {
  cartModel.findByIdAndDelete(cartId).then(() => {
    console.log("yay");
    callback();
  });
}

function getProductList(condition, callback) {
  productModel.find(condition).then((productList) => {
    callback(productList);
  });
}

function updateProduct(productId, newProduct, callback) {
  productModel.findByIdAndUpdate({ _id: productId }, newProduct).then(() => {
    callback();
  });
}

function deleteProduct(productId, callback) {
  productModel.findByIdAndDelete(productId).then(() => {
    callback();
  });
}

function getFiveProducts(idx, callback) {
  productModel.find({}).then((productList) => {
    var resList = [];
    var limit = idx + 5 >= productList.length ? productList.length : idx + 5;
    for (var i = idx; i < limit; ++i) {
      resList.push(productList[i]);
    }
    var more = productList.length / (idx + 5) > 1 ? true : false;
    // console.log("more check: ", more, resList);
    callback([resList, more]);
  });
  // fs.readFile("./products.txt", "utf-8", (err, data) => {
  //   // console.log('data', data)
  //   var productList = data.length ? JSON.parse(data): []

  // })
}

function isAdmin(userId, callback){
  userModel.findById(userId).then((user) => {
    console.log("check admin: ", user);
    if (!user.isAdmin) {
      console.log("Not an admin :)  ");
      callback(null);
    }
    callback(user);
  });
}

// ServerListener
app.listen(PORT, () => {
  console.log(`Server is Live and running :)`);
});

// forget-password/change-password/NaN          error in changePassword.ejs probably :)
