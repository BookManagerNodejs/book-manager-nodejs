const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { buildSession } = require('./config/session');
const passport = require('./config/passport'); // chỉ để side-effect đăng ký strategy
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middlewares/error');
const bookRoutes = require('./routes/book.routes');
const path = require('path');
const categoryRoutes = require('./routes/category.routes');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(buildSession());
app.use(require('passport').initialize());
app.use(require('passport').session());

app.use('/api/auth', authRoutes);


app.use('/api/books', bookRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => res.redirect('/login.html'));


app.use('/api/categories', categoryRoutes);

app.use(errorHandler);

module.exports = app;

