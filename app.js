
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var expressHbs = require('express-handlebars');
var session = require('express-session');
var MemoryStore = require('session-memory-store')(session);
var sessionStore = new MemoryStore();

var app = express();
app.set('trust proxy', 1)

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(cookieParser());
app.use(session({
  cookie: { maxAge: 1000*60*2 } ,
  secret: "session secret" ,
  store: sessionStore,
  resave: true, 
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

var products = require("./seed");

// Routes

app.get('/', function(req, res, next) {
  req.session.cart = req.session.cart || {};

  totalPrice = 0
  var keys = Object.keys(req.session.cart);
  for(i in keys){
    totalPrice += (req.session.cart[keys[i]].qty * req.session.cart[keys[i]].price)
  }

  res.render('shop/index', { title: 'Shopping Cart', products: products , totalPrice: totalPrice });
});

app.get('/cart/:id', function(req, res, next) {
  product = products[req.params.id]
    if(req.session.cart[req.params.id]){
      req.session.cart[req.params.id] = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        imagePath: product.imagePath,
        total: (req.session.cart[req.params.id].qty + 1) * product.price,
        qty: req.session.cart[req.params.id].qty + 1
      }
    } else {
      req.session.cart[req.params.id] = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        imagePath: product.imagePath,
        total: product.price,
        qty: 1
      }
    }

    res.redirect('/');
});

app.get('/cart', function(req, res, next) {
  req.session.cart = req.session.cart || {};

  totalPrice = 0
  var keys = Object.keys(req.session.cart);
  for(i in keys){
    totalPrice += (req.session.cart[keys[i]].qty * req.session.cart[keys[i]].price)
  }

  res.render('shop/cart', { title: 'Your Cart', products: req.session.cart, totalPrice: totalPrice})
})

app.get('/removeall', function(req, res, next) {
  req.session.cart = {}
  res.redirect('/');
})

app.get('/remove/:id', function(req, res, next) {
  req.session.cart = req.session.cart || {};
  delete req.session.cart[req.params.id];
  res.redirect('/cart');
})

app.get('/subtract/:id', function(req, res, next) {
  req.session.cart = req.session.cart || {};
  if(req.session.cart[req.params.id] && req.session.cart[req.params.id].qty > 1){
    req.session.cart[req.params.id].qty--
    req.session.cart[req.params.id].total = req.session.cart[req.params.id].price * req.session.cart[req.params.id].qty
  }
  res.redirect('/cart');
})

app.get('/add/:id', function(req, res, next) {
  req.session.cart = req.session.cart || {};
  if(req.session.cart[req.params.id]){
    req.session.cart[req.params.id].qty++
    req.session.cart[req.params.id].total = req.session.cart[req.params.id].price * req.session.cart[req.params.id].qty
  }
  res.redirect('/cart');
})

var port = process.env.PORT || '3000';
app.set('port', port);

app.listen(port, function () {
  console.log('App listening on port 3000!');
});