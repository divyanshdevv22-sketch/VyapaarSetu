// Application State
class AppState {
    constructor() {
        this.currentUser = 'Ayman';
        this.currentScreen = 'dashboardScreen';
        this.inventory = JSON.parse(localStorage.getItem('inventory')) || this.getDefaultInventory();
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.pickups = JSON.parse(localStorage.getItem('pickups')) || [];
        this.bills = JSON.parse(localStorage.getItem('bills')) || [];
        this.chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

        // Sample data for schemes
        this.schemes = [
            {
                id: 1,
                title: "Pradhan Mantri MUDRA Yojana (PMMY)",
                description: "Loans up to ₹10 lakh for non-corporate, non-farm small/micro enterprises. Three categories: Shishu (up to ₹50,000), Kishor (₹50,001 to ₹5 lakh), and Tarun (₹5,00,001 to ₹10 lakh).",
                type: "loan",
                eligibility: "Micro and small enterprises",
                interest: "6.5% - 12%",
                deadline: "Ongoing"
            },
            {
                id: 2,
                title: "Credit Guarantee Fund Scheme (CGTMSE)",
                description: "Collateral-free credit up to ₹2 crore for new and existing micro and small enterprises. Covers term loans and working capital.",
                type: "loan",
                eligibility: "New and existing MSEs",
                interest: "8.5% - 11.5%",
                deadline: "Ongoing"
            },
            {
                id: 3,
                title: "Stand-Up India Scheme",
                description: "Bank loans between ₹10 lakh and ₹1 crore to at least one SC/ST borrower and one woman borrower per bank branch for setting up a greenfield enterprise.",
                type: "loan",
                eligibility: "SC/ST and women entrepreneurs",
                interest: "7.5% - 10%",
                deadline: "Ongoing"
            },
            {
                id: 4,
                title: "PSB Loans in 59 Minutes",
                description: "Online platform for quick loan approvals up to ₹5 crore for MSMEs. Integrates with credit bureaus and banks for faster processing.",
                type: "loan",
                eligibility: "All MSMEs",
                interest: "8.5% - 12%",
                deadline: "Ongoing"
            },
            {
                id: 5,
                title: "Technology Upgradation Fund",
                description: "Subsidy for technology upgradation in manufacturing units. Covers 25% of project cost up to ₹10 lakh.",
                type: "subsidy",
                eligibility: "Manufacturing MSMEs",
                amount: "Up to ₹10 lakh",
                deadline: "March 31, 2025"
            }
        ];

        // Sample products for billing
        this.products = [
            { id: 1, name: "Notebook", price: 50, category: "Stationery" },
            { id: 2, name: "Pen", price: 20, category: "Stationery" },
            { id: 3, name: "Paper", price: 30, category: "Stationery" },
            { id: 4, name: "Stapler", price: 150, category: "Office Supplies" },
            { id: 5, name: "Calculator", price: 500, category: "Electronics" },
            { id: 6, name: "Desk Organizer", price: 250, category: "Office Supplies" }
        ];
    }

    getDefaultInventory() {
        return [
            { id: 1, name: "Notebook", sku: "NB001", quantity: 50, price: 50, status: "in-stock" },
            { id: 2, name: "Pens", sku: "PEN001", quantity: 0, price: 20, status: "out-of-stock" },
            { id: 3, name: "Paper", sku: "PAP001", quantity: 12, price: 30, status: "low-stock" },
            { id: 4, name: "Stapler", sku: "STP001", quantity: 25, price: 150, status: "in-stock" },
            { id: 5, name: "Calculator", sku: "CAL001", quantity: 8, price: 500, status: "low-stock" }
        ];
    }

    saveToLocalStorage() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
        localStorage.setItem('pickups', JSON.stringify(this.pickups));
        localStorage.setItem('bills', JSON.stringify(this.bills));
        localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    }

    updateInventoryStatus() {
        this.inventory.forEach(item => {
            if (item.quantity === 0) {
                item.status = 'out-of-stock';
            } else if (item.quantity <= 10) {
                item.status = 'low-stock';
            } else {
                item.status = 'in-stock';
            }
        });
        this.saveToLocalStorage();
    }
}

