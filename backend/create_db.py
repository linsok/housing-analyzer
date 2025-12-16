import mysql.connector

try:
    # Connect to MySQL server (without specifying a database)
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='Soklin0976193630'
    )
    
    # Create a cursor object
    cursor = connection.cursor()
    
    # Create the database if it doesn't exist
    db_name = 'housing_analyzer'
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    
    print(f"✅ Database '{db_name}' created successfully or already exists.")
    print("✅ You can now run migrations with: python manage.py migrate")
    
except mysql.connector.Error as err:
    print(f"❌ Error: {err}")
    
finally:
    if 'connection' in locals() and connection.is_connected():
        cursor.close()
        connection.close()
        print("✅ MySQL connection is closed")
