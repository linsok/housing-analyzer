# Property Images Setup Guide

## Quick Start

### Option 1: Run the Batch File (Easiest)
Simply double-click the file:
```
add_images.bat
```

This will automatically:
1. Install the required `requests` package
2. Download the 4 hotel room images
3. Add them to your properties
4. Show you the results

---

## Option 2: Manual Command

If you prefer to run it manually:

```bash
cd backend
pip install requests
python manage.py add_property_images
```

---

## What This Does

The script will:

1. **Find all properties** in your database
2. **Download 4 hotel room images** from these URLs:
   - https://www.vanorohotel.com/wp-content/uploads/2021/07/drz-vanoro_6737.jpg
   - https://www.vanorohotel.com/wp-content/uploads/2021/07/drz-vanoro_6664.jpg
   - https://www.jaypeehotels.com/blog/wp-content/uploads/2024/09/Blog-6-scaled.jpg
   - https://www.wivenhoehouse.co.uk/wp-content/uploads/2020/11/Wivenhoe-House-Hotel-Feb-2023-emma-Cabielles-123-1367x912.jpg

3. **Assign images to properties** (rotating through the 4 images)
4. **Set the first image as primary** for each property
5. **Skip properties** that already have images

---

## Expected Output

You should see something like:

```
============================================================
Adding Property Images
============================================================

Found 10 properties

[1/10] Processing: Modern Apartment in BKK1
  Downloading: https://www.vanorohotel.com/...
  ✓ Successfully added image

[2/10] Processing: Cozy Studio near Riverside
  Downloading: https://www.vanorohotel.com/...
  ✓ Successfully added image

...

============================================================
Image Addition Complete!
  Success: 10
  Failed: 0
  Skipped: 0
============================================================
```

---

## Troubleshooting

### Error: "No properties found"
**Solution**: You need to create properties first. Run:
```bash
cd backend
python manage.py populate_data
```

### Error: "requests module not found"
**Solution**: Install the requests package:
```bash
pip install requests
```

### Error: "Cannot download image"
**Solution**: 
- Check your internet connection
- The image URLs might be temporarily unavailable
- Try running the script again

### Error: "Permission denied"
**Solution**: 
- Make sure the `media/properties/` directory exists
- Check folder permissions
- Run as administrator if needed

---

## Verify Images Were Added

### Method 1: Check in Django Admin
1. Go to http://localhost:8000/admin/
2. Login as admin
3. Go to Properties → Property images
4. You should see all the images

### Method 2: Check the Database
```bash
cd backend
python manage.py shell
```

Then run:
```python
from properties.models import Property, PropertyImage

# Check how many properties have images
properties_with_images = Property.objects.filter(images__isnull=False).distinct().count()
print(f"Properties with images: {properties_with_images}")

# Check total images
total_images = PropertyImage.objects.count()
print(f"Total images: {total_images}")

# List properties and their image counts
for prop in Property.objects.all():
    print(f"{prop.title}: {prop.images.count()} images")
```

### Method 3: Check in Frontend
1. Start the frontend: `cd frontend && npm start`
2. Go to http://localhost:3000/properties
3. You should see property cards with images
4. Click on any property to see the full image

---

## Re-running the Script

The script is **safe to run multiple times**. It will:
- Skip properties that already have images
- Only add images to properties without images
- Not create duplicates

If you want to **replace existing images**:
1. Delete existing images from Django admin
2. Run the script again

---

## Adding More Images

If you want to add more images to each property:

### Option 1: Modify the Script
Edit `backend/properties/management/commands/add_property_images.py`:

Change this line:
```python
if existing_images > 0:
    self.stdout.write(self.style.WARNING(f"  Property already has {existing_images} image(s). Skipping..."))
    continue
```

To:
```python
if existing_images >= 3:  # Allow up to 3 images per property
    self.stdout.write(self.style.WARNING(f"  Property already has {existing_images} image(s). Skipping..."))
    continue
```

### Option 2: Add Images Manually
1. Go to Django admin
2. Navigate to Property images
3. Click "Add property image"
4. Select property and upload image
5. Set as primary if needed

---

## Image Storage

Images are stored in:
```
backend/media/properties/
```

Each image is named:
```
property_{property_id}_image_{number}.jpg
```

Example:
- `property_1_image_1.jpg`
- `property_2_image_1.jpg`
- etc.

---

## Next Steps

After adding images:

1. **Restart the backend** (if it's running):
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Check the frontend**:
   - Go to http://localhost:3000/properties
   - All properties should now have images
   - Click on properties to see full details

3. **Test favorites**:
   - Click heart icons to favorite properties
   - Go to /favorites page
   - You should see your favorited properties with images

---

## Summary

✅ **Created**: `add_images.bat` - Double-click to run  
✅ **Created**: Django management command  
✅ **Images**: 4 hotel room images will be added  
✅ **Safe**: Won't create duplicates  
✅ **Smart**: Rotates images across properties  

**Just run**: `add_images.bat` and you're done! 🎉
