# Bakugan Price Dashboard

A web application for tracking Bakugan prices and sales history with real-time charts and updates. Features separate admin and user access controls.

## Features

- Track Bakugan prices with interactive charts
- View price history for each Bakugan
- Admin dashboard for managing Bakugan data
- User view for browsing Bakugan information
- Authentication system with admin/user roles
- Multiple names support for each Bakugan (Thai, English, community names)
- Detailed Bakugan information (size, element, special properties)
- Price history with reference links
- Responsive design for all devices

## Technologies Used

- Next.js 14
- React 18
- MongoDB
- Chart.js
- Tailwind CSS
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB (local or remote)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/bakugan-dashboard.git
cd bakugan-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Create a `.env.local` file in the root directory with the following content:

```
MONGODB_URI=mongodb://localhost:27017/bakugan-dashboard
JWT_SECRET=your_jwt_secret_key
ADMIN_SECRET_KEY=your_admin_secret_key
```

Replace the MongoDB URI with your own if you're using a remote database. The JWT_SECRET is used for authentication tokens, and the ADMIN_SECRET_KEY is used when registering admin users.

### Running the Application

1. Start the development server:

```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Authentication

1. **Register**: Create a new account by providing a username and password.
2. **Admin Registration**: To register as an admin, check the "Register as admin" box and enter the admin key.
3. **Login**: Log in with your username and password.

### Admin Features

#### Adding a Bakugan

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

#### Updating a Bakugan

1. Find the Bakugan card you want to update.
2. Click the "Update Price" button to update just the price, or "Edit Details" to update other information.
3. For price updates:
   - Enter the new price
   - Add a reference URI (optional)
   - Add notes (optional)
4. For detail updates:
   - Modify any of the Bakugan's information
5. Click "Save" to update.

### User Features

Regular users can browse all Bakugan items and view their details, including:
- Multiple names
- Size and element information
- Special properties
- Current price and price history chart
- Price history table with dates and notes

The price history is displayed as a chart and a table on each Bakugan card. The chart shows the price trends over time, and the table shows detailed information about each price update.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
