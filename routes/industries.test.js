process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const generateRandomIndustry = require('../utils/generateRandom');


let testIndustry;
let industryCode;

beforeEach(async () => {
  try {
    const { code, industry } = generateRandomIndustry();
    const result = await db.query(
      `INSERT INTO industries (code, industry)
             VALUES ($1, $2)
             RETURNING code, industry`,
      [code, industry]
    );
    testIndustry = result.rows[0];
  } catch (error) {
    console.error('Error during beforeEach:', error);
    throw error;
  }
});

afterEach(async () => {
  try {
    if (testIndustry) {
      await db.query(
        'DELETE FROM industries WHERE code = $1',
        [testIndustry.code]
      );
    }
  } catch (error) {
    console.error('Error during afterEach:', error);
  }
});

afterAll(async () => {
  try {
    await db.end()
  } catch (error) {
    console.error('Error during afterAll:', error);
  }
});


describe('POST /', () => {
  test('It should add a new industry', async () => {
    const newIndustry = {
      code: 'tech',
      industry: 'Technology',
    };

    const res = await request(app).post('/industries').send(newIndustry);
    expect(res.status).toBe(201);
    expect(res.body.industry.code).toBe(newIndustry.code);
    expect(res.body.industry.industry).toBe(newIndustry.industry);

    industryCode = newIndustry.code;
  });
});

describe('GET /', () => {
  test('It should list all industries with associated company codes', async () => {
    const res = await request(app).get('/industries');

    expect(res.status).toBe(200);
    expect(res.body.industries).toBeInstanceOf(Array);
   
  });
});

describe('POST /:code/industries', () => {
  test('It should associate an industry with a company', async () => {
    const association = {
      industry_code: industryCode,
    };

    const res = await request(app)
      .post(`/companies/ibm/industries`).send(association);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Industry associated with the company successfully');
  });
});

