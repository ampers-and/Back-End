const router = require('express').Router()
const Users = require('./userModel')
const Auth = require('../auth/authModel')
const restricted = require('../utils/restricted')
const cors = require('cors')
const axios = require('axios')

router.use(cors())

/**
 * @api {get} /api/user Get User
 * @apiName GetUser
 * @apiGroup User
 * 
 * @apiHeader {json} authorization The json web token, sent to the server
 * 
 * @apiHeaderExample {json} Header-Example:
 * {
 *  "Content-Type": "application/json",
    "authorization": "sjvbhoi8uh87hfv8ogbo8iugy387gfofebcvudfbvouydyhf8377fg"
 * }
 * 
 * @apiSuccess (200) {Object} user An object depicting the user
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "username": "amy",
 *   "id": 2,
 *   "books": [
 *     {
 *       "title": "Coffee Table Book About Coffee Tables",
 *       "authors": "Cosmo Kramer",
 *       "id": 1,
 *       "rating": 5,
 *       "ISBN": "658716874168",
 *       "read": 0
 *     },
 *     {
 *       "title": "Javascript Data Structures and Algorithms",
 *       "authors": "Sammie Bae",
 *       "id": 3,
 *       "rating": 1.5,
 *       "ISBN": "574554681541",
 *       "read": 0
 *     },
 *     {
 *       "title": "Pathfinder 2nd Edition",
 *       "authors": "Logan Bonner, Jason Buhlmahn, Stephen Radney-MacFarland, and Mark Seifter",
 *       "id": 4,
 *       "rating": null,
 *       "ISBN": null,
 *       "read": 0
 *     }
 *   ],
 *   "descriptions": [
 *     {
 *       "description": "A book to set on a table, and maybe it's self-referential",
 *       "id": 1,
 *       "books": [
 *         {
 *           "id": 1,
 *           "title": "Coffee Table Book About Coffee Tables",
 *           "authors": "Cosmo Kramer",
 *           "rating": 5,
 *           "ISBN": "658716874168"
 *         },
 *         {
 *           "id": 2,
 *           "title": "Webster's Dictionary",
 *           "authors": "Webster",
 *           "rating": 2.5,
 *           "ISBN": "5758646574647"
 *         }
 *       ]
 *     },
 *     {
 *       "description": "A book about some kind of Javascript structures or methods for problem solving",
 *       "id": 3,
 *       "books": [
 *         {
 *           "id": 3,
 *           "title": "Javascript Data Structures and Algorithms",
 *           "authors": "Sammie Bae",
 *           "rating": 1.5,
 *           "ISBN": "574554681541"
 *         }
 *       ]
 *     },
 *     {
 *       "description": "A book about playing games with dragons and such",
 *       "id": 4,
 *       "books": [
 *         {
 *           "id": 4,
 *           "title": "Pathfinder 2nd Edition",
 *           "authors": "Logan Bonner, Jason Buhlmahn, Stephen Radney-MacFarland, and Mark Seifter",
 *           "rating": null,
 *           "ISBN": null
 *         }
 *       ]
 *     }
 *   ]
 * }
 * 
 * @apiError (400) {Object} bad-request-error The authorization header is absent
 * 
 * @apiErrorExample 400-Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *  "errorMessage": "No credentials provided"
 * }
 * 
 * @apiError (401) {Object} unauthorized-error The user sent an invalid token
 * 
 * @apiErrorExample 401-Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *  "errorMessage": "Invalid Credentials"
 * }
 * @apiError (500) {Object} internal-server-error Error in retrieving user info
 * 
 * @apiErrorExample 500-Error-Response:
 * HTTP/1.1 500 Internal-Server-Error
 * {
 *  "errorMessage": "Not sure until it comes up. Would be db error"
 * }
 * 
 */

router.get('/', restricted, (req, res) =>
{
    Auth.findBy({username: req.user.username})
    .then(response =>
        {
            Users.getUserWithBooksAndDesc(response[0].id)
            .then(userResponse =>
                {
                    res.status(200).json(userResponse)
                })
            .catch(err =>
                {
                    res.status(500).json(err)
                })
        })
    .catch(err =>
        {
            res.status(500).json(err)
        })
})