// Main Application Class
class MSMEBusinessHub {
    constructor() {
        this.state = new AppState();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showLoadingScreen();
        this.initializeScreens();
        this.setupNavigation();
        this.updateDate();

        // Simulate loading
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showLoginScreen();
        }, 2000);
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('data-target');
                this.navigateTo(target);
            });
        });

        // Quick actions
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                const target = card.getAttribute('data-target');
                this.navigateTo(target);
            });
        });

        // Payment verification
        document.getElementById('verifyPayment').addEventListener('click', () => {
            this.verifyPayment();
        });

        // Waste management
        document.getElementById('schedulePickup').addEventListener('click', () => {
            this.schedulePickup();
        });

        // Billing
        document.getElementById('generateBill').addEventListener('click', () => {
            this.generateBill();
        });

        // Inventory management
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showAddProductForm();
        });

        document.getElementById('cancelAddProduct').addEventListener('click', () => {
            this.hideAddProductForm();
        });

        document.getElementById('saveProduct').addEventListener('click', () => {
            this.saveProduct();
        });

        // Chat functionality
        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Quick questions in chat
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-question')) {
                const question = e.target.closest('.quick-question').getAttribute('data-question');
                document.getElementById('chatInput').value = question;
                this.sendChatMessage();
            }
        });

        // Scheme filters
        document.getElementById('schemeFilter').addEventListener('change', () => {
            this.filterSchemes();
        });

        document.getElementById('schemeSearch').addEventListener('input', () => {
            this.filterSchemes();
        });

        // Product search in billing
        document.getElementById('productSearch').addEventListener('input', () => {
            this.filterProducts();
        });

        // Inventory search
        document.getElementById('inventorySearch').addEventListener('input', () => {
            this.filterInventory();
        });
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').classList.add('active');
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').classList.remove('active');
    }

    showLoginScreen() {
        document.getElementById('loginScreen').classList.add('active');
    }

    handleLogin() {
        // Simple login - in real app, you'd validate credentials
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainApp').classList.add('active');
        this.showToast('Login successful!', 'Welcome back to your business dashboard.', 'success');
        this.navigateTo('dashboardScreen');
    }

    navigateTo(screenId) {
        // Update current screen
        this.state.currentScreen = screenId;

        // Update active navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === screenId) {
                item.classList.add('active');
            }
        });

        // Update active screen
        document.querySelectorAll('.app-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        // Update screen title
        this.updateScreenTitle(screenId);

        // Load screen-specific data
        this.loadScreenData(screenId);
    }

    updateScreenTitle(screenId) {
        const titles = {
            'dashboardScreen': 'Dashboard Overview',
            'paymentsScreen': 'Payment Verification',
            'wasteScreen': 'Waste Management',
            'billingScreen': 'Digital Billing',
            'inventoryScreen': 'Inventory Management',
            'expertScreen': 'Expert Guidance',
            'loansScreen': 'Government Schemes',
            'assistantScreen': 'Business Assistant'
        };

        document.getElementById('screenTitle').textContent = titles[screenId] || 'MSME Business Hub';
    }

    loadScreenData(screenId) {
        switch (screenId) {
            case 'dashboardScreen':
                this.loadDashboardData();
                break;
            case 'paymentsScreen':
                this.loadPaymentsData();
                break;
            case 'wasteScreen':
                this.loadWasteData();
                break;
            case 'billingScreen':
                this.loadBillingData();
                break;
            case 'inventoryScreen':
                this.loadInventoryData();
                break;
            case 'loansScreen':
                this.loadSchemesData();
                break;
            case 'assistantScreen':
                this.loadChatData();
                break;
        }
    }

    initializeScreens() {
        this.state.updateInventoryStatus();
    }

    updateDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = `Today, ${now.toLocaleDateString('en-US', options)}`;

        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = dateString;
        }
    }

    // Dashboard Methods
    loadDashboardData() {
        // Update stats based on actual data
        const revenue = this.state.bills.reduce((sum, bill) => sum + bill.total, 0);
        const transactions = this.state.bills.length;
        const successRate = transactions > 0 ? Math.round((transactions / (transactions + 5)) * 100) : 94; // Sample calculation

        document.querySelector('.stat-card.revenue .stat-value').textContent = `¥${revenue.toLocaleString()}`;
        document.querySelector('.stat-card.transactions .stat-value').textContent = transactions;
        document.querySelector('.stat-card.success .stat-value').textContent = `${successRate}%`;
    }

    // Payment Verification Methods
    loadPaymentsData() {
        this.updateTransactionsList();
    }

    verifyPayment() {
        const transactionId = document.getElementById('transactionId').value;
        const amount = document.getElementById('transactionAmount').value;

        if (!transactionId || !amount) {
            this.showToast('Missing Information', 'Please enter both Transaction ID and Amount.', 'warning');
            return;
        }

        // Simulate verification
        const isVerified = Math.random() > 0.3; // 70% success rate
        const resultElement = document.getElementById('verificationResult');

        if (isVerified) {
            resultElement.innerHTML = `
                <div class="verification-success">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4>Payment Verified Successfully!</h4>
                    <p>Transaction ID: <strong>${transactionId}</strong></p>
                    <p>Amount: <strong>¥${parseFloat(amount).toLocaleString()}</strong></p>
                    <p>Status: <span class="status-verified">Verified</span></p>
                    <p class="verification-time">Verified at ${new Date().toLocaleTimeString()}</p>
                </div>
            `;

            // Add to transactions
            this.state.transactions.push({
                id: transactionId,
                amount: parseFloat(amount),
                status: 'verified',
                timestamp: new Date().toISOString()
            });
            this.state.saveToLocalStorage();

            this.showToast('Payment Verified', 'The transaction has been successfully verified.', 'success');
        } else {
            resultElement.innerHTML = `
                <div class="verification-failed">
                    <div class="failed-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h4>Payment Verification Failed</h4>
                    <p>Transaction ID: <strong>${transactionId}</strong></p>
                    <p>Amount: <strong>¥${parseFloat(amount).toLocaleString()}</strong></p>
                    <p>Status: <span class="status-failed">Not Verified</span></p>
                    <p class="verification-note">Please check the transaction details and try again.</p>
                </div>
            `;
            this.showToast('Verification Failed', 'Unable to verify the transaction.', 'error');
        }

        this.updateTransactionsList();
    }

    updateTransactionsList() {
        const container = document.querySelector('.transactions-list');
        const transactions = this.state.transactions.slice(-5).reverse(); // Show last 5 transactions

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No recent transactions</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item ${transaction.status}">
                <div class="transaction-icon">
                    <i class="fas fa-${transaction.status === 'verified' ? 'check-circle' : 'times-circle'}"></i>
                </div>
                <div class="transaction-details">
                    <p class="transaction-id">${transaction.id}</p>
                    <span class="transaction-time">${new Date(transaction.timestamp).toLocaleString()}</span>
                </div>
                <div class="transaction-amount">¥${transaction.amount.toLocaleString()}</div>
            </div>
        `).join('');
    }

    // Waste Management Methods
    loadWasteData() {
        this.updatePickupsList();
    }

    schedulePickup() {
        const wasteType = document.getElementById('wasteType').value;
        const quantity = document.getElementById('wasteQuantity').value;
        const dateTime = document.getElementById('pickupDateTime').value;
        const instructions = document.getElementById('pickupInstructions').value;

        if (!wasteType || !quantity || !dateTime) {
            this.showToast('Missing Information', 'Please fill in all required fields.', 'warning');
            return;
        }

        const pickup = {
            id: 'PICKUP_' + Date.now(),
            wasteType,
            quantity: parseInt(quantity),
            dateTime,
            instructions,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        this.state.pickups.push(pickup);
        this.state.saveToLocalStorage();

        // Clear form
        document.getElementById('wasteType').value = '';
        document.getElementById('wasteQuantity').value = '';
        document.getElementById('pickupDateTime').value = '';
        document.getElementById('pickupInstructions').value = '';

        this.showToast('Pickup Scheduled', 'Your waste pickup has been scheduled successfully.', 'success');
        this.updatePickupsList();
    }

    updatePickupsList() {
        const container = document.querySelector('.pickups-list');
        const pickups = this.state.pickups.slice(-5).reverse(); // Show last 5 pickups

        if (pickups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-recycle"></i>
                    <p>No scheduled pickups</p>
                    <p class="empty-state-subtitle">Schedule your first waste pickup above</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pickups.map(pickup => `
            <div class="pickup-item">
                <div class="pickup-icon">
                    <i class="fas fa-trash-alt"></i>
                </div>
                <div class="pickup-details">
                    <p class="pickup-type">${this.formatWasteType(pickup.wasteType)} - ${pickup.quantity}kg</p>
                    <span class="pickup-time">${new Date(pickup.dateTime).toLocaleString()}</span>
                    ${pickup.instructions ? `<p class="pickup-instructions">${pickup.instructions}</p>` : ''}
                </div>
                <div class="pickup-status ${pickup.status}">${pickup.status}</div>
            </div>
        `).join('');
    }

    formatWasteType(type) {
        const types = {
            'plastic': 'Plastic',
            'paper': 'Paper & Cardboard',
            'metal': 'Metal',
            'glass': 'Glass',
            'electronic': 'Electronic Waste'
        };
        return types[type] || type;
    }

    // Billing Methods
    loadBillingData() {
        this.renderProductsList();
        this.setupBillingCalculations();
    }

    renderProductsList() {
        const container = document.getElementById('productsList');
        container.innerHTML = this.state.products.map(product => `
            <div class="product-item" data-product-id="${product.id}">
                <div class="product-info">
                    <input type="checkbox" class="product-checkbox" data-price="${product.price}" data-name="${product.name}">
                    <div class="product-details">
                        <span class="product-name">${product.name}</span>
                        <span class="product-category">${product.category}</span>
                    </div>
                </div>
                <div class="product-price">¥${product.price}</div>
            </div>
        `).join('');

        // Add event listeners to checkboxes
        container.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.calculateBill();
            });
        });
    }

    setupBillingCalculations() {
        this.calculateBill();
    }

    calculateBill() {
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        let subtotal = 0;

        checkboxes.forEach(checkbox => {
            subtotal += parseFloat(checkbox.getAttribute('data-price'));
        });

        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        document.getElementById('subtotal').textContent = `¥${subtotal.toLocaleString()}`;
        document.getElementById('gstAmount').textContent = `¥${gst.toLocaleString()}`;
        document.getElementById('totalAmount').textContent = `¥${total.toLocaleString()}`;
    }

    filterProducts() {
        const searchTerm = document.getElementById('productSearch').value.toLowerCase();
        const productItems = document.querySelectorAll('.product-item');

        productItems.forEach(item => {
            const productName = item.querySelector('.product-name').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    generateBill() {
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerAddress = document.getElementById('customerAddress').value;

        if (!customerName || !customerPhone) {
            this.showToast('Missing Information', 'Please enter customer name and phone number.', 'warning');
            return;
        }

        const selectedProducts = Array.from(document.querySelectorAll('.product-checkbox:checked'))
            .map(checkbox => ({
                name: checkbox.getAttribute('data-name'),
                price: parseFloat(checkbox.getAttribute('data-price'))
            }));

        if (selectedProducts.length === 0) {
            this.showToast('No Products Selected', 'Please select at least one product.', 'warning');
            return;
        }

        const subtotal = selectedProducts.reduce((sum, product) => sum + product.price, 0);
        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        const bill = {
            id: 'BILL_' + Date.now(),
            customer: { name: customerName, phone: customerPhone, address: customerAddress },
            products: selectedProducts,
            subtotal,
            gst,
            total,
            date: new Date().toISOString()
        };

        this.state.bills.push(bill);
        this.state.saveToLocalStorage();

        // Show bill preview
        this.showBillPreview(bill);

        this.showToast('Bill Generated', 'Bill has been generated successfully.', 'success');
    }

    showBillPreview(bill) {
        const preview = `
            <div class="bill-preview">
                <h3>Bill Generated Successfully!</h3>
                <div class="bill-details">
                    <p><strong>Bill ID:</strong> ${bill.id}</p>
                    <p><strong>Customer:</strong> ${bill.customer.name}</p>
                    <p><strong>Date:</strong> ${new Date(bill.date).toLocaleString()}</p>
                    <p><strong>Total Amount:</strong> ¥${bill.total.toLocaleString()}</p>
                </div>
                <button class="btn-primary" onclick="this.closest('.bill-preview').remove()">
                    <i class="fas fa-times"></i>
                    Close
                </button>
            </div>
        `;

        const resultsElement = document.getElementById('verificationResult');
        resultsElement.innerHTML = preview;
    }

    // Inventory Management Methods
    loadInventoryData() {
        this.renderInventoryTable();
        this.updateInventoryStats();
    }

    showAddProductForm() {
        document.getElementById('addProductForm').style.display = 'block';
        document.getElementById('addProductBtn').style.display = 'none';
    }

    hideAddProductForm() {
        document.getElementById('addProductForm').style.display = 'none';
        document.getElementById('addProductBtn').style.display = 'flex';
        this.clearAddProductForm();
    }

    clearAddProductForm() {
        document.getElementById('productName').value = '';
        document.getElementById('productSKU').value = '';
        document.getElementById('productQuantity').value = '';
        document.getElementById('productPrice').value = '';
    }

    saveProduct() {
        const name = document.getElementById('productName').value;
        const sku = document.getElementById('productSKU').value;
        const quantity = parseInt(document.getElementById('productQuantity').value);
        const price = parseFloat(document.getElementById('productPrice').value);

        if (!name || !sku || isNaN(quantity) || isNaN(price)) {
            this.showToast('Missing Information', 'Please fill in all fields with valid values.', 'warning');
            return;
        }

        const newProduct = {
            id: Date.now(),
            name,
            sku,
            quantity,
            price,
            status: quantity === 0 ? 'out-of-stock' : quantity <= 10 ? 'low-stock' : 'in-stock'
        };

        this.state.inventory.push(newProduct);
        this.state.saveToLocalStorage();
        this.state.updateInventoryStatus();

        this.hideAddProductForm();
        this.renderInventoryTable();
        this.updateInventoryStats();
        this.showToast('Product Added', 'New product has been added to inventory.', 'success');
    }

    renderInventoryTable() {
        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = this.state.inventory.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.sku}</td>
                <td>${item.quantity}</td>
                <td>¥${item.price}</td>
                <td><span class="stock-badge ${item.status}">${this.formatStockStatus(item.status)}</span></td>
                <td>
                    <button class="btn-action edit" onclick="app.editProduct(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="app.deleteProduct(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatStockStatus(status) {
        const statusMap = {
            'in-stock': 'In Stock',
            'low-stock': 'Low Stock',
            'out-of-stock': 'Out of Stock'
        };
        return statusMap[status] || status;
    }

    updateInventoryStats() {
        const total = this.state.inventory.length;
        const inStock = this.state.inventory.filter(item => item.status === 'in-stock').length;
        const lowStock = this.state.inventory.filter(item => item.status === 'low-stock').length;
        const outOfStock = this.state.inventory.filter(item => item.status === 'out-of-stock').length;

        document.querySelectorAll('.inventory-stat .stat-value').forEach((element, index) => {
            const values = [total, inStock, lowStock, outOfStock];
            element.textContent = values[index];
        });
    }

    filterInventory() {
        const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
        const rows = document.querySelectorAll('#inventoryTableBody tr');

        rows.forEach(row => {
            const productName = row.cells[0].textContent.toLowerCase();
            const sku = row.cells[1].textContent.toLowerCase();

            if (productName.includes(searchTerm) || sku.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    editProduct(productId) {
        const product = this.state.inventory.find(item => item.id === productId);
        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productSKU').value = product.sku;
            document.getElementById('productQuantity').value = product.quantity;
            document.getElementById('productPrice').value = product.price;

            this.showAddProductForm();

            // Remove the old product
            this.state.inventory = this.state.inventory.filter(item => item.id !== productId);
        }
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.state.inventory = this.state.inventory.filter(item => item.id !== productId);
            this.state.saveToLocalStorage();
            this.renderInventoryTable();
            this.updateInventoryStats();
            this.showToast('Product Deleted', 'Product has been removed from inventory.', 'success');
        }
    }

    // Schemes Methods
    loadSchemesData() {
        this.renderSchemes();
    }

    renderSchemes() {
        const container = document.getElementById('schemesGrid');
        container.innerHTML = this.state.schemes.map(scheme => `
            <div class="scheme-card" data-scheme-type="${scheme.type}">
                <h3>${scheme.title}</h3>
                <p>${scheme.description}</p>
                <div class="scheme-details">
                    <span><i class="fas fa-user-check"></i> ${scheme.eligibility}</span>
                    <span><i class="fas fa-percentage"></i> ${scheme.interest}</span>
                    ${scheme.deadline ? `<span><i class="fas fa-clock"></i> ${scheme.deadline}</span>` : ''}
                </div>
                <div class="scheme-actions">
                    <button class="btn-outline" onclick="app.viewSchemeDetails(${scheme.id})">
                        <i class="fas fa-info-circle"></i>
                        Details
                    </button>
                    <button class="btn-primary" onclick="app.applyForScheme(${scheme.id})">
                        <i class="fas fa-arrow-right"></i>
                        Apply Now
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterSchemes() {
        const filterValue = document.getElementById('schemeFilter').value;
        const searchTerm = document.getElementById('schemeSearch').value.toLowerCase();
        const schemeCards = document.querySelectorAll('.scheme-card');

        schemeCards.forEach(card => {
            const schemeType = card.getAttribute('data-scheme-type');
            const schemeTitle = card.querySelector('h3').textContent.toLowerCase();
            const schemeDescription = card.querySelector('p').textContent.toLowerCase();

            const matchesFilter = filterValue === 'all' || schemeType === filterValue;
            const matchesSearch = schemeTitle.includes(searchTerm) || schemeDescription.includes(searchTerm);

            if (matchesFilter && matchesSearch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    viewSchemeDetails(schemeId) {
        const scheme = this.state.schemes.find(s => s.id === schemeId);
        if (scheme) {
            alert(`Scheme Details:\n\n${scheme.title}\n\n${scheme.description}\n\nEligibility: ${scheme.eligibility}\nInterest Rate: ${scheme.interest}\nDeadline: ${scheme.deadline}`);
        }
    }

    applyForScheme(schemeId) {
        const scheme = this.state.schemes.find(s => s.id === schemeId);
        if (scheme) {
            this.showToast('Application Started', `Application for ${scheme.title} has been initiated.`, 'success');
            // In a real app, this would redirect to the application form
            setTimeout(() => {
                alert(`Redirecting to ${scheme.title} application form...\n\nThis would typically take you to the official application portal.`);
            }, 1000);
        }
    }

    // Chat Methods
    loadChatData() {
        this.renderChatHistory();
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addChatMessage(message, 'user');
        input.value = '';

        // Simulate bot response
        setTimeout(() => {
            const response = this.generateBotResponse(message);
            this.addChatMessage(response, 'bot');
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }

    addChatMessage(message, sender) {
        const chatContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const avatarClass = sender === 'user' ? 'user-avatar' : 'bot-avatar';

        messageDiv.innerHTML = `
            <div class="message-avatar ${avatarClass}">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <p>${this.formatMessage(message)}</p>
            </div>
        `;

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Save to history
        this.state.chatHistory.push({ sender, message, timestamp: new Date().toISOString() });
        this.state.saveToLocalStorage();
    }

    formatMessage(message) {
        // Convert URLs to links
        message = message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

        // Convert line breaks
        message = message.replace(/\n/g, '<br>');

        return message;
    }

    generateBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // GST related queries
        if (lowerMessage.includes('gst') || lowerMessage.includes('tax') || lowerMessage.includes('filing')) {
            return `For GST filing, you'll need:\n\n• Business PAN card\n• Bank account details\n• Sales and purchase invoices\n• HSN/SAC codes\n\nI can help you with:\n• GST registration\n• Return filing\n• Payment process\n• Compliance requirements\n\nWould you like me to guide you through any specific aspect?`;
        }

        // Loan related queries
        if (lowerMessage.includes('loan') || lowerMessage.includes('funding') || lowerMessage.includes('finance')) {
            return `I can help you with various business loans and government schemes:\n\n• MUDRA Loans (up to ₹10 lakh)\n• CGTMSE (collateral-free loans)\n• Stand-Up India Scheme\n• PSB Loans in 59 Minutes\n\nThese schemes offer competitive interest rates and flexible repayment options. Would you like to explore any specific loan program?`;
        }

        // Compliance related queries
        if (lowerMessage.includes('compliance') || lowerMessage.includes('legal') || lowerMessage.includes('regulation')) {
            return `Business compliance includes:\n\n• GST filing and returns\n• Income tax compliance\n• MSME registration\n• Shop and establishment license\n• Labor law compliance\n\nI can provide checklists and connect you with legal experts for specific compliance requirements. What type of compliance are you concerned about?`;
        }

        // Marketing related queries
        if (lowerMessage.includes('marketing') || lowerMessage.includes('sales') || lowerMessage.includes('customer')) {
            return `For business marketing, consider:\n\n• Digital marketing strategies\n• Social media presence\n• Customer acquisition\n• Brand building\n• Sales techniques\n\nI can provide marketing guides and connect you with marketing experts. Are you looking for online or offline marketing strategies?`;
        }

        // Inventory related queries
        if (lowerMessage.includes('inventory') || lowerMessage.includes('stock') || lowerMessage.includes('product')) {
            return `I see you're asking about inventory management. You can:\n\n• View current stock levels\n• Add new products\n• Track low stock items\n• Manage product categories\n\nWould you like me to show you your current inventory status or help with inventory management?`;
        }

        // Default response
        const defaultResponses = [
            "I understand you're asking about business-related topics. I specialize in GST, loans, compliance, and marketing for MSMEs. How can I assist you specifically?",
            "That's an interesting question about business operations. I can help you with various aspects of running and growing your business. Could you provide more details?",
            "I'd be happy to help with your business query! I have expertise in government schemes, compliance, inventory management, and more. What specific area would you like to discuss?",
            "Thank you for your question. As your business assistant, I can provide guidance on multiple business aspects. Let me know what you'd like to focus on today."
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    renderChatHistory() {
        const container = document.getElementById('chatMessages');
        // Only show initial message for now
        // In a real app, you'd load the actual chat history
    }

    // Utility Methods
    showToast(title, message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
                // Register Service Worker
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function () {
                        navigator.serviceWorker.register('/sw.js')
                            .then(function (registration) {
                                console.log('ServiceWorker registration successful');
                            })
                            .catch(function (err) {
                                console.log('ServiceWorker registration failed: ', err);
                            });
                    });
                }

                // Install prompt
                let deferredPrompt;
                window.addEventListener('beforeinstallprompt', (e) => {
                    deferredPrompt = e;
                    // Show install button
                    showInstallPromotion();
                });

                function showInstallPromotion() {
                    // You can show a custom install button here
                    console.log('App can be installed');
                }

                async function installApp() {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        if (outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        }
                        deferredPrompt = null;
                    }
                }
            }
        }, 5000);
    }
}

// Initialize the application when the DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MSMEBusinessHub();
});

// Make app globally available for onclick handlers
window.app = app;
