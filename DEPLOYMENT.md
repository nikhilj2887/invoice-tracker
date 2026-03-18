# Deployment Guide

This guide will walk you through deploying your Invoice Tracker application to production.

## Prerequisites

Before deploying, ensure you have:
- A Supabase project set up with the database schema created
- Your code in a Git repository (GitHub, GitLab, or Bitbucket)
- Your Supabase credentials ready:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Option 1: Deploy to Vercel (Recommended)

Vercel provides the best experience for React + Vite applications with zero configuration.

### Step 1: Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure your `.env` file is in `.gitignore` (it should be by default)

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your Git provider
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect it as a Vite project

### Step 3: Configure Environment Variables

In the Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add these variables:
   - Name: `VITE_SUPABASE_URL`
     Value: Your Supabase project URL
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: Your Supabase anon/public key

3. Apply to all environments (Production, Preview, Development)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions

## Option 2: Deploy to Netlify

### Step 1: Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure your `.env` file is in `.gitignore`

### Step 2: Import to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign in with your Git provider
3. Click "Add new site" → "Import an existing project"
4. Connect to your Git provider and select your repository

### Step 3: Configure Build Settings

Netlify should auto-detect these, but verify:

- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: (leave empty)

### Step 4: Add Environment Variables

1. Before deploying, click "Advanced build settings"
2. Add environment variables:
   - Key: `VITE_SUPABASE_URL`
     Value: Your Supabase project URL
   - Key: `VITE_SUPABASE_ANON_KEY`
     Value: Your Supabase anon/public key

### Step 5: Deploy

1. Click "Deploy site"
2. Wait for the build to complete
3. Your app will be live at `https://random-name.netlify.app`

### Step 6: Custom Domain (Optional)

1. Go to "Domain settings"
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Option 3: Deploy to Your Own Server

### Prerequisites

- A server with Node.js 18+ installed
- Nginx or Apache for serving the application
- SSL certificate (use Let's Encrypt)

### Step 1: Build the Application

```bash
npm run build
```

This creates a `dist` folder with your production files.

### Step 2: Upload to Server

Upload the `dist` folder to your server:

```bash
scp -r dist/* user@your-server.com:/var/www/invoice-tracker
```

### Step 3: Configure Nginx

Create a new Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/invoice-tracker;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Step 4: Enable HTTPS

Use Let's Encrypt to get a free SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com
```

### Step 5: Set Environment Variables

Since this is a static build, environment variables are baked into the build. Make sure you built with the correct `.env` file.

## Post-Deployment Checklist

After deploying, verify:

- [ ] Application loads without errors
- [ ] Can create a new client
- [ ] Can create a new invoice
- [ ] Invoice numbering works correctly
- [ ] Can view invoice details
- [ ] Can download invoice as PDF
- [ ] Dashboard analytics display correctly
- [ ] Search and filter work on invoice list
- [ ] Can mark invoices as paid

## Troubleshooting

### "Failed to fetch" errors

**Problem**: Cannot connect to Supabase
**Solution**: Verify environment variables are set correctly

### Blank page after deployment

**Problem**: Environment variables not loaded
**Solution**:
1. Check that variables start with `VITE_`
2. Rebuild after adding environment variables
3. Clear browser cache

### Invoice PDFs not downloading

**Problem**: Popup blocker is blocking the PDF window
**Solution**: Allow popups for your domain

### Database connection errors

**Problem**: RLS policies blocking access
**Solution**:
1. Check that RLS policies exist
2. Verify policies allow public access (for single-user app)
3. Check Supabase project status

## Continuous Deployment

Both Vercel and Netlify support automatic deployments:

1. Any push to your main/master branch triggers a new deployment
2. Pull requests create preview deployments
3. No manual intervention needed

To set this up:
1. Ensure your Git repository is connected
2. Deploy once manually
3. Future pushes will auto-deploy

## Environment-Specific Builds

If you need different configurations for staging/production:

### Vercel
- Use Git branches
- Create different environment variables per branch
- Vercel automatically creates preview deployments

### Netlify
- Use branch deploys
- Configure different environment variables per branch
- Enable branch deploys in site settings

## Monitoring and Analytics

### Add Analytics

To add analytics to your deployed app:

1. **Vercel Analytics**:
   - Automatically available on all Vercel deployments
   - View in Vercel dashboard

2. **Google Analytics**:
   - Add tracking code to `index.html`
   - Rebuild and redeploy

3. **Supabase Metrics**:
   - View database usage in Supabase dashboard
   - Monitor API requests and performance

## Backup Strategy

**Important**: Always backup your data!

### Supabase Backups

1. Go to your Supabase dashboard
2. Navigate to Database → Backups
3. Enable daily backups (available on paid plans)
4. Download backups periodically

### Manual Backup

Export your data:

```sql
-- Run in Supabase SQL Editor
COPY (SELECT * FROM clients) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM invoices) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM invoice_items) TO STDOUT WITH CSV HEADER;
```

## Scaling Considerations

This application is designed for solo business owners, but if you need to scale:

1. **Add Authentication**:
   - Implement Supabase Auth
   - Update RLS policies
   - Add user ownership

2. **Database Optimization**:
   - Add indexes as needed
   - Monitor slow queries
   - Upgrade Supabase plan if needed

3. **CDN & Caching**:
   - Vercel/Netlify provide global CDN
   - Enable caching headers
   - Optimize images

## Cost Estimates

### Free Tier

- **Vercel**: Free for personal projects, unlimited bandwidth
- **Netlify**: Free for personal projects, 100GB bandwidth/month
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth

### Paid Plans

- **Vercel Pro**: $20/month (team collaboration)
- **Netlify Pro**: $19/month (more bandwidth)
- **Supabase Pro**: $25/month (better performance, backups)

**Recommendation**: Start with free tiers, upgrade as needed.

## Support

If you encounter issues during deployment:

1. Check the hosting provider's documentation
2. Verify environment variables
3. Review build logs for errors
4. Test locally first with `npm run build && npm run preview`

## Next Steps

After successful deployment:

1. Add your company branding to invoices
2. Customize tax rates for your region
3. Set up regular database backups
4. Share your invoice tracker URL with clients (if needed)
5. Start creating invoices!

Congratulations on deploying your Invoice Tracker! 🎉
