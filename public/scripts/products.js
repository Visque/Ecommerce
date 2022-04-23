const productContainer = document.getElementById("product-container");
const container = document.getElementById("container");

// export { productContainer, container }; 

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

  var prodContainer = event.target.parentElement.parentElement;
  console.log("Parent of view detail: ", prodContainer);

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
  } else if (addToCartBtn !== null) {
    var productItem = {
      productId: prodContainer.getAttribute("key"),
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
};
