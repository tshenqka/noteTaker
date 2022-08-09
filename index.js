const { response } = require('express')
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static('build'))
require('dotenv').config()

const Note = require('./models/note')

const PORT = process.env.PORT

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!


let notes = [
    {
      id: 1,
      content: "HTML is easy",
      date: "2022-05-30T17:30:31.098Z",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only Javascript",
      date: "2022-05-30T18:39:34.091Z",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      date: "2022-05-30T19:20:14.298Z",
      important: true
    }
  ]

  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })

  app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
  })


  app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id).then(note => {
      response.json(note)
    })
  })

  const generateId = () => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => n.id))
      : 0
    return maxId + 1
  }

  app.put('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const body = request.body

    if (!body.content) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }
  
    const noteObject = {
      content: body.content,
      important: body.important || false,
      date: body.date,
      id: body.id
    }

    notes = notes.map(note => {
      if(note.id === id) {
        return noteObject
      }
      return note
    })

    //console.log(notes)

    response.json(noteObject)

  })
  
  app.post('/api/notes', (request, response) => {
    const body = request.body
  
    if (body.content === undefined) {
      return response.status(400).json({ error: 'content missing' })
    }
  
    const note = new Note({
      content: body.content,
      important: body.important || false,
      date: new Date(),
    })
  
    note.save().then(savedNote => {
      response.json(savedNote)
    })
  })

  app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
  })


  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)