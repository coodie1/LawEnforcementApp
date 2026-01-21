# Troubleshooting Login Issues

## Quick Checklist

1. **Is the backend server running?**
   ```bash
   cd backend
   npm start
   ```
   You should see: `Server is running on port: 5000`

2. **Is MongoDB connected?**
   Check backend terminal for: `>>> MongoDB Atlas database connection established successfully! <<<`

3. **Check browser console (F12)**
   - Look for error messages
   - Check Network tab to see if requests are being sent
   - Verify API URL is correct

4. **Test backend directly**
   ```bash
   # Test health endpoint
   curl http://localhost:5000/health
   
   # Or visit in browser:
   http://localhost:5000/health
   ```

5. **Verify user exists and password is correct**
   ```bash
   cd backend
   npm run diagnose-login
   ```

6. **Reset password if needed**
   ```bash
   cd backend
   npm run reset-admin-password
   ```

## Common Issues

### Issue: "Cannot connect to server"
**Solution:** Make sure backend is running on port 5000

### Issue: "Invalid credentials" but password is correct
**Solution:** Run `npm run reset-admin-password` to reset the password

### Issue: CORS errors in browser console
**Solution:** Backend CORS is already configured to allow all origins. Check if backend is running.

### Issue: Network Error / Failed to fetch
**Solution:** 
- Check if backend is running
- Verify API URL in frontend `.env` or Vercel settings
- Check firewall/antivirus isn't blocking localhost:5000

## Debug Steps

1. Open browser console (F12)
2. Try to login
3. Check console for:
   - `🔐 Attempting login with:` - confirms form submission
   - `📡 Sending login request to:` - confirms API call
   - Any error messages

4. Check Network tab:
   - Look for request to `/api/auth/login`
   - Check status code (200 = success, 400 = bad credentials, 500 = server error)
   - Check response body for error message

5. Check backend terminal:
   - Look for `[LOGIN FAILED]` messages
   - Check for any error stack traces

## Test Login Manually

You can test the login endpoint directly using curl:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@lawenforcement.com\",\"password\":\"Admin123!\"}"
```

Expected response:
```json
{
  "token": "...",
  "user": { ... }
}
```