/**
 * @api {post} /api/user/description Post Book Description
 * @apiName PostDescription
 * @apiGroup User
 * 
 * @apiHeader {json} authorization The json web token, sent to the server
 * 
 * @apiHeaderExample {json} Header-Example:
 * {
 *  "Content-Type": "application/json",
    "authorization": "sjvbhoi8uh87hfv8ogbo8iugy387gfofebcvudfbvouydyhf8377fg"
 * }
 * 
 * @apiParam {json} description A description of the desired book
 * 
 * @apiParamExample {json} Description-Example:
 * {
 *  "description": "A book about mars"
 * }
 * 
 * @apiSuccess (200) {Object} booklist An object with the description, and an array of 5 books
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "description": "A book about mars",
 *   "books": [
 *     {
 *       "id": 7,
 *       "title": "Calculus",
 *       "authors": "Michael Spivak",
 *       "rating": 3.5,
 *       "ISBN": "565156416515648"
 *     },
 *     {
 *       "id": 3,
 *       "title": "Javascript Data Structures and Algorithms",
 *       "authors": "Sammie Bae",
 *       "rating": 1.5,
 *       "ISBN": "574554681541"
 *     },
 *     {
 *       "id": 5,
 *       "title": "Harry Potter and the Half-Blood Prince",
 *       "authors": "J.K. Rowling",
 *       "rating": 5,
 *       "ISBN": "4505406540650"
 *     },
 *     {
 *       "id": 1,
 *       "title": "Coffee Table Book About Coffee Tables",
 *       "authors": "Cosmo Kramer",
 *       "rating": 5,
 *       "ISBN": "658716874168"
 *     },
 *     {
 *       "id": 4,
 *       "title": "Pathfinder 2nd Edition",
 *       "authors": "Logan Bonner, Jason Buhlmahn, Stephen Radney-MacFarland, and Mark Seifter",
 *       "rating": null,
 *       "ISBN": null
 *     }
 *   ]
 * }
 * 
 * @apiError (400) {Object} bad-request-error The description or token is absent
 * 
 * @apiErrorExample 400-Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *  "errorMessage": "Missing description"
 * }
 * @apiErrorExample 400-Error-Response-No-Token:
 * HTTP/1.1 400 Bad Request
 * {
 *   "errorMessage": "No credentials provided"
 * }
 * @apiError (401) {Object} unauthorized-error The user sent an invalid token
 * 
 * @apiErrorExample 401-Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *  "errorMessage": "Invalid Credentials"
 * }
 * @apiError (500) {Object} internal-server-error Error in retrieving books
 * 
 * @apiErrorExample 500-Error-Response:
 * HTTP/1.1 500 Internal-Server-Error
 * {
 *  "errorMessage": "Internal Error: Could not search for books"
 * }
 * 
 */

router.post('/description',cors(), restricted, (req, res) =>
{
    if(!req.body.description)
    {
        res.status(400).json({ errorMessage: "Missing description" })
    }
    else
    {
        //TODO: replace this with call to DS
        axios.post('http://better-reads-jay.herokuapp.com/api/description', req.body)
            .then(response =>
                {   
                    let books = response.data
                    parseDataResult(books)
                    .then(bookList =>
                        {
                            Auth.findBy({username: req.user.username}).first()
                            .then(user =>
                                {
                                    Users.addUserDescWithBookResults(req.body.description, bookList, user.id)
                                    .then(response =>
                                        {
                                            res.status(200).json({description: req.body.description, books: bookList})
                                        })
                                    .catch(err =>
                                        {
                                            res.status(500).json({ errorMessage: `Internal Error: Could not search for books a` })
                                        })
                                })
                            .catch(err =>
                                {
                                    res.status(500)
                                })
                        })
                })
            .catch(error =>
                {
                    res.status(500).json({ errorMessage: `Internal Error: Could not search for books` })
                })
    }
})

async function parseDataResult(data)
{
    let bookList = []

    for(let i=0; i<data.length; i++)
    {
        let book = 
        {
            title: data[i][0],
            authors: data[i][1],
            rating: data[i][2],
            ISBN: data[i][3] || null
        }
        let bookId = await Users.addBook(book)
        book.id = bookId
        bookList.push(book)
    }
    return bookList
}

