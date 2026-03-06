const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    next();
});

// app.get('/', function(req, res) {
//     return res.send('<h1>Safar</h1>');
// })

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('static', { maxAge: 86400000 }));
app.use(express.urlencoded());

const db = require('./config/mongoose');

app.use('/', require('./routes/index'));

app.listen(port, function(err) {
    if (err) {
        console.log('Error: ', err);
    }
    console.log('Server is running on port:', port);
})
