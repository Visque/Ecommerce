const logoutBtn = document.getElementById("logout-btn");
const dropDownList = document.getElementById("my-Dropdown");
const loadMoreBtn = document.getElementById("loadMore-btn");
const productContainer = document.getElementById("product-container");
const viewDetails = document.getElementById("product-details");


function sendHttpRequest(method, url, callback, data){
    var xhr = new XMLHttpRequest()
    xhr.open(method, url)
    if(data){
        console.log("data present");
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify(data))
    }
    else{
        console.log("no data")
        xhr.send()
    }
    xhr.addEventListener("load", callback(xhr));
    // xhr.onload = callback(xhr)
}

logoutBtn.onclick = (event) => {
    sendHttpRequest('get', '/logout', function(xhr){
        window.location.href = '/'
    })
}

loadMoreBtn.onclick = (event) => {
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

    var xhr = new XMLHttpRequest();
    xhr.open("get", "/loadMore");
    xhr.send()

    xhr.addEventListener("load", function(){
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
    })
}

productContainer.onclick = (event) => {
    var viewDetailsBtn = event.target
    var container = event.target.parentElement;
    console.log('Parent of view detail: ', container.children.length)

    for(var i = 0; i < container.children.length; ++i){
        var detail = container.children[i];
        if (detail.classList.contains("product-description") || detail.classList.contains("product-price")) {
            if(detail.classList.contains("hide")){
                detail.classList.remove("hide")
                viewDetailsBtn.innerHTML = `Hide Details`
            }   
            else {
                detail.classList.add("hide");
                viewDetailsBtn.innerHTML = `Show Details`;
            }
        }
    }
}

function showProductItem(productItemObj){

    var productItem = document.createElement("div")
    productItem.setAttribute("class", "product-item flex-column")

    var productImg = document.createElement("img")
    productImg.setAttribute("src", productItemObj.image);

    var productName = document.createElement("div");
    productName.setAttribute("class", "product-name");
    productName.innerHTML = productItemObj.name

    var productPrice = document.createElement("div");
    productPrice.setAttribute("class", "product-price hide");

    var descriptiveSpanPrice = document.createElement("span")
    descriptiveSpanPrice.setAttribute("class", "description-span");
    descriptiveSpanPrice.innerHTML = `Rs `

    var priceSpan = document.createElement("span")
    priceSpan.innerHTML = productItemObj.price;

    var productDescription = document.createElement("div");
    productDescription.setAttribute("class", "product-description hide");

    var descriptiveSpanDescription = document.createElement("span");
    descriptiveSpanDescription.setAttribute("class", "description-span");
    descriptiveSpanDescription.innerHTML = `Desc: `

    var descriptionSpan = document.createElement("span");
    descriptionSpan.innerHTML = productItemObj.description;


    var productViewDetailsBtn = document.createElement("button");
    productViewDetailsBtn.setAttribute("class", "product-details btn");
    productViewDetailsBtn.setAttribute("id", "product-details");
    productViewDetailsBtn.innerHTML = "View Details"

    productPrice.appendChild(descriptiveSpanPrice);
    productPrice.appendChild(priceSpan);

    productDescription.appendChild(descriptiveSpanDescription);
    productDescription.appendChild(descriptionSpan);

    // productPrice.appendChild(productItemObj.price)
    // productDescription.innerHTML = productItemObj.description;


    productItem.appendChild(productImg);
    productItem.appendChild(productName);
    productItem.appendChild(productPrice);
    productItem.appendChild(productDescription);
    productItem.appendChild(productViewDetailsBtn);

    productContainer.appendChild(productItem);
}

function dropDown(){
    if(dropDownList.classList.contains('hide'))
        dropDownList.classList.remove('hide')
    else
        dropDownList.classList.add('hide')
}