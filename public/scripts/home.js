// const logoutBtn = document.getElementById("logout-btn");                                   // in header.ejs
const loadMoreBtn = document.getElementById("loadMore-btn");

loadMoreBtn.onclick = (event) => {
  var xhr = new XMLHttpRequest();
  xhr.open("get", "/loadMore");
  xhr.send();

  xhr.addEventListener("load", function () {
    var arr = xhr.response;
    // console.log(xhr, xhr.response, xhr.status);
    arr = arr.length ? JSON.parse(arr) : [[], false];
    // console.log(JSON.parse(arr))
    var prodList = arr[0];
    var more = arr[1];
    // console.log("product-List: ", prodList);
    for (i = 0; i < prodList.length; ++i) {
      console.log("product-item: ", prodList[i]);
      showProductItem(prodList[i]);
    }
    if (!more) {
      if (document.getElementById("loadMore-btn")) {
        document.getElementById("loadMore-btn").remove();
      }
    }
  });
};

function showProductItem(productItemObj) {
  var productItem = document.createElement("div");
  productItem.setAttribute("class", "product-item flex-column");
  productItem.setAttribute("key", productItemObj._id);

  var productImg = document.createElement("img");
  productImg.setAttribute("src", productItemObj.productImg);
  productImg.setAttribute("class", "product-image");

  var productName = document.createElement("div");
  productName.setAttribute("class", "product-name");
  productName.innerHTML = productItemObj.productName;

  var productPrice = document.createElement("div");
  productPrice.setAttribute("class", "product-price");

  var descriptiveSpanPrice = document.createElement("span");
  descriptiveSpanPrice.setAttribute("class", "description-span");
  descriptiveSpanPrice.innerHTML = `Rs `;

  var priceSpan = document.createElement("span");
  priceSpan.innerHTML = productItemObj.productPrice;

  var productQuantity = document.createElement("div");
  productQuantity.setAttribute("class", "product-quantity hide");

  var descriptiveSpanQuantity = document.createElement("span");
  descriptiveSpanQuantity.setAttribute("class", "description-span");
  descriptiveSpanQuantity.innerHTML = `Quantity: `;

  var quantitySpan = document.createElement("span");
  quantitySpan.innerHTML = productItemObj.productQuantity;

  var productDescription = document.createElement("div");
  productDescription.setAttribute("class", "product-description hide");

  var descriptiveSpanDescription = document.createElement("span");
  descriptiveSpanDescription.setAttribute("class", "description-span");
  descriptiveSpanDescription.innerHTML = `Desc: `;

  var descriptionSpan = document.createElement("span");
  descriptionSpan.innerHTML = productItemObj.productDescription;

  var cartDetailContainer = document.createElement("div");
  cartDetailContainer.setAttribute("class", "cart-detail-container flex");

  var addToCartBtn = document.createElement("button");
  addToCartBtn.setAttribute("class", "add-to-cart product-function-holder");
  addToCartBtn.innerHTML = "Add To Cart";

  var productViewDetailsBtn = document.createElement("button");
  productViewDetailsBtn.setAttribute("class", "product-details product-function-holder btn");
  productViewDetailsBtn.setAttribute("id", "product-details");
  productViewDetailsBtn.innerHTML = "View Details";

  productPrice.appendChild(descriptiveSpanPrice);
  productPrice.appendChild(priceSpan);

  productQuantity.appendChild(descriptiveSpanQuantity);
  productQuantity.appendChild(quantitySpan);

  productDescription.appendChild(descriptiveSpanDescription);
  productDescription.appendChild(descriptionSpan);

  cartDetailContainer.appendChild(addToCartBtn);
  cartDetailContainer.appendChild(productViewDetailsBtn);

  // productPrice.appendChild(productItemObj.price)
  // productDescription.innerHTML = productItemObj.description;

  productItem.appendChild(productImg);
  productItem.appendChild(productName);
  productItem.appendChild(productPrice);
  productItem.appendChild(productQuantity);
  productItem.appendChild(productDescription);
  productItem.appendChild(cartDetailContainer);

  productContainer.appendChild(productItem);
}

// const productContainer = document.getElementById("product-container");

// function sendHttpRequest(method, url, callback, data) {
//   var xhr = new XMLHttpRequest();
//   xhr.open(method, url);
//   if (data) {
//     console.log("data present");
//     xhr.setRequestHeader("Content-type", "application/json");
//     xhr.send(JSON.stringify(data));
//   } else {
//     console.log("no data");
//     xhr.send();
//   }
//   xhr.addEventListener("load", callback(xhr));
//   // xhr.onload = callback(xhr)
// }

// sendHttpRequest('get', '/loadMore', function(xhr){
  //     var arr = xhr.response;
  //     console.log(xhr, xhr.response, xhr.status);
  //     arr = arr.length ? JSON.parse(arr) : [[], false];
  //     // console.log(JSON.parse(arr))
  //     var prodList = arr[0];
  //     var more = arr[1];
  //     console.log("product-List: ", prodList);
  //     for (i = 0; i < prodList.length; ++i) {
    //       console.log("product-item: ", prodList[i]);
    //       showProductItem(prodList[i]);
    //     }
    //     if (!more) {
      //       if (document.getElementById("loadMore-btn")) {
        //         document.getElementById("loadMore-btn").remove();
        //       }
        //     } else {
          //       var loadMoreBtn = document.getElementById("loadMore-btn");
          //       var loadMoreBtnCopy = cloneNode(loadMoreBtn);
          //       loadMoreBtn.remove();
          //       productContainer.appendChild(loadMoreBtnCopy);
          //     }
  // }, null)
  


