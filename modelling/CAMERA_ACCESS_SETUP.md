# Camera Access Setup for MPB-OMS Crowd Counter

This guide explains how to enable camera access when accessing the MPB-OMS Crowd Counter web application from a browser.

## The Problem

Modern web browsers require **HTTPS (secure connection)** to access camera permissions when the website is accessed from an IP address other than `localhost` or `127.0.0.1`. Since you're accessing the server at `http://192.168.1.113:5000/`, the browser blocks camera access for security reasons.

## Solution 1: Use HTTPS with Self-Signed Certificate (Recommended)

### Step 1: Install OpenSSL (if not already installed)

**Windows:**
- Download from: https://slproweb.com/products/Win32OpenSSL.html
- Or use Chocolatey: `choco install openssl`
- Or use scoop: `scoop install openssl`

**Verify installation:**
```bash
openssl version
```

### Step 2: Generate SSL Certificate and Start HTTPS Server

**Option A: Use the batch file (Windows)**
```bash
cd modelling
start_https_server.bat
```

**Option B: Use PowerShell**
```powershell
cd modelling
.\start_https_server.ps1
```

**Option C: Manual commands**
```bash
cd modelling
python scripts/generate_ssl_cert.py
python scripts/modeling.py --mode server --port 5000 --ssl
```

### Step 3: Access the HTTPS Website

1. Open your browser and go to: **https://192.168.1.113:5000/**
2. You'll see a security warning about the self-signed certificate
3. Click **"Advanced"** or **"Show details"**
4. Click **"Proceed to 192.168.1.113 (unsafe)"** or **"Accept the risk and continue"**
5. The camera permission should now work!

## Solution 2: Access via Localhost (Alternative)

If you're accessing the server from the same machine where it's running:

1. Stop the current server (Ctrl+C)
2. Start the regular HTTP server:
   ```bash
   cd modelling
   python scripts/modeling.py --mode server --port 5000
   ```
3. Access via: **http://localhost:5000/** or **http://127.0.0.1:5000/**

## Solution 3: Browser-Specific Settings (Temporary)

**Chrome:**
1. Start Chrome with insecure origins allowed:
   ```bash
   chrome.exe --unsafely-treat-insecure-origin-as-secure=http://192.168.1.113:5000 --user-data-dir=C:\temp\chrome-temp
   ```

**Firefox:**
1. Go to `about:config`
2. Search for `media.devices.insecure.enabled`
3. Set it to `true`
4. Search for `media.getusermedia.insecure.enabled`
5. Set it to `true`

## Troubleshooting

### Certificate Issues
- If you get certificate errors, try regenerating:
  ```bash
  cd modelling
  rmdir /s certs
  python scripts/generate_ssl_cert.py
  ```

### Camera Still Not Working
1. Check browser permissions in Settings > Privacy & Security > Camera
2. Ensure no other applications are using the camera
3. Try refreshing the page or restarting the browser
4. Check browser console for error messages (F12 → Console tab)

### Port Already in Use
- If port 5000 is busy, use a different port:
  ```bash
  python scripts/modeling.py --mode server --port 5001 --ssl
  ```

## Security Note

The self-signed certificate is only for development purposes. For production use, obtain a proper SSL certificate from a Certificate Authority (CA).

## Supported Browsers

- Chrome 47+
- Firefox 36+
- Safari 11+
- Edge 79+

All modern browsers require HTTPS for camera access from non-localhost domains.
