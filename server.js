const express = require('express'); //requiring express from node modules
const app = express(); //creating an express application named 'app'
const bodyParser = require('body-parser'); //require body-parser from node modules

const environment = process.env.NODE_ENV || 'development'; //setting environment mode to development if there is no NODE_ENV set
const configuration = require('./knexfile')[environment]; //requiring environment from knexfile
const database = require('knex')(configuration); //requiring knex from node modules and currying the configuration set above to a variable called 'database'

app.set('port', process.env.PORT || 3000); //assigning port to value of PORT in environment or 3000 if nothing is set
app.locals.title = "Palette Picker"; //assigning local variable within the app to 'Palette Picker'

app.use(bodyParser.json()); //mounting bodyParser middleware that was required on line 3
app.use(express.static('public')); //mounting built in middleware in Express for serving static files

app.get('/api/v1/projects', (request, response) => { //using Express for routing HTTP GET requests to '/api/v1/projects' to perform functions below
  database('projects').select() //using knex to create SELECT * (all) query on 'projects' table
    .then((projects) => { //chaining .then on promise returned from knex
      response.status(200).json(projects); //sending a response with HTTP status code 200 (OK) with json body of all projects from the table
    })
    .catch((error) => { //chaining .catch for any errors
      response.status(500).json({ error }); //sending a response with HTTP status code 500 (Internal Server Error) with json body of error
    });
});

app.post('/api/v1/projects', (request, response) => { //using Express for routing HTTP POST request to '/api/v1/projects'
  const projectInfo = request.body; //setting variable from HTTP request body

  for (let requiredParameter of ['project_name']) { //iterating through array of requiredParameters for request body (specficied in this function)
    if(!projectInfo[requiredParameter]) { //conditional checking if requiredParameter is not in HTTP request body
      return response.status(422).send({ //sending response with HTTP status code 422 (Unprocessable Entity) and error message on line 31
        error: `Expected format: { project_name: <String> }. You are missing a "${requiredParameter}" property.` //setting error message in response
      });
    }
  }

  database('projects').insert(projectInfo, 'id') //using knex to create INSERT query taking in request.body as the data and returning primary key 'id' set in the migration
    .then(project => { //chaining .then on promise return from knex
      const { project_name } = projectInfo; //destructuring variable from HTTP request body
      response.status(201).json({ id: project[0], project_name }); //sending HTTP response with status code 201 (Created) with json body of object with keys 'id' and 'project_name'
    })
    .catch(error => { //chaining .catch for any errors
      response.status(500).json({ error }); //sending a response with HTTP status code 500 (Internal Server Error) with json body of error
    });
});

app.get('/api/v1/projects/:id/', (request, response) => { //using Express for routing HTTP GET request to '/api/v1/projects/[project_id]/'
  database('projects').where('id', request.params.id).select() //using knex to do a SELECT query with WHERE clause that 'id' in table 'projects' matches request parameter 'id' provided in HTTP request
    .then((projects) => { //chaining .then on promise returned from knex
      if(projects.length) { //conditional checking if query from 'projects' table has an array with a length
        response.status(200).json(projects); //sending response with HTTP status code 200 (OK) with json body of all projects which matched the WHERE clause on line 47
      } else { //else for when query from 'projects' table does not have an array with a length
        response.status(404).json({ //sending response with HTTP status code 404 (Not Found) and json body of error message on line 53
          error: `Could not find project with id ${request.params.id}` //setting error message in response
        });
      }
    })
    .catch(error => { //chaining .catch for any errors
      response.status(500).json({ error }); //sending a response with HTTP status code 500 (Internal Server Error) with json body of error
    });
});

app.get('/api/v1/palettes', (request, response) => { //using Express for routing HTTP GET request to '/api/v1/palettes'
  database('palettes').select() //using knex to do a SELECT * (all) query on table 'palettes'
    .then((palettes) => { //chaining .then on promise return from knex
      response.status(200).json(palettes); //sending a response with HTTP status code 200 (OK) with json body of all 'palettes' from table
    })
    .catch((error) => { //chaining .catch for any errors
      response.status(500).json({ error }); //sending a response with HTTP status code 500 (Internal Server Error) with json body of error
    });
});

