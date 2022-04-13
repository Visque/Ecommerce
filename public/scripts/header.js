const dropDownList = document.getElementById("my-Dropdown"); // right most drop down in header.ejs
const settingsBtn = document.getElementById("settings-btn");                                // in header.ejs


function dropDown() {
  if (dropDownList.classList.contains("hide"))  dropDownList.classList.remove("hide");
  else dropDownList.classList.add("hide");
}