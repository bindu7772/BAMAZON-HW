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

connection.connect(function(err) {
    if (err) throw err;
    runOptions();
});

function runOptions()
{
    inquirer
    .prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "View Products for Sale",
          "View Low Inventory",
          "Add to Inventory",
          "Add New Product"
        ]
    })
    .then(function(answer) {
        switch (answer.action) {
            case "View Products for Sale":
                viewProduct();
                break;

            case "View Low Inventory":
                viewInventory();
                break;

            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Product":
                addProduct();
                break;
        }
    });
}

function viewProduct()
{
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
            }
            table.push(productArr);
        }

        console.log(table.toString());
        connection.end();
    });
}

function viewInventory()
{
    console.log("============================================");
    console.log("Low Inventory");
    console.log("============================================");
    var query = "SELECT * FROM products WHERE stock_quantity<5";
    connection.query(query,function(err,low){
        if(err)
        {
            console.log(err);
        }

        var table = new Table({
            head: ['ID', 'Item Name', 'Department Name', 'Price', 'Stock Quantity']});

        for (var i = 0; i < low.length; i++) {
            var productArr = [];
            for (var key in low[i]) {
                productArr.push(low[i][key]);
            }
            table.push(productArr);
        }
        console.log(table.toString());
        connection.end();
    });	
}

function addInventory()
{
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Please enter the ID of an item:"
    },

    	{
    	    name: "quantity",
    	    type: "input",
    	    message: "Enter number of items you want to add:"
    	}])
          .then(function (answer) {
              var temp = "SELECT stock_quantity FROM products WHERE ?";
              var id = parseInt(answer.id);

              connection.query(temp,{item_id:id},function(err,plus){
			if(err)
          {
				console.log(err);
          }

			var q = data[0].stock_quantity + parseInt(answer.quantity);

    connection.query("UPDATE products SET ? WHERE ?", [{ stock_quantity: q }, { item_id: id }], function (err, q_data) {
        if (err) {
            return console.log(err);
        }
        console.log("Quantity updated");
                          
        connection.end();
    });
});
});
}

function addProduct()
{
    inquirer.prompt([{
        name: "pName",
        type: "input",
        message: "Please enter product name:"
    },

    	{
    	    name: "dName",
    	    type: "input",
    	    message: "Please enter department name:"
    	},
	{
		
	    name: "price",
	    type: "input",
	    message: "Please enter price of the product:"
	},
	{
	    name: "sQuantity",
	    type: "input",
	    message: "Please enter stock quantity:"
	}])
          .then(function (answer) {
              var p = parseInt(answer.price);
              var q = parseInt(answer.sQuantity);
              console.log(answer.pName);

              connection.query("INSERT INTO products (product_name,department_name,price,stock_quantity) VALUES (answer.pName,answer.dName,p,q)",function(err,add_val){
                  if(err)
                  {
                      console.log(err);
                  }
                  console.log("Item added to database");
			
                  connection.end();
              });
          });
}