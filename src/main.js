import './style.css'
import { products } from '../data'

const container = document.getElementById("productList")
const cartItemsContainer = document.querySelector('.js-cart-items')
const cartCountEl = document.querySelector('.js-cart-count')

let cart = JSON.parse(localStorage.getItem('cart')) || [] //will push name, price, count, image, category

function formatPrice(cents) {
  return (cents / 100).toFixed(2) // keep decimal prices
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.count, 0) //.reduce sum up all the total quantity
  cartCountEl.textContent = `(${totalItems})`;
}

function getsumTotal() {
  const totalCents = cart.reduce((sum, item) => sum + (item.price * item.count), 0)
  return formatPrice(totalCents)
} 

//Add product to cart or update existing count
function addToCart(product) {
  const existing = cart.find(item => item.name === product.name)

  if(existing) {
    existing.count++
  } else {
    cart.push({...product, count: 1})
  }
  saveAndRender()
  getsumTotal()
}

//Update quantity in cart
function updateCart(name, count) {
  cart = cart.map(item => item.name === name ? {...item, count} : item).filter(item => item.count > 0)  //map create new array with updated quantity //prevent zero/negative qty
  saveAndRender()
  getsumTotal()
}

//Remove product from cart
function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name)
  saveAndRender()
  getsumTotal()
}

function saveAndRender() {
  localStorage.setItem("cart", JSON.stringify(cart))
  renderCart()
  updateCartCount()
}

//Create each product card
products.forEach((product) => {
  const card = document.createElement("div")
  card.className = "relative group block rounded-xl"

  card.innerHTML = `
  <div class="relative aspect-w-16 aspect-h-9 border-2 border-transparent rounded-xl">
    <picture>
      <source media="(min-width:1024px)" srcset="${product.image.desktop}">
      <source media="(min-width:649px)" srcset="${product.image.tablet}">
      <img class="w-full object-cover rounded-xl" src="${product.image.mobile}" alt="${product.name}">
    </picture>

    <button class="addBtn absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-2 md:py-1.5 inline-flex items-center justify-center gap-1 rounded-full shadow-md text-xs font-bold text-neutral-950 whitespace-nowrap hover:bg-rose-50 cursor-pointer transition"><img class="h-4 w-4 md:h-5 md:w-5" src="images/icon-add-to-cart.svg" alt="">Add to Cart</button>

    <div class="qtyControls hidden absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 px-6 py-1.5 md:px-6 md:py-2 rounded-full items-center gap-2 text-white">
      <button class="decrement h-5 w-5 md:w-4 md:h-4"><img src="images/icon-decrement-quantity.svg" alt=""></button>
      <span class="qty min-w-[24px] md:min-w-[20px] text-center text-xs">1</span>
      <button class="increment h-5 w-5 md:w-4 md:h-4"><img src="images/icon-increment-quantity.svg" alt=""></button>
    </div>
  </div>

  <div class="text-left">
    <p class="mt-5 text-[14px] text-amber-950 font-semibold">${product.name}</p>
    <h3 class="mt-1 text-xl font-medium text-neutral-900">${product.category}</h3>
    <p class="text-rose-900 font-semibold">$${formatPrice(product.price)}</p>
  </div>
  `;

  //Find the image container inside this card
  const imgContainer = card.querySelector(".aspect-w-16")

  const addBtn = card.querySelector('.addBtn')
  const qtyControls = card.querySelector('.qtyControls')
  const decrementBtn = card.querySelector('.decrement')
  const qtySpan = card.querySelector('.qty')
  const incrementBtn = card.querySelector('.increment')

  let quantity = 1;

  // When Add to Cart is clicked
  addBtn.addEventListener('click', () => {
    // Remove "selected" styling from ALL image containers
    document.querySelectorAll("#productList .aspect-w-16").forEach(box => { //it finds all the image container inside the  #productList
      box.classList.remove("border-amber-700")
      box.classList.add("border-transparent")
    });
    imgContainer.classList.replace('border-transparent', 'border-amber-700')

    addBtn.classList.add('hidden')
    qtyControls.classList.replace('hidden', 'flex')


    quantity = 1
    qtySpan.textContent = 1
    addToCart(product)
  })

  // Increment
  incrementBtn.addEventListener('click', () => {
    quantity++;
    qtySpan.textContent = quantity;
    updateCart(product.name, quantity)
  })

  // Decrement
  decrementBtn.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      updateCart(product.name, quantity)
    } else {
      qtyControls.classList.add('hidden')
      qtyControls.classList.remove('flex')
      addBtn.classList.remove('hidden')
      removeFromCart(product.name)
    }
    qtySpan.textContent = quantity;
  })

  container.appendChild(card);
}) 

