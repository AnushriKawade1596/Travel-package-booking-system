# Travel Package Booking System 🌴✈️

A complete full-stack web application for booking travel tours and packages, built using the **Node.js + Express + EJS** framework with a **MySQL** database.

This guide will walk you through exactly how to set up, install, and run this application on your local machine, even if you are a beginner!

---

## 📋 Prerequisites
Before you start, make sure you have the following installed on your computer:
1. **Node.js**: Download and install from [nodejs.org](https://nodejs.org/)
2. **MySQL Server**: Download and install from [mysql.com](https://dev.mysql.com/downloads/installer/) (You can also use XAMPP or MySQL Workbench)
3. **Git**: Download and install from [git-scm.com](https://git-scm.com/)

---

## 🚀 Installation & Setup Guide

### Step 1: Clone the Repository
Open your terminal (Command Prompt, PowerShell, or VS Code Terminal) and clone the project to your computer:
```bash
git clone https://github.com/AnushriKawade1596/Travel-package-booking-system.git
cd Travel-package-booking-system
```

### Step 2: Install Dependencies
This project uses several open-source packages (like Express and MySQL drivers). You need to download them by running:
```bash
npm install
```
*(This will automatically download everything listed in `package.json` into a new `node_modules` folder).*

### Step 3: Setup the Database
You need to create the database and import the tables before the application can start.

1. Open your **MySQL Workbench** (or your preferred database tool).
2. Log in using your root username and password.
3. Open the file located in this project at `models/database.sql`.
4. Copy all the code inside the file, paste it into your query tab, and execute (run) it.
   - *This command will automatically create a database named `tour_booking_system`, inject all tables (users, tours, bookings, etc.), and provide sample initial data!*

### Step 4: Configure Environment Variables
The application needs your specific database credentials to connect securely.

1. Inside the main project folder, create a new file named exactly **`.env`**
2. Open the `.env` file and paste the following inside:
```ini
DB_HOST=localhost
DB_USER=root
# Put your actual MySQL password below (Don't use quotes)
DB_PASSWORD=your_database_password_here
DB_NAME=tour_booking_system
SESSION_SECRET=my_super_secure_secret_key_123
PORT=3000
```
3. Change `DB_PASSWORD` to whatever password you set during your MySQL installation.

### Step 5: Start the Application!
Everything is configured! It's time to run the server.

In your terminal, inside the project folder, run:
```bash
node app.js
```
*(Tip: If you want the server to auto-restart whenever you save a file, you can install and use nodemon by running `npm i -g nodemon` and then `nodemon app.js`).*

---

## 🌐 Viewing the App
Once the server is running, open your favorite web browser (Chrome, Edge, Firefox) and go to:
**👉 http://localhost:3000**

You can now explore tours, create an account, make bookings, and access the admin panel! 

### Admin Access
A default admin user is created when you import the `database.sql` file. You can log in with:
- **Email:** `admin@example.com`
- **Password:** *(You may need to register a new user or update the hashed password directly in the database to log in).*

---

## 🛠️ Built With
* **Frontend**: HTML5, CSS3, Bootstrap 5, EJS (Embedded JavaScript Templates)
* **Backend**: Node.js, Express.js
* **Database**: MySQL (relational database storage)
* **Authentication**: express-session, bcryptjs

Happy Coding! 🎉
