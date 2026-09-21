const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "Customer successfully registred. Now you can login" });
});

// Task 1 & Task 10: Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };
    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list" });
  }
});

// Task 2 & Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found" });
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(err.status).json({ message: err.message });
    });
});

// Task 3 & Task 12: Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const getBooksByAuthor = () => {
      return new Promise((resolve) => {
        const matchingBooks = [];
        const bookKeys = Object.keys(books);
        bookKeys.forEach((key) => {
          if (books[key].author.toLowerCase() === author.toLowerCase()) {
            matchingBooks.push(books[key]);
          }
        });
        resolve(matchingBooks);
      });
    };

    const result = await getBooksByAuthor();
    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Task 4 & Task 13: Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    const matchingBooks = [];
    const bookKeys = Object.keys(books);
    bookKeys.forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push(books[key]);
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ status: 404, message: "No books found with this title" });
    }
  });

  getBooksByTitle
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      return res.status(err.status).json({ message: err.message });
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
