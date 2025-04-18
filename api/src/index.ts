import express, {json, urlencoded} from 'express';
import productsRoutes from './routes/products/index';
import authRoutes from './routes/auth/index';
import ordersRoutes from './routes/orders/index';
 


const port = 3000;

const app = express();

app.use(urlencoded({ extended:false }));
app.use(json());

app.get('/', (req, res) => {
    res.send('Welcome Home !!!');
});


app.use('/products', productsRoutes);
app.use('/auth', authRoutes);
app.use('/orders', ordersRoutes);



    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
