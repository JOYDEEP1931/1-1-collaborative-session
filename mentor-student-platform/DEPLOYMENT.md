# 🚀 Deployment Guide

## Pre-Deployment Checklist

- [ ] Change JWT_SECRET to a strong random key
- [ ] Update ALLOWED_ORIGINS for your production domain
- [ ] Set NODE_ENV=production
- [ ] Test all features locally
- [ ] Update API URLs in frontend .env
- [ ] Set up error monitoring (optional)
- [ ] Configure TURN servers for better WebRTC connectivity

## Backend Deployment (Railway / Render)

### Option 1: Railway.app

1. **Create Account**: https://railway.app
2. **Connect GitHub**: Link your repository
3. **Create New Project**: Select your repo
4. **Add Environment Variables**:
   ```
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=<your-strong-secret-key>
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```
5. **Deploy**: Railway auto-deploys on push

### Option 2: Render.com

1. **Create Account**: https://render.com
2. **New Web Service**: Connect your GitHub
3. **Configure**:
   - Runtime: Node
   - Build: `npm install`
   - Start: `npm start`
4. **Environment Variables**: Add in dashboard
5. **Deploy**: Automatic on push

## Frontend Deployment (Vercel)

### Deploy to Vercel

1. **Create Account**: https://vercel.com
2. **Import Project**: Select your GitHub repo
3. **Framework**: Select "Vite"
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_SOCKET_URL=https://your-backend-url.railway.app
   ```
5. **Deploy**: Vercel handles everything

### Deploy to Netlify

```bash
# Build locally
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir dist
```

## Production Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
JWT_SECRET=your-very-strong-random-secret-key-min-32-chars
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DATABASE_URL=postgresql://user:pass@host:5432/db  # Optional
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

## Enable HTTPS (Required for WebRTC)

Both Vercel and Railway provide HTTPS by default. Ensure:
- ✅ No HTTP, only HTTPS
- ✅ WebRTC works over HTTPS
- ✅ Socket.io uses secure WebSocket (wss://)

## Scaling Considerations

### Single Server (Current Setup)
- ✅ Works for 1-2 concurrent sessions
- In-memory session storage
- No horizontal scaling needed

### Multiple Servers (Future)
- Use Redis for session storage
- Use Socket.io Redis adapter
- Load balance with sticky sessions
- Database: PostgreSQL with Supabase

## Performance Optimization

### Backend
```javascript
// Add compression middleware
const compression = require('compression');
app.use(compression());

// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

### Frontend
```bash
# Build with optimizations
npm run build

# Check bundle size
npm run build --analyze
```

## Monitoring & Logging

### Backend Logs
- Use service dashboard (Railway/Render)
- Check server logs for errors
- Monitor socket connections

### Frontend Errors
- Set up Sentry: https://sentry.io
- Monitor browser console errors
- Track user sessions

## Database Setup (Optional)

### PostgreSQL + Supabase
1. Create Supabase project
2. Create tables:
   ```sql
   CREATE TABLE sessions (
     id UUID PRIMARY KEY,
     mentor_id VARCHAR,
     student_id VARCHAR,
     created_at TIMESTAMP,
     ended_at TIMESTAMP
   );

   CREATE TABLE messages (
     id UUID PRIMARY KEY,
     session_id UUID,
     user_id VARCHAR,
     content TEXT,
     created_at TIMESTAMP
   );
   ```
3. Update backend to use database

## SSL/TLS Certificate

### Automatic (Recommended)
- Vercel: Automatic
- Railway: Automatic
- Render: Automatic

### Manual
- Use Let's Encrypt
- Configure in server

## Custom Domain

### Vercel
1. Go to project settings
2. Add custom domain
3. Update DNS records

### Railway/Render
1. Add custom domain in dashboard
2. Update DNS CNAME record
3. Wait for verification

## Backup & Disaster Recovery

### For In-Memory Storage
- Current setup: No persistence needed
- Sessions are temporary

### For Database (Future)
- Regular automated backups
- Point-in-time recovery
- Geo-redundant backups

## Security Checklist

- [ ] HTTPS enabled
- [ ] JWT secret is strong (32+ chars)
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] Rate limiting enabled
- [ ] Security headers set
- [ ] No sensitive data in logs
- [ ] Error messages don't expose internals

## Troubleshooting Production Issues

### WebRTC Not Working
- Check HTTPS is enforced
- Verify STUN servers are accessible
- Check firewall/NAT settings
- Consider adding TURN servers

### High Memory Usage
- Check for memory leaks
- Monitor socket connections
- Implement connection limits

### Socket Timeout Issues
- Increase ping interval in Socket.io config
- Check network stability
- Monitor server resources

## Rollback Procedure

### Vercel
```bash
git revert <commit-hash>
git push  # Auto-deploys
```

### Railway/Render
- Revert to previous deployment from dashboard

## Performance Targets

- Page load: < 2s
- Video connection: < 3s
- Chat latency: < 100ms
- Code sync latency: < 500ms

## Cost Estimation

### Vercel (Free - Hobby tier)
- Build: Included
- Bandwidth: 100GB/month
- Functions: 100GB/month

### Railway (Pay-as-you-go)
- Compute: ~$5-10/month for low traffic
- Storage: Additional charges for database

### Render (Free tier available)
- Web service: ~$7-15/month for production
- Database: ~$15/month for PostgreSQL

---

For more information, refer to [README.md](./README.md)
