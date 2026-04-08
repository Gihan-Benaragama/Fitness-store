# FitZone E-Commerce Application

A full-stack e-commerce application for fitness products built with React and Node.js.

## Project Structure

```
FitnessStore/
├── frontend/          # React frontend application
│   ├── public/
│   └── src/
│       ├── components/    # Reusable components (Navbar, Hero, ProductCard)
│       ├── pages/         # Page components (Home, Products, ProductDetail, Cart)
│       ├── services/      # API service layer
│       ├── App.js
│       └── index.js
└── backend/           # Node.js/Express backend API
    ├── controller/    # Route controllers
    ├── models/        # MongoDB models
    ├── routes/        # API routes
    └── index.js
```

## Features

### Frontend
- ✅ Homepage with hero section matching "FitZone" design
- ✅ Product listing pages with filtering and sorting
- ✅ Product detail pages with options (size/flavour)
- ✅ Shopping cart functionality
- ✅ Responsive design with dark red theme
- ✅ Integration with backend API

### Backend
- Product management (Categories: Supplements, Clothing, Accessories)
- Cart management with item options
- User authentication
- Order processing
- Product reviews

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get single product

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Add review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Axios
- CSS3 with custom styling

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Design Features

- Dark theme with red accents matching the Fitnessisland brand
- Animated hero section with lion logo and crown
- Smooth hover effects and transitions
- Responsive grid layouts
- Sticky navigation and cart summary
- Product filtering and sorting

## Future Enhancements

- [ ] User authentication UI (login/register pages)
- [ ] Checkout and payment integration
- [ ] Order history page
- [ ] Product search functionality
- [ ] Wishlist feature
- [ ] Product reviews submission
- [ ] Admin dashboard

## License

MIT License
