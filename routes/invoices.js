const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();

// Return info in invoices
router.get('/', async (req, res, next) => {
    try {
      const results = await db.query(
        `SELECT id, comp_code 
        FROM invoices
        ORDER BY id`);
      const invoices = results.rows;
      return res.json({ invoices })
    } catch (e) {
      return next(e);
    }
  })

// Return obj on given invoice
router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        `SELECT i.id, i.comp_code, i.amt, i.add_date, i.paid_date, c.code, c.name, c.description
        FROM invoices AS i
        INNER JOIN companies AS c on (i.comp_code = c.code)
        WHERE i.id= $1 `, 
        [id]
        );
  
      if (result.rows.length === 0) {
        throw new ExpressError(`Invoice with id of ${id} not found`, 404);
      }
      const invoice = result.rows[0];
      return res.json({ invoice })
    } catch (e) {
      return next(e);
    }
  });
  


  // Adds a new invoice
  router.post('/', async (req, res, next) => {
    try {
      const { comp_code, amt } = req.body;
      
      const result = await db.query(
       `INSERT INTO invoices (comp_code, amt)
        VALUES ($1,$2)
        RETURNING id,comp_code,amt,paid,add_date,paid_date`,
         [comp_code,amt]
         );
     
     const newInvoice = result.rows[0];
      return res.status(201).json({ invoce: newInvoice })
    } catch (e) {
      next(e);
    }
  });

  
  // Edit existing invoice- First Version
  // router.put('/:id', async (req, res, next) => {
  //   try {
  //     const { id } = req.params;
  //     const { amt } = req.body;
  
  //     const result = await db.query(
  //       `UPDATE invoices
  //      SET amt=$1
  //      WHERE id=$2 
  //      RETURNING id,comp_code,amt,paid,add_date,paid_date`,
  //       [amt, id]
  //       );
  
  //     if (result.rows.length === 0) {
  //       throw new ExpressError(`Invoice ${id} not found `, 404)
  //     }
  //     const updatedInvoice = result.rows[0];
  //     return res.json({ invoice: updatedInvoice });
  //   } catch (e) {
  //     next(e)
  //   }
  // });


  // Allow paying of an invoice
  router.put("/:id", async function (req, res, next) {
    try {
      let {amt, paid} = req.body;
      let id = req.params.id;
      let paidDate = null;
  
      const currResult = await db.query(
            `SELECT paid
             FROM invoices
             WHERE id = $1`,
          [id]);
  
      if (currResult.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${id}`, 404);
      }
  
      const currPaidDate = currResult.rows[0].paid_date;
  
      if (!currPaidDate && paid) {
        paidDate = new Date();
      } else if (!paid) {
        paidDate = null
      } else {
        paidDate = currPaidDate;
      }
  
      const result = await db.query(
            `UPDATE invoices
             SET amt=$1, paid=$2, paid_date=$3
             WHERE id=$4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
          [amt, paid, paidDate, id]);
  
      return res.json({"invoice": result.rows[0]});
    }
  
    catch (err) {
      return next(err);
    }
  
  });


  // Delete invoice
  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        `DELETE FROM invoices
         WHERE id=$1
         RETURNING id`, 
         [id]
         );
  
      if (result.rows.length === 0) {
        throw new ExpressError(`Invoice not found: ${id}`, 404)
  
      }
      return res.json({ status: 'deleted' })
  
    } catch (e) {
      next(e);
    }
  });
  
  
  
  module.exports = router;