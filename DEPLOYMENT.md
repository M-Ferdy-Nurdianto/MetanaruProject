# Deployment Guide - Vercel Serverless Function

This guide will walk you through deploying your BabyMetal themed form with secure Google Apps Script integration to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your Google Apps Script Web App URL (deployed and accessible)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Google Apps Script

1. Open your Google Apps Script project
2. Deploy it as a Web App:
   - Click **Deploy** → **New deployment**
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (or **Anyone with Google account**)
   - Click **Deploy**
3. Copy the **Web App URL** (it looks like: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`)
4. Keep this URL safe - you'll need it for environment variables

### Sample Google Apps Script Code

If you haven't created your Google Apps Script yet, here's a sample:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the request
    const name = e.parameter.name || "";
    const email = e.parameter.email || "";
    const message = e.parameter.message || "";
    const timestamp = new Date();

    // Append data to sheet
    sheet.appendRow([timestamp, name, email, message]);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: "Data saved successfully" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 2: Push Your Code to Git

1. Initialize Git repository (if not already done):

   ```bash
   git init
   git add .
   git commit -m "Initial commit - BabyMetal form with Vercel serverless"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended for First-Time Users)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your Git repository
4. Configure your project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty
   - **Output Directory**: `public`
5. Click **Deploy**

### Option B: Via Vercel CLI

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy:

   ```bash
   vercel
   ```

4. Follow the prompts and deploy to production:
   ```bash
   vercel --prod
   ```

## Step 4: Configure Environment Variables

**CRITICAL**: Your application won't work until you set the environment variable.

### Via Vercel Dashboard:

1. Go to your project dashboard on Vercel
2. Click **Settings** tab
3. Click **Environment Variables** in the left sidebar
4. Add a new environment variable:
   - **Name**: `GOOGLE_SHEET_URL`
   - **Value**: Your Google Apps Script Web App URL (from Step 1)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Important**: Redeploy your application for changes to take effect
   - Go to **Deployments** tab
   - Click the three dots (**...**) on the latest deployment
   - Click **Redeploy**

### Via Vercel CLI:

```bash
vercel env add GOOGLE_SHEET_URL production
```

Then paste your Google Apps Script URL when prompted.

## Step 5: Test Your Deployment

1. Open your deployed URL (e.g., `https://your-project.vercel.app`)
2. Fill out the form with test data
3. Click **Join Resistance**
4. Check your Google Sheet to verify the data was saved
5. Open browser DevTools → Network tab
6. Submit the form again
7. Verify the request goes to `/api/submit` (NOT to Google Apps Script URL)

## Step 6: Verify Security

✅ **Security Checklist:**

1. Open your deployed website
2. Right-click → **View Page Source**
3. Search for "script.google.com" - it should NOT appear anywhere
4. Open DevTools → Network tab
5. Submit the form
6. Verify:
   - Request goes to `/api/submit` endpoint
   - Google Apps Script URL is NOT visible in any request
   - Response comes from your Vercel function

## Local Development (Optional)

To test locally before deploying:

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Create a `.env` file in your project root:

   ```
   GOOGLE_SHEET_URL=your-google-apps-script-url-here
   ```

3. Run development server:

   ```bash
   vercel dev
   ```

4. Open `http://localhost:3000` in your browser

5. Test the form submission

## Troubleshooting

### Issue: "Google Sheet URL is not configured" error

**Solution**:

- Verify environment variable `GOOGLE_SHEET_URL` is set in Vercel dashboard
- Redeploy after adding environment variables
- Check variable name is exactly `GOOGLE_SHEET_URL` (case-sensitive)

### Issue: CORS errors

**Solution**:

- Check that `vercel.json` includes CORS headers
- Verify Google Apps Script is deployed with "Anyone" access
- Check browser console for specific CORS error messages

### Issue: Data not appearing in Google Sheet

**Solution**:

- Test Google Apps Script URL directly using a tool like Postman
- Verify the script has permissions to write to the sheet
- Check Google Apps Script logs for errors
- Ensure the sheet has the correct columns

### Issue: 405 Method Not Allowed

**Solution**:

- Verify you're sending POST requests, not GET
- Check the fetch method in frontend code is set to 'POST'

## Security Best Practices

✅ **Never commit `.env` files to Git** - They are already in `.gitignore`

✅ **Rotate your Google Apps Script URL** if it gets exposed

✅ **Monitor your Google Sheet** for unusual activity

✅ **Set up rate limiting** (consider Vercel's rate limiting features)

✅ **Add input validation** on both frontend and backend

## Environment Variables Reference

| Variable           | Required | Description                                    |
| ------------------ | -------- | ---------------------------------------------- |
| `GOOGLE_SHEET_URL` | Yes      | Your Google Apps Script Web App deployment URL |

## Next Steps

- Add email notifications when form is submitted
- Implement reCAPTCHA to prevent spam
- Add analytics to track submissions
- Create an admin dashboard to view submissions
- Set up monitoring and alerts

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Google Apps Script execution logs
3. Review browser console for errors
4. Verify all environment variables are set correctly

---

**Congratulations! Your BabyMetal form is now securely deployed with hidden backend endpoints!** 🤘🎸
