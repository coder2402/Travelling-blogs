const Safar = require('../models/safarSchema');

module.exports.home = function(req, res) {
    return res.render('home');
}
module.exports.about = function(req, res) {
    return res.render('about');
}
module.exports.review = function(req, res) {
    return res.render('review');
}


module.exports.add_review = function(req, res) {
    Safar.create(req.body,
        function(err, newReview) {
            if (err) {
                console.log('Error in creating review');
                return res.status(500).send('Error in creating review');
            }
            return res.redirect('/explore');
        });
}

module.exports.explore = function(req, res) {
    Safar.find().sort('_id').exec(function(err, reviews) {
        if (err) {
            console.log('error in fetching reviews!');
            return res.status(500).send('Error in fetching reviews');
        }
        return res.render('explore', {
            reviews: reviews
        });
    });
}

module.exports.delete_review = function(req, res) {
    let id = req.query.id;

    Safar.findByIdAndDelete(id, function(err) {
        if (err) {
            console.log('Error in deleting review from the database');
            return res.status(500).send('Error in deleting review');
        }
        return res.redirect('/explore');
    });
}
