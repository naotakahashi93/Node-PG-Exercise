process.env.NODE_ENV = "test"

const request = require("supertest")

const app= require("../app");
const db = require("../db")

let testInvoice; 

let testComp; 

beforeEach(async function(){
    let res = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('test', 'Test', 'Test Descripp')
        returning code, name, description`
    )
    testComp = res.rows[0]
})

beforeEach(async function(){
    let res = await db.query(
        `INSERT INTO invoices (comp_code, amt)
        VALUES ('test', '400')
        RETURNING id, comp_code, amt`
    )
    testInvoice = res.rows[0]
})

afterEach(async function(){
    await db.query(
        `DELETE FROM invoices`
    )
})

afterAll( async function(){
    await db.end()
})

describe("GET /invoices", function(){
    test("gets all companies", async function(){
        const res = await request(app).get(`/invoices`);
        expect(res.statusCode).toEqual(200)
    })
})


