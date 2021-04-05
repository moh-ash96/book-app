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

app.get('/searches/new', showForm);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

app.get('*', (req, res) => res.status(404).send('This route does not exist'));

function showForm(req, res) {
    res.render('pages/searches/new')
}


function createSearch(request, response) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';

    console.log(request.body);
    console.log(request.body.search);
    console.log(request.body.radio)
        // console.log(request.body.search[1]);
        // console.log(request.body.search[0]);

    // can we convert this to ternary?
    request.body.radio === 'title' ? url += `intitle=${request.body.search}` : url += `inauthor=${request.body.search}`;
    console.log(url);
    // request.body.radio === 'author' ?  : '';
    // if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
    // if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

    superagent.get(url)
        .then(apiResponse => {
            // response.send(apiResponse.body.items)
            const Books = apiResponse.body.items.map(data => {
                console.log(data.id)
                return new Book(data);
            })
            response.render('pages/searches/show', { books: Books })
        })
        .catch(err => errorHandler(err, request, response))
}




// constructor books
function Book(data) {
    this.image_url = data.volumeInfo.imageLinks.thumbnail ? data.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = data.volumeInfo.title ? data.volumeInfo.title : "DEFULT TITLE";
    this.author = data.volumeInfo.authors ? data.volumeInfo.authors : "DEFULT AUTHOR";
    this.description = data.volumeInfo.description ? data.volumeInfo.description : "DEFULT DESCRIPTION";
}

function errorHandler(err, req, res) {
    res.status(500).send(err);
}

app.listen(PORT, () =>
    console.log(`app is listening on ${PORT}`))