const express = require("express");
const slugify = require('slugify')
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();


// Returns list of companies
router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT * FROM companies 
      ORDER BY name`);
    const companies = results.rows;
    return res.json({ companies })
  } catch (e) {
    return next(e);
  }
})

// Return obj of company using company code
router.get('/:code', async (req, res, next) => {
  try {
    let code = req.params.code;

    const compResult = await db.query(
      `SELECT * FROM companies
      WHERE code = $1 `,
      [code]
    );

    const invResult = await db.query(
      `SELECT id
       FROM invoices
       WHERE comp_code = $1`,
      [code]
    );
    if (compResult.rows.length === 0) {
      throw new ExpressError(`Company code ${code} not found`, 404)
    }
    const company = compResult.rows[0];
    const invoices = invResult.rows;
    company.invoices = invoices.map(inv => inv.id);

    return res.json({ 'company': company })
  }
  catch (e) {
    return next(e);
  }
});

// Adds a new company
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true });

    const result = await db.query(
      `INSERT INTO companies (code, name, description)
      VALUES ($1,$2,$3)
      RETURNING code,name,description`,
      [code, name, description]
    );

    const newCompany = result.rows[0];
    return res.status(201).json({ company: newCompany })
  } catch (e) {
    next(e);
  }
});

// Edit existing company
router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;

    const result = await db.query(
      `UPDATE companies
     SET name=$1, description=$2
     WHERE code=$3 
     RETURNING code,name,description`,
      [code, name, description]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Company not found: ${code}`, 404)
    }
    const updatedCompany = result.rows[0];
    return res.json({ company: updatedCompany });
  } catch (e) {
    next(e)
  }
});

// Delete company
router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(
      `DELETE FROM companies
       WHERE code=$1
       RETURNING code`,
      [code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Company not found: ${code}`, 404)

    }
    return res.json({ status: 'deleted' })

  } catch (e) {
    next(e);
  }
});



module.exports = router;