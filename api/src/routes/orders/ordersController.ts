import { Request, Response } from 'express';
import { orderItemsTable, ordersTable } from '../../db/ordersSchema';
import { db } from '../../db';
import { ne } from 'drizzle-orm';

export async function createOrder (req: Request, res: Response) {
    try {
        const { order, items } = req.cleanBody;
        const userId = req.userId;
        if (!userId) {
            res.status(400).json({ message: 'invalid order data'});
            return;
        }

        const [newOrder] = await db.insert(ordersTable).values({ userId: userId }).returning();


        // TODO: validate products ids, and take their actual price from db
        const orderItems = items.map((item: any) => ({
            ...item,
            orderId: newOrder.id,
        }));
        const newOrderItems = await db.insert(orderItemsTable).values(orderItems).returning();

        res.status(201).json({ ...newOrder, items: newOrderItems });
    } catch (e) {
        console.log(e);
        res.status(400).json({ message: 'invalid order data'});
    }
}