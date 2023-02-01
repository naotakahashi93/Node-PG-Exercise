process.env.NODE_ENV = "test"

const request = require("supertest")

const app= require("../app");
const db = require("../db")

let testComp; 

beforeEach(async function(){
    let res = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('test', 'Test', 'Test Descripp')
        returning code, name, description`
    )
    testComp = res.rows[0]
})

afterEach(async function(){
    await db.query(
        `DELETE FROM companies`
    )
})

afterAll( async function(){
    await db.end()
})

describe("GET /companies", function(){
    test("gets all companies", async function(){
        const res = await request(app).get(`/companies`);
        expect(res.statusCode).toEqual(200)
    })
})

describe("POST /companies", function(){
    test("create a companies", async function(){
        const res = await request(app).post(`/companies`)
        .send(
            {
                code: "t",
                name: "T",
                description: "ttt"
            }
        );
        expect(res.statusCode).toEqual(201)
       
    })
})