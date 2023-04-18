const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

// invoices
// id, comp_code, amt, paid, add_date, paid_date

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices : results.rows})
  } catch (e) {
    return next(e);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    // const results = await db.query(`SELECT 
    // invoices.id, 
    // invoices.amt, 
    // invoices.paid, 
    // invoices.add_Date, 
    // invoices.paid_date, 
    // companies.* FROM 
    // invoices INNER JOIN 
    // companies ON 
    // invoices.comp_code = companies.code WHERE 
    // invoices.id = $1`, [id])
    const inv_results = await db.query(`SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE id=$1`, [id])
    const comp_results = await db.query(`SELECT * FROM companies FULL JOIN invoices ON companies.code = invoices.comp_code`)
    if(inv_results.rows.length===0) {
      throw new ExpressError(`Can't find invoice with id of ${id}`)
    } 
    return res.send ({invoices: inv_results.rows[0], company: comp_results.rows[0]})
  } catch (e) {
    return next(e);
  }
})

// POST /invoices
// Adds an invoice.

// Needs to be passed in JSON body of: {comp_code, amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt])
    return res.status(201).json({ invoices : results.rows[0]})
  } catch (e) {
    return next(e);
  }
})
// PUT /invoices/[id]
// Updates an invoice.

// If invoice cannot be found, returns a 404.

// Needs to be passed in a JSON body of {amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id])
    if (results.rowCount.length===0){
      throw new ExpressError(`Cannot update invoice with id of ${id}`, 404)
    }
    return res.send({invoices : results.rows[0]})
  } catch (e) {
    return next(e);
  }
})

// DELETE /invoices/[id]
// Deletes an invoice.

// If invoice cannot be found, returns a 404.

// Returns: {status: "deleted"}

router.delete('/:id', async (req, res, next) => {
  try {
    const results = db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id])
    return res.send({msg: 'DELETED!'})
  } catch (e) {
    return next(e);
  }
})


module.exports = router;