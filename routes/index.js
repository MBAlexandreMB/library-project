const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const ensureLogin = require("connect-ensure-login");

const checkRoles = role => {
  return (req, res, next) => {
    if(req.isAuthenticated() && req.user.role === role) {
      next();
    } else {
      res.redirect('/auth/login');
    }
  }
}

const isAdmin = checkRoles('ADMIN');

router.get('/', (req, res) => {
  res.redirect('/books');
});

router.get('/books', (req, res) => {
  Book.find({})
  .then(books => {
    books = books.map(book => {
      if (req.user && book.owner && book.owner.equals(req.user._id)) {
        book.isOwner = true;
      }
      return book;
    })
    res.render('books', {books, user: req.user});
  })
    .catch(err => console.log(err));
  });
  
  
  router.get('/book/add', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
    Author.find({}, {name: 1, lastName: 1}, {sort: {name: 1}})
    .then(authors => {
      res.render('book-add', { user: req.user, authors } );
    })
    .catch(err => console.log(err));
  });
  
  router.post('/book/add', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
    const { title, author, description, rating, owner } = req.body;
    const newBook = new Book({ title, author, description, rating, owner});
    newBook.save()
    .then(() => {
      res.redirect('/books');
    })
    .catch((error) => console.log(error));
  });
  
  router.get('/book/edit/:bookId', ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
    Book.findById(req.params.bookId)
    .populate('author')
    .then((book) => {
      Author.find({_id: {$ne: book.author[0]._id}}, null, {sort: {name: 1}})
      .then(authors =>  {
        Author.findById(book.author[0]._id)
        .then(author => res.render("book-edit", {book, authors, author}))
        .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
    })
    .catch((error) => {
      console.log(error);
    })
  });
  
  router.post('/book/edit/:bookId', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
    const { title, author, description, rating } = req.body;
    
    Book.update({_id: req.params.bookId}, { $set: {title, author, description, rating }})
    .then((book) => {
      res.redirect('/books');
    })
    .catch((error) => {
      console.log(error);
    })
  });
  
  router.get('/book/:bookId', (req, res) => {
    Book.findById(req.params.bookId)
    .populate('author')
    .then(book => {
      res.render('book', book);})
      .catch(err => console.log(err));
    });


    router.get('/authors/add', ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
      res.render("author-add")
    });
    
    router.post('/authors/add', ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
      const { name, lastName, nationality, birthday, pictureUrl } = req.body;
      const newAuthor = new Author({ name, lastName, nationality, birthday, pictureUrl})
      newAuthor.save()
      .then((book) => {
        res.redirect('/books')
      })
      .catch((error) => {
        console.log(error)
      })
    });

    router.post('/reviews/add/:bookId', (req, res, next) => {
      const { user, comments } = req.body;
      Book.update({ _id: req.params.bookId }, { $push: { reviews: { user, comments }}})
      .then(book => {
        res.redirect('/book/' + req.params.bookId);  
      })
      .catch((error) => {
        console.log(error)
      })
    });

    router.get('/dashboard', isAdmin, (req, res) => {
      res.render('dashboard');
    });
    
    module.exports = router;