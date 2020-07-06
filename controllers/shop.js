const Product = require('../models/product');
const Order=require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId').execPopulate()//an array will return in productId as document
    .then(user => {
      // console.log(user.cart.items);
      const products=user.cart.items
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)//this  chains the user.models function
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
  .populate('cart.items.productId').execPopulate()//an array will return in productId as document
  .then(user => {
    console.log(user.cart.items);
    
    // console.log(user.cart.items); i stands for "item"
    const products=user.cart.items.map(i=>{//this products is different than modal "products" maps change the arr items and store them in products arr in modal
      return{quantity:i.quantity,product:{...i.productId._doc}};//we store all the data into product document object
    });
    const order=new Order({//this needs to initialize according to orderSchema
      user:{
        name:req.user.name,
        userId:req.user//mongo picks the id of the user itself
      },
      products:products
  });
 return order.save();
 })
    .then(result => {
      req.user.clearCart();//this comes from user modal function
      
    }).then(()=>{
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({"user.userId":req.user._id}).then(orders=>{//userId is nested inside user in modal
    
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};
