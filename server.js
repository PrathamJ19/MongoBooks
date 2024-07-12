const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Book = require("./models/book"); // Import your Book model
const validateBook = require('./middleware/addbook_validator'); // Import your book validation middleware
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://your_connection_string_here", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db = mongoose.connection;

// Validate ObjectId function
function validateObjectId(req, res, next) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid book ID' });
    }
    next();
}

// MongoDB connection events
db.once("open", () => {
    console.log("Connected to MongoDB");
});

db.on("error", (err) => {
    console.error("DB Error:", err);
});

// Routes

// Example root route
app.get("/", (req, res) => {
    Book.find({})
        .then((books) => {
            res.json(books);
        })
        .catch((error) => {
            console.error("Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

// Route for adding a book
app.route("/book/add")
    .get((req, res) => {
        res.sendFile(path.join(__dirname, "views/add.html"));
    })
    .post(validateBook, (req, res) => {
        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            pages: req.body.pages,
            genres: req.body.genres,
            ratings: req.body.ratings
        });

        book.save()
            .then(() => {
                res.json({ message: "Successfully Added" });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    });

// Route for getting, updating, and deleting a book by ID
app.route("/api/book/:id")
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
            .then((result) => {
                if (result.deletedCount > 0) {
                    res.json({ success: true, message: "Successfully Deleted" });
                } else {
                    res.status(404).json({ error: "Book not found" });
                }
            })
            .catch((err) => {
                console.error("Error deleting book by id:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    });

// Route for editing a book
app.route("/book/edit/:id")
    .get((req, res) => {
        console.log("Edit book ID:", req.params.id); // Log the ID to check if it's correct
        res.sendFile(path.join(__dirname, "views", "book.html"));
    });

app.route("/api/book/edit/:id")
    .get(validateObjectId, (req, res) => { 
        Book.findById(req.params.id)
            .then((book) => {
                if (!book) {
                    console.log("Book not found for ID:", req.params.id); 
                    return res.status(404).json({ error: "Book not found" });
                }
                res.json({ book: book });
            })
            .catch((err) => {
                console.error("Error fetching book by id:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    })
    .post(validateObjectId, (req, res) => { 
        let updatedBook = {
            title: req.body.title,
            author: req.body.author,
            pages: req.body.pages,
            genres: req.body.genres,
            ratings: req.body.ratings
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

// Start server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
