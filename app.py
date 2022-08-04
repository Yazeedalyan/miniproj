from flask import Flask, render_template, request, redirect, url_for, flash
from flask import session as login_session
import pyrebase






config = {

  "apiKey": "AIzaSyCWteM0sMb5OE5KhY1w_LMaElO0nBQhW7c",

  "authDomain": "yazeedalyan00-d8676.firebaseapp.com",

  "projectId": "yazeedalyan00-d8676",

  "storageBucket": "yazeedalyan00-d8676.appspot.com",

  "messagingSenderId": "555134451022",

  "appId": "1:555134451022:web:f1b92fb8f7864b6fe3721f",

  "measurementId": "G-DGMFC4JCRZ",
  "databaseURL": "https://yazeedalyan00-d8676-default-rtdb.europe-west1.firebasedatabase.app/"

}

firebase = pyrebase.initialize_app(config)
auth = firebase.auth()
db = firebase.database()
app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SECRET_KEY'] = 'super-secret-key'

# Your code should be below
@app.route('/home')
def home():
    return render_template('home.html')


@app.route('/product')
def product():
    return render_template('product.html')



@app.route('/signin', methods=['GET', 'POST'])
def signin():
    error = ""
    if request.method == 'POST':
       email = request.form['email']
       password = request.form['password']
      
       try:
          login_session['user'] = auth.sign_in_with_email_and_password(email, password)
          return redirect(url_for('home'))
       except:
           error = "Authentication failed"
           return render_template("signin.html")
    else :
           return render_template("signin.html")




@app.route('/signup', methods=['GET', 'POST'])
def signup():
    error = ""
    if request.method == 'POST':
       email = request.form['email']
       password = request.form['password']
       full_name = request.form['full_name']
       username = request.form['username']

       try:
        login_session['user'] = auth.create_user_with_email_and_password(email, password)
        user = {"email" : email , 'password' : password , 'full_name' :full_name , 'username' : username}
        db.child("users").child(login_session['user']['localId']).set(user)

        return redirect(url_for('home'))

       except:
        error = "Authentication failed"
        return render_template("signup.html")
    else :
        return render_template("signup.html")



@app.route('/cart/<string:pic>')
def cart(pic):
    return render_template('cart.html', pic = pic)








@app.route('/userdata', methods=['GET', 'POST'])
def userdata():
    error = ""
    if request.method == 'POST':
        try:
         usercart = {"name" : request.form['name'] , 'phone' : request.form['phone'] , 'place' :request.form['place'] , 'anything' : request.form['anything'],"userid":login_session['user']['localId']}
         db.child("usercart").push(usercart)
         return redirect(url_for('addcart'))
        except:
         print("please follow the rules")


    return redirect(url_for('home'))

       


@app.route('/add-cart', methods=['GET', 'POST'])
def addcart():
    usersdata = db.child("usercart").get().val()
    for userdata in usersdata:
        if login_session['user']['localId']  == usersdata[userdata].get('userid'):
                return render_template("add-cart.html", usersdata = usersdata[userdata])
    else:
        return render_template("home.html")
















if __name__ == "__main__":  # Makes sure this is the main process
    app.run(debug=True)


