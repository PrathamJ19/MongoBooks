const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");
const { body, validationResult } = require('express-validator');
const Book = require("./models/book");

router.get("/", (req, res) => {
    Book.find({})
        .then((Books) => {
            res.json(Books);
        })
        .catch((error) => {
            console.error("Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

router.route("/add")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, './views/add.html'));
    })
    .post(
        [
            body("title", "Title is required").notEmpty(),
            body("author", "Author is required").notEmpty(),
            body("pages", "Pages is required").notEmpty(),
            body("ratings", "Rating is required").notEmpty(),
            body("genres", "Genre is required").notEmpty(),
        ],
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            let newBook = new Book();
            newBook.title = req.body.title;
            newBook.author = req.body.author;
            newBook.pages = req.body.pages;
            newBook.genres = req.body.genres;
            newBook.ratings = req.body.ratings;
            newBook
                .save()
                .then(() => {
                    res.json({ message: "Successfully Added" });
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ error: "Internal Server Error" });
                });
        }
    );

router.route("/book/:id")
    .get((req, res) => {
        Book.findById(req.params.id)
            .then((book) => {
                if (!book) {
                    return res.status(404).json({ error: "Book not found" });
                }
                res.json({ book: book });
            })
            .catch((err) => {
                console.error("Error fetching book by id:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    })
    .delete((req, res) => {
        const query = { _id: req.params.id };
        Book.deleteOne(query)
            .then(result => {
                if (result.deletedCount > 0) {
                    res.json({ message: 'Successfully Deleted' });
                } else {
                    res.status(404).json({ error: 'Book not found' });
                }
            })
            .catch(err => {
                console.error('Error deleting book by id:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    });

router.route("/edit/:id")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, './views/edit-book.html'));
    });

router.route("/book/edit/:id")
    .get((req, res) => {
        Book.findById(req.params.id)
            .then((book) => {
                if (!book) {
                    return res.status(404).json({ error: "Book not found" });
                }
                res.json({ book: book });
            })
            .catch((err) => {
                console.error("Error fetching book by id:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    })
    .post((req, res) => {
        let updatedBook = {
            title: req.body.title,
            author: req.body.author,
            pages: req.body.pages,
            genres: req.body.genres,
            rating: req.body.rating,
        };
        const query = { _id: req.params.id };
        Book.updateOne(query, updatedBook)
            .then(() => {
                res.json({ message: "Successfully Updated" });
            })
            .catch((err) => {
                console.error("Error updating book by id:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    });

module.exports = router;
