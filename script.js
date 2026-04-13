// ========== PRODUCT DATA (Dynamic - Add any dish here and AI understands it!) ==========
const products = [
  {
    id: 1,
    name: "Classic Beef Burger",
    category: "Burgers",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    description:
      "Juicy beef patty with fresh lettuce, tomato, and our secret sauce",
    tags: ["beef", "burger", "popular"],
  },
  {
    id: 2,
    name: "Chocolate Lava Cake",
    category: "Desserts",
    price: 6.99,
    image:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop",
    description:
      "Warm chocolate cake with melting chocolate center, served with vanilla ice cream",
    tags: ["chocolate", "dessert", "sweet", "popular"],
  },
  {
    id: 3,
    name: "Belgian Chocolate Milkshake",
    category: "Beverages",
    price: 5.99,
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
    description: "Rich and creamy milkshake made with real Belgian chocolate",
    tags: ["chocolate", "drink", "cold"],
  },
  {
    id: 4,
    name: "Double Cheese Pizza",
    category: "Pizza",
    price: 18.99,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    description: "Loaded with mozzarella, cheddar, and parmesan cheese",
    tags: ["pizza", "cheese", "vegetarian"],
  },
  {
    id: 5,
    name: "Chocolate Chip Cookie",
    category: "Desserts",
    price: 3.99,
    image:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
    description: "Fresh baked, soft and chewy with dark chocolate chips",
    tags: ["chocolate", "cookie", "dessert"],
  },
  {
    id: 6,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 14.99,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
    description:
      "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
    tags: ["pizza", "vegetarian", "italian"],
  },
  {
    id: 7,
    name: "Spicy Chicken Wings",
    category: "Appetizers",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
    description: "Crispy chicken wings tossed in spicy buffalo sauce",
    tags: ["chicken", "spicy", "popular"],
  },
  {
    id: 8,
    name: "Dark Chocolate Brownie",
    category: "Desserts",
    price: 4.99,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
    description: "Fudgy brownie with dark chocolate chunks and walnuts",
    tags: ["chocolate", "brownie", "dessert"],
  },
  {
    id: 9,
    name: "Burger King",
    category: "Premium Choice",
    price: 15.99,
    image:
      "https://assets.bonappetit.com/photos/5b919cb83d923e31d08fed17/4:3/w_2666,h_2000,c_limit/basically-burger-1.jpg",
    description: "Burger with cheese and spicy",
    tags: ["burger", "cheese", "popular"],
  },
];

let cart = [];

const GEMINI_API_KEY = "AIzaSyBhDRgo06KKHOMUpzf38MMlrkD_u9Y3F4A";
const USE_GEN_AI = true;

function loadCartFromStorage() {
  const stored = localStorage.getItem("hungerNeedsCart");
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch (e) {
      cart = [];
    }
  }
}

function saveCartToStorage() {
  localStorage.setItem("hungerNeedsCart", JSON.stringify(cart));
}

function addToCart(product, quantity = 1) {
  const existingIndex = cart.findIndex((item) => item.id === product.id);
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ ...product, quantity: quantity });
  }
  saveCartToStorage();
  renderCartUI();
  updateCartBadge();
  showToast(`Added ${product.name} to cart 🛒`);
}

function updateCartItemQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    cart = cart.filter((item) => item.id !== productId);
  } else {
    const item = cart.find((item) => item.id === productId);
    if (item) item.quantity = newQuantity;
  }
  saveCartToStorage();
  renderCartUI();
  updateCartBadge();
}

function removeCartItem(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCartToStorage();
  renderCartUI();
  updateCartBadge();
  showToast("Item removed from cart");
}

function clearCart() {
  if (cart.length === 0) {
    showToast("Cart already empty");
    return;
  }
  cart = [];
  saveCartToStorage();
  renderCartUI();
  updateCartBadge();
  showToast("Cart cleared successfully");
}

