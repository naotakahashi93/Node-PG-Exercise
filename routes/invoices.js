const express = require("express");
const ExpressError = require("../expressError");

const router = new express.Router()

const db = require("../db")

router.get("/", async function(req, res, next){
    try{
        const result = await db.query(
            `SELECT *
            FROM invoices`
        )
        return res.json({invoices: result.rows})
    }catch(e){
        next(e)
    }
})

//Returns obj on given invoice.
//If invoice cannot be found, returns 404.
//Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}


router.get("/:id", async function(req, res, next){
    try{
        const result = await db.query(
            `SELECT i.id,
                    i.comp_code, 
                    i.amt,
                    i.paid,
                    i.add_date, 
                    i.paid_date,
                    c.name, 
                    c.description 
            FROM invoices as i
            INNER JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id=$1`,
            [req.params.id]
        );

        if(result.rows.length === 0) { // if there is nothing in results.rows AKA no company was found 
            throw new ExpressError(`No such invoice: ${req.params.id}`, 404)
          }
        else{
        return res.json({invoice:{id:result.rows[0].id, 
                                amt:result.rows[0].amt,
                                paid:result.rows[0].paid,
                                add_date:result.rows[0].add_date,
                                paid_date: result.rows[0].paid_date,
                                company: {code: result.rows[0].code,
                                        name: result.rows[0].name,
                                        description: result.rows[0].description}
                                }})
        }
        
    }
    
    catch(e){
        next(e)
    }
})


router.post("/", async function(req, res, next){
    try{
        const {comp_code, amt} = req.body;

        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt`,
            [comp_code, amt]
        )

        if(result.rows.length === 0 ){
            throw new ExpressError(`No such invoice: ${req.params.id}`, 404)
        }
        else{
            return res.json({invoice:result.rows})
        }

    }
    catch(e){
        next(e)
    }
})


router.put("/:id", async function(req, res, next){
    try{
        const amt = req.body.amt

        const result = await db.query(
            `UPDATE invoices SET amt=$1
            WHERE id=$2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, 
            [amt, req.params.id]
        )

        if(result.rows.length === 0){
            throw new ExpressError(`No such invoice: ${req.params.id}`, 404)
        }
        else{
            return res.json({invoice: result.rows[0]})
        }

    }
    catch(e){
        next(e)
    }
})

router.delete("/:id", async function(req, res, next){
    try{
        const result = await db.query(
            `DELETE FROM invoices 
            WHERE id=$1
            RETURNING id`,
            [req.params.id]
        )

        
            return res.json({message: "Deleted!!"})
        
    }
    catch(e){
        next(e)
    }
})






module.exports = router