//Render cart UI
function renderCart() {
  cartItemsContainer.innerHTML = ""
  // let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
    <img src="images/illustration-empty-cart.svg" alt="">
    <p class="text-rose-950 text-[16px] font-mediumxs">Your added items will appear here</p>
    `
    return;
  }

  cart.forEach(item => {
    const itemTotal = item.price * item.count
    // total += itemTotal;

    const div = document.createElement('div')
    div.className = "flex justify-between w-full items-center py-2 border-b border-gray-200"
     div.innerHTML = `
    <div class="flex-1">
      <p class="font-semibold text-left text-gray-800">${item.name}</p>
      <div class="flex items-center gap-2 text-sm text-rose-500">
        <span>${item.count}x</span>
        <span class="text-amber-950 font-medium">@$${formatPrice(item.price)}</span>
        <span class="text-gray-400">$${formatPrice(itemTotal)}</span>
      </div>
    </div>
    <button class="ml-4 text-gray-400 hover:text-amber-500 transition">
      <img class="w-5 h-5" src="images/icon-remove-item.svg" alt="">
    </button>
  `;

  //remove item listener
  div.querySelector('button').addEventListener('click', () => removeFromCart(item.name))
    cartItemsContainer.appendChild(div)
  })

  const totalDiv = document.createElement('div')
  totalDiv.className = "flex justify-between w-full mt-4 text-neutral-900 items-center"
  totalDiv.innerHTML = `
  <span>Order Total</span>
  <span class="font-bold text-lg">$${getsumTotal()}</span>
  `;
  cartItemsContainer.appendChild(totalDiv)

  const carbonDelivery = document.createElement('div')
  carbonDelivery.className = "flex justify-center w-full items-center mx-auto bg-rose-50 text-neutral-950 rounded-lg py-2 mt-2"
  carbonDelivery.innerHTML = `
  <div class="flex gap-1">
  <img src="images/icon-carbon-neutral.svg" alt ="" />
  <p>This is a <b>carbon-neutral</b> delivery</p>
  </div>
  `
  cartItemsContainer.appendChild(carbonDelivery)

  const confirmOrder = document.createElement('button')
  confirmOrder.className= "bg-amber-700 hover:bg-amber-900 w-full text-white text-lg  rounded-full py-2 mt-3"
  confirmOrder.textContent = "Confirm Order"
  confirmOrder.addEventListener('click', showOrderConfirmation)
  cartItemsContainer.appendChild(confirmOrder)

  function showOrderConfirmation() {
    //Hide the cart panel
    const cartEl = document.querySelector('.cart')
    if (cartEl) cartEl.style.display = 'none'

    //Create modal overlay
    const overlay = document.createElement('div')
    overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'

    // Create modal box
    const modal = document.createElement('div')
    modal.className = 'bg-white rounded-2xl shadow-xl max-w-md w-full p-6'
    
    // Build order summary list
    let itemsHTML = ""
    cart.forEach(item => {
      const itemTotal = item.price * item.count
      itemsHTML += `
      <div class="flex justify-between items-center py-2 border-b border-gray-200">
      <div class="flex gap-3">
        <img class="w-10 h-10 object-cover rounded-md" src="${item.image.thumbnail}" alt="${item.name}">
        <div class="flex flex-col text-left">
          <p class="font-semibold text-gray-800">${item.name}</p>
          <div class="flex items-center gap-2 text-sm text-rose-500">
            <span>x${item.count}</span>
            <span class="text-amber-950 font-medium">@ $${formatPrice(item.price)}</span>
          </div>
        </div>
      </div>
        <p class="font-medium text-gray-800">$${formatPrice(itemTotal)}</p>
      </div>
      `
    })

    modal.innerHTML = `
    <div class="flex flex-col items-left gap-2 mb-6">
      <img class="w-6 h-6" src="images/icon-order-confirmed.svg" alt="">
      <div>
        <h2 class="text-2xl font-bold text-neutral-950">Order Confirmed</h2>
        <p class="text-gray-500 text-sm">We hope you enjoy your food!</p>
      </div>
    </div>

    <div class="bg-rose-50 rounded-lg p-4 mb-4">
      ${itemsHTML}
      <div class="flex justify-between mt-4 text-lg font-bold text-neutral-900">
        <span>Order Total</span>
        <span>$${getsumTotal()}</span>
      </div>
    </div>

    <button class="startNew bg-amber-700 hover:bg-amber-900 w-full text-white rounded-full py-3 font-semibold">
      Start New Order
    </button>
    `

    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    // Reset cart + product cards on new order
    modal.querySelector('.startNew').addEventListener('click', () => {
      cart = []
      saveAndRender()

      document.querySelectorAll('.addToCartContainer').forEach(container => {
        container.innerHTML = `
        <button class="addToCartBtn bg-amber-700 hover:bg-amber-900 text-white rounded-full px-4 py-2 text-sm font-semibold">Add to Cart</button>
        `
      })

      overlay.remove()
      if (cartEl) cartEl.style.display = 'block'
    })
  }
}
saveAndRender()
getsumTotal()