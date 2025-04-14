/********************************************************************************* 

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name:  Aamna Raja 
Student ID:   149336224­
Date:  2025-04-12
Cyclic Web App URL:  https://web322-assignment5-42yx.onrender.com
GitHub Repository URL:  Puran1964/web322-assignment5

********************************************************************************/  

const fs = require("fs");

let items = [];
let categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                items = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}


module.exports.getItemById = function(id){
    return new Promise((resolve,reject)=>{
        let foundItem = items.find(item => item.id == id);

        if(foundItem){
            resolve(foundItem);
        }else{
            reject("no result returned");
        }
    });
}

module.exports.getAllItems = function(){
    return new Promise((resolve,reject)=>{
        (items.length > 0 ) ? resolve(items) : reject("no results returned"); 
    });
}

module.exports.getPublishedItems = function(){
    return new Promise((resolve,reject)=>{
        (items.length > 0) ? resolve(items.filter(item => items.published)) : reject("no results returned");
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        (categories.length > 0 ) ? resolve(categories) : reject("no results returned"); 
    });
}

module.exports.addItem = function(itemData){
    return new Promise((resolve, reject)=>{
      itemData.published = itemData.published ? true : false;
      itemData.id = items.length + 1;
  
      itemData.postDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  
      items.push(itemData);
      resolve();
    });
  };
  

module.exports.getItemsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        let filteredItems = items.filter(post=>post.category == category);

        if(filteredItems.length == 0){
            reject("no results returned")
        }else{
            resolve(filteredItems);
        }
    });
}

module.exports.getItemsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(post => (new Date(post.postDate)) >= (new Date(minDateStr)))

        if (filteredItems.length == 0) {
            reject("no results returned")
        } else {
            resolve(filteredItems);
        }
    });
}

module.exports.getPublishedItemsByCategory = function(category){
    return new Promise((resolve, reject) => {
      let filteredItems = items.filter(item => item.published === true && item.category == category);
      if (filteredItems.length > 0) {
        resolve(filteredItems);
      } else {
        reject("no results returned");
      }
    });
  };
  