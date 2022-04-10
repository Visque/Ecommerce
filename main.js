const PORT = 3000

const express = require("express");
const session = require("express-session");
const fs = require("fs");
const multer = require("multer");
const morgan = require("morgan");

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
    findUsers(data, function(user){
        if(user && user.password === password){
            // console.log(`user is logged in: `, user)
            req.session.isLoggedIn = true;
            req.session.userName = userName;
            req.session.userId = user._id;
            res.redirect('/')
        }
        else{
            // console.log(`user couldn't log in: `, user);
            res.render('auth/signin.ejs', {error: "Wrong Credentials"})
        }
    })
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
    };

    findUsers(user, function (person) {
      if (person) {
        // console.log(`Duplicate: `, person);
        res.render("auth/signup", {error: "UserName Taken"});
      }
      else {
        // console.log('insertings user: ', user)
        insertUser(user, function () {
          res.redirect("/signin");
        });
      }
    });

    
})

app.get("/logout", (req, res) => {
    req.session.destroy()
    res.end();
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

function findUsers(data, callback){
    // console.log('log at findusers: ', data)
    userModel.findOne({userName: data.userName}).then((user) => {
        callback(user);
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

