# MongoDB Setup Guide

This guide will help you set up MongoDB for the Raki authentication system.

## Prerequisites

1. **Install MongoDB** on your system:
   - **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. **Install Python dependencies**:
   ```bash
   pip install motor pymongo beanie passlib[bcrypt] python-jose[cryptography] httpx
   ```

## Setup Steps

### 1. Start MongoDB

**Windows:**
```cmd
# Start MongoDB service
net start MongoDB

# Or run manually
mongod --dbpath C:\data\db
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or run manually
mongod
```

### 2. Configure Environment

Copy the environment template:
```bash
cp env_template.txt .env.local
```

Edit `.env.local` and set your MongoDB connection:
```env
DATABASE_URL=mongodb://localhost:27017
SECRET_KEY=your-super-secret-key-change-in-production
```

### 3. Test the Setup

Run the test script to verify everything works:
```bash
python test_auth.py
```

## MongoDB Atlas (Cloud Option)

If you prefer to use MongoDB Atlas (cloud database):

1. **Create a free account** at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create a cluster** (free tier available)
3. **Get connection string** from Atlas dashboard
4. **Update DATABASE_URL** in `.env.local`:
   ```env
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/raki_db
   ```

## Database Collections

The system will automatically create these collections:
- `users` - User accounts and profiles
- `user_sessions` - Active user sessions

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running: `mongosh` should connect
- Check firewall settings
- Verify connection string format

### Authentication Errors
- Check if user exists in `users` collection
- Verify session tokens in `user_sessions` collection
- Check JWT secret key configuration

### Performance
- Create indexes on frequently queried fields
- Monitor database performance in MongoDB Compass
- Consider connection pooling for production

## Development vs Production

**Development:**
- Use local MongoDB instance
- Simple connection string: `mongodb://localhost:27017`
- No authentication required

**Production:**
- Use MongoDB Atlas or dedicated server
- Enable authentication and SSL
- Use connection pooling
- Set up monitoring and backups


