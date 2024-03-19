const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ // Check if the username has at least 5 characters
    if (username.length < 5) {
      return false; // Username must have at least 5 characters
    }
  
    // Check if the username contains only letters (both uppercase and lowercase) and numbers
    const validCharacters = /^[a-zA-Z0-9]+$/;
    if (!validCharacters.test(username)) {
      return false; // Username can only contain letters and numbers
    }
  
    // If all conditions are met, the username is considered valid
    return true;
  };

const authenticatedUser = (username,password)=>{ 
    // Vérifier si l'utilisateur est authentifié
    const validUser = users.find(user => user.username === username && user.password === password);
    return validUser ? true : false;
};

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60*60 });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const review = req.body.review;

    // Vérifier si l'utilisateur est connecté
    if (!username) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    // Vérifier si la revue est fournie
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Trouver le livre correspondant à l'ISBN
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Ajouter ou modifier la revue
    if (!book.reviews) {
        book.reviews = {};
    }
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review added or modified successfully" });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;

    // Vérifier si l'utilisateur est connecté
    if (!username) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    // Trouver le livre correspondant à l'ISBN
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Vérifier si le livre a des critiques
    if (!book.reviews) {
        return res.status(404).json({ message: "No reviews available for this book" });
    }

    // Vérifier si l'utilisateur a une critique pour ce livre
    if (!book.reviews[username]) {
        return res.status(404).json({ message: "No review found for this user and ISBN" });
    }

    // Supprimer la critique de l'utilisateur pour ce livre
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