let toastTimeout = null;
function showToast(message) {
  const toastEl = document.getElementById("toastMsg");
  const toastTextSpan = document.getElementById("toastText");
  toastTextSpan.innerText = message;
  toastEl.classList.add("show");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2000);
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badgeSpan = document.getElementById("cartCountBadge");
  if (badgeSpan) badgeSpan.innerText = totalItems;
}

function renderCartUI() {
  const cartContainer = document.getElementById("cartItemsList");
  const totalSpan = document.getElementById("cartTotalPrice");
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `<div class="text-center text-muted py-4"><i class="bi bi-emoji-smile fs-2"></i><p class="mt-2">Your cart is empty ✨</p></div>`;
    totalSpan.innerText = "$0.00";
    return;
  }

  let total = 0;
  let html = "";
  for (let item of cart) {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `
        <div class="cart-item d-flex gap-3 align-items-center">
          <img src="${item.image}" class="cart-img-sm" alt="${item.name}" onerror="this.src='https://via.placeholder.com/55'">
          <div class="flex-grow-1">
            <div class="fw-semibold">${escapeHtml(item.name)}</div>
            <div class="small text-muted">$${item.price.toFixed(2)}</div>
            <div class="d-flex align-items-center mt-1">
              <button class="quantity-btn dec-qty" data-id="${item.id}">−</button>
              <span class="mx-2 fw-medium" style="min-width: 28px; text-align:center;">${item.quantity}</span>
              <button class="quantity-btn inc-qty" data-id="${item.id}">+</button>
              <button class="btn btn-link text-danger p-0 ms-2 small" data-remove="${item.id}" style="font-size: 0.8rem;">Remove</button>
            </div>
          </div>
          <div class="fw-bold">$${itemTotal.toFixed(2)}</div>
        </div>
      `;
  }
  cartContainer.innerHTML = html;
  totalSpan.innerText = `$${total.toFixed(2)}`;

  document.querySelectorAll(".dec-qty").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.getAttribute("data-id"));
      const item = cart.find((i) => i.id === id);
      if (item && item.quantity > 1) {
        updateCartItemQuantity(id, item.quantity - 1);
      } else if (item && item.quantity === 1) {
        updateCartItemQuantity(id, 0);
      }
    });
  });
  document.querySelectorAll(".inc-qty").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.getAttribute("data-id"));
      const item = cart.find((i) => i.id === id);
      if (item) {
        updateCartItemQuantity(id, item.quantity + 1);
      }
    });
  });
  document.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(btn.getAttribute("data-remove"));
      removeCartItem(id);
    });
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;
  let productsHtml = "";
  products.forEach((product) => {
    productsHtml += `
        <div class="col-md-6 col-lg-6">
          <div class="card h-100 shadow-sm">
            <img src="${product.image}" class="product-img card-img-top" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Food+Image'">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title fw-bold">${escapeHtml(product.name)}</h5>
                <span class="badge bg-light text-dark rounded-pill">${product.category}</span>
              </div>
              <p class="card-text text-muted small mt-1">${product.description}</p>
              <div class="mt-auto d-flex justify-content-between align-items-center pt-2">
                <span class="price">$${product.price.toFixed(2)}</span>
                <button class="btn btn-danger rounded-pill px-4 add-to-cart-btn" data-id="${product.id}">
                  <i class="bi bi-cart-plus"></i> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
  });
  container.innerHTML = productsHtml;

  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = parseInt(btn.getAttribute("data-id"));
      const product = products.find((p) => p.id === productId);
      if (product) {
        addToCart(product, 1);
      }
    });
  });
}

function handleCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty. Add some items first!");
    return;
  }
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
    .toFixed(2);
  alert(
    `✨ Order placed successfully! ✨\nItems: ${totalItems}\nTotal: $${totalPrice}\nThank you for shopping at HungerNeeds.`,
  );
  cart = [];
  saveCartToStorage();
  renderCartUI();
  updateCartBadge();
  showToast("Order confirmed! Cart cleared.");
}

// ========== GEN AI CHATBOT (Using Gemini API) ==========

function getMenuContext() {
  return products
    .map((p) => `- ${p.name}: $${p.price} - ${p.description} [${p.category}]`)
    .join("\n");
}

async function callGeminiAPI(userMessage, conversationHistory) {

  if (
    !GEMINI_API_KEY ||
    GEMINI_API_KEY === ""
  ) {
    console.log(
      "Maybe API is not working properly",
    );
    return null;
  }

  const menuContext = getMenuContext();
  const cartContext =
    cart.length > 0
      ? `Cart has ${cart.reduce((sum, i) => sum + i.quantity, 0)} item(s) totaling $${cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}`
      : "Cart is empty";

  const systemPrompt = `You are "HungryBot", an AI food ordering assistant for HungerNeeds restaurant.
    
    MENU:
    ${menuContext}
    
    ${cartContext}
    
    RULES:
    1. Be friendly, enthusiastic about food, and helpful
    2. Only recommend items from the menu above
    3. Keep responses concise (2-3 sentences max)
    4. Encourage users to click "Add" button on product cards to order
    5. If user asks for chocolate, recommend Chocolate Lava Cake, Belgian Chocolate Milkshake, Chocolate Chip Cookie, Dark Chocolate Brownie
    
    Respond naturally as a food assistant:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt + '\n\nUser asked: "' + userMessage + '"',
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
            topP: 0.9,
            topK: 40,
          },
        }),
      },
    );

    const data = await response.json();
    console.log("Gemini API Response:", data);

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      return data.candidates[0].content.parts[0].text;
    }

    
    if (data.error) {
      console.error("API Error:", data.error);
      console.log("Using fallback response due to API error");
      return null;
    }

    console.log("No valid response from API, using fallback");
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

