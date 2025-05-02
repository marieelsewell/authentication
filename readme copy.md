# MY PROJECT
## RESOURCE
### library

Attributes:
- id
- title (string)
- author (string)
- genre (string)
- is_read (boolean)
- rating (string)

### SCHEMA
```sql
CREATE TABLE library (
    id INTEGER PRIMARY KEY,
    title TEXT,
    author TEXT,
    genre TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    rating TEXT
);
```
### users

Attributes:
- id
- first_name (string)
- last_name (string)
- email (string)
- password (string)

### SCHEMA
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password TEXT
);
```

## REST ENDPOINTS


| Name                                 | Method | Path            |
|--------------------------------------|--------|-----------------|
| Retrieve a list of all books.        | GET    | /library        |
| Get details of a single book by ID.  | GET    | /library/_id_   |
| Add a new book to library.           | PUT    | /library        |
| Update book information.             | POST   | /library/_id_   |
| Delete book from library.            | DELETE | /library/_id_   |
| create a new user.                   | PUT    | /users   |
| retrieve a user.                     | GET    | /sessions/auth |
