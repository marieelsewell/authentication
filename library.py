import sqlite3

def dict_factory(cursor, row):
 fields = []
 # Extract column names from cursor description
 for column in cursor.description:
    fields.append(column[0])

 # Create a dictionary where keys are column names and values are row values
 result_dict = {}
 for i in range(len(fields)):
    result_dict[fields[i]] = row[i]

 return result_dict

class LibraryDB:
    def __init__(self,filename):
        #connect to DB file
        self.connection = sqlite3.connect(filename)
        self.connection.row_factory = dict_factory
        #use the connection instance to perform db operations
        #create a cursor instance for the connection
        self.cursor = self.connection.cursor()

    def getAll(self):
        #now that we have an access point we can fetch all or one
        #ONLY applicable use of fetch is following a SELECT query
        self.cursor.execute("SELECT * FROM library")
        return self.cursor.fetchall()
    
    def getOne(self,book_id):
        # have to put data in array even if just one
        data = [book_id]
        # fill in ? in order
        self.cursor.execute("SELECT * FROM library WHERE id = ?",data)
        return self.cursor.fetchone()

    def create(self,title, author, genre, is_read, rating):
        data = [title, author, genre, is_read, rating]
        #add a new rollercoaster to our db
        self.cursor.execute("INSERT INTO library(title, author, genre, is_read, rating)VALUES(?,?,?,?,?)",data)
        self.connection.commit()
        return True
    
    def update(self, book_id, title, author, genre, is_read, rating):
        data = [title, author, genre, is_read, rating, book_id]
        self.cursor.execute("UPDATE library SET title = ?, author = ?, genre = ?, is_read = ?, rating = ? WHERE id = ?", data)
        self.connection.commit()

    def delete(self, book_id):
       data = [book_id]
       self.cursor.execute("DELETE FROM library WHERE id = ?", data)
       self.connection.commit()
       return True

    def close(self):
       self.connection.close()
       return True
    
    def create_user(self, first, last, email, password):
        data = [first, last, email, password]
        #add a new user to our db
        self.cursor.execute("INSERT INTO users(first_name, last_name, email, password)VALUES(?,?,?,?)",data)
        self.connection.commit()
        return True
    
    def get_user_by_email(self, email):
        data = [email]
        self.cursor.execute("SELECT * FROM users WHERE email = ?", data)
        user = self.cursor.fetchone()
        return user