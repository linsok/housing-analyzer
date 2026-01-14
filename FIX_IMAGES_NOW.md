# 🔧 Fix: Property Images Not Showing

## The Problem
You're getting a 404 error because the image files don't exist in:
```
backend/media/properties/
```

## The Solution (2 Options)

---

### ✅ Option 1: Use Sample Images (RECOMMENDED - Works Offline)

This creates colored placeholder images locally. **No internet required!**

**Just run:**
```bash
add_sample_images.bat
```

**What it does:**
- Creates beautiful colored placeholder images
- Each property gets a unique color
- Shows property type on the image
- Works 100% offline
- Takes only 5 seconds

**Result:**
- Property #1: Blue image with "Apartment"
- Property #2: Green image with "House"
- Property #3: Orange image with "Room"
- etc.

---

### Option 2: Download Real Hotel Images (Requires Internet)

This downloads actual hotel room photos from the internet.

**Run:**
```bash
add_images.bat
```

**What it does:**
- Downloads 4 real hotel room images
- Adds them to your properties
- Requires internet connection
- May fail if URLs are blocked

---

## After Running Either Script

1. **Check if it worked:**
   ```bash
   check_images.bat
   ```
   
   Should show: "Properties with images: X" (where X > 0)

2. **Verify files exist:**
   - Go to: `backend/media/properties/`
   - You should see `.jpg` files

3. **Refresh frontend:**
   - Press Ctrl+F5 in your browser
   - Go to `/properties` page
   - Images should now appear!

---

## Why Images Weren't Showing

The error message shows:
```
"property_1_image_1.jpg" does not exist
```

This means:
1. ✅ The database has a record of the image
2. ❌ But the actual file doesn't exist on disk

**Cause:** The image addition script either:
- Wasn't run yet
- Failed to download images
- Failed to save images to disk

**Solution:** Run one of the scripts above to actually create the image files.

---

## Troubleshooting

### "No properties found"
**Fix:** Create properties first:
```bash
cd backend
python manage.py populate_data
```
Then run the image script again.

### "Permission denied"
**Fix:** Run as administrator or check folder permissions.

### Images still not showing after running script
**Fix:** 
1. Make sure backend is running: `python manage.py runserver`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+F5)
4. Check browser console (F12) for errors

### "Pillow not installed" (for sample images)
**Fix:** The script will install it automatically, but you can also:
```bash
pip install Pillow
```

### "requests not installed" (for real images)
**Fix:**
```bash
pip install requests
```

---

## Quick Test

After running the script, test if images work:

1. **Check file exists:**
   ```
   dir backend\media\properties
   ```
   Should show `.jpg` files

2. **Access directly in browser:**
   ```
   http://localhost:8000/media/properties/property_1_image_1.jpg
   ```
   Should show the image (not 404)

3. **Check API response:**
   ```
   http://localhost:8000/api/properties/
   ```
   Look for `primary_image` field with a URL

4. **Check frontend:**
   ```
   http://localhost:3000/properties
   ```
   Property cards should show images

---

## Summary

**Problem:** Image files don't exist on disk

**Solution:** Run `add_sample_images.bat` (recommended) or `add_images.bat`

**Expected result:** Images appear on all property cards

**Time to fix:** Less than 1 minute

---

## Need Help?

If images still don't show after running the script:

1. Share the output from `check_images.bat`
2. Share any error messages from the script
3. Check if files exist in `backend/media/properties/`
4. Share the browser console errors (F12)
