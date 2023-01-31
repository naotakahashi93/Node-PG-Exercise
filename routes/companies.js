const express = require("express");
const ExpressError = require("../expressError");

const router = new express.Router()


const db = require("../db")

router.get("/", async function(req, res, next){
    try{
        const results = await db.query(
            `SELECT * FROM companies`);

        return res.json({companies: results.rows})

    } catch(e){
        return next(e)
    }
})

router.get("/:code", async function(req, res, next){
    try{
        const results = await db.query(
            `SELECT * FROM companies
            WHERE code= $1`,
            [req.params.code]);

        return res.json({company: results.rows[0]})

    } catch(e){
        return next(e)
    }
})


router.post("/", async function(req, res, next){
    try{
        const {code, name, description} = req.body;

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