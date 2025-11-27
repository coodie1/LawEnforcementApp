import axios from 'axios';

// Create a base axios instance that we can use everywhere in our app.
// This tells axios: "Whenever I make a request, start with this base URL."
export default axios.create({
  baseURL: 'http://localhost:5173/api', // We point it to the frontend server for now (more on this in a second!)
});





