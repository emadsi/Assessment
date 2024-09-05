const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Get all contacts
app.get('/contacts', (req, res) => {
  db.all('SELECT * FROM contacts', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a contact by ID
app.get('/contacts/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Create a new contact
app.post('/contacts', (req, res) => {
  const { name, email, phone, address, image, registrationDate, age } = req.body;
  db.run('INSERT INTO contacts (name, email, phone, address, image, registrationDate, age) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone, address, image, registrationDate, age], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
});

// Update an existing contact
app.put('/contacts/:id', (req, res) => {
  const { name, email, phone, address, image, registrationDate, age } = req.body;
  const id = req.params.id;
  db.run('UPDATE contacts SET name = ?, email = ?, phone = ?, address = ?, image = ?, registrationDate = ?, age = ? WHERE id = ?',
    [name, email, phone, address, image, registrationDate, age, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ updated: this.changes });
    });
});

// Delete a contact
app.delete('/contacts/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM contacts WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// Add random contacts
app.post('/contacts/add-random', (req, res) => {
  axios.get('https://randomuser.me/api/?results=10&nat=us')
    .then(response => {
      const contacts = response.data.results.map(user => {
        return [
          `${user.name.first} ${user.name.last}`,
          user.email,
          user.phone,
          `${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.postcode}`,
          user.picture.large,
          new Date(user.registered.date).toISOString().split('T')[0],
          user.dob.age
        ];
      });
      const placeholders = contacts.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(',');
      const sql = `INSERT INTO contacts (name, email, phone, address, image, registrationDate, age) VALUES ${placeholders}`;
      db.run(sql, contacts.flat(), function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ added: this.changes });
      });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});