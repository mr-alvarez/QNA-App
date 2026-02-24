# Azure QA Application - Deployment Package

This folder contains all files needed to deploy the QA application to Azure App Service.

## Folder Structure
```
deployment/
├── flask_app.py              # Main Flask application
├── requirements.txt          # Python dependencies
├── web.config                # IIS configuration for Azure
├── startup.sh                # Application startup script
├── .gitignore                # Git ignore file
└── static/                   # Frontend files
    ├── index.html            # Main HTML page
    ├── main.js               # Application logic
    └── styles.css            # Styling
```

## Step 1: Prepare the ZIP Package
1. Select all files in this folder (Flask app, requirements.txt, static folder, web.config, etc.)
2. Right-click and select "Send to > Compressed (zipped) folder"
3. Name it: `qa-app-deployment.zip`

## Step 2: Upload to Azure Portal
1. Go to **Azure Portal** > **Your App Service**
2. Navigate to **Deployment Center** (or **Development Tools > App Service Editor**)
3. Choose **Upload ZIP**
4. Upload your `qa-app-deployment.zip`

## Step 3: Configure Application Settings
1. Go to App Service > **Configuration** > **Application Settings**
2. Click **+ New application setting** and add these variables:

| Name | Value |
|------|-------|
| `AI_SERVICE_ENDPOINT` | `https://your-service.cognitiveservices.azure.com/` |
| `AI_SERVICE_KEY` | Your API key from Azure Language Service |
| `QA_PROJECT_NAME` | `LearnFAQ` (or your project name) |
| `QA_DEPLOYMENT_NAME` | `production` (or your deployment name) |
| `FLASK_ENV` | `production` |
| `FLASK_DEBUG` | `False` |
| `HOST` | `0.0.0.0` |
| `PORT` | `8000` |

3. Click **Save**

## Step 4: Test Your Application
1. Go to App Service > **Overview**
2. Click the **URL** to open your app (e.g., `https://your-app-service.azurewebsites.net/`)
3. Test the health endpoint: `https://your-app-service.azurewebsites.net/health`
4. Try asking a question in the UI

## Step 5: Monitor Logs
1. Go to App Service > **Log Stream**
2. Watch the logs as the application starts
3. Look for any errors or startup issues

## Troubleshooting

### App doesn't start
- Check **Log Stream** for error messages
- Verify all environment variables are set correctly
- Restart the app: Go to **Overview** > **Restart**

### API gives 500 error
- Check that `AI_SERVICE_ENDPOINT` and `AI_SERVICE_KEY` are correct
- Verify `QA_PROJECT_NAME` and `QA_DEPLOYMENT_NAME` exist in your Azure Language Service
- Check the **Log Stream** for specific error messages

### Frontend can't reach API
- The frontend automatically uses `window.location.origin + '/api/answer'`
- This should work automatically after deployment
- If issues persist, check browser console for CORS errors

### Files not found (404)
- Ensure all files are in the `static/` folder
- Check that Flask is serving static files correctly
- Restart the app

## File Descriptions

- **flask_app.py**: Main Flask application that:
  - Serves the frontend files from `static/` folder
  - Provides `/api/answer` endpoint for Q&A queries
  - Provides `/health` endpoint for monitoring
  
- **requirements.txt**: Lists all Python dependencies needed
  
- **web.config**: IIS configuration for Azure (Windows App Service)
  
- **static/**: Contains all frontend files
  - `index.html`: Main page structure
  - `main.js`: Client-side JavaScript logic
  - `styles.css`: Application styling

## Key Features

✓ CORS enabled for cross-origin requests
✓ Dynamic API endpoint (works on any domain)
✓ Health check endpoint for monitoring
✓ Logging configured for diagnostics
✓ Production-ready with Gunicorn WSGI server
✓ Static file serving from Flask
✓ Error handling and validation
✓ Environmental configuration support

## Support

For issues or questions, check:
- Azure App Service logs
- Flask application logs
- Browser console for JavaScript errors
- Azure Language Service API documentation
