process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { default: slugify } = require('slugify');

let testCompany;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code ,name, description) VALUES ('jbl', 'JBL', 'speakers') RETURNING  id, code, name, description`);
    testCompany = result.rows[0]
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})


describe('GET /companies', () => {
    test('It should return a list of companies', async () => {
        const res = await request(app).get('/companies');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('companies');
        expect(res.body).toEqual({company: [testCompany]});
        expect(res.body.companies).toBeInstanceOf(Array);
    });
});

describe('GET /companies/:code', () => {
    test('It should return a specific company', async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({company: testCompany})
    });
    test('it should return 404 if the company is not found', async() => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.status).toBe(404);
    });
});

describe('POST /companies', () => {
    test('Creates a single comapny', async() => {
        const newCompanyData ={
            code: 'dpw', 
            name: 'Deer Park',
            description: 'Water distributor'
        };

        const res = await request(app).post('/companies').send(newCompanyData);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('newCompany');

        const expectedCode = slugify(newCompanyData.name, {lower:true});
        expect(res.body.newCompany.code).toBe(expectedCode);
        });
    });

describe("PUT /users/:id", () => {
    test("Updates a single company", async () => {
        const updatedCompanyData = {
            code: 'ncc',
            name: 'Updated Company',
            description: 'An updated company description'
          };
          const res = await request(app).put(`/companies/ncc`).send(updatedCompanyData);
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('company');
          expect(res.body.company.name).toBe(updatedCompanyData.name);
        });
        test('it should return a 404 if the company is not found', async () => {
          const res = await request(app).put(`/companies/xyz`).send({ name: 'Updated Name'});
          expect(res.status).toBe(404);
        });
      });

      describe("DELETE /companies/:code", () => {
        test("Deletes a single company", async () => {
          const res = await request(app).delete(`/companies/${testCompany.code}`);
          expect(res.status).toBe(200);
          expect(res.body).toEqual({ status: 'deleted' })

          const getRes = await request(app).get('/companies');
          expect(getRes.body.companies).not.toContainEqual(testCompany);
        });
      });


