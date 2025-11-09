import mysql.connector
import os

def reset_database():
    try:
        # Connect to MySQL server (without specifying a database)
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Soklin0976193630'
        )
        
        # Create a cursor object
        cursor = connection.cursor()
        
        # Drop the database if it exists
        cursor.execute("DROP DATABASE IF EXISTS mind")
        print("✅ Dropped existing 'mind' database")
        
        # Create the database
        cursor.execute("CREATE DATABASE mind CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("✅ Created new 'mind' database")
        
    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")
        return False
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("✅ MySQL connection is closed")
    return True

if __name__ == "__main__":
    if reset_database():
        # Run migrations
        print("\nRunning migrations...")
        os.system("python manage.py migrate --settings=housing_analyzer.mysql_settings")
        
        # Create superuser
        print("\nCreating superuser...")
        os.system("python manage.py createsuperuser --settings=housing_analyzer.mysql_settings")
        
        print("\n✅ Setup complete! You can now start the server with:")
        print("python manage.py runserver --settings=housing_analyzer.mysql_settings")
