document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
    });

    const floatingCart = document.getElementById('floatingCart');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.querySelector('.cart-count');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    let cart = [];
    
    floatingCart.addEventListener('click', function() {
        cartModal.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeCart.addEventListener('click', function() {
        cartModal.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    overlay.addEventListener('click', function() {
        cartModal.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const menuCard = this.closest('.menu-card');
            const itemId = menuCard.dataset.item;
            const itemTitle = menuCard.querySelector('.card-title').textContent;
            const itemPrice = parseInt(menuCard.querySelector('.card-price').textContent.replace('₹', ''));
            const itemImage = menuCard.querySelector('.card-image img').src;
            
            const existingItem = cart.find(item => item.id === itemId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: itemId,
                    title: itemTitle,
                    price: itemPrice,
                    image: itemImage,
                    quantity: 1
                });
            }
            
            updateCart();
            
            cartCount.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        });
    });
    
    function updateCart() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">₹${item.price}</div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            <button class="remove-item" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
            
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemId = this.dataset.id;
                    const item = cart.find(item => item.id === itemId);
                    
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        updateCart();
                    }
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemId = this.dataset.id;
                    const item = cart.find(item => item.id === itemId);
                    
                    item.quantity += 1;
                    updateCart();
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemId = this.dataset.id;
                    cart = cart.filter(item => item.id !== itemId);
                    updateCart();
                });
            });
        }
        
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05;
        const total = subtotal + tax;
        
        subtotalElement.textContent = `₹${subtotal}`;
        taxElement.textContent = `₹${tax.toFixed(2)}`;
        totalElement.textContent = `₹${total.toFixed(2)}`;
    }
    
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            const menuCards = document.querySelectorAll('.menu-card');
            
            menuCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    window.addEventListener('scroll', function() {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});