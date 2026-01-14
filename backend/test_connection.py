"""
Simple script to test SQL Server connection
Run this after updating your .env file with correct credentials
"""
import os
from decouple import config

print("=" * 60)
print("SQL Server Connection Test")
print("=" * 60)

# Load environment variables
try:
    use_windows_auth = config('USE_WINDOWS_AUTH', default=False, cast=bool)
    db_name = config('DB_NAME', default='housing_analyzer')
    db_host = config('DB_HOST', default='localhost\\SQLEXPRESS')
    db_port = config('DB_PORT', default='1433')
    
    print(f"\n📋 Configuration:")
    print(f"   Database: {db_name}")
    print(f"   Host: {db_host}")
    print(f"   Port: {db_port}")
    
    if use_windows_auth:
        print(f"   Authentication: Windows Authentication (Trusted Connection)")
    else:
        db_user = config('DB_USER', default='sa')
        print(f"   Authentication: SQL Server Authentication")
        print(f"   User: {db_user}")
        print(f"   Password: {'*' * 8} (hidden)")
    
    print("\n🔄 Testing connection...")
    
    # Try to import mssql-django
    try:
        import mssql
        print("✅ mssql-django package is installed")
    except ImportError:
        print("❌ mssql-django package not found. Run: pip install mssql-django")
        exit(1)
    
    # Try to connect using pyodbc
    try:
        import pyodbc
        print("✅ pyodbc package is installed")
        
        # Build connection string based on authentication method
        if use_windows_auth:
            # Windows Authentication
            conn_str = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                f"SERVER={db_host};"
                f"DATABASE={db_name};"
                f"Trusted_Connection=yes;"
            )
        else:
            # SQL Server Authentication
            db_user = config('DB_USER', default='sa')
            db_password = config('DB_PASSWORD', default='')
            
            if not db_password:
                print("\n⚠️  WARNING: DB_PASSWORD is empty in .env file")
                print("   Please update backend/.env with your SQL Server password")
                print("   OR switch to Windows Authentication by setting USE_WINDOWS_AUTH=True")
                exit(1)
            
            conn_str = (
                f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                f"SERVER={db_host};"
                f"DATABASE={db_name};"
                f"UID={db_user};"
                f"PWD={db_password}"
            )
        
        print("\n🔌 Attempting to connect to SQL Server...")
        conn = pyodbc.connect(conn_str, timeout=5)
        cursor = conn.cursor()
        
        # Test query
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()[0]
        
        print("✅ CONNECTION SUCCESSFUL!")
        print(f"\n📊 SQL Server Version:")
        print(f"   {version.split(chr(10))[0]}")
        
        # Check if tables exist
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        """)
        table_count = cursor.fetchone()[0]
        
        print(f"\n📁 Database Info:")
        print(f"   Tables found: {table_count}")
        
        if table_count == 0:
            print("\n⚠️  No tables found. You need to run migrations:")
            print("   python manage.py migrate")
        else:
            print("✅ Database has tables")
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print("✅ All checks passed! Your database is ready.")
        print("=" * 60)
        
    except pyodbc.Error as e:
        print(f"\n❌ CONNECTION FAILED!")
        print(f"\nError: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("   1. Check if SQL Server is running")
        print("   2. Verify your password in backend/.env")
        print("   3. Ensure database 'housing_analyzer' exists")
        print("   4. Check if SQL Server allows SQL Authentication")
        exit(1)
        
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    print("\nMake sure you have a .env file in the backend directory")
    exit(1)