function getMenuContext() {
  return products
    .map((p) => `- ${p.name}: $${p.price} - ${p.description} [${p.category}]`)
    .join("\n");
}


function getFallbackResponse(userMessage) {
  const msg = userMessage.toLowerCase();


  for (let product of products) {
    if (msg.includes(product.name.toLowerCase())) {
      return `🍽️ **${product.name}** - $${product.price}\n\n📝 ${product.description}\n\n💡 Want to order this? Click the "Add" button on the product card!\n\nWould you like to see similar items? 🛒`;
    }
  }


  if (
    msg.includes("chocolate") ||
    msg.includes("sweet") ||
    msg.includes("dessert") ||
    msg.includes("cake")
  ) {
    const chocolateItems = products.filter(
      (p) =>
        p.name.toLowerCase().includes("chocolate") ||
        p.name.toLowerCase().includes("cake") ||
        p.name.toLowerCase().includes("cookie") ||
        p.name.toLowerCase().includes("brownie"),
    );

    if (chocolateItems.length > 0) {
      let response = `🍫 **I found ${chocolateItems.length} delicious chocolate items for you!**\n\n`;
      chocolateItems.forEach((item) => {
        response += `• **${item.name}** - $${item.price}\n  ${item.description}\n\n`;
      });
      response += `Which one looks tempting? 😋`;
      return response;
    }
  }

 
  if (
    msg.includes("menu") ||
    msg.includes("what do you have") ||
    msg.includes("show me")
  ) {
    let response = `📋 **Our Complete Menu**\n\n`;
    const categories = [...new Set(products.map((p) => p.category))];
    categories.forEach((cat) => {
      response += `**${cat}:**\n`;
      products
        .filter((p) => p.category === cat)
        .forEach((p) => {
          response += `• ${p.name} - $${p.price}\n`;
        });
      response += `\n`;
    });
    response += `What catches your eye? 🍽️`;
    return response;
  }

 
  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("how much")
  ) {
    for (let product of products) {
      if (msg.includes(product.name.toLowerCase())) {
        return `💰 **${product.name}** costs $${product.price}\n\n${product.description}\n\nWant to add it to your cart?`;
      }
    }
    return `💰 **Price List:**\n${products.map((p) => `• ${p.name}: $${p.price}`).join("\n")}\n\nWhich item interests you?`;
  }


  if (
    msg.includes("popular") ||
    msg.includes("best") ||
    msg.includes("recommend")
  ) {
    const popular = products.filter(
      (p) => p.tags?.includes("popular") || p.price > 15,
    );
    let response = `🔥 **Popular Items:**\n\n`;
    popular.slice(0, 4).forEach((p) => {
      response += `• **${p.name}** - $${p.price}\n  ${p.description}\n\n`;
    });
    return response;
  }

  
  if (msg.includes("cart")) {
    if (cart.length > 0) {
      return `🛒 **Your Cart:** ${cart.reduce((s, i) => s + i.quantity, 0)} item(s)\n💰 Total: $${cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}\n\nClick "Proceed to Order" to checkout!`;
    } else {
      return `🛒 Your cart is empty. Browse our menu and add some delicious items! 🍔🍕🍰`;
    }
  }

  
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return `👋 Hello! Welcome to **HungerNeeds AI Assistant**!\n\nI can help you with:\n• Finding dishes (try "chocolate")\n• Menu exploration ("show me menu")\n• Price checks ("price of pizza")\n\nWhat would you like today? 🍽️`;
  }

 
  if (
    msg.includes("chocolate") ||
    msg.includes("sweet") ||
    msg.includes("dessert")
  ) {
    const chocolateItems = products.filter(
      (p) =>
        p.name.toLowerCase().includes("chocolate") ||
        p.tags?.includes("chocolate") ||
        p.tags?.includes("dessert"),
    );
    if (chocolateItems.length > 0) {
      let response = "🍫 **Our Sweet Treats:**\n\n";
      chocolateItems.forEach((item) => {
        response += `• ${item.name} - $${item.price}\n`;
      });
      response += "\nThese are perfect for your sweet tooth! 🍰";
      return response;
    }
  }

  if (msg.includes("menu") || msg.includes("what do you have")) {
    let response = "📋 **Our Delicious Menu:**\n\n";
    products.forEach((p) => {
      response += `• **${p.name}** - $${p.price} (${p.category})\n`;
    });
    response += "\nWhat looks good to you? 😋";
    return response;
  }

  if (
    msg.includes("popular") ||
    msg.includes("best") ||
    msg.includes("recommend")
  ) {
    const popular = products.filter((p) => p.tags?.includes("popular"));
    let response = "🔥 **Customer Favorites:**\n\n";
    (popular.length ? popular : products.slice(0, 3)).forEach((p) => {
      response += `• ${p.name} - $${p.price}\n   ${p.description}\n\n`;
    });
    response += "These are flying off the shelves! 🚀";
    return response;
  }

  if (msg.includes("vegetarian") || msg.includes("veg")) {
    const vegItems = products.filter(
      (p) =>
        p.tags?.includes("vegetarian") ||
        (p.category === "Pizza" && p.name !== "Pepperoni Pizza"),
    );
    let response = "🥗 **Vegetarian Options:**\n\n";
    vegItems.forEach((p) => {
      response += `• ${p.name} - $${p.price}\n`;
    });
    response += "\nAll made with fresh ingredients! 🌱";
    return response;
  }

  if (msg.includes("price") || msg.includes("cost")) {
    for (let product of products) {
      if (msg.includes(product.name.toLowerCase())) {
        return `💰 **${product.name}** costs $${product.price}\n\n${product.description}`;
      }
    }
    const prices = products.map((p) => `${p.name}: $${p.price}`).join("\n• ");
    return `💰 **Price List:**\n• ${prices}\n\nWhich one interests you?`;
  }

  if (msg.includes("delivery") || msg.includes("shipping")) {
    return "⏱️ **Delivery Info:**\n• 30-45 minutes delivery\n• Free shipping over $50\n• Track your order live!\n\nReady to order? 🚚";
  }

  if (msg.includes("cart")) {
    if (cart.length > 0) {
      return `🛒 You have ${cart.reduce((s, i) => s + i.quantity, 0)} item(s) totaling $${cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}\n\nClick "Proceed to Order" when you're ready!`;
    } else {
      return "🛒 Your cart is empty. Browse our menu and add some delicious items! 🍔🍕";
    }
  }

  if (msg.includes("help")) {
    return "🤖 **I can help you with:**\n\n• 'menu' - See all items\n• 'popular' - Best sellers\n• 'chocolate' - Sweet treats\n• 'vegetarian' - Veg options\n• 'price of [item]' - Check price\n• 'delivery' - Delivery info\n• 'cart' - Your cart\n\nWhat would you like? 🍽️";
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "👋 Hey there! Welcome to HungerNeeds! I'm your AI food assistant. Hungry? Let me help you find something delicious! 🍔🍕🍰";
  }

  if (msg.includes("thank")) {
    return "😊 You're very welcome! Enjoy your meal! Come back anytime you're hungry! 🍽️";
  }


  if (msg.includes("spicy")) {
    return "🌶️ Looking for spicy? Try our **Spicy Chicken Wings**! They're a customer favorite with just the right kick! 🔥";
  }

  if (msg.includes("cheese")) {
    return "🧀 Cheese lover? Our **Double Cheese Pizza** is loaded with mozzarella, cheddar, and parmesan! Also try our **Classic Beef Burger** with extra cheese! 🍔";
  }

  // Default intelligent response
  const randomRecommendation =
    products[Math.floor(Math.random() * products.length)];
  return `😋 I'm here to help! You can ask me about our menu, prices, or get recommendations.\n\n💡 Try asking:\n• "Show me the menu"\n• "What's popular?"\n• "Tell me about ${randomRecommendation.name}"\n• "Do you have chocolate items?"\n\nWhat sounds good to you today? 🍽️`;
}


