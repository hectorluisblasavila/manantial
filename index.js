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

    orders.forEach(order => {
      const orderDiv = document.createElement('div');
      orderDiv.classList.add('order-item');

      let clientTotal = 0; // Total por cliente
      const productDetails = order.products.map(product => {
        clientTotal += product.price * product.quantity;
        return `${product.quantity} x ${product.name} S/.${product.price}  (S/ ${(product.price * product.quantity).toFixed(2)})`;
      }).join('\n');

      orderDiv.innerHTML = `
        <p><b>Cliente:</b> ${order.clientName}</p>
        <ul>${order.products.map(product => `
          <li>${product.quantity} x ${product.name} S/.${product.price}  (S/ ${(product.price * product.quantity).toFixed(2)})</li>
        `).join('')}</ul>
        <strong>Total: S/ ${clientTotal.toFixed(2)}</strong>
        <button class="send-whatsapp" data-whatsapp="${order.whatsappNumber}" data-message="Hola, ${order.clientName}. Tu pedido:\n${productDetails}\nTotal: S/ ${clientTotal.toFixed(2)}">Enviar a WhatsApp</button>
      `;

      orderContainer.appendChild(orderDiv);
    });

    // Agregar eventos a los botones de WhatsApp
    document.querySelectorAll('.send-whatsapp').forEach(button => {
      button.addEventListener('click', (event) => {
        const whatsappNumber = button.getAttribute('data-whatsapp');
        const message = encodeURIComponent(button.getAttribute('data-message'));
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      });
    });
  }

  // Cargar los pedidos guardados al cargar la página
  if (orders.length > 0) {
    renderOrders();
  }