/**
 * @api {post} /api/user/book Save Book
 * @apiName PostBookSave
 * @apiGroup User
 * 
 * @apiHeader {json} authorization The json web token, sent to the server
 * 
 * @apiHeaderExample {json} Header-Example:
 * {
 *  "Content-Type": "application/json",
    "authorization": "sjvbhoi8uh87hfv8ogbo8iugy387gfofebcvudfbvouydyhf8377fg"
 * }
 * 
 * @apiParam {integer} bookId The id of the book you want to save
 * 
 * @apiParamExample {json} Book-Save-Example:
 * {
 * 	"bookId": 8
 * }
 * 
 * @apiSuccess (200) {Object} Success Object containing the updated books of the user
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "books": [
 *     {
 *       "title": "Coffee Table Book About Coffee Tables",
 *       "authors": "Cosmo Kramer",
 *       "id": 1,
 *       "rating": 5,
 *       "ISBN": "658716874168",
 *       "read": 0
 *     },
 *     {
 *       "title": "Pathfinder 2nd Edition",
 *       "authors": "Logan Bonner, Jason Buhlmahn, Stephen Radney-MacFarland, and Mark Seifter",
 *       "id": 4,
 *       "rating": null,
 *       "ISBN": null,
 *       "read": 0
 *     },
 *     {
 *       "title": "Quantum Theory",
 *       "authors": "David Bohm",
 *       "id": 8,
 *       "rating": 3,
 *       "ISBN": "6546878498468784",
 *       "read": 0
 *     }
 *   ]
 * }
 * 
 * @apiSuccess (200) {Integer} Success Id 0, the book is already saved
 * @apiSuccessExample Success-Response-Book-Already-Added:
 * HTTP/1.1 200 OK
 * 0
 * 
 * @apiError (400) {Object} bad-request-error The bookId or token is absent
 * 
 * @apiErrorExample 400-Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *  "errorMessage": "requires a bookId"
 * }
 * @apiErrorExample 400-Error-Response-No-Token:
 * HTTP/1.1 400 Bad Request
 * {
 *   "errorMessage": "No credentials provided"
 * }
 * @apiError (401) {Object} unauthorized-error The user sent an invalid token
 * 
 * @apiErrorExample 401-Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *  "errorMessage": "Invalid Credentials"
 * }
 * @apiError (500) {Object} internal-server-error Error in adding book
 * 
 * @apiErrorExample 500-Error-Response:
 * HTTP/1.1 500 Internal-Server-Error
 * {
 *  "errorMessage": "Internal Error: Could not save book"
 * }
 * 
 */

router.post('/book', restricted, (req, res) =>
{
    if(!req.body.bookId)
    {
        res.status(400).json({ errorMessage: "requires a bookId", incReq: req.body})
    }
    else
    {
        Auth.findBy({username: req.user.username})
        .then(response =>
            {
                Users.addBookByUserId(response[0].id, req.body.bookId)
                .then(bookResponse =>
                    {
                        Users.getBooksByUserId(response[0].id)
                        .then(bookList =>
                            {
                                res.status(200).json({books: bookList})
                            })
                    })
                .catch(err =>
                    {
                        console.log(err)
                        res.status(500).json(err)
                    })
            })
    }
})