class GenAIChatbot {
  constructor() {
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createChatbotHTML();

    this.chatbotWindow = document.getElementById("chatbotWindow");
    this.toggleBtn = document.getElementById("chatbotToggleBtn");
    this.closeBtn = document.getElementById("closeChatBtn");
    this.sendBtn = document.getElementById("sendMessageBtn");
    this.userInput = document.getElementById("userInput");
    this.chatMessages = document.getElementById("chatMessages");

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", () => this.toggleChat());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.closeChat());
    }
    if (this.sendBtn) {
      this.sendBtn.addEventListener("click", () => this.sendMessage());
    }
    if (this.userInput) {
      this.userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.sendMessage();
      });
    }

    // Welcome message with AI badge
    setTimeout(() => {
      this.addBotMessage(
        '🍔 **Hi! I\'m your AI-powered assistant!** \n\nI can help you with:\n• Menu recommendations\n• Price checks\n• Finding specific dishes (like chocolate!)\n• Order help\n\n**Try asking me:**\n"What chocolate items do you have?"\n"Show me popular dishes"\n"Tell me about Chocolate Lava Cake"\n\nWhat are you craving today? 🤖',
        true,
      );
    }, 500);
  }

  createChatbotHTML() {
    const chatbotHTML = `
        <div id="chatbotWindow" class="chatbot-window">
          <div class="chatbot-header">
            <h3>
              <i class="bi bi-robot"></i> 
              AI Food Assistant
              <span class="ai-badge">Powered by Gemini AI</span>
            </h3>
            <button id="closeChatBtn" class="close-chat">×</button>
          </div>
          <div id="chatMessages" class="chat-messages"></div>
          <div class="suggestion-chips">
            <button class="suggestion-chip" data-suggestion="Show me the menu">📋 Menu</button>
            <button class="suggestion-chip" data-suggestion="What chocolate items do you have?">🍫 Chocolate</button>
            <button class="suggestion-chip" data-suggestion="What's popular?">🔥 Popular</button>
            <button class="suggestion-chip" data-suggestion="Vegetarian options">🥗 Veg</button>
            <button class="suggestion-chip" data-suggestion="I want something sweet">🍰 Sweet</button>
          </div>
          <div class="chat-input-area">
            <input type="text" id="userInput" placeholder="Ask me anything... (e.g., 'Got any chocolate?')">
            <button id="sendMessageBtn">Send</button>
          </div>
        </div>
      `;

    document.body.insertAdjacentHTML("beforeend", chatbotHTML);

    setTimeout(() => {
      document.querySelectorAll(".suggestion-chip").forEach((chip) => {
        chip.addEventListener("click", (e) => {
          const suggestion = chip.getAttribute("data-suggestion");
          if (suggestion && this.userInput) {
            this.userInput.value = suggestion;
            this.sendMessage();
          }
        });
      });
    }, 100);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.chatbotWindow.classList.add("open");
      if (this.userInput) this.userInput.focus();
    } else {
      this.chatbotWindow.classList.remove("open");
    }
  }

  closeChat() {
    this.isOpen = false;
    this.chatbotWindow.classList.remove("open");
  }

  addBotMessage(text, isGenAI = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot";
    messageDiv.innerHTML = `<div class="message-content">${this.formatMessage(text)}${isGenAI ? '<br><span style="font-size: 10px; opacity: 0.6;">🤖 AI-generated</span>' : ""}</div>`;
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addUserMessage(text) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user";
    messageDiv.innerHTML = `<div class="message-content">${this.escapeHtml(text)}</div>`;
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot";
    typingDiv.id = "typingIndicator";
    typingDiv.innerHTML = `
        <div class="message-content ai-thinking">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <span style="font-size: 10px; margin-left: 10px;">AI thinking...</span>
        </div>
      `;
    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) indicator.remove();
  }

  async sendMessage() {
    const message = this.userInput.value.trim();
    if (!message) return;

    this.addUserMessage(message);
    this.userInput.value = "";
    this.showTypingIndicator();

    // Try Gen AI first (if API key provided)
    let response = null;
    if (GEMINI_API_KEY && USE_GEN_AI) {
      response = await callGeminiAPI(message, []);
    }

    // Fallback to smart fallback responses
    if (!response) {
      response = getFallbackResponse(message);
    }

    this.hideTypingIndicator();
    this.addBotMessage(response, !!response && GEMINI_API_KEY && USE_GEN_AI);
  }

  formatMessage(text) {
    let formatted = this.escapeHtml(text);
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\n/g, "<br>");
    formatted = formatted.replace(/•/g, "•");
    return formatted;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom() {
    if (this.chatMessages) {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }
}

