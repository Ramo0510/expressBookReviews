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

// Get the book list available in the shop using Promises
public_users.get('/books',function (req, res) {

    const get_books = new Promise((resolve, reject) => {
        resolve(res.send(JSON.stringify({books}, null, 4)));
      });

      get_books.then(() => console.log("Promise for Task 10 resolved"));
      console.log("test: this message is displayed before the first console log above")
  });

// Get book details based on ISBN using async-await with axios
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get('https://omardij01-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books');
        const books = response.data.books;
        
        // Recherche du livre basé sur l'ISBN
        const bookByIsbn = books[isbn];
        
        if (bookByIsbn) {
            res.json(bookByIsbn);
            console.log("Promise for Task 11 resolved");
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error('Error fetching book details:', error);
        res.status(500).json({ message: "Error fetching book details" });
    }
});
  
// Get book details based on author using async-await with axios
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const response = await axios.get('https://omardij01-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/books');
        const books = response.data.books;
        
        // Filter books based on the author
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        
        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
            console.log("Promise for Task 12 resolved");
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
        
        // Filter books based on the title
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        
        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle);
            console.log("Promise for Task 13 resolved");
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