/**
 * @api {delete} /api/user/book/:id Delete Book
 * @apiName DeleteBook
 * @apiGroup User
 * 
 * @apiHeader {json} authorization The json web token, sent to the server
 * 
 * @apiHeaderExample {json} Header-Example:
 * {
 *  "Content-Type": "application/json",
    "authorization": "sjvbhoi8uh87hfv8ogbo8iugy387gfofebcvudfbvouydyhf8377fg"
 * }
 * 
 * @apiParam {Integer} bookId The id of the book you want to delete as a param on the url
 * 
 * @apiParamExample {URL} Book-Delete-Example:
 * https://better-reads-bw.herokuapp.com/api/user/book/8
 * 
 * @apiSuccess (200) {Object} Success Object containing the user's remaining books
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "bookList": [
 *     {
 *       "title": "Coffee Table Book About Coffee Tables",
 *       "authors": "Cosmo Kramer",
 *       "id": 1,
 *       "rating": 5,
 *       "ISBN": "658716874168",
 *       "read": 0
 *     },
 *     {
 *       "title": "Pathfinder 2nd Edition",
 *       "authors": "Logan Bonner, Jason Buhlmahn, Stephen Radney-MacFarland, and Mark Seifter",
 *       "id": 4,
 *       "rating": null,
 *       "ISBN": null,
 *       "read": 0
 *     }
 *   ]
 * }
 * 
 * @apiError (400) {Object} bad-request-error The bookId or token is absent
 * 
 * @apiErrorExample 400-Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *  "errorMessage": "requires a bookId"
 * }
 * @apiErrorExample 400-Error-Response-No-Token:
 * HTTP/1.1 400 Bad Request
 * {
 *   "errorMessage": "No credentials provided"
 * }
 * 
 * @apiError (401) {Object} unauthorized-error The user sent an invalid token
 * 
 * @apiErrorExample 401-Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *  "errorMessage": "Invalid Credentials"
 * }
 * 
 * @apiError (404) {String} No-Book-Error A message that the book was not saved for the user
 * @apiErrorExample 404-Error-Response-No-Book:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Book is not in list"
 * }
 * 
 * @apiError (500) {Object} internal-server-error Error in deleting book
 * 
 * @apiErrorExample 500-Error-Response:
 * HTTP/1.1 500 Internal-Server-Error
 * {
 *  "errorMessage": "Internal Error: Could not delete book"
 * }
 * 
 */

router.delete('/book/:id', restricted, (req, res) =>
{
    if(!req.params.id)
    {
        res.status(400).json({ errorMessage: "requires a bookId", incReq: req.params.id})
    }
    else
    {
        Auth.findBy({username: req.user.username})
        .then(response =>
            {
                Users.removeBookByUserId(response[0].id, req.params.id)
                .then(bookResponse =>
                    {
                        Users.getBooksByUserId(response[0].id)
                        .then(list =>
                            {
                                res.status(bookResponse.code).json({bookList: list})
                            })
                    })
                .catch(err =>
                    {
                        console.log(err)
                        res.status(500).json({errorMessage: "Internal Error: Could not delete book"})
                    })
            })
    }
})

/**
 * @api {put} /api/user/book Put Book
 * @apiName PutBook
 * @apiGroup User
 * 
 * @apiHeader {json} authorization The json web token, sent to the server
 * 
 * @apiHeaderExample {json} Header-Example:
 * {
 *  "Content-Type": "application/json",
    "authorization": "sjvbhoi8uh87hfv8ogbo8iugy387gfofebcvudfbvouydyhf8377fg"
 * }
 * 
 * @apiParam {Integer} bookId The id of the book you want to delete
 * @apiParam {Boolean} read The boolean of whether the book has been read or not
 * 
 * @apiParamExample {json} Book-Put-Example:
 * { 
 * 	 "bookId": 4,
 * 	 "changes": {"read": true}
 * }
 * 
 * @apiSuccess (200) {Object} Success The updated booklist for the user
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "books": [
 *     {
 *       "title": "Coffee Table Book About Coffee Tables",
 *       "authors": "Cosmo Kramer",
 *       "id": 1,
 *       "rating": 5,
 *       "ISBN": "658716874168",
 *       "read": 0
 *     },
 *     {
 *       "title": "Pathfinder 2nd Edition",
 *       "authors": "Logan Bonner, Jason Buhlmahn, Stephen Radney-MacFarland, and Mark Seifter",
 *       "id": 4,
 *       "rating": null,
 *       "ISBN": null,
 *       "read": 1
 *     }
 *   ]
 * }
 * @apiError (400) {Object} bad-request-error The bookId or token is absent
 * 
 * @apiErrorExample 400-Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *  "errorMessage": "requires a bookId"
 * }
 * @apiErrorExample 400-Error-Response-No-Token:
 * HTTP/1.1 400 Bad Request
 * {
 *   "errorMessage": "No credentials provided"
 * }
 * 
 * @apiError (401) {Object} unauthorized-error The user sent an invalid token
 * 
 * @apiErrorExample 401-Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *  "errorMessage": "Invalid Credentials"
 * }
 * 
 * @apiError (404) {String} No-Book-Error A message that the book was not saved for the user
 * @apiErrorExample 404-Error-Response-No-Book:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Book is not in list"
 * }
 * 
 * @apiError (500) {Object} internal-server-error Error in updating book
 * 
 * @apiErrorExample 500-Error-Response:
 * HTTP/1.1 500 Internal-Server-Error
 * {
 *  "errorMessage": "Internal Error: Could not update book"
 * }
 * 
 */

