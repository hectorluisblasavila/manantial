// Array de productos
const products = [
  { name: "Papa", price: 3, img: "productos/papa.jpg" },
  { name: "Picaron", price: 3, img: "productos/picaron.jpg" },
  { name: "Chicha", price: 1.5, img: "productos/chicha.jpg" },
  { name: "Cachanga", price: 2.5, img: "productos/cachanga.jpg" },
];

// Cargar pedidos desde localStorage
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// Renderizar productos
const productContainer = document.getElementById("products");
products.forEach((product, index) => {
  const productDiv = document.createElement("div");
  productDiv.classList.add("product");

  productDiv.innerHTML = `
    <img src="${product.img}" alt="${product.name}" width="100">
    <p class="uppercase-bold">${product.name}</p>
    <p class="price-style">Precio: S/ ${product.price.toFixed(2)}</p>
    <input type="number" id="quantity-${index}" min="0" placeholder="Cantidad">
  `;

  productContainer.appendChild(productDiv);
});

// Confirmar pedido
document.getElementById("confirm-order").addEventListener("click", () => {
  const clientName = document.getElementById("client-name").value.trim();
  const whatsappNumber = document
    .getElementById("whatsapp-number")
    .value.trim();

  if (!clientName) {
    alert("Por favor, ingresa tu nombre y número de WhatsApp.");
    return;
  }

  const newOrder = {
    clientName,
    whatsappNumber,
    products: [],
    status: "Pendiente",
  };

  products.forEach((product, index) => {
    const quantityInput = document.getElementById(`quantity-${index}`);
    const quantity = parseInt(quantityInput.value);

    if (!isNaN(quantity) && quantity > 0) {
      newOrder.products.push({
        name: product.name,
        price: product.price,
        quantity,
      });
      quantityInput.value = ""; // Limpiar input
    }
  });

  if (newOrder.products.length === 0) {
    alert("Por favor, selecciona al menos un producto.");
    return;
  }

  // Agregar el pedido a la lista global
  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders)); // Guardar en localStorage

  renderOrders();
  renderSalesSummary(); // Actualizar resumen de ventas

  alert(`Gracias, ${clientName}. Tu pedido ha sido confirmado.`);
  document.getElementById("client-name").value = ""; // Limpiar el nombre del cliente
  document.getElementById("whatsapp-number").value = ""; // Limpiar el número de WhatsApp
});

