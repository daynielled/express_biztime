const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();

// Add an industry
router.post('/', async (req, res, next) => {
    try {
      const { code, industry } = req.body;
      const result = await db.query(
        `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`,
        [code, industry]
      );
  
      const newIndustry = result.rows[0];
      return res.status(201).json({ industry: newIndustry });
    } catch (e) {
      next(e);
    }
  });
  
  // List all industries with associated company codes
  router.get('/', async (req, res, next) => {
    try {
      const result = await db.query(
        `SELECT i.code, i.industry, array_agg(ci.comp_code) AS company_codes
        FROM industries AS i
        LEFT JOIN company_industries AS ci ON i.code = ci.industry_code
        GROUP BY i.code, i.industry`
      );
  
      const industries = result.rows;
      return res.json({ industries });
    } catch (e) {
      next(e);
    }
  });
  
  // Associate an industry to a company
  router.post('/:code/industries', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { industry_code } = req.body;
  
      await db.query(
        `INSERT INTO company_industries (comp_code, industry_code)
        VALUES ($1, $2)`,
        [code, industry_code]
      );
  
      return res.status(201).json({ message: 'Industry associated with the company successfully' });
    } catch (e) {
      next(e);
    }
  });
  
  
module.exports = router;