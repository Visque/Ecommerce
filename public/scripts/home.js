const logoutBtn = document.getElementById('logout-btn')
const dropDownList = document.getElementById("my-Dropdown");

function sendHttpRequest(method, url, callback, data){
    var xhr = new XMLHttpRequest()
    xhr.open(method, url)
    if(data){
        xhr.setRequestHeader('Content-type', 'application/json')
        xhr.send(JSON.stringify(data))
    }
    else{
        xhr.send()
    }

    xhr.onload = callback(xhr)
}

logoutBtn.onclick = (event) => {
    sendHttpRequest('get', '/logout', function(xhr){
        window.location.href = '/'
    })
}

function dropDown(){
    if(dropDownList.classList.contains('hide'))
        dropDownList.classList.remove('hide')
    else
        dropDownList.classList.add('hide')
}