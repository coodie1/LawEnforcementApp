# Creating the First Admin User

Since user registration has been disabled, you need to create the first admin user using a script.

## Method 1: Using the Script (Recommended)

Run the script with default values:
```bash
npm run create-first-user
```

This will create a user with:
- Email: `admin@lawenforcement.com`
- Password: `Admin123!`
- Name: `Admin User`
- Role: `admin`

### Custom Values

You can also provide custom values:
```bash
node scripts/createFirstUser.js <email> <password> <firstName> <lastName>
```

Example:
```bash
node scripts/createFirstUser.js john.doe@example.com MySecurePass123 John Doe
```

## Method 2: Manual MongoDB Insert

If you prefer to create the user directly in MongoDB:

1. Connect to your MongoDB database
2. Use MongoDB Compass, MongoDB Shell, or any MongoDB client
3. Insert the following document into the `users` collection:

```javascript
db.users.insertOne({
  email: "admin@lawenforcement.com",
  password: "<hashed_password>", // You need to hash this first using bcrypt
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  temporaryPassword: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note:** You'll need to hash the password using bcrypt. The script does this automatically.

## After Creating the First User

1. Log in to the application using the credentials
2. Navigate to **User Management** → **Add User** (visible in sidebar for admins)
3. Create additional users as needed
4. **Important:** Change the default password after first login!

## Security Notes

- The script will only create a user if no users exist in the database
- After creating the first user, use the admin panel to create additional users
- All new users created through the admin panel will receive temporary passwords via email

