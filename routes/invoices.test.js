process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const generateRandomInvoice = require('../utils/generateRandom');

let testInvoice;

beforeEach(async () => {
    try {
        const comp_codes = ['testCompany1'];
        const newInvoiceData = generateRandomInvoice(comp_codes);

        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt`,
            [newInvoiceData.comp_code, newInvoiceData.amt]
        );

        testInvoice = result.rows[0];
    } catch (error) {
        console.error('Error during beforeEach:', error);
        throw error;
    }
});

afterEach(async () => {
    try {
        if (testInvoice) {
            await db.query(
                'DELETE FROM invoices WHERE id = $1',
                [testInvoice.id]
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

describe('GET /invoices', () => {
  test('It should return a list of invoices', async () => {
    const res = await request(app).get('/invoices');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('invoices');
    expect(res.body.invoices).toBeInstanceOf(Array);
  });
});

describe('GET /invoices/:id', () => {
  test('It should return a specific invoice', async () => {
    const res = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('invoice');
  });

  test('It should return 404 if the invoice is not found', async () => {
    const nonExistentId = testInvoice.id + 5;
    const res = await request(app).get(`/invoices/${nonExistentId}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /invoices', () => {
    test('Creates a single invoice', async () => {
      const comp_codes = ['testCompany1'];
      const newInvoiceData = generateRandomInvoice(comp_codes);
  
      const res = await request(app).post('/invoices').send(newInvoiceData);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('invoice');
    });
  });
  
  describe('PUT /invoices/:id', () => {
    test('Updates a single invoice', async () => {
      const updatedInvoiceData = generateRandomInvoice(['testCompany1']);
  
      const res = await request(app).put(`/invoices/${testInvoice.id}`).send(updatedInvoiceData);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('invoice');
    });
  
  test('It should return 404 if the invoice is not found', async () => {
    const res = await request(app).put('/invoices/999').send({ amt: 200 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /invoices/:id', () => {
  test('Deletes a single invoice', async () => {
    const res = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'deleted' });
  });

  test('It should return 404 if the invoice is not found', async () => {
    const res = await request(app).delete('/invoices/999');
    expect(res.status).toBe(404);
  });
});