router.put('/book', restricted, (req, res) =>
{
    if(!req.body.bookId || !req.body.changes)
    {
        res.status(400).json({ errorMessage: "requires a bookId and changes for the book" })
    }
    else
    {
        Auth.findBy({username: req.user.username})
        .then(response =>
            {
                Users.updateBookByUserId(response[0].id, req.body.bookId, req.body.changes)
                .then(bookResponse =>
                    {
                        Users.getBooksByUserId(response[0].id)
                        .then(bookList =>
                            {
                                res.status(bookResponse.code).json({books: bookList})
                            })
                    })
                .catch(err =>
                    {
                        console.log(err)
                        res.status(500).json({errorMessage: "Internal Error: Could not update book"})
                    })
            })
    }
})

/**
 * @api {delete} /api/user/description/:id Delete Description
 * @apiName DeleteDescription
 * @apiGroup User
 * 
 * @apiHeader {json} authorization The json web token, sent to the server
 * 
 * @apiHeaderExample {json} Header-Example:
 * {
 *  "Content-Type": "application/json",
    "authorization": "sjvbhoi8uh87hfv8ogbo8iugy387gfofebcvudfbvouydyhf8377fg"
 * }
 * 
 * @apiParam {Integer} descriptionId The id of the description you want to delete as a param on the url
 * 
 * @apiParamExample {URL} Description-Delete-Example:
 * https://better-reads-bw.herokuapp.com/api/user/description/1
 * 
 * 
 * @apiSuccess (200) {Object} Success An object containing the remaining descriptions for the user
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "descriptions": [
 *     {
 *       "description": "A book about some kind of Javascript structures or methods for problem solving",
 *       "id": 3,
 *       "books": [
 *         {
 *           "id": 3,
 *           "title": "Javascript Data Structures and Algorithms",
 *           "authors": "Sammie Bae",
 *           "rating": 1.5,
 *           "ISBN": "574554681541"
 *         }
 *       ]
 *     },
 *     {
 *       "description": "A book about playing games with dragons and such",
 *       "id": 4,
 *       "books": [
 *         {
 *           "id": 4,
 *           "title": "Pathfinder 2nd Edition",
 *           "authors": "Logan Bonner, Jason Buhlmahn, Stephen Radney-MacFarland, and Mark Seifter",
 *           "rating": null,
 *           "ISBN": null
 *         }
 *       ]
 *     }
 *   ]
 * }
 * @apiError (400) {Object} bad-request-error The descriptionId or token is absent
 * 
 * @apiErrorExample 400-Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *  "errorMessage": "requires a descriptionId"
 * }
 * @apiErrorExample 400-Error-Response-No-Token:
 * HTTP/1.1 400 Bad Request
 * {
 *   "errorMessage": "No credentials provided"
 * }
 * 
 * @apiError (401) {Object} unauthorized-error The user sent an invalid token
 * 
 * @apiErrorExample 401-Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *  "errorMessage": "Invalid Credentials"
 * }
 * 
 * @apiError (404) {String} No-Description-Error A message that the description was not saved for the user
 * @apiErrorExample 404-Error-Response-No-Desc:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Description is not in list"
 * }
 * 
 * @apiError (500) {Object} internal-server-error Error in deleting description
 * 
 * @apiErrorExample 500-Error-Response:
 * HTTP/1.1 500 Internal-Server-Error
 * {
 *  "errorMessage": "Internal Error: Could not delete description"
 * }
 * 
 */

router.delete('/description/:id', restricted, (req, res) =>
{
    if(!req.params.id)
    {
        res.status(400).json({ errorMessage: "requires a description id param" })
    }
    else
    {
        Auth.findBy({username: req.user.username})
        .then(response =>
            {
                Users.removeDescByUserId(response[0].id, req.params.id)
                .then(descResponse =>
                    {
                        Users.getDescriptionsByUserId(response[0].id)
                        .then(descList =>
                            {
                                res.status(descResponse.code).json({descriptions: descList})
                            })
                    })
                .catch(err =>
                    {
                        console.log(err)
                        res.status(500).json({errorMessage: "Internal Error: Could not delete description"})
                    })
            })
    }
})


module.exports = router