app.post('/api/v1/palettes', (request, response) => { //using Express for routing HTTP POST request to '/api/v1/palettes'
  const paletteInfo = request.body; //setting variable based on HTTTP request body
  const paletteParams = ['palette_name', 'color1', 'color2', 'color3', 'color4', 'color5']; //setting variable for requiredParameters

  for(let requiredParameter of paletteParams) { //iterating through array of paletteParams
    if(!paletteInfo[requiredParameter]) { //conditional checking if requiredParameter is not in HTTP request body
      return response.status(422).send({ //sending response with HTTP status code 422 (Unprocessable Entity) and error message on line 79
        error: `Expected format: { palette_name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String>}. You are missing a "${requiredParameter}" property.` //setting error message in response
      });
    }
  }

  database('palettes').insert(paletteInfo, 'id') //using knex to create INSERT query taking in request.body as the data and returning primary key 'id' set in the migration
    .then(palette => { //chaining .then on promise return from knex
      const {
        palette_name,
        color1,
        color2,
        color3,
        color4,
        color5
      } = paletteInfo; //destructuring variables from request.body passed to INSERT query
      response.status(201).json({ //sending a response with HTTP status code 201 (Created) and json body of object with keys of 'id', 'palette name', 'color1', 'color2', 'color3', 'color4', and 'color5'
        id: palette[0],
        palette_name,
        color1,
        color2,
        color3,
        color4,
        color5
      });
    })
    .catch(error => { //chaining .catch for any errors
      response.status(500).json({ error }); //sending a response with HTTP status code 500 (Internal Server Error) with json body of error
    });
});

app.delete('/api/v1/palettes/:id/', (request, response) => { //using Express for routing HTTP DELETE request to /api/v1/palettes/[palette_id]/
  database('palettes').where('id', request.params.id).del() //using knex to use the DELETE with WHERE clause where 'id' and matches 'id' provided in request parameter
    .then(palette => { //chaining .then on promise return from knex
      if (palette) { //conditional checking if response is truthy
        response.status(204).json(); //sending a response with HTTP status code 204 (No Content) and json of nothing to resolve promise
      } else {
        response.status(404).json({ //sending a response with HTTP status code 404 (Not Found) with json body of error message on line 116
          error: `Could not find palette with id ${request.params.id}` //setting error message in response
        })
      }
    })
    .catch(error => { //chaining .catch for any errors
      response.status(500).json({ error }); //sending a response with HTTP status code 500 (Internal Server Error) with json body of error
    });
});

app.get('/api/v1/projects/:id/palettes', (request, response) => { //using Express for routing HTTP GET request to '/api/v1/projects/[project_id]/palettes'
  database('palettes').where('project_id', request.params.id).select() //using knex to do a SELECT * (all) query with WHERE clause that 'project_id' in table 'palettes' matches request parameter 'id' provided in HTTP request
    .then((palettes) => { //chaining .then on promise return from knex
      if(palettes.length) { //conditional checking if array returned from query has a length
        response.status(200).json(palettes); //sending a response with HTTP status code 200 (OK) with json body of array of all palettes from 'palettes' table matching WHERE clause on line 126
      } else { //else if array returned from query does not have a length
        response.status(404).json({ //sending a response with HTTP status code 404 (Not Found) with json body of error message on line 132
          error: `Could not find palette with id ${request.params.id}` //setting error message in response
        });
      }
    })
    .catch(error => { //chaining .catch for any errors
      response.status(500).json({ error }); //sending a response with HTTP status code 500 (Internal Server Error) with json body of error
    });
});

app.listen(app.get('port'), () => { //using Express to bind and listen on port specified on line 9
  console.log(`${app.locals.title} running on PORT ${app.get('port')}.`); //console log local variable app.locals.title on line 10 and port from line 9
});

module.exports = app; //exporting app