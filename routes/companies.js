const express = require("express");
const ExpressError = require("../expressError");
var slugify = require('slugify')

const router = new express.Router()

const db = require("../db");
const { route } = require("../app");

router.get("/", async function(req, res, next){
    try{
        const results = await db.query(
            `SELECT c.code, c.name, c.description, i.industry
            FROM companies as c
            LEFT JOIN 
            comp_industries AS ci
            ON c.code = ci.comp_code
            LEFT JOIN 
            industries AS i
            ON i.code = ci.industry_code
            `);

        return res.json({companies: results.rows})

    } catch(e){
        return next(e)
    }
})

router.get("/industries", async function(req, res, next){
    try{
        const indResult = await db.query(
        `SELECT * FROM industries;`
        ); 
     
        const result = indResult.rows // gets all industry

        for (let each in result){ // loop over each obj result (which is all industries)
            // console.log("check", result[each].code)
            let compRes = await db.query( // get the company names of the industry in question
            `SELECT c.name
            FROM companies AS c
            LEFT JOIN comp_industries AS ci
            ON c.code = ci.comp_code
            LEFT JOIN industries AS i 
            ON i.code = ci.industry_code
            WHERE i.code = '${result[each].code}'`
            ); 
            result[each].companies = compRes.rows.map(r => r.name) // add a new property to that indusctry (company) and map the company name to it and itll add as an array to that key
        }

        // console.log("check LASTT", result)
        return res.json(indResult.rows)
    }
    catch(e){
        next(e)
    }
})

router.get("/:code", async function(req, res, next){
    try{
        const results = await db.query(
            `SELECT c.code, c.name, c.description, i.industry
            FROM companies as c
            LEFT JOIN 
            comp_industries AS ci
            ON c.code = ci.comp_code
            LEFT JOIN 
            industries AS i
            ON i.code = ci.industry_code
            WHERE c.code =$1`,
            [req.params.code]);

        return res.json({company: results.rows[0]})

    } catch(e){
        return next(e)
    }
})


router.post("/", async function(req, res, next){
    try{
        const {name, description} = req.body;
        const code = slugify(name)

        const results = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            returning code, name, description`,
            [code, name, description]);

        return res.status(201).json({company: results.rows[0]})

    } catch(e){
        return next(e)
    }
})



router.post("/industries", async function(req, res, next){
    try{
        const {code, industry} = req.body;

        const results = await db.query(
            `INSERT INTO industries (code, industry)
            VALUES ($1, $2)
            returning code, industry`,
            [code, industry]);

        return res.status(201).json({industry: results.rows[0]})

    } catch(e){
        return next(e)
    }
})

router.post("/compind", async function(req, res, next){
    try{
        const {comp_code, industry_code} = req.body;

        const results = await db.query(
            `INSERT INTO comp_industries (comp_code, industry_code)
            VALUES ($1, $2)
            returning comp_code, industry_code`,
            [comp_code, industry_code]);

        return res.status(201).json({association: results.rows[0]})

    } catch(e){
        return next(e)
    }
})

router.put("/:code", async function(req, res, next){
    try{
        const { name, description} = req.body;
        const code = req.params.code
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2
            WHERE code= $3
            RETURNING code, name, description`,
            [name, description, code]);

            if(results.rows.length === 0) { // if there is nothing in results.rows AKA no company was found 
                throw new ExpressError(`No such company: ${code}`, 404)
              }
              else{
            return res.json({company: results.rows[0]})}

    } catch(e){
        return next(e)
    }
})


router.delete("/:code", async function(req, res, next){
    try{
        const results = await db.query(
            `DELETE FROM companies 
            WHERE code=$1`,
            [req.params.code]);

        return res.json({message: "Deleted!"})

    } catch(e){
        return next(e)
    }
})




module.exports = router