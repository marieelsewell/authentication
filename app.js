

console.log("connected")

// color picker
const colorPickerContainer = document.getElementById('color-picker-container');
let inputFavColor = document.querySelector("#colorPicker");
let saveColorButton = document.querySelector("#save-color-button");

// add book form
const addForm = document.getElementById('add-form');
let inputTitle = document.querySelector("#input-title-name");
let inputAuthor = document.querySelector("#input-author-name");
let inputGenre = document.querySelector("#input-genre");
let inputRead = document.querySelector("#input-boolean");
let inputRating = document.querySelector("#input-rating");
let saveBookButton = document.querySelector("#save-book-button");

// review section
const section = document.getElementById('section');
let libraryWrapper = document.querySelector("section");

// login form
const loginForm = document.getElementById('login-form');
let inputEmailLogin = document.querySelector("#input-email-login");
let inputPasswordLogin = document.querySelector("#input-password-login");
let loginButton = document.querySelector("#login-button");

//sign up form
const signUpForm = document.getElementById('sign-up-form');
let inputFirstName = document.querySelector("#input-first-name");
let inputLastName = document.querySelector("#input-last-name");
let inputEmail = document.querySelector("#input-email");
let inputPassword = document.querySelector("#input-password");
let saveUserButton = document.querySelector("#save-user-button");

// toggle buttons or menu items
const loginToggleButton = document.getElementById('login-toggle-button');
const signupToggleButton = document.getElementById('signup-toggle-button');
const colorToggleButton = document.getElementById('color-toggle-button');
const logoutButton = document.getElementById('logout-button');

// start of ui helpers

showForm(null);
let editId = null;

saveBookButton.onclick = saveBookToServer;
saveUserButton.onclick = saveUserToServer;  
loginButton.onclick = saveLoginToServer;


function showForm(formToShow) {
    loginForm.style.display = 'none';
    signUpForm.style.display = 'none';
    colorPickerContainer.style.display = 'none';

    if (formToShow) {
        formToShow.style.display = 'block';
    }
}

loginToggleButton.addEventListener('click', function () {
    showForm(loginForm);
});

signupToggleButton.addEventListener('click', function () {
    showForm(signUpForm);
});

colorToggleButton.addEventListener('click', function () {
    showForm(colorPickerContainer);
});



