/** Express app for message.ly. */
const express = require("express");
const nunjucks = require("nunjucks");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const { authenticateJWT } = require("./middleware/auth");

const ExpressError = require("./expressError")
const app = express();

// allow both form-encoded and json body parsing
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// allow connections to all routes from any browser and cookies parser
app.use(cors());
app.use(cookieParser());

// allow static files for te app
app.use('/js', express.static('static'));

// allow templating engine
nunjucks.configure("templates", {
    autoescape: true,
    express: app
});

// get auth token for all routes
app.use(authenticateJWT);

/** routes */
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

/** Route for the home app */
app.get("/", function(req, res) {
    res.render("home.html");
});

/** 404 handler */

app.use(function(req, res, next) {
    const err = new ExpressError("Not Found", 404);
    return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if (process.env.NODE_ENV != "test") console.error(err.stack);

    return res.json({
        error: err,
        message: err.message
    });
});


module.exports = app;
