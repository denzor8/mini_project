// account logic
// show modal logic
let registerUserModalBtn = document.querySelector("#registerUser-modal");
let loginUserModalBtn = document.querySelector("#loginUser-modal");
let registerUserModalBlock = document.querySelector("#registerUser-block");
let loginUserModalBlock = document.querySelector("#loginUser-block");
let registerUserBtn = document.querySelector("#registerUser-btn");
let loginUserBtn = document.querySelector("#loginUser-btn");
let logoutUserBtn = document.querySelector("#logoutUser-btn");
let closeRegisterModalBtn = document.querySelector(".btn-close");
// console.log(registerUserModalBtn, loginUserModalBtn, registerUserModalBlock, loginUserModalBlock, registerUserBtn, loginUserBtn,logoutUserBtn);

registerUserModalBtn.addEventListener("click", () => {
	registerUserModalBlock.setAttribute("style", "display: flex !important;");
	registerUserBtn.setAttribute("style", "display: flex !important;");
	loginUserModalBlock.setAttribute("style", "display: none !important;");
	loginUserBtn.setAttribute("style", "display: none !important;");
});

loginUserModalBtn.addEventListener("click", () => {
	registerUserModalBlock.setAttribute("style", "display: none !important;");
	registerUserBtn.setAttribute("style", "display: none !important;");
	loginUserModalBlock.setAttribute("style", "display: flex !important;");
	loginUserBtn.setAttribute("style", "display: flex !important;");
});

// register logic
const USERS_API = "http://localhost:8000/users";

// inputs group
let usernameInp = document.querySelector("#reg-username");
let ageInp = document.querySelector("#reg-age");
let passwordInp = document.querySelector("#reg-password");
let passwordConfirmInp = document.querySelector("#reg-passwordConfirm");
let isAdminInp = document.querySelector("#isAdmin");
// console.log(usernameInp, ageInp, passwordInp, passwordConfirmInp, isAdminInp);

async function checkUniqueUsername(username) {
	let res = await fetch(USERS_API);
	let users = await res.json();
	return users.some(item => item.username === username);
}

async function registerUser() {
	if (!usernameInp.value.trim() || !ageInp.value.trim() || !passwordInp.value.trim() || !passwordConfirmInp.value.trim()) {
		alert("Some inputs are empty!");
		return;
	}

	let uniqueUsername = await checkUniqueUsername(usernameInp.value);

	if (uniqueUsername) {
		alert("User with this usrename already exists!");
		return;
	}

	if (passwordInp.value !== passwordConfirmInp.value) {
		alert("Passwords don't match!");
		return;
	}

	let userObj = {
		username: usernameInp.value,
		age: ageInp.value,
		password: passwordInp.value,
		isAdmin: isAdminInp.checked,
	};

	fetch(USERS_API, {
		method: "POST",
		body: JSON.stringify(userObj),
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
	});

	console.log("OK");

	usernameInp.value = "";
	ageInp.value = "";
	passwordInp.value = "";
	passwordConfirmInp.value = "";
	isAdminInp.checked = false;

	closeRegisterModalBtn.click();
}

registerUserBtn.addEventListener("click", registerUser);

// login logic
let showUsername = document.querySelector("#showUsername");

function checkLoginLogoutStatus() {
	let user = localStorage.getItem("user");
	if (!user) {
		loginUserModalBtn.parentNode.style.display = "block";
		logoutUserBtn.parentNode.style.display = "none";
		showUsername.innerText = "No user";
	} else {
		loginUserModalBtn.parentNode.style.display = "none";
		logoutUserBtn.parentNode.style.display = "block";
		showUsername.innerText = JSON.parse(user).username;
	}
	showAdminPanel();
}
checkLoginLogoutStatus();

let loginUsernameInp = document.querySelector("#login-username");
let loginPasswordInp = document.querySelector("#login-password");

function checkUserInUsers(username, users) {
	return users.some(item => item.username === username);
}

function checkUserPassword(user, password) {
	return user.password === password;
}

function setUserToStorage(username, isAdmin) {
	localStorage.setItem(
		"user",
		JSON.stringify({
			username,
			isAdmin,
		})
	);
}

