process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const generateRandomCompany = require('../utils/generateRandom');


let testCompany;

beforeEach(async () => {
    try {
        const { code, name,description }= generateRandomCompany();
        const result = await db.query(
            `INSERT INTO companies (code ,name, description)
            VALUES $1,$2,$3) 
            RETURNING code, name, description`,
            [code, name, description]
        );
        testCompany = result.rows[0]
    } catch (error){
        console.error('Error during beforeEach:', error);
        throw error;
    }
    
});

afterEach(async () => {
    try{
        if (testCompany){
            await db.query(
                'DELETE FROM companies where code = $1',
                 [testCompany.code]
                 );
        }
    }catch(error){
        console.error('Error during afterEach:', error)
    }
    
})

afterAll(async () => {
    try{
        await db.end()
    } catch(error){
        console.error('Error during afterAll:', error)
    }
   
});


describe('GET /companies', () => {
    test('It should return a list of companies', async () => {
        const res = await request(app).get('/companies');
        expect(res.status).toBe(200);
        expect(res.body.companies).toEqual(expect.arrayContaining([testCompany]));
        
    });
});

describe('GET /companies/:code', () => {
    test('It should return a specific company', async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ company: testCompany })
    });
    test('it should return 404 if the company code is not found', async () => {
        const nonExistentCode = 'azj';
        const res = await request(app).get(`/companies/${nonExistentCode}`);
        expect(res.status).toBe(404);
    });
});

describe('POST /companies', () => {
    test('Creates a single comapny', async () => {
        const newCompanyData = generateRandomCompany();

        const res = await request(app).post('/companies').send(newCompanyData);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('newCompany');

        const expectedCode = slugify(newCompanyData.name, { lower: true });
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
        expect(res.body.company.name).toBe(updatedCompanyData.name);
    });
    test('it should return a 404 if the company is not found', async () => {
        const res = await request(app).put(`/companies/xyz`).send({ name: 'Updated Name' });
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


