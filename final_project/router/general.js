const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Vérifier si le nom d'utilisateur existe déjà
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists." });
    }

    // Vérifier si le nom d'utilisateur est valide
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username. Username must have at least 5 characters and contain only letters and numbers." });
    }

    // Ajouter le nouvel utilisateur au tableau d'utilisateurs
    users.push({ username, password });

    return res.status(200).json({ message: "User successfully registered." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
    if (booksByAuthor.length > 0) {
        res.status(200).json(booksByAuthor);
    } else {
        res.status(404).json({ message: 'No books found for author' });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const booksByTitle = Object.values(books).filter(book => book.title === title);
    if (booksByTitle.length > 0) {
        res.status(200).json(booksByTitle);
    } else {
        res.status(404).json({ message: 'No books found for this title' });
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