async function loginUser() {
	if (!loginUsernameInp.value.trim() || !loginPasswordInp.value.trim()) {
		alert("Some inputs are empty!");
		return;
	}

	let res = await fetch(USERS_API);
	let users = await res.json();

	if (!checkUserInUsers(loginUsernameInp.value, users)) {
		alert("User not found!");
		return;
	}

	let userObj = users.find(item => item.username === loginUsernameInp.value);

	if (!checkUserPassword(userObj, loginPasswordInp.value)) {
		alert("Wrong password!");
		return;
	}

	setUserToStorage(userObj.username, userObj.isAdmin);

	loginUsernameInp.value = "";
	loginPasswordInp.value = "";

	checkLoginLogoutStatus();

	closeRegisterModalBtn.click();

	render();
}

loginUserBtn.addEventListener("click", loginUser);

// logout logic
logoutUserBtn.addEventListener("click", () => {
	localStorage.removeItem("user");
	checkLoginLogoutStatus();
	render();
});

// product logic
// create
function checkUserForProductCreate() {
	let user = JSON.parse(localStorage.getItem("user"));
	if (user) return user.isAdmin;
	return false;
}

function showAdminPanel() {
	let adminPanel = document.querySelector("#admin-panel");
	if (!checkUserForProductCreate()) {
		adminPanel.setAttribute("style", "display: none !important;");
	} else {
		adminPanel.setAttribute("style", "display: flex !important;");
	}
}

let productTitle = document.querySelector("#product-title");
let productPrice = document.querySelector("#product-price");
let productDesc = document.querySelector("#product-desc");
let productImage = document.querySelector("#product-image");
let productCategory = document.querySelector("#product-category");

const PRODUCTS_API = "http://localhost:8000/products";

async function createProduct() {
	if (!productTitle.value.trim() || !productPrice.value.trim() || !productDesc.value.trim() || !productImage.value.trim() || !productCategory.value.trim()) {
		alert("Some inputs are empty!");
		return;
	}

	let productObj = {
		title: productTitle.value,
		price: productPrice.value,
		desc: productDesc.value,
		image: productImage.value,
		category: productCategory.value,
	};

	await fetch(PRODUCTS_API, {
		method: "POST",
		body: JSON.stringify(productObj),
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
	});

	productTitle.value = "";
	productPrice.value = "";
	productDesc.value = "";
	productImage.value = "";
	productCategory.value = "";

	render();
}

let addProductBtn = document.querySelector(".add-product-btn");
addProductBtn.addEventListener("click", createProduct);

// read
async function render() {
	let productsList = document.querySelector("#products-list");
	productsList.innerHTML = "";
	let res = await fetch(PRODUCTS_API);
	let products = await res.json();
	products.forEach(item => {
		productsList.innerHTML += `
        <div class="card m-5" style="width: 18rem;">
            <img src="${item.image}" class="card-img-top" alt="error:(" height="200">
            <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text">${item.desc}</p>
                <p class="card-text">${item.category}</p>
                <p class="card-text">${item.price}</p>
                ${
									checkUserForProductCreate()
										? `<a href="#" class="btn btn-dark btn-edit" id="edit-${item.id}">EDIT</a>
                <a href="#" class="btn btn-danger btn-delete" id="del-${item.id}">DELETE</a>`
										: ""
								}
            </div>
        </div>
        `;
	});
	if (products.length === 0) return;
	addCategoryToDropdownMenu();
	addDeleteEvent();
}
render();

async function addCategoryToDropdownMenu() {
	let res = await fetch(PRODUCTS_API);
	let data = await res.json();
	let categories = new Set(data.map(item => item.category));
	// console.log(categories);
	let categoriesList = document.querySelector(".dropdown-menu");
	categoriesList.innerHTML = '<li><a class="dropdown-item" href="#">All</a></li>';
	categories.forEach(
		item =>
			(item.categoriesList.innerHTML += `
        <li><a class="dropdown-item" href="#">${item}</a></li>
    `)
	);
}

// delete
async function deleteProduct(e) {
	// console.log('OK');
	let productId = e.target.id.spit("-")[1];
	// console.log(productId);

	await fetch(`${PRODUCTS_API}/${productId}`),
		{
			method: "DELETE",
		};
	render();
}

function addDeleteEvent() {
	let deleteProductBtn = document.querySelectorAll(".btn-delete");
	deleteProductBtn.forEach(item => item.addEventListener("click", deleteProduct));
}

