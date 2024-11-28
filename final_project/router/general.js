const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const booksList = await Promise.resolve(books);
        res.status(200).json(booksList);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;

    axios.get(`http://localhost:5000/books/${isbn}`)
        .then(response => res.status(200).json(response.data))
        .catch(error => res.status(500).json({ message: "Error fetching book by ISBN", error: error.message }));
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params;

    try {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        res.status(200).json(booksByAuthor);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const { title } = req.params;

    axios.get(`http://localhost:5000/books?title=${title}`)
        .then(response => res.status(200).json(response.data))
        .catch(error => res.status(500).json({ message: "Error fetching books by title", error: error.message }));
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const { isbn } = req.params;

    if (books[isbn]) {
        res.status(200).json(books[isbn].reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
