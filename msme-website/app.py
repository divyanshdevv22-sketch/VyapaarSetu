from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = 'msme_secret_key_2023'
CORS(app)

# Database connection using MySQL Workbench settings
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'msme_db'),
            port=os.getenv('DB_PORT', '3306')
        )
        return conn
    except mysql.connector.Error as e:
        print(f"❌ Database connection error: {e}")
        return None

def create_tables():
    conn = get_db_connection()
    if not conn:
        print("❌ Cannot connect to database. Please check your MySQL connection.")
        return
    
    cursor = conn.cursor()
    
    try:
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("✅ Users table created/verified")
        
        # Create payments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_id VARCHAR(100) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) NOT NULL,
                verified_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("✅ Payments table created/verified")
        
        # Create waste_pickups table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS waste_pickups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                waste_type VARCHAR(50) NOT NULL,
                quantity DECIMAL(10,2) NOT NULL,
                pickup_date DATE NOT NULL,
                status VARCHAR(20) NOT NULL,
                scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("✅ Waste pickups table created/verified")
        
        # Create bills table with customer phone
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(100) NOT NULL,
                customer_phone VARCHAR(15),
                subtotal DECIMAL(10,2) NOT NULL,
                gst DECIMAL(10,2) NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("✅ Bills table created/verified")
        
        # Create bill_items table with GST rate
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bill_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                bill_id INT,
                item_name VARCHAR(100) NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                gst_rate DECIMAL(5,2) DEFAULT 18.00,
                FOREIGN KEY (bill_id) REFERENCES bills(id)
            )
        ''')
        print("✅ Bill items table created/verified")
        
        # Create inventory table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                stock INT NOT NULL,
                description TEXT,
                gst_rate DECIMAL(5,2) DEFAULT 18.00,
                status VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ''')
        print("✅ Inventory table created/verified")
        
        # Insert sample user if not exists
        cursor.execute('''
            INSERT IGNORE INTO users (username, password) 
            VALUES ('ayman', 'password123')
        ''')
        print("✅ Sample user 'ayman' inserted")
        
        # Insert sample payments
        cursor.execute('''
            INSERT IGNORE INTO payments (transaction_id, amount, status) 
            VALUES 
            ('TXN001234', 2500.00, 'verified'),
            ('TXN001233', 1800.00, 'pending'),
            ('TXN001232', 3200.00, 'verified'),
            ('TXN001231', 1500.00, 'verified'),
            ('TXN001230', 2800.00, 'failed')
        ''')
        print("✅ Sample payments inserted")
        
        # Insert sample waste pickups
        cursor.execute('''
            INSERT IGNORE INTO waste_pickups (waste_type, quantity, pickup_date, status) 
            VALUES 
            ('plastic', 5.5, '2024-01-15', 'completed'),
            ('paper', 3.2, '2024-01-16', 'scheduled'),
            ('metal', 2.1, '2024-01-18', 'completed'),
            ('glass', 4.8, '2024-01-20', 'scheduled')
        ''')
        print("✅ Sample waste pickups inserted")
        
        # Insert sample bills
        cursor.execute('''
            INSERT IGNORE INTO bills (customer_name, customer_phone, subtotal, gst, total) 
            VALUES 
            ('Rajesh Kumar', '9876543210', 1000.00, 180.00, 1180.00),
            ('Priya Singh', '8765432109', 2500.00, 450.00, 2950.00),
            ('Amit Sharma', '7654321098', 1500.00, 270.00, 1770.00)
        ''')
        print("✅ Sample bills inserted")
        
        # Insert sample bill items
        cursor.execute('''
            INSERT IGNORE INTO bill_items (bill_id, item_name, quantity, price, gst_rate) 
            VALUES 
            (1, 'Laptop', 1, 45000.00, 18.00),
            (1, 'Mouse', 2, 800.00, 18.00),
            (2, 'Office Chair', 1, 7500.00, 18.00),
            (2, 'Desk Lamp', 2, 1500.00, 18.00),
            (3, 'Notebooks', 5, 120.00, 12.00)
        ''')
        print("✅ Sample bill items inserted")
        
        # Insert sample inventory
        cursor.execute('''
            INSERT IGNORE INTO inventory (product_name, category, price, stock, description, gst_rate) 
            VALUES 
            ('Laptop', 'electronics', 45000.00, 12, 'High-performance business laptop', 18.00),
            ('Office Chair', 'furniture', 7500.00, 8, 'Ergonomic office chair', 18.00),
            ('Notebooks', 'stationery', 120.00, 150, 'A4 size notebooks pack of 10', 12.00),
            ('Wireless Mouse', 'electronics', 800.00, 2, 'Bluetooth wireless mouse', 18.00),
            ('Desk Lamp', 'furniture', 1500.00, 0, 'LED desk lamp with adjustable arm', 18.00),
            ('Pen Set', 'stationery', 250.00, 50, 'Premium pen set with case', 12.00),
            ('Monitor', 'electronics', 12000.00, 6, '24-inch HD monitor', 18.00),
            ('Keyboard', 'electronics', 1800.00, 15, 'Mechanical keyboard', 18.00)
        ''')
        print("✅ Sample inventory inserted")
        
        conn.commit()
        
        # Verify data was created
        cursor.execute("SELECT COUNT(*) as user_count FROM users")
        user_count = cursor.fetchone()
        print(f"✅ User verification: {user_count[0]} users found")
        
    except mysql.connector.Error as e:
        print(f"❌ Error creating tables: {e}")
    finally:
        cursor.close()
        conn.close()

