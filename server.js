/********************************************************************************* 

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name: Aamna Raja   
Student ID:  149336224­
Date:  2025-04-12
Cyclic Web App URL:  
GitHub Repository URL: Puran1964/web322-assignment5 

********************************************************************************/

const express = require("express");
const itemData = require("./store-service");
const path = require("path");
const exphbs = require('express-handlebars');

const app = express();

//  handlebars engine
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    navLink: function (url, options) {
      return '<li class="nav-item' + ((url === app.locals.activeRoute) ? ' active' : '') +
        '"><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
    safeHTML: function(context) {
      return new exphbs.create().handlebars.SafeString(context);
    }
  }
}));

app.set('view engine', '.hbs');


// 3 new modules, multer, cloudinary, streamifier
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configure Cloudinary. This API information is
// inside of the Cloudinary Dashboard - https://console.cloudinary.com/
cloudinary.config({
  cloud_name: "",
  api_key: "",
  api_secret: "",
  secure: true,
});

//  "upload" variable without any disk storage
const upload = multer(); // no { storage: storage }


const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.use(function(req, res, next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (
    isNaN(route.split('/')[1]) 
      ? route.replace(/\/(?!.*)/, "") 
      : route.replace(/\/(.*)/, "")
  );
  app.locals.viewingCategory = req.query.category;
  next();
});


app.get("/", (req, res) => {
  res.redirect("/shop");
});


app.get("/about", (req, res) => {
  res.render("about");
});


app.get("/store", (req, res) => {
  itemData
    .getPublishedItems()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// Accept queryStrings
app.get('/items', (req, res) => {
  let queryPromise = null;

  if (req.query.category) {
    queryPromise = itemData.getItemsByCategory(req.query.category);
  } else if (req.query.minDate) {
    queryPromise = itemData.getItemsByMinDate(req.query.minDate);
  } else {
    queryPromise = itemData.getAllItems();
  }

  queryPromise
    .then((data) => {
      res.render("items", { items: data });
    })
    .catch((err) => {
      res.render("items", { message: "no results" });
    });
});


// A route for items/add
app.get("/items/add", (req, res) => {
  res.render("addPost");
});


app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);

      console.log(result);

      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;

    // TODO: Process the req.body and add it as a new Item before redirecting to /items
    itemData
      .addItem(req.body)
      .then((post) => {
        res.redirect("/items");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});

// Get an individual item
app.get('/item/:id', (req,res)=>{
    itemData.getItemById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});

app.get("/categories", (req, res) => {
  itemData
    .getCategories()
    .then((data) => {
      res.render("categories", { categories: data });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});


app.use((req, res) => {
  res.status(404).render("404");
});


itemData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("server listening on: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
  
  app.get("/shop", (req, res) => {
    let viewData = {};
  
    let itemsPromise = req.query.category
      ? itemData.getPublishedItemsByCategory(req.query.category)
      : itemData.getPublishedItems();
  
    itemsPromise
      .then((items) => {
        viewData.posts = items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.post = viewData.posts[0];
      })
      .catch(() => {
        viewData.message = "no results";
      })
      .then(itemData.getCategories)
      .then((categories) => {
        viewData.categories = categories;
        res.render("shop", { data: viewData });
      })
      .catch(() => {
        viewData.categoriesMessage = "no categories";
        res.render("shop", { data: viewData });
      });
  });
  
  app.get("/shop/:id", (req, res) => {
    let viewData = {};
  
    itemData.getPublishedItems()
      .then((items) => {
        viewData.posts = items;
        viewData.posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
      })
      .then(() => itemData.getItemById(req.params.id))
      .then((post) => {
        viewData.post = post;
      })
      .catch(() => {
        viewData.message = "no results";
      })
      .then(itemData.getCategories)
      .then((categories) => {
        viewData.categories = categories;
        res.render("shop", { data: viewData });
      })
      .catch(() => {
        viewData.categoriesMessage = "no categories";
        res.render("shop", { data: viewData });
      });
  });
  