saveColorButton.addEventListener("click", function () {
    console.log("favColor: ", inputFavColor.value);
    let data = "color=" + encodeURIComponent(inputFavColor.value);

    fetch("http://localhost:8080/sessions/settings", {
        headers: {
            "Authorization": authorizationHeader(),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "PUT",
        body: data,
    }).then(function(response) {
        return response.text();
    }).then(function(text) {
        console.log(text);
        document.body.style.backgroundColor = inputFavColor.value;
    }).catch(function(error) {
        console.error("Error:", error);
    });
});

logoutButton.addEventListener('click', function () {
    logout();
});

function logout() {
    fetch("http://localhost:8080/sessions/logout", {
        method: "POST",
        headers: {
            "Authorization": authorizationHeader()
        }
    })
    .then(function(response) {
        if (response.status === 200) {
            // Remove session ID from local storage
            localStorage.removeItem("sessionID");
            // Clear books from the page
            libraryWrapper.textContent = "";
            // Update UI elements
            updateUIOnLogout();
            alert("You have been logged out.");
        } else {
            alert("Error logging out.");
        }
    })
    .catch(function(error) {
        console.error("Network error:", error);
    });
}

function updateUIOnLogin() {
    logoutButton.style.display = 'inline-block';
    loginToggleButton.style.display = 'none';
    signupToggleButton.style.display = 'none';
    addForm.style.display = 'block';
    section.style.display = 'block';
    loginForm.style.display = 'none';
    loadBooksFromServer();
}

function updateUIOnLogout() {
    logoutButton.style.display = 'none';
    loginToggleButton.style.display = 'inline-block';
    signupToggleButton.style.display = 'inline-block';
    addForm.style.display = 'none';
    libraryWrapper.textContent = "";
    section.style.display = 'none';
}

// end of ui stuff

createSessionId()


function saveLoginToServer() {
    let data = "email=" + encodeURIComponent(inputEmailLogin.value);
    data += "&password=" + encodeURIComponent(inputPasswordLogin.value);

    let URL = "http://localhost:8080/sessions/auth";
    let method = "POST";

    fetch(URL, {
        method: method,
        body: data,
        headers: {
            "Authorization" : authorizationHeader(),
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(function(response) {
        console.log("User Logged In!", response);
        if (response.status == 201) {
            alert("Login successful!");
            createSessionId();
            libraryWrapper.textContent = "";
            loadBooksFromServer();
        } else {
            alert("Login failed: Incorrect email or password.");
        }        
    })

    inputEmailLogin.value = "";
    inputPasswordLogin.value = "";
}

function saveBookToServer() {
    // QUESTION FOR LORA: what does ncodeURIComponent do?
    let data = "title=" + encodeURIComponent(inputTitle.value);
    // QUESTION FOR LORA: why do we need the '&'
    data += "&author=" + encodeURIComponent(inputAuthor.value);
    data += "&genre=" + encodeURIComponent(inputGenre.value);
    data += "&is_read=" + encodeURIComponent(inputRead.value);
    data += "&rating=" + encodeURIComponent(inputRating.value);

    let URL = "http://localhost:8080/library";
    let method = "POST";
    if(editId) {
        URL = "http://localhost:8080/library/" + editId;
        method = "PUT";
    }

    fetch(URL, {
        method: method,
        body: data,
        headers: {
            "Authorization" : authorizationHeader(),
            "Content-Type": "application/x-www-form-urlencoded"
            // QUESTION FOR LORA: why do we need ^ and where do we get it from?
        }
    }).then(function(response) {
        console.log("New Book Saved!", response);
        libraryWrapper.textContent = "";
        loadBooksFromServer();
    })

    inputTitle.value = "";
    inputAuthor.value = "";
    inputGenre.value = "";
    inputRead.value = "";
    inputRating.value = "";
    editId = null;
}

function saveUserToServer() {
    let data = "first_name=" + encodeURIComponent(inputFirstName.value);
    data += "&last_name=" + encodeURIComponent(inputLastName.value);
    data += "&email=" + encodeURIComponent(inputEmail.value);
    data += "&password=" + encodeURIComponent(inputPassword.value);

    let URL = "http://localhost:8080/users";
    let method = "POST";

    fetch(URL, {
        method: method,
        body: data,
        headers: {
            "Authorization" : authorizationHeader(),
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(function(response) {
        console.log("New User Saved!", response);
        if (response.status == 201) {
            alert("Success, you can log in.")
        } else {
            alert("Unable to sign up with that email")
        }
    })

    inputFirstName.value = "";
    inputLastName.value = "";
    inputEmail.value = "";
    inputPassword.value = "";
}

function addBook(data) {
    try {
        if (!data || !data.title || !data.author || !data.genre || data.is_read === undefined || !data.rating) {
            throw new Error("Incomplete book data provided.");
        }

        let bookTitle = document.createElement("h5");
        let bookAuthor = document.createElement("h5");
        let bookGenre = document.createElement("h5");
        let bookRead = document.createElement("h5");
        let bookRating = document.createElement("h5");
        let editButton = document.createElement("button");
        let deleteButton = document.createElement("button");

        bookTitle.textContent = "Title: " + data.title;
        bookAuthor.textContent = "Author: " + data.author;
        bookGenre.textContent = "Genre: " + data.genre;
        bookRead.textContent = data.is_read == 1 ? "Read" : "Not Read";
        bookRating.textContent = "My Rating: " + data.rating;
        editButton.textContent = "Edit";
        deleteButton.textContent = "Delete";

        libraryWrapper.appendChild(bookTitle);
        libraryWrapper.appendChild(bookAuthor);
        libraryWrapper.appendChild(bookGenre);
        libraryWrapper.appendChild(bookRead);
        libraryWrapper.appendChild(bookRating);
        libraryWrapper.appendChild(editButton);
        libraryWrapper.appendChild(deleteButton);
        libraryWrapper.appendChild(document.createElement("hr"));

        editButton.onclick = function() {
            inputTitle.value = data.title;
            inputAuthor.value = data.author;
            inputGenre.value = data.genre;
            inputRead.value = data.is_read;
            inputRating.value = data.rating;
            editId = data.id;
        };

        deleteButton.onclick = function() {
            if (confirm("Do you want to delete this item?")) {
                deleteBookFromServer(data.id);
                console.log("Item deleted.");
            } else {
                console.log("Action canceled.");
            }
        };
    } catch (error) {
        console.error("Error in addBook:", error.message);
    }
}

function loadBooksFromServer() {
    console.log("Entered load function");
    fetch("http://localhost:8080/library", {
        method: "GET",
        headers: {
            "Authorization": authorizationHeader()
        }
    })
    .then(function(response) {
        if (response.status == 401){
            return;
        }
        response.json().then(function(data){
            console.log(data);
            let books = data;
            books.forEach(addBook);
        });
    }).catch(function(error) {
        console.error("Network error:", error);
    });
}

function authorizationHeader() {
    let sessionID = localStorage.getItem("sessionID");
    if (sessionID) {
       return `Bearer ${sessionID}`;
    } else {
       return '';
    }
}
 

function createSessionId() {
    fetch("http://localhost:8080/sessions", {
        headers: {
            "Authorization": authorizationHeader()
        }
    }).then(function(response) {
        if (response.status == 200) {
            response.json().then(function (session) {
                localStorage.setItem('sessionID', session.id);
                console.log("session id from server", session.id);
                console.log("session data from server", session.data);

                if (session.data.fav_color) {
                    inputFavColor.value = session.data.fav_color;
                    document.body.style.backgroundColor = session.data.fav_color;
                }

                if (session.data.user_id) {
                    // User is logged in
                    updateUIOnLogin();
                } else {
                    // User is not logged in
                    updateUIOnLogout();
                }
            })
        }
    })
}


function deleteBookFromServer(id) {
    let URL = "http://localhost:8080/library/" + id;

    fetch(URL, {
        method: "DELETE",
        headers: {
            "Authorization" : authorizationHeader()
        }
    }).then(function(response) {
        if (response.ok) {
            console.log("Book Deleted!", response);
            libraryWrapper.textContent = "";  
            loadBooksFromServer();  
        } else {
            console.error("Error deleting book");
        }
    }).catch(function(error) {
        console.error("Network error:", error);
    });
}

