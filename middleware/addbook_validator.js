const { body, validationResult } = require("express-validator");

const validateBook = [
body("title", "Title is required").notEmpty(),
body("author", "Author is required").notEmpty(),
body("pages", "Pages is required").notEmpty(),
body("ratings", "Rating is required").notEmpty(),
body("genres", "Genre is required").notEmpty(),
(req, res, next) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
}
next();
},
];
module.exports = validateBook;