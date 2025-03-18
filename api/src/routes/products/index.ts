import { Router } from 'express';

// products endpoints
const router = Router();

router.get('/', (req, res) => {
    res.send('The list of products');
});

router.get('/:id', (req, res) => {
    console.log(req.params);
    res.send('A product');
});

router.post('/', (req, res) => {
    res.send('New product created');
});

export default router;