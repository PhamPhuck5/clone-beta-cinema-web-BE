import express from "express";

let configViewEngine =  (app) =>{
    app.use(express.static("./src/public"));
    app.set("view engine", "ejs");
    app.set("views", "./src/views");
}

export default configViewEngine;
// maybe error in type in package.json