// ========== INITIALIZATION ==========
function init() {
  loadCartFromStorage();
  renderProducts();
  renderCartUI();
  updateCartBadge();

  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) clearBtn.addEventListener("click", () => clearCart());

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", handleCheckout);

  // Initialize Gen AI Chatbot
  window.chatbot = new GenAIChatbot();

  // Show AI feature notification
  setTimeout(() => {
    showToast(
      "🤖 AI Assistant is ready! Ask me about chocolate, menu, or get recommendations!",
    );
  }, 1000);
}

document.addEventListener("DOMContentLoaded", init);

if (window.innerWidth < 992) {
  const navbarCollapse = document.getElementById("navbarNav");
  if (navbarCollapse && !document.querySelector(".mobile-search")) {
    const searchHtml =
      '<div class="px-3 mt-2 d-lg-none mobile-search"><input type="text" class="form-control" placeholder="Search food..."></div>';
    navbarCollapse.insertAdjacentHTML("afterbegin", searchHtml);
  }
}


// ========== USER AUTHENTICATION SYSTEM ==========

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
    this.init();
  }

  loadUsers() {
    const stored = localStorage.getItem("hungerNeedsUsers");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    
    return [
      {
        id: 1,
        name: "Demo User",
        email: "demo@hungerneeds.com",
        password: "demo123",
        createdAt: new Date().toISOString(),
        orderHistory: []
      }
    ];
  }

  saveUsers() {
    localStorage.setItem("hungerNeedsUsers", JSON.stringify(this.users));
  }

  init() {
    this.checkLoggedInUser();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Login form submit
    const loginForm = document.getElementById("loginFormElement");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    
    const signupForm = document.getElementById("signupFormElement");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => this.handleSignup(e));
    }

    
    const showSignupBtn = document.getElementById("showSignupBtn");
    if (showSignupBtn) {
      showSignupBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleForms("signup");
      });
    }

    const showLoginBtn = document.getElementById("showLoginBtn");
    if (showLoginBtn) {
      showLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleForms("login");
      });
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  toggleForms(formType) {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (formType === "signup") {
      loginForm.style.display = "none";
      signupForm.style.display = "block";
    } else {
      loginForm.style.display = "block";
      signupForm.style.display = "none";
    }
  }

  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    // Validation
    if (!email || !password) {
      this.showAuthToast("Please fill in all fields", "error");
      return;
    }

    // Find user
    const user = this.users.find(u => u.email === email && u.password === password);

    if (user) {
      this.currentUser = user;
      localStorage.setItem("hungerNeedsCurrentUser", JSON.stringify(user));
      this.showAuthToast(`Welcome back, ${user.name}! 🎉`, "success");
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("authModal"));
      if (modal) modal.hide();
      
      // Update UI
      this.updateUIForLoggedInUser();
      
      // Clear form
      document.getElementById("loginFormElement").reset();
    } else {
      this.showAuthToast("Invalid email or password", "error");
    }
  }

  handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      this.showAuthToast("Please fill in all fields", "error");
      return;
    }

    if (password !== confirmPassword) {
      this.showAuthToast("Passwords do not match!", "error");
      return;
    }

    if (password.length < 6) {
      this.showAuthToast("Password must be at least 6 characters", "error");
      return;
    }

    // Check if email already exists
    const emailExists = this.users.some(u => u.email === email);
    if (emailExists) {
      this.showAuthToast("Email already registered. Please login.", "error");
      this.toggleForms("login");
      return;
    }

    // Create new user
    const newUser = {
      id: this.users.length + 1,
      name: name,
      email: email,
      password: password,
      createdAt: new Date().toISOString(),
      orderHistory: []
    };

    this.users.push(newUser);
    this.saveUsers();
    
    // Auto-login after signup
    this.currentUser = newUser;
    localStorage.setItem("hungerNeedsCurrentUser", JSON.stringify(newUser));
    
    this.showAuthToast(`Welcome to HungerNeeds, ${name}! 🎉`, "success");
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("authModal"));
    if (modal) modal.hide();
    
    // Update UI
    this.updateUIForLoggedInUser();
    
    // Clear form
    document.getElementById("signupFormElement").reset();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("hungerNeedsCurrentUser");
    this.showAuthToast("Logged out successfully! 👋", "success");
    this.updateUIForLoggedOutUser();
    
    // Clear cart when logging out (optional)
    if (confirm("Would you like to clear your cart?")) {
      clearCart();
    }
  }

  checkLoggedInUser() {
    const storedUser = localStorage.getItem("hungerNeedsCurrentUser");
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.updateUIForLoggedInUser();
      } catch (e) {
        this.updateUIForLoggedOutUser();
      }
    } else {
      this.updateUIForLoggedOutUser();
    }
  }

  updateUIForLoggedInUser() {
    const userMenu = document.getElementById("userMenu");
    const loginNavBtn = document.getElementById("loginNavBtn");
    const userNameDisplay = document.getElementById("userNameDisplay");
    
    if (userMenu && loginNavBtn && userNameDisplay && this.currentUser) {
      userMenu.style.display = "block";
      loginNavBtn.style.display = "none";
      userNameDisplay.textContent = this.currentUser.name.split(" ")[0]; // Show first name
    }
  }

  updateUIForLoggedOutUser() {
    const userMenu = document.getElementById("userMenu");
    const loginNavBtn = document.getElementById("loginNavBtn");
    
    if (userMenu && loginNavBtn) {
      userMenu.style.display = "none";
      loginNavBtn.style.display = "block";
    }
  }

  showAuthToast(message, type = "success") {
    // Reuse existing toast or create custom
    const toastEl = document.getElementById("toastMsg");
    const toastTextSpan = document.getElementById("toastText");
    
    if (toastEl && toastTextSpan) {
      const icon = type === "success" ? "✅" : "❌";
      toastTextSpan.innerHTML = `${icon} ${message}`;
      
      // Change toast color based on type
      if (type === "error") {
        toastEl.style.background = "#dc3545";
      } else {
        toastEl.style.background = "#1e293b";
      }
      
      toastEl.classList.add("show");
      if (window.toastTimeout) clearTimeout(window.toastTimeout);
      window.toastTimeout = setTimeout(() => {
        toastEl.classList.remove("show");
        toastEl.style.background = "#1e293b"; // Reset color
      }, 3000);
    } else {
      alert(message);
    }
  }

 
  isAuthenticated() {
    if (!this.currentUser) {
      this.showAuthToast("Please login to continue!", "error");
      const modal = new bootstrap.Modal(document.getElementById("authModal"));
      modal.show();
      return false;
    }
    return true;
  }

  
