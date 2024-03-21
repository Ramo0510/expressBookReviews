const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if username already exists
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists." });
    }

    // Check if username is valid
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username. Username must have at least 5 characters and contain only letters and numbers." });
    }

    // Add the new user to the users array
    users.push({ username, password });

    return res.status(200).json({ message: "User successfully registered." });
});

// Get the book list available in the shop using async callback function
public_users.get(['/','/books'], async function (req, res) {
    try {
        res.json(books);
        console.log("Retrieved list of books");
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Get book details based on ISBN using Promises with axios
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get('https://omardij01-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books')
        .then(response => {
            const books = response.data.books;
            const bookByIsbn = books[isbn];
            if (bookByIsbn) {
                res.json(bookByIsbn);
                console.log("Retrieved book details by ISBN");
            } else {
                res.status(404).json({ message: "Book not found" });
            }
        })
        .catch(error => {
            console.error('Error fetching book details:', error);
            res.status(500).json({ message: "Error fetching book details" });
        });
});
  
// Get book details based on author using async-await with axios
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const response = await axios.get('https://omardij01-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books');
        const books = response.data.books;
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
            console.log("Retrieved books by author");
        } else {
            res.status(404).json({ message: 'No books found for author' });
        }
    } catch (error) {
        console.error('Error fetching books by author:', error);
        res.status(500).json({ message: 'Error fetching books by author' });
    }
});

// Get all books based on title using async-await with axios
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        const response = await axios.get('https://omardij01-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books');
        const books = response.data.books;
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle);
            console.log("Retrieved books by title");
        } else {
            res.status(404).json({ message: 'No books found for this title' });
        }
    } catch (error) {
        console.error('Error fetching books by title:', error);
        res.status(500).json({ message: 'Error fetching books by title' });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        if (book.reviews && Object.keys(book.reviews).length > 0) {
            res.status(200).json(book.reviews);
        } else {
            res.status(404).json({ message: 'No reviews available for this book' });
        }
    } else {
        res.status(404).json({ message: 'No book found for this ISBN' });
    }
});

module.exports.general = public_users;
