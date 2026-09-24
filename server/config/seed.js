require('dotenv').config();
const connectDB = require('./connect');

const User = require('../models/Users/User');
const Seller = require('../models/Seller/Seller');
const Admin = require('../models/Admin/Admin');
const Author = require('../models/Author');
const Category = require('../models/Category');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');
const Review = require('../models/Review');
const Interaction = require('../models/Interaction');

const CATEGORY_NAMES = [
  'Fiction',
  'Non Fiction',
  'Science',
  'Technology',
  'Programming',
  'History',
  'Biography',
  'Business',
  'Self Help',
  'Children',
  'Comics'
];

// Real, published books with real ISBN-13s, grouped by the store's category names.
// Cover images are pulled live from the Open Library Covers API (covers.openlibrary.org),
// which serves the actual cover photo for a given ISBN - so seeded books show real book
// cover images instead of generated placeholder art.
const BOOK_POOL = [
  // Fiction
  { title: '1984', author: 'George Orwell', isbn: '9780451524935', category: 'Fiction' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', category: 'Fiction' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', category: 'Fiction' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', category: 'Fiction' },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', category: 'Fiction' },
  { title: 'Where the Crawdads Sing', author: 'Delia Owens', isbn: '9780735219090', category: 'Fiction' },
  { title: 'The Da Vinci Code', author: 'Dan Brown', isbn: '9780307474278', category: 'Fiction' },
  { title: 'A Game of Thrones', author: 'George R.R. Martin', isbn: '9780553593716', category: 'Fiction' },
  { title: 'Norwegian Wood', author: 'Haruki Murakami', isbn: '9780375704024', category: 'Fiction' },
  // Non Fiction
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '9780062316097', category: 'Non Fiction' },
  { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', category: 'Non Fiction' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', category: 'Non Fiction' },
  { title: 'Outliers', author: 'Malcolm Gladwell', isbn: '9780316017930', category: 'Non Fiction' },
  // Science
  { title: 'A Short History of Nearly Everything', author: 'Bill Bryson', isbn: '9780767908184', category: 'Science' },
  { title: 'Cosmos', author: 'Carl Sagan', isbn: '9780345539434', category: 'Science' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '9780198788607', category: 'Science' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', category: 'Science' },
  // Technology
  { title: 'The Innovators', author: 'Walter Isaacson', isbn: '9781476708706', category: 'Technology' },
  { title: 'Steve Jobs', author: 'Walter Isaacson', isbn: '9781451648539', category: 'Technology' },
  // Programming
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Programming' },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780135957059', category: 'Programming' },
  // History
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393317558', category: 'History' },
  { title: 'The Diary of a Young Girl', author: 'Anne Frank', isbn: '9780553296983', category: 'History' },
  // Biography
  { title: 'Becoming', author: 'Michelle Obama', isbn: '9781524763138', category: 'Biography' },
  { title: 'Long Walk to Freedom', author: 'Nelson Mandela', isbn: '9780316548182', category: 'Biography' },
  // Business
  { title: 'Zero to One', author: 'Peter Thiel', isbn: '9780804139298', category: 'Business' },
  { title: 'The Lean Startup', author: 'Eric Ries', isbn: '9780307887894', category: 'Business' },
  // Self Help
  { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', category: 'Self Help' },
  { title: "The Subtle Art of Not Giving a F*ck", author: 'Mark Manson', isbn: '9780062457714', category: 'Self Help' },
  { title: 'The Power of Now', author: 'Eckhart Tolle', isbn: '9781577314806', category: 'Self Help' },
  { title: "Man's Search for Meaning", author: 'Viktor Frankl', isbn: '9780807014295', category: 'Self Help' },
  // Children
  { title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', isbn: '9780747532699', category: 'Children' },
  { title: "Charlotte's Web", author: 'E.B. White', isbn: '9780064400558', category: 'Children' },
  { title: 'The Very Hungry Caterpillar', author: 'Eric Carle', isbn: '9780399226908', category: 'Children' },
  // Comics
  { title: 'Watchmen', author: 'Alan Moore', isbn: '9781401245252', category: 'Comics' },
  { title: 'The Sandman, Vol. 1', author: 'Neil Gaiman', isbn: '9781401225759', category: 'Comics' },
  { title: 'Maus', author: 'Art Spiegelman', isbn: '9780679406419', category: 'Comics' }
];

const AUTHOR_NAMES = [...new Set(BOOK_POOL.map((b) => b.author))];

const SELLER_BUSINESSES = [
  { businessName: 'Pageturner Books Co.', ownerName: 'Ananya Rao' },
  { businessName: 'Chapter One Traders', ownerName: 'Vikram Sharma' },
  { businessName: 'Inkwell Distributors', ownerName: 'Priya Menon' },
  { businessName: 'Storyline Wholesale', ownerName: 'Karan Gupta' }
];

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Spanish'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const runSeed = async () => {
  {
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Seller.deleteMany({}),
      Admin.deleteMany({}),
      Author.deleteMany({}),
      Category.deleteMany({}),
      Book.deleteMany({}),
      Inventory.deleteMany({}),
      Review.deleteMany({}),
      Interaction.deleteMany({})
    ]);

    console.log('Creating categories...');
    const categories = await Category.insertMany(
      CATEGORY_NAMES.map((name) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `Explore our collection of ${name} books.`
      }))
    );

    console.log('Creating authors...');
    const authors = await Author.insertMany(AUTHOR_NAMES.map((name) => ({ name })));

    console.log('Creating admin account...');
    const admin = await Admin.create({
      fullName: 'BookStore Admin',
      email: process.env.ADMIN_EMAIL || 'admin@bookstore.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      superAdmin: true
    });

    console.log('Creating seller accounts (approved)...');
    const sellers = [];
    for (let i = 0; i < SELLER_BUSINESSES.length; i++) {
      const { businessName, ownerName } = SELLER_BUSINESSES[i];
      const seller = await Seller.create({
        businessName,
        ownerName,
        email: `seller${i + 1}@example.com`,
        mobile: `91000000${String(i + 1).padStart(2, '0')}`,
        password: 'Seller@123',
        approvalStatus: 'approved',
        rating: 0
      });
      sellers.push(seller);
    }
    // One pending seller, so the admin "approve sellers" flow has something to show
    const pendingSeller = await Seller.create({
      businessName: 'Newcomer Reads',
      ownerName: 'Fatima Sheikh',
      email: 'seller-pending@example.com',
      mobile: '9100000099',
      password: 'Seller@123',
      approvalStatus: 'pending'
    });

    console.log('Creating 20 customer users...');
    const users = [];
    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        fullName: `Test User ${i}`,
        email: `user${i}@example.com`,
        mobile: `90000000${String(i).padStart(2, '0')}`,
        password: 'Password@123'
      });
      users.push(user);
    }

    console.log(`Creating ${BOOK_POOL.length} books with real cover images...`);
    const books = [];
    const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c]));
    const authorByName = Object.fromEntries(authors.map((a) => [a.name, a]));

    // The Book model requires a unique ISBN, so we seed exactly one listing per real
    // book in the pool (rather than padding to a fixed count with repeats).
    const listings = [...BOOK_POOL].sort(() => Math.random() - 0.5);

    for (let i = 0; i < listings.length; i++) {
      const entry = listings[i];
      const category = categoryByName[entry.category] || randomFrom(categories);
      const author = authorByName[entry.author];
      const seller = randomFrom(sellers);
      const price = randomInt(150, 999);
      const quantity = randomInt(0, 100);
      // Real cover photo for this ISBN, served live by Open Library's Covers API.
      const coverImage = `https://covers.openlibrary.org/b/isbn/${entry.isbn}-L.jpg?default=false`;

      const book = await Book.create({
        title: entry.title,
        authors: [author._id],
        authorNames: author.name,
        description:
          'A captivating read that takes you on a journey through compelling storytelling, ' +
          'rich characters, and thought-provoking ideas. A must-have addition to any book lover\'s shelf.',
        categories: [category._id],
        seller: seller._id,
        price,
        discount: randomFrom([0, 5, 10, 15, 20, 25]),
        rating: 0,
        language: randomFrom(LANGUAGES),
        publisher: randomFrom(['Penguin', 'HarperCollins', 'Simon & Schuster', 'Macmillan', 'Scholastic']),
        stock: quantity,
        isbn: entry.isbn,
        pages: randomInt(120, 650),
        coverImage,
        isBestSeller: Math.random() < 0.2,
        isNewArrival: Math.random() < 0.2
      });
      books.push(book);

      await Inventory.create({
        book: book._id,
        seller: seller._id,
        quantity,
        location: 'Main Warehouse',
        condition: 'new'
      });
    }

    console.log('Creating 30 reviews...');
    const comments = [
      'Absolutely loved this book, couldn\'t put it down!',
      'A decent read but the pacing was a bit slow in the middle.',
      'One of the best books I have read this year.',
      'Great insights, highly recommend to everyone.',
      'The story was okay, expected a bit more from the ending.',
      'Beautifully written and deeply moving.',
      'Good value for the price, arrived in great condition.',
      'A must-read for anyone interested in the subject.'
    ];

    const usedPairs = new Set();
    let reviewCount = 0;
    while (reviewCount < 30) {
      const user = randomFrom(users);
      const book = randomFrom(books);
      const key = `${user._id}-${book._id}`;
      if (usedPairs.has(key)) continue;
      usedPairs.add(key);

      await Review.create({
        book: book._id,
        user: user._id,
        rating: randomInt(2, 5),
        comment: randomFrom(comments)
      });
      reviewCount++;
    }

    // Recalculate ratings for all books based on seeded reviews
    for (const book of books) {
      const reviews = await Review.find({ book: book._id });
      const numReviews = reviews.length;
      const rating = numReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / numReviews : 0;
      await Book.findByIdAndUpdate(book._id, { rating: +rating.toFixed(1), numReviews });
    }

    console.log('Creating a few sample reading interactions...');
    for (let i = 0; i < 15; i++) {
      const user = randomFrom(users);
      const book = randomFrom(books);
      await Interaction.findOneAndUpdate(
        { user: user._id, book: book._id },
        {
          status: randomFrom(['want_to_read', 'reading', 'completed']),
          progressPercent: randomInt(0, 100)
        },
        { upsert: true }
      );
    }

    console.log('\n✅ Seed complete!');
    console.log(`Categories: ${categories.length}`);
    console.log(`Authors: ${authors.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Sellers: ${sellers.length} approved + 1 pending`);
    console.log(`Books: ${books.length}`);
    console.log(`Reviews: ${reviewCount}`);
    console.log(`\nAdmin login -> email: ${admin.email} | password: ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
    console.log('Sample seller login -> email: seller1@example.com | password: Seller@123');
    console.log('Pending seller login -> email: seller-pending@example.com | password: Seller@123');
    console.log('Sample customer login -> email: user1@example.com | password: Password@123');

  }
};

module.exports = runSeed;

// `npm run seed` still works exactly as before
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await runSeed();
      process.exit(0);
    } catch (error) {
      console.error('Seeding error:', error);
      process.exit(1);
    }
  })();
}
