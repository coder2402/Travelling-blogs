const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

// app.get('/', function(req, res) {
//     return res.send('<h1>Safar</h1>');
// })

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('static'));
app.use(express.urlencoded());

require('./config/mongoose');

app.use('/', require('./routes/index'));

app.listen(port, function(err) {
    if (err) {
        console.log('Error: ', err);
    }
    console.log('Server is running on port:', port);
})
