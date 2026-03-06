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
    const { username, location, image, experience, rating, places, expenditure } = req.body;

    // Presence validation
    if (!username || !location || !image || !experience || rating === undefined || !places || expenditure === undefined) {
        return res.status(400).send('All fields are required');
    }

    // Type validation for numeric fields
    const numericRating = Number(rating);
    const numericExpenditure = Number(expenditure);

    if (isNaN(numericRating) || isNaN(numericExpenditure)) {
        return res.status(400).send('Rating and expenditure must be numbers');
    }

    const reviewData = {
        username,
        location,
        image,
        experience,
        rating: numericRating,
        places,
        expenditure: numericExpenditure
    };

    Safar.create(reviewData,
        function(err, newReview) {
            if (err) {
                console.log('Error in creating review');
                return res.status(500).send('Error in creating review');
            }
            return res.redirect('/explore');
        });
}

module.exports.explore = function(req, res) {
    Safar.find().sort('_id').lean().exec(function(err, reviews) {
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
