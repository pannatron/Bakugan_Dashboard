# 🔥 Bakugan Price Dashboard 🔥

A web application for tracking Bakugan prices and sales history with real-time charts and updates. Features separate admin and user access controls.

## ✨ Features

- 📊 Track Bakugan prices with interactive charts
- 📈 View price history for each Bakugan
- 👑 Admin dashboard for managing Bakugan data
- 👀 User view for browsing Bakugan information
- 🔐 Authentication system with admin/user roles
- 🌐 Multiple names support for each Bakugan (Thai, English, community names)
- 📋 Detailed Bakugan information (size, element, special properties)
- 🔗 Price history with reference links
- 📱 Responsive design for all devices

## 🛠️ Technologies Used

### 🌐 Frontend
- **⚛️ Next.js 14**: React framework with App Router for server-side rendering and API routes
- **⚛️ React 18**: JavaScript library for building user interfaces
- **🔷 TypeScript**: Type-safe JavaScript for better developer experience and code quality
- **🎨 Tailwind CSS**: Utility-first CSS framework with custom animations and theme extensions
- **📊 Chart.js** and **react-chartjs-2**: For interactive price history visualization
- **✨ Framer Motion**: For smooth animations and transitions

### 🔧 Backend
- **🔌 Next.js API Routes**: Serverless functions for backend logic
- **🗄️ MongoDB**: NoSQL database for storing Bakugan data
- **🐿️ Mongoose**: MongoDB object modeling for Node.js
- **🔑 JWT Authentication**: JSON Web Tokens for secure user authentication and authorization

### 🏗️ Project Architecture
- **🧭 App Router**: Next.js 14 App Router for file-based routing
- **🧩 Component-based Structure**: Modular components for better code organization and reusability
- **🪝 Custom Hooks**: React hooks for shared logic and state management
- **🧠 Model-View Pattern**: Separation of data models and UI components

## 📂 Project Structure

The project follows Next.js 14 App Router directory structure:

```
app/
├── api/                    # API routes (serverless functions)
│   ├── auth/               # Authentication endpoints
│   ├── bakugan/            # Bakugan CRUD operations
│   ├── recommendations/    # Recommendation endpoints
│   └── upload/             # File upload handling
├── bakumania/              # Bakumania section pages
│   └── admin/              # Admin-specific pages
├── components/             # Reusable React components
│   └── BakuganCard/        # Modular Bakugan card components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and services
│   └── models/             # Mongoose data models
└── types/                  # TypeScript type definitions
```

### 🧩 Key Components

- **BakuganCard**: The main component for displaying Bakugan information, with subcomponents for different aspects:
  - BakuganInfo: Displays basic information
  - PriceDisplay: Shows current price
  - PriceHistoryChart: Visualizes price history
  - PriceUpdateForm: Form for updating prices
  - BakuganEditForm: Form for editing Bakugan details
  - AdminButtons: Admin-only action buttons

- **Data Flow**:
  1. Data models defined in `lib/models/` using Mongoose schemas
  2. API routes in `api/` handle data operations
  3. Custom hooks in `hooks/` manage data fetching and state
  4. Components consume and display data with appropriate UI

## 🔍 Technical Details

### 🔐 Authentication System

The application uses JWT (JSON Web Token) for authentication:

1. **Registration**: Users register with username/password via `/api/auth/register`
2. **Login**: Authentication occurs via `/api/auth/login`, which returns a JWT
3. **Session Management**: JWT is stored in cookies with HTTP-only flag for security
4. **Authorization**: Protected routes check JWT validity via middleware
5. **Role-based Access**: Admin-specific features are protected by role verification

### 💾 Data Models

The application uses Mongoose schemas to define data models:

- **Bakugan**: Stores information about each Bakugan
  ```typescript
  {
    names: { primary: String, alt: [String] },
    size: String,
    element: String,
    specialProperties: [String],
    imageUrl: String,
    currentPrice: Number,
    createdAt: Date,
    updatedAt: Date
  }
  ```

- **PriceHistory**: Tracks price changes over time
  ```typescript
  {
    bakuganId: ObjectId,
    price: Number,
    date: Date,
    referenceUri: String,
    notes: String
  }
  ```

- **User**: Manages user authentication and roles
  ```typescript
  {
    username: String,
    password: String (hashed),
    role: String,
    createdAt: Date
  }
  ```

- **Recommendation**: Manages featured Bakugan recommendations
  ```typescript
  {
    bakuganId: ObjectId,
    order: Number,
    createdAt: Date
  }
  ```

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js 18 or later
- MongoDB (local or remote)

### ⚙️ Installation

1. 📥 Clone the repository:

```bash
git clone https://github.com/yourusername/bakugan-dashboard.git
cd bakugan-dashboard
```

2. 📦 Install dependencies:

```bash
npm install
```

3. ⚙️ Configure environment variables:

Create a `.env.local` file in the root directory with the following content:

```
MONGODB_URI=mongodb://localhost:27017/bakugan-dashboard
JWT_SECRET=your_jwt_secret_key
ADMIN_SECRET_KEY=your_admin_secret_key
```

Replace the MongoDB URI with your own if you're using a remote database. The JWT_SECRET is used for authentication tokens, and the ADMIN_SECRET_KEY is used when registering admin users.

### 🏃‍♂️ Running the Application

1. 🚀 Start the development server:

```bash
npm run dev
```

2. 🌐 Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### 🔑 Authentication

1. 📝 **Register**: Create a new account by providing a username and password.
2. 👑 **Admin Registration**: To register as an admin, check the "Register as admin" box and enter the admin key.
3. 🔑 **Login**: Log in with your username and password.

### 👑 Admin Features

#### ➕ Adding a Bakugan

1. Log in as an admin.
2. Click the "Add New Bakugan" button.
3. Fill in the required information:
   - Names (primary and alternative names)
   - Size (B1, B2, B3)
   - Element
   - Special Properties (optional)
   - Image URL (optional)
   - Initial Price
   - Reference URI (optional)
4. Click "Add Bakugan" to save.

#### 🔄 Updating a Bakugan

1. Find the Bakugan card you want to update.
2. Click the "Update Price" button to update just the price, or "Edit Details" to update other information.
3. For price updates:
   - Enter the new price
   - Add a reference URI (optional)
   - Add notes (optional)
4. For detail updates:
   - Modify any of the Bakugan's information
5. Click "Save" to update.

### 👤 User Features

Regular users can browse all Bakugan items and view their details, including:
- 📝 Multiple names
- 📏 Size and element information
- ✨ Special properties
- 💰 Current price and price history chart
- 📅 Price history table with dates and notes

The price history is displayed as a chart and a table on each Bakugan card. The chart shows the price trends over time, and the table shows detailed information about each price update.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