// Renderizar pedidos guardados
function renderOrders() {
  const orderContainer = document.getElementById("order-items");
  orderContainer.innerHTML = "";

  // Ordenar los pedidos: primero los pendientes, luego los entregados
  const sortedOrders = orders.sort((a, b) => {
    if (a.status === "Pendiente" && b.status === "Entregado") {
      return -1; // "Pendiente" va antes que "Entregado"
    } else if (a.status === "Entregado" && b.status === "Pendiente") {
      return 1; // "Entregado" va después de "Pendiente"
    }
    return 0; // Mantener el mismo orden si ambos tienen el mismo estado
  });

  sortedOrders.forEach((order, index) => {
    const orderDiv = document.createElement("div");
    orderDiv.classList.add("order-item");

    let clientTotal = 0; // Total por cliente
    const productDetails = order.products
      .map((product, productIndex) => {
        const productSubtotal = product.price * product.quantity; // Subtotal por producto
        clientTotal += productSubtotal;

        return `
        <div class="product-detail">
          <input type="number" class="edit-quantity" data-order-index="${index}" data-product-index="${productIndex}" value="${
          product.quantity
        }" min="0" style="width: 50px; margin-right: 10px;">
          <span>${product.name}</span>
          <span>S/. ${product.price.toFixed(2)}</span>
          <span class="subtotal">Subtotal: S/. ${productSubtotal.toFixed(
            2
          )}</span>
        </div>
      `;
      })
      .join("");

    orderDiv.innerHTML = `
  <div class="order-header">
    <p><b>Cliente:</b> ${order.clientName}</p>
  </div>
  
  <div class="order-products">
    ${productDetails}
  </div>
  
  <div class="order-footer">
    <strong>Total: S/ <span class="total-amount">${clientTotal.toFixed(
      2
    )}</span></strong>
    <div class="order-buttons">
    <button class="mark-delivered" data-order-index="${index}">${
      order.status
    }</button>
      <button class="send-whatsapp" data-whatsapp="${
        order.whatsappNumber
      }" data-order-index="${index}">WhatsApp</button>
           <button class="delete-order" data-order-index="${index}">Eliminar</button>
      
    </div>
  </div>
`;

    orderContainer.appendChild(orderDiv);
  });

  // Eventos para cambiar el estado del pedido
  document.querySelectorAll(".mark-delivered").forEach((button) => {
    button.addEventListener("click", (event) => {
      const orderIndex = parseInt(button.getAttribute("data-order-index"));
      const order = orders[orderIndex];

      // Solo mostrar el alert si el pedido está en estado "Pendiente"
      if (order.status === "Pendiente") {
        const confirmDelivery = confirm(
          "¿Estás seguro de que deseas marcar este pedido como entregado?"
        );

        if (confirmDelivery) {
          order.status = "Entregado";

          // Mover el pedido al final de la lista
          orders.push(...orders.splice(orderIndex, 1));
        }

        localStorage.setItem("orders", JSON.stringify(orders)); // Guardar cambios en localStorage
        renderOrders(); // Re-renderizar pedidos
      }
    });
  });

  // Eventos para actualizar subtotal y total en tiempo real
  document.querySelectorAll(".edit-quantity").forEach((input) => {
    input.addEventListener("input", (event) => {
      const orderIndex = parseInt(input.getAttribute("data-order-index"));
      const productIndex = parseInt(input.getAttribute("data-product-index"));
      const newQuantity = parseInt(input.value);

      if (!isNaN(newQuantity) && newQuantity >= 0) {
        orders[orderIndex].products[productIndex].quantity = newQuantity;
        updateTotals(orderIndex, productIndex);
        renderSalesSummary(); // Actualizar resumen de ventas al modificar la cantidad
      }
    });
  });

  // Eventos para eliminar pedidos con confirmación
  document.querySelectorAll(".delete-order").forEach((button) => {
    button.addEventListener("click", (event) => {
      const orderIndex = parseInt(button.getAttribute("data-order-index"));

      // Mostrar ventana de confirmación antes de eliminar
      const confirmDelete = confirm(
        "¿Estás seguro de que deseas eliminar este pedido?"
      );

      if (confirmDelete) {
        orders.splice(orderIndex, 1); // Eliminar pedido completo
        localStorage.setItem("orders", JSON.stringify(orders));
        renderOrders();
        renderSalesSummary(); // Actualizar resumen de ventas
      } else {
        console.log("Eliminación cancelada");
      }
    });
  });

  // Agregar eventos a los botones de WhatsApp
  document.querySelectorAll(".send-whatsapp").forEach((button) => {
    button.addEventListener("click", () => {
      const orderIndex = button.getAttribute("data-order-index");
      const order = orders[orderIndex];

      // Construir el mensaje con todos los detalles del pedido
      let message = `*MANANTIAL DEL SABOR*\n\n*Detalle del Pedido*\n`;

      order.products.forEach((product) => {
        message += `- ${product.quantity} x ${
          product.name
        } (S/. ${product.price.toFixed(2)}) = S/. ${(
          product.quantity * product.price
        ).toFixed(2)}\n`;
      });
      message += `*Total: S/ ${order.products
        .reduce((total, product) => total + product.price * product.quantity, 0)
        .toFixed(2)}*\n\n`;
      message += `*MUCHAS GRACIAS POR SU COMPRA*`;

      const whatsappLink = `https://wa.me/${
        51order.whatsappNumber
      }?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, "_blank");
    });
  });
}

// Actualizar subtotal y total
function updateTotals(orderIndex, productIndex) {
  const order = orders[orderIndex];
  const product = order.products[productIndex];
  const newSubtotal = product.price * product.quantity;

  // Actualizar subtotal en la interfaz
  const subtotalElement = document.querySelectorAll(
    ".product-detail .subtotal"
  )[orderIndex * order.products.length + productIndex];
  subtotalElement.textContent = `Subtotal: S/. ${newSubtotal.toFixed(2)}`;

  // Actualizar total
  let newTotal = 0;
  order.products.forEach((p) => {
    newTotal += p.price * p.quantity;
  });

  const totalElement = document.querySelectorAll(".total-amount")[orderIndex];
  totalElement.textContent = newTotal.toFixed(2);

  // Guardar cambios en localStorage
  localStorage.setItem("orders", JSON.stringify(orders));
}

// Renderizar resumen de ventas diarias
function renderSalesSummary() {
  const salesSummaryContainer = document.getElementById("sales-summary");
  salesSummaryContainer.innerHTML = ""; // Limpiar la tabla

  let totalQuantity = 0;
  let totalAmount = 0;
  const productSales = {};

  orders.forEach((order) => {
    order.products.forEach((product) => {
      if (!productSales[product.name]) {
        productSales[product.name] = { quantity: 0, amount: 0 };
      }
      productSales[product.name].quantity += product.quantity;
      productSales[product.name].amount += product.quantity * product.price;
    });
  });

  for (const productName in productSales) {
    const productTotal = productSales[productName];
    totalQuantity += productTotal.quantity;
    totalAmount += productTotal.amount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${productName}</td>
      <td>${productTotal.quantity}</td>
      <td>S/ ${productTotal.amount.toFixed(2)}</td>
    `;
    salesSummaryContainer.appendChild(row);
  }

  // Mostrar total general
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td><b>Total general</b></td>
    
    <td><b>S/ ${totalAmount.toFixed(2)}</b></td>
  `;
  salesSummaryContainer.appendChild(totalRow);
}

function markAsDelivered(orderId) {
  // Obtener el elemento del pedido
  const orderElement = document.getElementById(orderId);

  // Mover el pedido al final de la lista
  const orderContainer = document.getElementById("order-items");
  orderContainer.appendChild(orderElement);

  // Actualizar el estado del pedido
  const statusElement = document.getElementById(`status-${orderId}`);
  statusElement.textContent = "Entregado";
  statusElement.classList.add("delivered");
}

// Llamada inicial para renderizar
renderOrders();
renderSalesSummary();

//ESTE CODIGO ME MUESTRA LA FECHA DEL RESUMEN DE PEDIDOS
const fecha = new Date();
const fechaFormateada = fecha.toLocaleDateString(); // Obtiene solo la fecha en formato legible
document.getElementById(
  "fecha-pedido"
).innerText = `Fecha del Resumen: ${fechaFormateada}`;

// Evento para el botón "BORRAR TODO"
document.getElementById("delete-all").addEventListener("click", () => {
  const confirmDelete = confirm(
    "¿Estás seguro de que deseas borrar todos los pedidos?"
  );

  if (confirmDelete) {
    // Vaciar la lista de pedidos y el localStorage
    orders = []; // Vaciar el array de pedidos
    localStorage.removeItem("orders"); // Eliminar los pedidos del localStorage

    // Re-renderizar la lista de pedidos (quedará vacía)
    renderOrders();
    renderSalesSummary(); // Actualizar resumen de ventas
    // Mostrar alerta de confirmación
    alert("Todos los pedidos han sido eliminados correctamente.");
  }
});
