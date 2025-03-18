import express from 'express';

const port = 3000;

const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to this world Mossab !!!')
  })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })