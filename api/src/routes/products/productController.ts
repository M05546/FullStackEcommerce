import { Request, Response} from 'express';
import { db } from '../../db/index';
import { productsTable, createProductSchema } from '../../db/productsSchema';
import { eq } from 'drizzle-orm';
import _ from 'lodash';


export async function listProducts (req: Request, res: Response) {
    try{
        const products = await db.select().from(productsTable);
        res.json(products);
    } catch(e) {
        console.error("Error listing products:", e);
        res.status(500).json({ message: "Failed to retrieve products." });
    }
}

export async function getProductById (req: Request, res: Response) {
    try{
        const { id } = req.params;
        const [product] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, Number(id)));

        if (!product) {
            res.status(404).json({message: 'Product not found'});
            return;
        } else {
            res.json(product);
        }
    } catch(e) {
        console.error("Error getting product by ID:", e);
        res.status(500).json({ message: "Failed to retrieve product." });
    }
}

export async function createProduct (req: Request, res: Response) {
    try {
        // console.log(req.cleanBody);
        // const data = _.pick(req.body, Object.keys(createProductSchema.shape));
        const [product] = await db
        .insert(productsTable)
        .values(req.cleanBody)            // WILL BE ADDING VALIDATION HERE
        .returning();
        res.status(201).json(product);
    } catch (e) {
        console.error("Error creating product:", e);
        res.status(500).json({ message: "Failed to create product." });
    }
}

export async function updateProduct (req: Request, res: Response) {
    try{
        const id = Number(req.params.id);
        const updatedFields = req.cleanBody;

        const [product] = await db.update(productsTable)
        .set(updatedFields)
        .where(eq(productsTable.id, id))
        .returning();

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product was not found'});
            return;
        }
    } catch(e) {
        console.error("Error updating product:", e);
        res.status(500).json({ message: "Failed to update product." });
    }
}

export async function deleteProduct (req: Request, res: Response) {
    try{
        const id = Number(req.params.id);
        const [deleteProduct] = await db
        .delete(productsTable)
        .where(eq(productsTable.id, id))
        .returning();
        if (deleteProduct) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Product was not found'});
            return;
        }
    } catch(e) {
        console.error("Error deleting product:", e);
        res.status(500).json({ message: "Failed to delete product." });
    }
}