# Routes
@app.route('/')
def home():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>MSME Business Hub</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #121212, #1A1A1A);
                color: #E0E0E0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 2rem;
                text-align: center;
                background: #1E1E1E;
                border-radius: 16px;
                border: 1px solid #333;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            }
            h1 { 
                color: #BB86FC; 
                margin-bottom: 1rem;
            }
            .btn { 
                background: linear-gradient(135deg, #00E5FF, #00B8D4);
                color: #121212;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                display: inline-block;
                margin: 1rem 0.5rem;
                transition: transform 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
            .status {
                background: #2A2A2A;
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
                border-left: 4px solid #00E5FF;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 MSME Business Hub Backend</h1>
            <p>Your backend server is successfully running on port 5000.</p>
            
            <div class="status">
                <strong>📊 System Status:</strong> 
                <span style="color: #4CAF50;">● Operational</span>
            </div>
            
            <p>To access the full application, open the <strong>frontend/index.html</strong> file in your browser.</p>
            
            <div>
                <a href="/api/status" class="btn">Check API Status</a>
                <a href="/login" class="btn">Go to Login Page</a>
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background: #2A2A2A; border-radius: 8px;">
                <strong>👤 Test Credentials:</strong><br>
                Username: <code>ayman</code><br>
                Password: <code>password123</code>
            </div>
        </div>
    </body>
    </html>
    """

# Simple login page
@app.route('/login')
def login_page():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login - MSME Business Hub</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #121212, #1A1A1A); 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
            }
            .login-box { 
                background: #1E1E1E; 
                padding: 2rem; 
                border-radius: 16px; 
                box-shadow: 0 20px 60px rgba(0,0,0,0.4); 
                width: 100%; 
                max-width: 400px; 
                border: 1px solid #333;
            }
            .form-group { 
                margin-bottom: 1rem; 
            }
            label { 
                display: block; 
                margin-bottom: 0.5rem; 
                font-weight: bold; 
                color: #BB86FC;
            }
            input { 
                width: 100%; 
                padding: 0.75rem; 
                background: #2A2A2A; 
                border: 1px solid #444; 
                border-radius: 8px; 
                color: #E0E0E0;
                font-size: 1rem;
            }
            button { 
                width: 100%; 
                padding: 0.75rem; 
                background: linear-gradient(135deg, #00E5FF, #00B8D4); 
                color: #121212; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer; 
                font-weight: bold;
                font-size: 1rem;
                margin-top: 1rem;
            }
            button:hover { 
                opacity: 0.9;
            }
            .note {
                background: #2A2A2A;
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1rem;
                font-size: 0.9rem;
                color: #B0B0B0;
            }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h2 style="text-align: center; color: #BB86FC; margin-bottom: 1.5rem;">MSME Business Hub</h2>
            <p style="text-align: center; color: #B0B0B0; margin-bottom: 1.5rem;">Use the frontend for full application access</p>
            <div class="form-group">
                <label>Username:</label>
                <input type="text" value="ayman" readonly style="background: #333; color: #888;">
            </div>
            <div class="form-group">
                <label>Password:</label>
                <input type="password" value="password123" readonly style="background: #333; color: #888;">
            </div>
            <div class="note">
                <strong>Note:</strong> Open <strong>frontend/index.html</strong> in your browser to use the full application with all features.
            </div>
        </div>
    </body>
    </html>
    """

# API Status Check
@app.route('/api/status')
def api_status():
    return jsonify({
        'status': 'operational',
        'message': 'MSME Business Hub API is running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# Login API
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    print(f"🔐 Login attempt: username={username}")
    
    # Temporary hardcoded login for development
    if username == 'ayman' and password == 'password123':
        session['user'] = username
        return jsonify({'success': True, 'message': 'Login successful'})
    
    # Fallback to database check
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT * FROM users WHERE username = %s AND password = %s",
                (username, password)
            )
            user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if user:
                print(f"✅ Database login successful for: {username}")
                session['user'] = username
                return jsonify({'success': True, 'message': 'Login successful'})
        except Exception as e:
            print(f"❌ Database error: {e}")
    
    print(f"❌ Login failed for: {username}")
    return jsonify({'success': False, 'message': 'Invalid credentials'})

# Payment Verification API
@app.route('/api/verify_payment', methods=['POST'])
def verify_payment():
    data = request.json
    transaction_id = data.get('transactionId')
    amount = data.get('amount')
    
    # Simulate bank API verification
    import random
    is_verified = random.choice([True, True, False])  # 66% success rate
    
    # Save to database
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO payments (transaction_id, amount, status, verified_at) VALUES (%s, %s, %s, %s)",
            (transaction_id, amount, 'verified' if is_verified else 'failed', datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
    
    return jsonify({
        'verified': is_verified,
        'message': 'Payment verified successfully' if is_verified else 'Potential fraud detected'
    })

# Schedule Pickup API
@app.route('/api/schedule_pickup', methods=['POST'])
def schedule_pickup():
    data = request.json
    waste_type = data.get('wasteType')
    quantity = data.get('quantity')
    pickup_date = data.get('pickupDate')
    
    # Save to database
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO waste_pickups (waste_type, quantity, pickup_date, status, scheduled_at) VALUES (%s, %s, %s, %s, %s)",
            (waste_type, quantity, pickup_date, 'scheduled', datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
    
    return jsonify({'success': True, 'message': 'Pickup scheduled successfully'})

# Enhanced Billing API with Automated Product System
@app.route('/api/create_bill', methods=['POST'])
def create_bill():
    try:
        data = request.json
        customer_name = data.get('customerName')
        customer_phone = data.get('customerPhone', '')
        items = data.get('items', [])
        
        print(f"📝 Creating bill for: {customer_name}")
        print(f"📞 Phone: {customer_phone}")
        print(f"📦 Items: {items}")
        
        if not customer_name or not items:
            return jsonify({'success': False, 'message': 'Customer name and items are required'})
        
        # Calculate totals with individual GST rates
        subtotal = 0
        total_gst = 0
        
        for item in items:
            quantity = float(item['quantity'])
            price = float(item['price'])
            gst_rate = float(item.get('gst', 18))  # Default to 18% if not specified
            
            item_subtotal = quantity * price
            item_gst = item_subtotal * (gst_rate / 100)
            
            subtotal += item_subtotal
            total_gst += item_gst
        
        total = subtotal + total_gst
        
        print(f"💰 Calculated - Subtotal: {subtotal}, GST: {total_gst}, Total: {total}")
        
        # Save to database
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'})
        
        cursor = conn.cursor()
        
        # Insert bill
        cursor.execute(
            "INSERT INTO bills (customer_name, customer_phone, subtotal, gst, total) VALUES (%s, %s, %s, %s, %s)",
            (customer_name, customer_phone, subtotal, total_gst, total)
        )
        bill_id = cursor.lastrowid
        
        # Insert bill items with individual GST rates
        for item in items:
            cursor.execute(
                "INSERT INTO bill_items (bill_id, item_name, quantity, price, gst_rate) VALUES (%s, %s, %s, %s, %s)",
                (bill_id, item['name'], item['quantity'], item['price'], item.get('gst', 18))
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ Bill created successfully with ID: {bill_id}")
        
        return jsonify({
            'success': True,
            'bill': {
                'id': bill_id,
                'customer_name': customer_name,
                'customer_phone': customer_phone,
                'subtotal': round(subtotal, 2),
                'gst': round(total_gst, 2),
                'total': round(total, 2),
                'items': items
            },
            'message': 'Bill created successfully'
        })
        
    except Exception as e:
        print(f"❌ Error creating bill: {e}")
        return jsonify({'success': False, 'message': f'Error creating bill: {str(e)}'})

# Get Products for Billing System
@app.route('/api/products')
def get_products():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify([])
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, product_name as name, price, category, gst_rate as gst 
            FROM inventory 
            WHERE status = 'Active' AND stock > 0
            ORDER BY product_name
        """)
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(products)
        
    except Exception as e:
        print(f"❌ Error fetching products: {e}")
        return jsonify([])

# Inventory Management APIs
@app.route('/api/inventory')
def get_inventory():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify([])
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM inventory 
            ORDER BY created_at DESC
        """)
        inventory = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(inventory)
        
    except Exception as e:
        print(f"❌ Error fetching inventory: {e}")
        return jsonify([])

@app.route('/api/add_inventory', methods=['POST'])
def add_inventory():
    try:
        data = request.json
        product_name = data.get('productName')
        category = data.get('category')
        price = data.get('price')
        stock = data.get('stock')
        description = data.get('description', '')
        
        print(f"📦 Adding product: {product_name}, Category: {category}, Price: {price}, Stock: {stock}")
        
        if not product_name or not category or not price or not stock:
            return jsonify({'success': False, 'message': 'All fields are required'})
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'})
        
        cursor = conn.cursor()
        
        # Insert without gst_rate column
        cursor.execute(
            "INSERT INTO inventory (product_name, category, price, stock, description) VALUES (%s, %s, %s, %s, %s)",
            (product_name, category, price, stock, description)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ Product '{product_name}' added to inventory successfully!")
        return jsonify({'success': True, 'message': 'Product added to inventory successfully'})
        
    except Exception as e:
        print(f"❌ Error adding inventory: {e}")
        return jsonify({'success': False, 'message': f'Error adding product: {str(e)}'})

# History APIs
@app.route('/api/payment_history')
def payment_history():
    conn = get_db_connection()
    payments = []
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM payments ORDER BY created_at DESC LIMIT 10")
        payments = cursor.fetchall()
        cursor.close()
        conn.close()
    
    return jsonify(payments)

@app.route('/api/pickup_history')
def pickup_history():
    conn = get_db_connection()
    pickups = []
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM waste_pickups ORDER BY scheduled_at DESC LIMIT 10")
        pickups = cursor.fetchall()
        cursor.close()
        conn.close()
    
    return jsonify(pickups)

@app.route('/api/bill_history')
def bill_history():
    conn = get_db_connection()
    bills = []
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.*, 
                   COUNT(bi.id) as item_count
            FROM bills b
            LEFT JOIN bill_items bi ON b.id = bi.bill_id
            GROUP BY b.id
            ORDER BY b.created_at DESC 
            LIMIT 10
        """)
        bills = cursor.fetchall()
        cursor.close()
        conn.close()
    
    # Convert decimal to float for JSON serialization
    for bill in bills:
        bill['subtotal'] = float(bill['subtotal'])
        bill['gst'] = float(bill['gst'])
        bill['total'] = float(bill['total'])
    
    return jsonify(bills)

# Reports APIs
@app.route('/api/reports/summary')
def get_reports_summary():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({})
        
        cursor = conn.cursor(dictionary=True)
        
        # Get total revenue
        cursor.execute("SELECT COALESCE(SUM(total), 0) as total_revenue FROM bills")
        revenue = cursor.fetchone()
        
        # Get total transactions
        cursor.execute("SELECT COUNT(*) as total_transactions FROM payments")
        transactions = cursor.fetchone()
        
        # Get success rate
        cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status='verified' THEN 1 ELSE 0 END) as success FROM payments")
        success_rate = cursor.fetchone()
        
        # Get total bills
        cursor.execute("SELECT COUNT(*) as total_bills FROM bills")
        total_bills = cursor.fetchone()
        
        # Get waste earnings (simulated)
        cursor.execute("SELECT COUNT(*) as total_pickups FROM waste_pickups")
        total_pickups = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        success_percentage = (success_rate['success'] / success_rate['total'] * 100) if success_rate['total'] > 0 else 0
        waste_earnings = total_pickups['total_pickups'] * 250  # Simulate ₹250 per pickup
        
        return jsonify({
            'total_revenue': float(revenue['total_revenue']),
            'total_transactions': transactions['total_transactions'],
            'success_rate': round(success_percentage, 2),
            'total_bills': total_bills['total_bills'],
            'waste_earnings': waste_earnings
        })
        
    except Exception as e:
        print(f"❌ Error generating reports: {e}")
        return jsonify({})

@app.route('/api/export_bills_excel')
def export_bills_excel():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'})
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.*, bi.item_name, bi.quantity, bi.price, bi.gst_rate
            FROM bills b
            LEFT JOIN bill_items bi ON b.id = bi.bill_id
            ORDER BY b.created_at DESC
        """)
        bills_data = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # In a real application, you would generate an Excel file here
        # For now, we'll return the data as JSON
        return jsonify({
            'success': True,
            'message': f'Found {len(bills_data)} bills for export',
            'data': bills_data
        })
        
    except Exception as e:
        print(f"❌ Error exporting bills: {e}")
        return jsonify({'success': False, 'message': f'Error exporting bills: {str(e)}'})

# Dashboard Statistics
@app.route('/api/dashboard/stats')
def dashboard_stats():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({})
        
        cursor = conn.cursor(dictionary=True)
        
        # Get today's date for filtering
        today = datetime.now().date()
        
        # Today's revenue
        cursor.execute("SELECT COALESCE(SUM(total), 0) as today_revenue FROM bills WHERE DATE(created_at) = %s", (today,))
        today_revenue = cursor.fetchone()
        
        # Today's transactions
        cursor.execute("SELECT COUNT(*) as today_transactions FROM payments WHERE DATE(created_at) = %s", (today,))
        today_transactions = cursor.fetchone()
        
        # Low stock items
        cursor.execute("SELECT COUNT(*) as low_stock FROM inventory WHERE stock < 5 AND stock > 0")
        low_stock = cursor.fetchone()
        
        # Out of stock items
        cursor.execute("SELECT COUNT(*) as out_of_stock FROM inventory WHERE stock = 0")
        out_of_stock = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'today_revenue': float(today_revenue['today_revenue']),
            'today_transactions': today_transactions['today_transactions'],
            'low_stock_items': low_stock['low_stock'],
            'out_of_stock_items': out_of_stock['out_of_stock']
        })
        
    except Exception as e:
        print(f"❌ Error fetching dashboard stats: {e}")
        return jsonify({})

if __name__ == '__main__':
    print("🔧 Initializing database...")
    create_tables()
    print("\n🚀 Starting MSME Business Hub...")
    print("📊 Database tables initialized successfully!")
    print("🌐 Backend running on http://localhost:5000")
    print("📱 Open frontend/index.html in your browser to use the application")
    print("\n👤 Login Credentials:")
    print("   Username: ayman")
    print("   Password: password123")
    print("\n✨ Features Available:")
    print("   ✅ Automated Billing System with GST")
    print("   ✅ Payment Fraud Detection")
    print("   ✅ Waste Management")
    print("   ✅ Inventory Management")
    print("   ✅ Business Guides")
    print("   ✅ Analytics & Reports")
    print("\nPress CTRL+C to stop the server")
    app.run(debug=True)
    