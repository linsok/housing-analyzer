# 📸 How to Add Your Uploaded Images

## Step-by-Step Instructions

### Step 1: Create the Images Folder

1. Go to: `backend/` folder
2. Create a new folder called: `temp_images`
3. Full path should be: `backend/temp_images/`

### Step 2: Save Your 4 Images

Save the 4 images you uploaded with these exact names:

1. **First image** (modern room with blue curtains) → Save as: `room1.jpg`
2. **Second image** (room with bathroom view) → Save as: `room2.jpg`
3. **Third image** (modern room with sofa) → Save as: `room3.jpg`
4. **Fourth image** (minimalist white room) → Save as: `room4.jpg`

Place all 4 images in: `backend/temp_images/`

### Step 3: Run the Script

**Option A: Double-click the batch file**
```
add_your_images.bat
```

**Option B: Run manually**
```bash
cd backend
python add_uploaded_images.py
```

### Step 4: Verify

1. Check the output - should say "Success: X"
2. Refresh your frontend (Ctrl+F5)
3. Go to `/properties` page
4. You should see your uploaded images!

---

## Folder Structure

```
WCTll-Project/
├── backend/
│   ├── temp_images/          ← Create this folder
│   │   ├── room1.jpg         ← Your first image
│   │   ├── room2.jpg         ← Your second image
│   │   ├── room3.jpg         ← Your third image
│   │   └── room4.jpg         ← Your fourth image
│   ├── add_uploaded_images.py
│   └── ...
└── add_your_images.bat
```

---

## What the Script Does

1. Looks for images in `backend/temp_images/`
2. Rotates through your 4 images
3. Assigns them to properties
4. Copies them to `backend/media/properties/`
5. Sets the first image as primary for each property

---

## Troubleshooting

### "temp_images folder not found"
**Fix**: Create the folder `backend/temp_images/`

### "room1.jpg not found"
**Fix**: Make sure images are named exactly:
- `room1.jpg` (not `room1.png` or `Room1.jpg`)
- `room2.jpg`
- `room3.jpg`
- `room4.jpg`

### "No properties found"
**Fix**: Create properties first:
```bash
cd backend
python manage.py populate_data
```

---

## Quick Summary

1. ✅ Create folder: `backend/temp_images/`
2. ✅ Save 4 images as: `room1.jpg`, `room2.jpg`, `room3.jpg`, `room4.jpg`
3. ✅ Run: `add_your_images.bat`
4. ✅ Refresh browser and see your images!
