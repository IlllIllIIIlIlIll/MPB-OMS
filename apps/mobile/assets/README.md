# Assets Directory

This directory contains image assets for the mobile app.

## Required Files

You'll need to add the following image files for the app to work properly:

- `icon.png` - App icon (1024x1024px)
- `adaptive-icon.png` - Android adaptive icon (1024x1024px)
- `splash.png` - Splash screen image (1284x2778px for iPhone 13 Pro)
- `favicon.png` - Web favicon (32x32px)

## Asset Guidelines

### App Icon (`icon.png`)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Should represent the TransJakarta/bus theme
- Will be used for iOS and as fallback for Android

### Adaptive Icon (`adaptive-icon.png`) 
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Android adaptive icon foreground
- Should work well with different background shapes

### Splash Screen (`splash.png`)
- Size: 1284x2778 pixels (or appropriate for your target device)
- Format: PNG
- Should match the app's branding
- Will be displayed while the app loads

### Favicon (`favicon.png`)
- Size: 32x32 pixels
- Format: PNG
- For web version of the app

## Temporary Solution

For development purposes, you can use simple placeholder images or emoji-based icons until proper assets are created.

The app will still function without these assets, but you may see warnings in the console.
