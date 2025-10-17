# Housing & Rent Analyzer 🏠

**Group 05**: Thoeun Soklin, Sov Sakura, Chhom Sodanith, Chhiv Sivmeng

A comprehensive rental platform that connects property owners with renters, featuring analytics, recommendations, and secure payment systems.

## 🎯 Features

### User Roles
- **Admin**: Verify property owners, manage listings, monitor platform
- **Property Owner**: CRUD operations on properties, view analytics
- **Renter**: Search, filter, book properties, make payments

### Core Functionality
- ✅ Property verification system with admin approval
- 🔍 Advanced search and filtering
- 📊 Analytics and rent trend visualization
- 🤖 AI-powered property recommendations
- 💳 Secure online payment (QR code, e-wallet)
- 📅 Room reservation and visit booking
- 🗺️ Google Maps & Street View integration
- ⭐ Ratings and reviews system
- 💬 In-app messaging
- 🛡️ Trust badges and verification

## 🛠️ Tech Stack

### Frontend
- React.js 18
- TailwindCSS for styling
- shadcn/ui components
- Lucide React icons
- Recharts for analytics
- Axios for API calls
- React Router for navigation

### Backend
- Django 5.0
- Django REST Framework
- MySQL database
- JWT authentication
- Django CORS headers

### Additional Tools
- Google Maps API
- Payment gateway integration
- Analytics engine

## 📁 Project Structure

```
WCTll-Project/
├── backend/              # Django backend
│   ├── housing_analyzer/ # Main project
│   ├── api/             # REST API app
│   ├── users/           # User management
│   ├── properties/      # Property management
│   ├── bookings/        # Booking system
│   ├── analytics/       # Analytics engine
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── utils/       # Utilities
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure database in `settings.py`

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Run server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Run development server:
```bash
npm run dev
```

## 📊 Database Schema

### Main Tables
- **Users**: Admin, Property Owner, Renter profiles
- **Properties**: Rental listings with details
- **Bookings**: Reservations and visits
- **Payments**: Transaction records
- **Reviews**: User ratings and feedback
- **Analytics**: Rent trends and insights

## 🔐 Security Features

- JWT-based authentication
- Admin verification for property owners
- Secure payment processing
- Report and moderation system
- Data encryption

## 📈 Analytics Features

- Rent price trends by area
- Property demand analysis
- Seasonal trends
- Performance metrics for owners
- Cost of living comparisons

## 🎨 UI/UX Highlights

- Modern, responsive design
- Intuitive navigation
- Interactive maps
- Real-time updates
- Mobile-friendly interface

## 📅 Project Timeline

- **Week 1-2**: Requirements & Design
- **Week 3**: UX/UI Design
- **Week 4-5**: Frontend Development
- **Week 6**: Database & ML Setup
- **Week 7-10**: Backend Development
- **Week 11-12**: Integration
- **Week 13-14**: Testing & Bug Fixes
- **Week 15**: Final Deployment

## 🤝 Contributing

This is an academic project by Group 05 for Web and Cloud Technology II course.

## 📝 License

Academic Project - All Rights Reserved

## 📧 Contact

For questions or support, contact the development team.

---

**Built with ❤️ by Group 05**
