// Array de productos
const products = [
  { name: 'Papa', price: 3, img: 'productos/papa.jpg' },
  { name: 'Picaron', price: 3, img: 'productos/picaron.jpg' },
  { name: 'Chicha', price: 1.5, img: 'productos/chicha.jpg' },
  { name: 'Cachanga', price: 2.5, img: 'productos/cachanga.jpg' }
];

// Cargar pedidos desde localStorage
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Renderizar productos
const productContainer = document.getElementById('products');
products.forEach((product, index) => {
  const productDiv = document.createElement('div');
  productDiv.classList.add('product');

  productDiv.innerHTML = `
    <img src="${product.img}" alt="${product.name}" width="100">
    <p>${product.name}</p>
    <p>Precio: S/ ${product.price.toFixed(2)}</p>
    <input type="number" id="quantity-${index}" min="0" placeholder="Cantidad">
  `;

  productContainer.appendChild(productDiv);
});

// Confirmar pedido
document.getElementById('confirm-order').addEventListener('click', () => {
  const clientName = document.getElementById('client-name').value.trim();
  const whatsappNumber = document.getElementById('whatsapp-number').value.trim();

  if (!clientName || !whatsappNumber) {
    alert('Por favor, ingresa tu nombre y número de WhatsApp.');
    return;
  }

  const newOrder = {
    clientName,
    whatsappNumber,
    products: []
  };

  products.forEach((product, index) => {
    const quantityInput = document.getElementById(`quantity-${index}`);
    const quantity = parseInt(quantityInput.value);

    if (!isNaN(quantity) && quantity > 0) {
      newOrder.products.push({
        name: product.name,
        price: product.price,
        quantity
      });
      quantityInput.value = ''; // Limpiar input
    }
  });

  if (newOrder.products.length === 0) {
    alert('Por favor, selecciona al menos un producto.');
    return;
  }

  // Agregar el pedido a la lista global
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders)); // Guardar en localStorage

  renderOrders();

  alert(`Gracias, ${clientName}. Tu pedido ha sido confirmado.`);
  document.getElementById('client-name').value = ''; // Limpiar el nombre del cliente
  document.getElementById('whatsapp-number').value = ''; // Limpiar el número de WhatsApp
});

// Renderizar pedidos guardados
function renderOrders() {
  const orderContainer = document.getElementById('order-items');
  orderContainer.innerHTML = '';

  orders.forEach((order, index) => {
    const orderDiv = document.createElement('div');
    orderDiv.classList.add('order-item');

    let clientTotal = 0; // Total por cliente
    const productDetails = order.products.map((product, productIndex) => {
      const productSubtotal = product.price * product.quantity; // Subtotal por producto
      clientTotal += productSubtotal;

      return `
        <div class="product-detail">
          <input type="number" class="edit-quantity" data-order-index="${index}" data-product-index="${productIndex}" value="${product.quantity}" min="0" style="width: 50px; margin-right: 10px;">
          <span>${product.name}</span>
          <span>S/. ${product.price.toFixed(2)}</span>
          <span class="subtotal">Subtotal: S/. ${productSubtotal.toFixed(2)}</span>
        </div>
      `;
    }).join('');

    orderDiv.innerHTML = `
      <p><b>Cliente:</b> ${order.clientName}</p>
      <div class="order-products">
        ${productDetails}
      </div>
      <strong>Total: S/ <span class="total-amount">${clientTotal.toFixed(2)}</span></strong>
      <button class="delete-order" data-order-index="${index}">Eliminar Pedido</button>
      <button class="send-whatsapp" data-whatsapp="${order.whatsappNumber}" data-order-index="${index}">Enviar a WhatsApp</button>
    `;

    orderContainer.appendChild(orderDiv);
  });

  // Eventos para actualizar subtotal y total en tiempo real
  document.querySelectorAll('.edit-quantity').forEach(input => {
    input.addEventListener('input', event => {
      const orderIndex = parseInt(input.getAttribute('data-order-index'));
      const productIndex = parseInt(input.getAttribute('data-product-index'));
      const newQuantity = parseInt(input.value);

      if (!isNaN(newQuantity) && newQuantity >= 0) {
        orders[orderIndex].products[productIndex].quantity = newQuantity;
        updateTotals(orderIndex, productIndex);
      }
    });
  });

  // Eventos para eliminar pedidos con confirmación
  document.querySelectorAll('.delete-order').forEach(button => {
    button.addEventListener('click', event => {
      const orderIndex = parseInt(button.getAttribute('data-order-index'));

      // Mostrar ventana de confirmación antes de eliminar
      const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este pedido?");
      
      if (confirmDelete) {
        orders.splice(orderIndex, 1); // Eliminar pedido completo
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
      } else {
        console.log("Eliminación cancelada");
      }
    });
  });

  // Agregar eventos a los botones de WhatsApp
  document.querySelectorAll('.send-whatsapp').forEach(button => {
    button.addEventListener('click', () => {
      const orderIndex = button.getAttribute('data-order-index');
      const order = orders[orderIndex];

      // Construir el mensaje con todos los detalles del pedido
      let message = `*MANANTIAL DEL SABOR*\n\n*Detalle del Pedido*\n`;

      order.products.forEach(product => {
        message += `- ${product.quantity} x ${product.name} (S/. ${product.price.toFixed(2)}) = S/. ${(product.quantity * product.price).toFixed(2)}\n`;
      });
      message += `*Total: S/ ${order.products.reduce((total, product) => total + product.price * product.quantity, 0).toFixed(2)}*\n\n`;
      message += `*MUCHAS GRACIAS POR SU COMPRA*`;

      const whatsappLink = `https://wa.me/${order.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank');
    });
  });
}

// Actualizar subtotal y total
function updateTotals(orderIndex, productIndex) {
  const order = orders[orderIndex];
  const product = order.products[productIndex];
  const newSubtotal = product.price * product.quantity;

  // Actualizar subtotal en la interfaz
  const subtotalElement = document.querySelectorAll('.product-detail .subtotal')[orderIndex * order.products.length + productIndex];
  subtotalElement.textContent = `Subtotal: S/. ${newSubtotal.toFixed(2)}`;

  // Actualizar total
  let newTotal = 0;
  order.products.forEach(p => {
    newTotal += p.price * p.quantity;
  });

  const totalElement = document.querySelectorAll('.total-amount')[orderIndex];
  totalElement.textContent = newTotal.toFixed(2);

  // Guardar cambios en localStorage
  localStorage.setItem('orders', JSON.stringify(orders));
}

// Inicializar los pedidos
if (orders.length > 0) {
  renderOrders();
}
