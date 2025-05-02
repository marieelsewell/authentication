from flask import Flask, request, g
from library import LibraryDB
from passlib.hash import bcrypt
from session_store import SessionStore

app = Flask(__name__)
session = SessionStore()

def load_session_data():
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        session_id = auth_header[len("Bearer "):]
    else:
        session_id = None
    if session_id:
        session_data = session.get_session_data(session_id)
        print("loaded session data", session_data)
    
    #if the session id is missing or session data invalid
    if session_id == None or session_data == None:
        #create a new session and session id
        session_id = session.create_session()
        #load the session with the new session id
        session_data = session.get_session_data(session_id)
    g.session_id = session_id
    g.session_data = session_data

# @app.route("/library/<int:book_id>", methods=["OPTIONS"])
# def handle_cors_options(book_id):
#     return "", 204, {
#         "Access-Control-Allow-Origin":"*",
#         "Access-Control-Allow-Methods" : "PUT, DELETE",
#         "Access-Control-Allow-Headers": "Content-Type"
#     }

@app.before_request
def before_request_func():
    if request.method == "OPTIONS":
        response = app.response_class("", status=204)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content, Authorization"
        return response
    load_session_data()

@app.after_request
def after_request_func(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content, Authorization"
    return response

@app.route("/sessions", methods=["GET"])
def retrieve_session():
    return {
        'id' : g.session_id,
        'data' : g.session_data
    }

@app.route("/library", methods=["GET"])
def retrieve_all_books():
    if "user_id" not in g.session_data:
        return "Unauthenticated", 401
    
    db = LibraryDB("library_db.db")
    library = db.getAll()
    return library, 200, {"Access-Control-Allow-Origin" : "*"}

@app.route("/library/<int:book_id>", methods=["GET"])
def retrieve_one_book(book_id):
    db = LibraryDB("library_db.db")
    book = db.getOne(book_id)
    if not book:
        return f"book with {book_id} not found", 404, {"Access-Control-Allow-Origin": "*"}
    return book, 200, {"Access-Control-Allow-Origin" : "*"}
    

@app.route("/library", methods=["POST"])
def create_book():
    print("The request data is: ", request.form)
    title = request.form["title"]
    author = request.form["author"]
    genre = request.form["genre"]
    is_read = request.form["is_read"]
    rating = request.form["rating"]
    db = LibraryDB("library_db.db")
    db.create(title, author, genre, is_read, rating)
    return "Created", 201, {"Access-Control-Allow-Origin" : "*"}

@app.route("/library/<int:book_id>",methods=["PUT"])
def update_book(book_id):
    print("update book with ID")
    db = LibraryDB('library_db.db')
    book = db.getOne(book_id)
    if not book:
        return f"book with {book_id} not found", 404, {"Access-Control-Allow-Origin": "*"}
    
    title = request.form["title"]
    author = request.form["author"]
    genre = request.form["genre"]
    is_read = request.form["is_read"]
    rating = request.form["rating"]
    db.update(book_id, title, author, genre, is_read, rating)
    return "Updated", 200, {"Access-Control-Allow-Origin": "*"}

@app.route("/library/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    print("delete book with id")
    db = LibraryDB('library_db.db')  
    book = db.getOne(book_id)
    if not book:
        return f"book with {book_id} not found", 404, {"Access-Control-Allow-Origin": "*"}
    
    db.delete(book_id)
    return "Deleted", 200, {"Access-Control-Allow-Origin": "*"}

@app.route("/users", methods=["POST"])
def create_user():
    print("The request data is: ", request.form)
    first = request.form["first_name"]
    last = request.form["last_name"]
    email = request.form["email"]
    password = request.form["password"]
    db = LibraryDB("library_db.db")
    if first != "" and last != "" and email != "" and password != "":
        if db.get_user_by_email(email):
            return f"User with email {email} already exists", 422, {"Access-Control-Allow-Origin" : "*"}
        else:
            encrypted_password = bcrypt.hash(password)
            db.create_user(first, last, email, encrypted_password)
            return "User Created", 201, {"Access-Control-Allow-Origin" : "*"}
    else:
        return "Missing field", 401, {"Access-Control-Allow-Origin" : "*"}
    
@app.route("/sessions/auth", methods=["POST"])
def login():
    print("The request data is: ", request.form)
    email = request.form["email"]
    password = request.form["password"]
    db = LibraryDB("library_db.db")
    # get user info by email
    user = db.get_user_by_email(email)
    if user:
        if bcrypt.verify(password, user['password']):
            g.session_data["user_id"] = user["id"]
            session.session_data[g.session_id] = g.session_data
            return "Authenticated", 201, {"Access-Control-Allow-Origin" : "*"}
        else:
            return "Unauthorized", 401, {"Access-Control-Allow-Origin" : "*"}
    else:
        return "Unauthorized: No user", 401, {"Access-Control-Allow-Origin" : "*"}
    
@app.route("/sessions/settings", methods=["PUT"])
def setFavoriteColor():
    print("Color is: ", request.form)
    color = request.form["color"]
    g.session_data["fav_color"] = color
    return "Color Saved", 200

@app.route("/sessions/logout", methods=["POST"])
def logout():
    if "user_id" in g.session_data:
        del g.session_data["user_id"]
        # Update the session store
        session.session_data[g.session_id] = g.session_data
        return "Logged out", 200, {"Access-Control-Allow-Origin": "*"}
    else:
        return "No user logged in", 400, {"Access-Control-Allow-Origin": "*"}


def run():
    app.run(port=8080)

if __name__ == "__main__":
    run()