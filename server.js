'use strcit'

// Load environment variables module
require('dotenv').config();

// Load modules into our script 
const express = require('express');
const superagent = require('superagent')
    // App setup 
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./public'))
app.set('view engine', 'ejs'); // Set the view engine for server-side templating


app.get('/', (req, res) => {
    res.render('pages/index'); // views/index.ejs  'views/' + name + '.' + engineExt
})


app.get('*', (req, res) => res.status(404).send('This route does not exist'));

app.listen(PORT, () =>
    console.log(`app is listening on ${PORT}`))