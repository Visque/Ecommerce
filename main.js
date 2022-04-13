const PORT = 3000

const express = require("express");
const session = require("express-session");
const fs = require("fs");
const multer = require("multer");
const morgan = require("morgan");
const sendMail = require("./utils/mailSender");

// Db Imports
const db = require("./database")
const userModel = require("./database/models/users")

db.start()

const app = express()

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

app.use(morgan("dev"));                             // Logger

app.use(express.json())                             // Read JSON data
app.use(express.urlencoded())                       // Read Form data

app.use(express.static('public'))                   // Public Static
app.use(express.static('uploads'))                  // uploads Static

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(                                            // Session
  session({
    secret: "keyboard Cat",
  })
);


// Routing
app.get('/', (req, res) => {
    var userId = req.session.userId;

    if(req.session.isLoggedIn){                   // User is Valid
        getUserDp(userId, function(userDp){
          // console.log('users DP: ', userDp)

          // Get first 5 products
          getFiveProducts(0, function(arr){
            req.session.prodIndex = 5;
            var resList = arr[0];
            var more = arr[1];
            res.render("home.ejs", { 
              name: req.session.userName, 
              dp: userDp,
              productList: resList, 
              loadMore: more 
            });
          });

        });
    }
    else{                                         // User isn't Valid
        res.redirect('/signin')
    }
})

app.route('/signin')
.get((req, res) => {
    res.render("auth/signin", {error: ""});
})
.post((req, res) => {
    var userName = req.body.userName;
    var password = req.body.password;

    var data = {
        userName: userName,
        password: password
    }
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
})

app.route("/signup")
.get((req, res) => {
  res.render("auth/signup", {error: ""});
})
.post(upload.single('displayPic'), (req, res) => {
    // console.log(req.body)
    var userName = req.body.userName
    var email = req.body.email
    var password = req.body.password
    var passwordCheck = req.body.confirmPassword
    var displayPic = req.file ? req.file.filename : ""

    if(password !== passwordCheck){
        res.render('auth/signup', {error: "Passwords Don't Match"})
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
          var html = '<h1>Click here to verify your email address: <a href="http://localhost:3000/email-verification/'+userName+'">click here</a></h1> <br> <h5>This is for developement purposes only IGNORE if it is irrelevent (must be sent to you by mistake) to you. You do not need to click the link but incase if you do not need to worry since it does nothing ( development site :) ). Sorry for the inconvenience :(</h5>';
          console.log("html: ", html);
          sendMail(email, html, function (error) {
            if (error) {
              console.log(error);
              res.render("auth/signup", {error: error});
            } else {
              console.log("mail has been sent");
              res.redirect("/signin");
            }
          });
        });
      }
    });
})

app.get("/email-verification/:userName", (req, res) => {
  var userName = req.params.userName;

  userModel.findOneAndUpdate({userName: userName}, {emailVerified: true}).then(() => {
    res.redirect("/signin")
  });
});

app.route("/forgot-password")
.get((req, res) => {
  res.render("auth/forgot-password.ejs", {error: ""})
})
.post((req, res) => {
  var userEmail = req.body.email;

  findUsers({ email: userEmail }, function(user){
    var userId = user._id;
    var html = '<h1>Click here to Reset your Password: <a href="http://localhost:3000/forgot-password/change-password/'+userId+'">click here</a></h1> <br> <h5>This is for developement purposes only IGNORE if it is irrelevent (must be sent to you by mistake) to you. You do not need to click the link but incase if you do not need to worry since it does nothing ( development site :) ). Sorry for the inconvenience :(</h5>';
    console.log("html: ", html)
    sendMail(userEmail, html, function(error){
      if (error) {
        console.log(error);
        res.render("auth/signup", { error: error });
      } else {
        console.log("mail has been sent");
        res.render("auth/forgot-password", {error: "check Email"});
      }
    })
  })

})

app.route("/forgot-password/change-password/:userId")
.get((req, res) => {
  // var userId = getUserId(req.params.email)
  // sb user detail
  console.log('user ID at get forgot/change: ', req.params.userId);
  res.render("settings/changePassword.ejs", {error: false, postLogin: false, userId: req.params.userId})
})
.post((req, res) => {
  var userId = req.params.userId;
  console.log()
  var newPassword = req.body.newPassword;
  var confirmPassword = req.body.confirmPassword;

  if (newPassword !== confirmPassword) {
    res.render("settings/changePassword.ejs", { postLogin: false, error: "Password Dont Match", userId: userId });
    return;
  }

  updateUser(userId, { password: newPassword }, function () {
    res.redirect("/");
  });
})

app.get("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/");
}) 

app.get("/settings", (req, res) => {

  if(!req.session.isLoggedIn){
    res.redirect('/')
    return;
  } 
  var userId = req.session.userId;
  console.log("userID: ", userId, req.session.userName);

  getUserDp(userId, function(userDp){
    res.render("settings/setting.ejs", {name: req.session.userName, dp: userDp, error: false})
  })
})

app.post("/updatePassword", (req, res) => {
  var userId = req.session.userId;
  var newPassword = req.body.newPassword;
  var confirmPassword = req.body.confirmPassword;

  if(newPassword !== confirmPassword){
    getUserDp(userId, function(userDp){
      res.render("settings/setting.ejs", {name: req.session.userName, dp: userDp, error: "Password Dont Match"})
    })
    return;
  }

  getUserDp(userId, function(userDp){
    updateUser(userId, {password: newPassword}, function(){

      res.redirect("/logout")
    })
  })
})

app.get('/loadMore', (req, res) => {
  getFiveProducts(req.session.prodIndex, function (arr) {
    // console.log("type check: ", arr);
    req.session.prodIndex = req.session.prodIndex + 5
    res.send(JSON.stringify(arr));
  });
  // res.end("hello")
})

// Wrong Endpoint
app.get("*", (req, res) => {
  res.render("error/500.ejs");
});


// Functions: -

// Registers a new user and saves to DB
function insertUser(data, callback){
    userModel.create(data).then(() => {
      callback();
    });
}

function findUsers(findCondition, callback){
    // console.log('log at findusers: ', data)
    userModel.findOne(findCondition).then((user) => {
        callback(user);
    })
}

function updateUser(userId, updateValue, callback){
  userModel.findByIdAndUpdate(userId, updateValue).then(() => {
    callback();
  })
}

function getUserDp(userId, callback){
  userModel.findOne({_id: userId}).then((user) => {
    var userDp = user.displayPic
    if(!userDp.length)  userDp = "/defaultDp/dp.png"
    callback(userDp)
  })
}

function getFiveProducts(idx, callback){
  fs.readFile("./products.txt", "utf-8", (err, data) => {
    // console.log('data', data)
    var productList = data.length ? JSON.parse(data): []

    var resList = []
    var limit = idx + 5 >= productList.length ? productList.length : idx + 5
    for(var i = idx; i < limit; ++i){
      resList.push(productList[i])
    }
    var more = (productList.length / (idx + 5)) > 1 ? true : false
    console.log("more check: ", more);
    callback([resList, more])
  })
}

// ServerListener
app.listen(PORT, () => {
    console.log(`Server is Live and running :)`)
})



// forget-password/change-password/NaN          error in changePassword.ejs probably :)