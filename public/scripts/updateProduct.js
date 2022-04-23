const container = document.getElementById("product-container");

const deleteProductBtn = document.getElementById("delete-btn");
const updateProductBtn = document.getElementById("update-btn");

container.addEventListener("click", (event) => eventHandler(event))

// updateProductBtn.addEventListener("click", (event) => updateProduct(event));
// deleteProductBtn.addEventListener("click", (event) => deleteProduct(event));

// Functions
console.log(container)
function eventHandler(event){
    console.log(event.target)
    if(event.target.classList.contains("update-btn")){
        updateProduct(event)
    }
    else if(event.target.classList.contains("delete-btn")){
        deleteProduct(event);
    }
}

function updateProduct(event) {
  var productItem = event.target.parentElement.parentElement;

  console.log(productItem);

  var key = productItem.getAttribute("key");
  var productName = productItem.children[1].children[0].value;
  var productPrice = productItem.children[2].children[0].value;
  var productQuantity = productItem.children[3].children[0].value;
  var productDescription = productItem.children[4].children[0].value;

  var productObj = {
    key: key,
    name: productName,
    price: productPrice,
    quantity: Number(productQuantity),
    description: productDescription,
  };

  console.log(
    "check at update: :()  ",
    'name: ', productName,
    'price: ', productPrice,
    'quant: ', productQuantity,
    'desc: ', productDescription
  );

  var xhr = new XMLHttpRequest();
  xhr.open("post", "/update-product");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(productObj));

  xhr.onload = (xhr) => {
    // Product Update notification.........
    console.log("request has been recieved \nProduct must be updated :)");
  };
}

function deleteProduct(event) {
  var productItem = event.target.parentElement.parentElement;

  console.log(productItem);

  var key = productItem.getAttribute("key");

  var productObj = {
    key: key,
  };

  console.log("check at update: :()  ");

  var xhr = new XMLHttpRequest();
  xhr.open("post", "/delete-product");
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(productObj));

  xhr.onload = (xhr) => {
    // Product Delete notification.........
    console.log("request has been recieved \nProduct must be deleted :)");
    productItem.remove();

    // BUG 
    // Add check if no products left then show "No products added by this admin"
  };
}
