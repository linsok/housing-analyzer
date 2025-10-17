# Troubleshooting: Property Images Not Showing

## Quick Diagnosis

### Step 1: Run the Check Script
```bash
check_images.bat
```

This will tell you exactly what's wrong.

---

## Common Problems & Solutions

### Problem 1: "Total Images: 0"
**Meaning**: No images have been added to the database yet.

**Solution**:
1. Run `add_images.bat`
2. Wait for it to complete
3. Refresh your frontend

---

### Problem 2: "Total Properties: 0"
**Meaning**: No properties exist in the database.

**Solution**:
1. First create properties:
   ```bash
   cd backend
   python manage.py populate_data
   ```
2. Then add images:
   ```bash
   add_images.bat
   ```

---

### Problem 3: Images in Database But Not Showing
**Meaning**: Images are added but frontend can't access them.

**Possible Causes**:

#### A. Backend Not Running
**Check**: Is `python manage.py runserver` running?

**Solution**: Start the backend:
```bash
cd backend
python manage.py runserver
```

#### B. Wrong Backend URL
**Check**: Is backend running on `http://localhost:8000`?

**Solution**: Make sure frontend is pointing to correct backend URL.

Check `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

#### C. Media Files Not Being Served
**Check**: Can you access this URL directly?
```
http://localhost:8000/media/properties/property_1_image_1.jpg
```

**Solution**: Media serving should work automatically in development. If not, check `backend/housing_analyzer/urls.py`:

```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your urls
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

### Problem 4: Images Download Failed
**Meaning**: Script couldn't download images from URLs.

**Symptoms**:
- "Error downloading" messages
- "Failed: X" in summary

**Solutions**:

#### A. Check Internet Connection
Make sure you're connected to the internet.

#### B. Install Requests Library
```bash
pip install requests
```

#### C. Try Alternative Image URLs
If the hotel image URLs are blocked, use these alternatives:

Edit `backend/properties/management/commands/add_property_images.py`:

Replace the `IMAGE_URLS` with:
```python
IMAGE_URLS = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39',
]
```

---

### Problem 5: Permission Denied
**Meaning**: Can't write to media folder.

**Solution**:

#### Windows:
1. Right-click `backend/media` folder
2. Properties → Security
3. Give your user "Full control"

#### Or create the folder manually:
```bash
cd backend
mkdir media
mkdir media\properties
```

---

## Manual Image Addition (Alternative Method)

If the script still doesn't work, add images manually:

### Method 1: Using Django Admin

1. **Start backend**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Go to admin**: http://localhost:8000/admin/

3. **Login** with admin credentials

4. **Navigate to**: Properties → Property images

5. **Click "Add property image"**

6. **Fill in**:
   - Property: Select a property
   - Image: Upload an image file
   - Is primary: Check this box
   - Order: 0

7. **Save**

8. **Repeat** for other properties

### Method 2: Using Django Shell

```bash
cd backend
python manage.py shell
```

Then run:
```python
from properties.models import Property, PropertyImage
from django.core.files import File
import urllib.request
from io import BytesIO

# Get first property
prop = Property.objects.first()

# Download image
url = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
response = urllib.request.urlopen(url)
image_data = BytesIO(response.read())

# Create PropertyImage
img = PropertyImage(
    property=prop,
    caption='Room image',
    is_primary=True,
    order=0
)

# Save image
img.image.save('room.jpg', File(image_data), save=True)

print(f"Image added to {prop.title}")
```

---

## Verification Steps

After adding images, verify they work:

### 1. Check in Database
```bash
cd backend
python check_images.py
```

Should show: "Properties with images: X" (where X > 0)

### 2. Check File System
Navigate to:
```
backend/media/properties/
```

You should see `.jpg` files there.

### 3. Check API Response
Open browser and go to:
```
http://localhost:8000/api/properties/
```

Look for `primary_image` field in the JSON response. It should have a URL.

### 4. Check Frontend
1. Go to http://localhost:3000/properties
2. Property cards should show images
3. Open browser console (F12)
4. Check for any errors

---

## Still Not Working?

### Debug Checklist:

- [ ] Backend is running (`python manage.py runserver`)
- [ ] Frontend is running (`npm start`)
- [ ] Properties exist in database
- [ ] Images exist in database (`check_images.bat`)
- [ ] Image files exist in `backend/media/properties/`
- [ ] Can access media URL directly in browser
- [ ] No errors in browser console
- [ ] No errors in backend console

### Get More Help:

1. **Check backend logs**: Look at the terminal where `manage.py runserver` is running

2. **Check frontend console**: Press F12 in browser, look for errors

3. **Check API response**: Go to `http://localhost:8000/api/properties/` and verify `primary_image` field exists

4. **Share error messages**: Copy any error messages you see

---

## Quick Test

Run these commands in order:

```bash
# 1. Check if properties exist
cd backend
python manage.py shell -c "from properties.models import Property; print(f'Properties: {Property.objects.count()}')"

# 2. Check if images exist
python manage.py shell -c "from properties.models import PropertyImage; print(f'Images: {PropertyImage.objects.count()}')"

# 3. If no images, add them
cd ..
add_images.bat

# 4. Verify images were added
check_images.bat
```

---

## Summary

**Most common issue**: Images were never added to the database.

**Solution**: Run `add_images.bat`

**If that doesn't work**: Follow the troubleshooting steps above to identify the specific issue.