orderHistoryLink = document.querySelector('a[href="#"]:has(.bi-clock-history)');
if (orderHistoryLink) {
  orderHistoryLink.addEventListener("click", (e) => {
    e.preventDefault();
    this.showOrderHistory();
  });
}

showOrderHistory() {
  if (!this.isAuthenticated()) return;
  
  const modal = new bootstrap.Modal(document.getElementById("orderHistoryModal"));
  const content = document.getElementById("orderHistoryContent");
  
  if (!this.currentUser.orderHistory || this.currentUser.orderHistory.length === 0) {
    content.innerHTML = '<div class="text-center py-5"><i class="bi bi-inbox" style="font-size: 4rem;"></i><p class="mt-3">No orders yet. Start shopping! 🛒</p></div>';
  } else {
    let html = '<div class="list-group">';
    this.currentUser.orderHistory.reverse().forEach(order => {
      html += `
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>Order #${order.id}</strong><br>
              <small class="text-muted">${new Date(order.date).toLocaleDateString()}</small>
            </div>
            <div class="text-end">
              <span class="badge bg-success">${order.status}</span><br>
              <strong>$${order.total.toFixed(2)}</strong>
            </div>
          </div>
          <hr class="my-2">
          <div class="small">
            ${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
          </div>
        </div>
      `;
    });
    html += '</div>';
    content.innerHTML = html;
  }
  
  modal.show();
}
}

