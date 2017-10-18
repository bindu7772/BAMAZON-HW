var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) {
        console.log("Error in database connection");
    }
    console.log("connected as id " + connection.threadId);
    displayProducts();
});

//Function for display products
function displayProducts() {
    console.log("========================================");
    console.log("Items available for Sale");
    console.log("========================================");

    //Selecting all the data from table
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) {
            console.log("Error in Select query");
        }

        var table = new Table({
            head: ['ID', 'Item Name', 'Department Name', 'Price', 'Stock Quantity']

        });

        for (var i = 0; i < res.length; i++) {
            var productArr = [];
            for (var key in res[i]) {
                productArr.push(res[i][key]);
                // table is an Array, so you can `push`, `unshift`, `splice` and friends 
            }
            table.push(productArr);
        }


        console.log(table.toString());
        // Log all results of the SELECT statement
        //console.log(res);
        placeOrder();
    });

}

//Function to place orders
function placeOrder() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Please enter the ID of an item:"
    },

    {
        name: "quantity",
        type: "input",
        message: "How many units of the product you would like to buy?"
    }])
          .then(function (answer) {
              var temp = "SELECT stock_quantity,price FROM products WHERE ?";
              var id = parseInt(answer.id);
              connection.query(temp, { item_id: id }, function (err, data) {
                  //console.log(data[0].price);
                  if (err) {
                      console.log(err);
                  }

                  if (data[0].stock_quantity >= parseInt(answer.quantity)) {
                      //Query for Update quantity
                      var q = data[0].stock_quantity - parseInt(answer.quantity);
                      console.log(id);
                      connection.query("UPDATE products SET ? WHERE ?", [{ stock_quantity: q }, { item_id: id }], function (err, q_data) {
                          if (err) {
                              return console.log(err);
                          }
                          console.log("Quantity updated");
                          var p = data[0].price * parseInt(answer.quantity);
                          console.log("Total price: " + p);
                      });

                  }
                  else {
                      console.log("Insufficient Quantity!");
                  }
                  connection.end();
              });
          });
}