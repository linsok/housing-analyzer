import pymysql

try:
    # Try to connect to the database
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='Soklin0976193630',
        database='db_my_rentor',
        port=3306
    )
    
    print("✅ Successfully connected to MySQL database!")
    
    # Create a cursor object
    with connection.cursor() as cursor:
        # Check if the database exists
        cursor.execute("SHOW DATABASES LIKE 'db_my_rentor'")
        result = cursor.fetchone()
        if result:
            print("✅ Database 'db_my_rentor' exists")
        else:
            print("❌ Database 'db_my_rentor' does not exist")
            
        # Show tables in the database
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        if tables:
            print("\nTables in the database:")
            for table in tables:
                print(f"- {table[0]}")
        else:
            print("\nNo tables found in the database")
            
except pymysql.Error as e:
    print(f"❌ Error connecting to MySQL: {e}")
    
finally:
    # Close the connection
    if 'connection' in locals() and connection.open:
        connection.close()
        print("\nConnection closed.")
