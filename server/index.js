const express = require('express')
const app = express()

const {
    client,
    createTables,
    createProduct,
    fetchProduct,
    createUser,
    fetchUser,
    createFavorites,
    fetchFavorites,
    deleteFavorites
} = require('./db')

app.use(express.json())

app.get('/api/users', async(req, res, next) =>{
    try{   
        res.send(await fetchUser())

    } catch(error){
        next(error)
    }
})
app.get('/api/products', async(req, res, next) =>{
    try{
        res.send(await fetchProduct())
        
    } catch(error){
        next(error)
    }
})
app.get('/api/users/:id/favorites', async(req, res, next) =>{
    try{
        res.send(await fetchFavorites(req.params.id))
    } catch(error){
        next(error)
    }
})
app.post('/api/users/:user_id/favorites', async(req, res, next) => {
    try {
        res.status(201).send(await createFavorites({user_id: req.params.user_id, product_id: req.body.product_id}))
    } catch(error){
        next(error)
    }
})
app.delete('/api/users/:user_id/favorites/:id', async(req,res,next)=>{
    try{
        res.send(await deleteFavorites({user_id: req.params.user_id, id: req.params.id}));
        res.sendStatus(204)

    } catch(error){
        next(error)
    }
})
const init = async()=>{
    await client.connect()
    console.log('connected to database')
    await createTables()
    console.log('tables created')
    
    const [ hammer, nails, drill, screws, andres, emily, david, jane ] = await Promise.all([
        createProduct({name:'hammer'}),
        createProduct({name:'nails'}),
        createProduct({name:'drill'}),
        createProduct({name:'screws'}),
        createUser({username: 'andres', password: 'secret1'}),
        createUser({username: 'emily', password: 'secret2'}),
        createUser({username: 'david', password: 'secret3'}),
        createUser({username: 'jane', password: 'secret4'})
    ])
    console.log('list of products:', await fetchProduct())
    console.log('list of users:', await fetchUser())
    
    const favorites = await Promise.all([
        createFavorites({user_id: andres.id, product_id: hammer.id}),
        createFavorites({user_id: emily.id, product_id: drill.id}),
        createFavorites({user_id: david.id, product_id: screws.id}),
        createFavorites({user_id: jane.id, product_id: nails.id})
    ])

    const favoriteAndres = await fetchFavorites(andres.id)
    console.log('favorite of Andres:', favoriteAndres)

    console.log(`(Copy and Paste to POST): CURL -X POST localhost:3000/api/users/${david.id}/favorites -d '{"product_id":"${hammer.id}"}' -H 'Content-Type:application/json'`); 
    console.log(`(Copy and Paste to DELETE): CURL -X DELETE localhost:3000/api/users/${david.id}/favorites/${hammer.id}`);

    const port = process.env.PORT || 3000
    app.listen(port, ()=>console.log(`listening on port ${port}`))
}
init()