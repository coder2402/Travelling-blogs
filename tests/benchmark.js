const { performance } = require('perf_hooks');

// Mock review data generator
function generateReviews(count) {
    const reviews = [];
    for (let i = 0; i < count; i++) {
        reviews.push({
            _id: `id_${i}`,
            username: `user_${i}`,
            location: `location_${i}`,
            image: `https://example.com/image_${i}.jpg`,
            experience: `This is a long experience description for review number ${i}. It should be long enough to simulate real-world data payload.`.repeat(5),
            rating: Math.floor(Math.random() * 5) + 1,
            places: `Place A, Place B, Place C`,
            expenditure: Math.floor(Math.random() * 5000)
        });
    }
    return reviews;
}

// Simple simulation of "rendering" or processing the data
function processReviews(reviews) {
    let output = '';
    reviews.forEach(review => {
        // Simulating EJS rendering logic
        output += `User: ${review.username}, Location: ${review.location}, Rating: ${review.rating}\n`;
        output += `Exp: ${review.experience}\n`;
    });
    return output.length;
}

function runBenchmark(count) {
    const start = performance.now();
    const reviews = generateReviews(count);
    const dataSize = JSON.stringify(reviews).length;
    const processResult = processReviews(reviews);
    const end = performance.now();
    return {
        count: count,
        duration: (end - start).toFixed(4),
        dataSizeMB: (dataSize / (1024 * 1024)).toFixed(2)
    };
}

console.log('--- Performance Benchmark ---');
const unbounded = runBenchmark(1000);
console.log(`Unbounded (1000 reviews): ${unbounded.duration} ms, Data size: ${unbounded.dataSizeMB} MB`);

const bounded = runBenchmark(50);
console.log(`Bounded (50 reviews): ${bounded.duration} ms, Data size: ${bounded.dataSizeMB} MB`);

const improvement = ((unbounded.duration - bounded.duration) / unbounded.duration * 100).toFixed(2);
console.log(`Improvement: ${improvement}% faster`);
