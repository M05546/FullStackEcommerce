import express, {json, urlencoded, Request, Response} from 'express';
import cors from 'cors';
import productsRoutes from './routes/products/index';
import authRoutes from './routes/auth/index';
import ordersRoutes from './routes/orders/index';


const port = 3000;

const app = express();

app.use(cors({
    origin: ['http://localhost:8081', 'http://192.168.1.163:8081'],
  }));
  
app.use(urlencoded({ extended:false }));
app.use(json());

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome Home !!!');
});


app.use('/products', productsRoutes);
app.use('/auth', authRoutes);
app.use('/orders', ordersRoutes);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