// ========== MODIFIED CHECKOUT FUNCTION ==========
// Replace your existing handleCheckout function with this:

function handleCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty. Add some items first!");
    return;
  }
  
  // Check if user is logged in
  if (!authSystem.isAuthenticated()) {
    return;
  }
  
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);
  
  // Save order to user's history
  if (authSystem.currentUser) {
    const order = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: [...cart],
      total: parseFloat(totalPrice),
      status: "Confirmed"
    };
    
    const userIndex = authSystem.users.findIndex(u => u.id === authSystem.currentUser.id);
    if (userIndex !== -1) {
      if (!authSystem.users[userIndex].orderHistory) {
        authSystem.users[userIndex].orderHistory = [];
      }
      authSystem.users[userIndex].orderHistory.push(order);
      authSystem.saveUsers();
    }
  }
  
  alert(
    `✨ Order placed successfully! ✨\n\n` +
    `Items: ${totalItems}\n` +
    `Total: $${totalPrice}\n` +
    `Order #: ${Date.now()}\n\n` +
    `Thank you for shopping at HungerNeeds, ${authSystem.currentUser?.name || "Guest"}! 🍔🍕🍰`
  );
  
  cart = [];
  saveCartToStorage();
  renderCartUI();
  updateCartBadge();
  showToast("Order confirmed! Cart cleared. Check your order history! 📦");
}

// ========== INITIALIZE AUTH SYSTEM ==========
// Add this line inside your init() function

// At the top of your init() function, add:
let authSystem; // Declare globally

function init() {
  loadCartFromStorage();
  renderProducts();
  renderCartUI();
  updateCartBadge();

  // Initialize Auth System
  authSystem = new AuthSystem();

  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) clearBtn.addEventListener("click", () => clearCart());

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", handleCheckout);

  // Initialize Gen AI Chatbot
  window.chatbot = new GenAIChatbot();

  // Show AI feature notification
  setTimeout(() => {
    showToast("🤖 AI Assistant is ready! Ask me about chocolate, menu, or get recommendations!");
  }, 1000);
}