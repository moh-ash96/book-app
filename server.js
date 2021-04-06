'use strcit'

// Load environment variables module
require('dotenv').config();

// Load modules into our script 
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// App setup 
const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => console.log(err));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static('public'));
app.set('view engine', 'ejs'); // Set the view engine for server-side 



// console.log(superagent)


app.get('/', (req, res) => { // render the index.ejs from DB
    const SQL = 'SELECT * FROM books;';
    client
        .query(SQL)
        .then((results) => {
            res.render('pages/index', { book: results.rows });
        })
        .catch((err) => {
            errorHandler(err, req, res);
        });
});


app.get('/books/:id', (req, res) => { // render the datails of a book
    const SQL = 'SELECT * FROM books WHERE id=$1;';
    const values = [req.params.id];
    console.log(values);
    client
        .query(SQL, values)
        .then((results) => {
            // console.log(results)
            res.render('pages/books/show', { book: results.rows[0] });
        })
        .catch((err) => {
            errorHandler(err, req, res);
        });
});

app.post('/books', (req, res) => { // Insert books into DB if not

    // let values = [req.body.isbn];
    let SQL = 'INSERT INTO books (image_url,title,author,description) VALUES ($1,$2,$3,$4) RETURNING id ;';
    let values = [req.body.img, req.body.title, req.body.author, req.body.description];
    client.query(SQL, values).then((results) => {
            // if (results.rows.length > 0) {
            // res.redirect(`/books/${results.rows[0].id}`);
            //  else {
            res.redirect(`/books/${results.rows[0].id}`);
            // console.log("inside insert")
            // let sqlQuery = 'SELECT * FROM books'
            // client.query(sqlQuery).then((results) => {
            //         console.log('data returned back from db ', results);

        })
        .catch((err) => {
            errorHandler(err, req, res);
        })
        // }
});

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
                // console.log(data.id);
                return new Book(data);
            })
            response.render('pages/searches/show', { book: Books })
        })
        .catch(err => errorHandler(err, request, response))
}




// constructor books
function Book(data) {
    this.image_url = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = data.volumeInfo.title ? data.volumeInfo.title : "DEFULT TITLE";
    this.author = data.volumeInfo.authors ? data.volumeInfo.authors : "DEFULT AUTHOR";
    this.description = data.volumeInfo.description ? data.volumeInfo.description : "DEFULT DESCRIPTION";
    // this.isbn = (data.volumeInfo.industryIdentifiers && data.volumeInfo.industryIdentifiers[0].identifier) ? data.volumeInfo.industryIdentifiers[0].identifier : "NO ISBN AVAILABLE"
}

function errorHandler(err, req, res) {
    res.status(500).send(err);
}

client.connect()
    .then(app.listen(PORT, () =>
        console.log(`app is listening on ${PORT}`)))