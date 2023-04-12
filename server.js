import express from "express";
import dotenv from "dotenv";
import pg from "pg";
import { check, validationResult } from 'express-validator';
const { Pool } = pg;

//Initialize Express
const app = express();
app.use(express.static("public"));

//Initialize dotenv
dotenv.config();
const port = process.env.PORT || 3000;

//Initialize PG
const pool = new Pool({connectionString:process.env.DATABASE_URL})
pool.connect();

app.use(express.json());

app.get("/", function(req, res) {   
    res.send("Hello, world!");
});

app.get('/api/to_do_list_db', (req, res) => {
    pool
        .query('SELECT * FROM to_do_list')
        .then((result)=> {
            console.log(result)
            res.send(result.rows)
        })
    .catch((e) => console.error(e.stack))
})
app.get('/api/to_do_list_db/:id', (req, res) => {
    const id = req.params.id; // Get the id from URL parameter
    pool
        .query('SELECT * FROM to_do_list WHERE id = $1', [id])
        .then((result) => {
            res.send(result.rows)
        })
        .catch((e) => console.error(e.stack))
})

app.patch('/api/to_do_list_db/:id', (req, res) => {
    const id = req.params.id; // Get the id from URL parameter
    const { name_, due_by, start_, complete } = req.body; // Get the updated data from request body

    pool.query('UPDATE to_do_list SET name_ = $1, due_by = $2, start_ = $3, complete = $4 WHERE id = $5 RETURNING *', [
        name_, due_by, start_, complete, id
    ])
    .then((result) => {
        if (result.rowCount === 0) {
            // If no rows were affected, return an error
            res.status(404).json({ message: 'Todo not found' });
        } else {
            // Send relevant response data to client-side
            res.json({ message: 'Todo updated successfully', to_do_list: result.rows[0] });
        }
    })
    .catch((error) => {
        // Handle database errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    });
});


app.post('/api/to_do_list_db', (req, res) => {
    // req.checkBody('name_', 'Name is required').notEmpty();
   
    // const errors = req.validationErrors();
    // if (errors) {
    //     // Return validation errors to the client-side
    //     return res.status(400).json({ errors: errors });
    // }
    pool.query('INSERT INTO to_do_list (name_, due_by, start_, complete) VALUES ($1, $2, $3, $4) RETURNING * ',[
       
        req.body.name_, 
        req.body.due_by, 
        req.body.start_,
        req.body.complete,
        
     ])
      .then((result) => {
         // Send relevant response data to client-side
         res.status(201).json({ message: "Added successfully", to_do_list: result.rows[0] });
     })
     .catch((error) => {
         // Handle database errors
         console.error(error);
         res.status(500).json({ message: "Internal server error" });
     });
}); 

app.delete('/api/to_do_list_db/:id', (req, res) => {
    const id = req.params.id; // Get the id from URL parameter

    pool.query('DELETE FROM to_do_list WHERE id = $1 RETURNING *', [id])
    .then((result) => {
        if (result.rowCount === 0) {
            // If no rows were affected, return an error
            res.status(404).json({ message: 'Todo not found' });
        } else {
            // Send relevant response data to client-side
            res.json({ message: 'Todo deleted successfully', to_do_list: result.rows[0] });
        }
    })
    .catch((error) => {
        // Handle database errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    });
});


app.listen(port, function() {
    console.log(`Server started on port ${port}`);
});