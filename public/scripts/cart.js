const productContainer = document.getElementById("product-container");
const container = document.getElementById("container");

function sendHttpRequest(method, url, callback, data) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  if (data) {
    console.log("data present");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
  } else {
    console.log("no data");
    xhr.send();
  }
  xhr.addEventListener("load", callback(xhr));
  // xhr.onload = callback(xhr)
}

productContainer.onclick = (event) => {
  var addToCartBtn = event.target.classList.contains("add-to-cart")? event.target: null;
  var viewDetailsBtn = event.target.classList.contains("product-details")? event.target: null;
  var removeFromCartBtn = event.target.classList.contains("remove-from-cart") ? event.target : null;
  var productQuantityBtn = event.target.classList.contains("product-quantity-change") ? event.target : null;

  var prodContainer = event.target.parentElement.parentElement;
  // console.log("Parent of view detail: ", productQuantityBtn);

  if (viewDetailsBtn !== null) {
    for (var i = 0; i < prodContainer.children.length; ++i) {
      var detail = prodContainer.children[i];
      if (
        detail.classList.contains("product-description") ||
        detail.classList.contains("product-quantity")
      ) {
        // || detail.classList.contains("product-price")
        if (detail.classList.contains("hide")) {
          detail.classList.remove("hide");
          viewDetailsBtn.innerHTML = `Hide Details`;
        } else {
          detail.classList.add("hide");
          viewDetailsBtn.innerHTML = `Show Details`;
        }
      }
    }
  }
  if (addToCartBtn !== null) {
    var productItem = {
      productId: prodContainer.getAttribute("productkey"),
    };

    var xhr = new XMLHttpRequest();
    xhr.open("post", "/cart");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(productItem));

    xhr.onload = (xhr) => {
      if (xhr.target.status === 200) {
        console.log("container check: ", container);
        var infoContainer = document.createElement("div");
        infoContainer.setAttribute("class", "success flex");

        var info = document.createElement("h3");
        info.style.width = "100%";
        info.innerHTML = `Product Added To Cart`;

        infoContainer.appendChild(info);
        container.prepend(infoContainer);
        setTimeout(function () {
          if (container.firstChild.classList.contains("success")) {
            container.firstChild.remove();
          }
        }, 3000);
      } else {
        alert("Please login First");
        window.location.href = "/logout";
      }
    };
  }
  if (removeFromCartBtn !== null) {
    console.log(prodContainer,typeof prodContainer.getAttribute("cartkey"));

    var productItem = {
      cartId: prodContainer.getAttribute("cartkey"),
    };

    var xhr = new XMLHttpRequest();
    xhr.open("post", "/remove-from-cart");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(productItem));

    xhr.onload = (xhr) => {
      if (xhr.target.status === 200) {
        prodContainer.remove()
      } else {
        console.log("failed to delete item :(")
      }
    };
  }
  if (productQuantityBtn !== null) {
    productQuantityBtn.onchange = (event, prodContainer, productQuantityBtn) => quantityHandler(event);
    // productQuantityBtn.onmouseup = (event, prodContainer, productQuantityBtn) => quantityHandler(event);
  }
};

// Functions
function quantityHandler(event){
  var product = event.target.parentElement.parentElement.parentElement;
  // var prodContainer = product.parentElement
  console.log(product)
  var cartKey = product.getAttribute("cartkey");
  var productKey = product.getAttribute("productkey");
  var price = product.children[2].children[1];
  var maxQuantity = Number(event.target.getAttribute("max"))
  // console.log('ajax cartItem: ', price);

  if(event.target.value > maxQuantity){
    // Condition for quantity exceed
    alert("Quantity exceeds the total number of products")
    event.target.value = maxQuantity;
    getProductPrice(productKey, function (productPrice) {
      price.innerHTML = productPrice * maxQuantity;
    });
    return;
  }
  // console.log(price)

  getProductPrice(productKey, function (productPrice) {
    price.innerHTML = productPrice * event.target.value;
  })

  var productItem = {
    cartId: cartKey,
    quantity: event.target.value,
  }

  var xhr = new XMLHttpRequest();
  xhr.open("post", "/update-cart");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(productItem));

  xhr.onload = (xhr) => {
    console.log("products Quantity has been changed :)")
  };

}

function getProductPrice(productId, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("get", `/addProduct?key=${productId}`);
  xhr.send();

  xhr.onload = (xhr) => {
    var prodPrice = JSON.parse(xhr.target.response);
    console.log("log price check :)  ", prodPrice);
    callback(prodPrice);
  };
}
