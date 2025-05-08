// I changed this file to fetch the price from the database instead of the client
// and to validate the product IDs and quantities before creating the order.


import { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { orderItemsTable, ordersTable } from '../../db/ordersSchema.js';
import { productsTable } from '../../db/productsSchema.js'; // Import productsTable
import { eq, inArray } from 'drizzle-orm';

// Define a more specific type for items in the request
// Price is no longer expected from the client for items
interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export async function createOrder(req: Request, res: Response) {
  try {
    const { order, items } = req.cleanBody as { order: any; items: OrderItemRequest[] };

    const userId = req.userId;
    if (!userId) {
      // User ID should be set by verifyToken middleware
      res.status(401).json({ message: 'User not authenticated.' });
      return;
    }

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'Order must contain at least one item.' });
      return;
    }

    // 1. Extract Product IDs from the request
    const productIds = items.map((item) => item.productId);
    if (productIds.some(id => typeof id !== 'number' || isNaN(id))) {
        res.status(400).json({ message: 'Invalid product ID format in items.' });
        return;
    }

    // 2. Fetch products and their actual prices from the database
    const productsFromDb = await db
      .select({
        id: productsTable.id,
        price: productsTable.price, // Assuming 'price' is the column name for product price
      })
      .from(productsTable)
      .where(inArray(productsTable.id, productIds));

    // 3. Create a map for easy price lookup and validate products
    const productPriceMap = new Map<number, number>();
    productsFromDb.forEach(p => {
      if (p.price === null || p.price === undefined) { // Should not happen if DB schema enforces NOT NULL
        // This case should ideally be prevented by DB constraints
        // Log this server-side as it indicates a data integrity issue with productsTable
        console.error(`Critical: Price for product ID ${p.id} is missing in the database.`);
        // We will throw an error that results in a 500 for the client, as this is a server/data issue
        throw new Error(`Internal error: Price configuration for product ID ${p.id} is incomplete.`);
      }
      productPriceMap.set(p.id, p.price);
    });

    // Validate that all requested product IDs were found and have valid quantity
    for (const item of items) {
      if (!productPriceMap.has(item.productId)) {
        res.status(400).json({
          message: `Product with ID ${item.productId} not found or is unavailable.`,
        });
        return;
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        res.status(400).json({ message: `Invalid quantity for product ID ${item.productId}. Quantity must be a positive number.` });
        return;
      }
    }

    const [newOrder] = await db
      .insert(ordersTable)
      .values({ ...order, userId: userId }) // Spread other order fields if any (e.g., shippingAddress)
      .returning();

    // 4. Prepare orderItems with actual prices from the database
    const orderItemsToInsert = items.map((item) => ({ // item is of type OrderItemRequest (no price field)
      productId: item.productId,
      quantity: item.quantity,
      price: productPriceMap.get(item.productId)!, // Use the validated price from DB
      orderId: newOrder.id,
    }));

    const newOrderItems = await db
      .insert(orderItemsTable)
      .values(orderItemsToInsert)
      .returning();

    res.status(201).json({ ...newOrder, items: newOrderItems });
  } catch (e) {
    console.error('Error creating order:', e);
    // Check for specific database errors if needed, e.g., foreign key constraint
    if (e instanceof Error && (e.message.toLowerCase().includes('foreign key constraint') || e.message.toLowerCase().includes('not-null constraint'))) {
        res.status(400).json({ message: 'Invalid order data. Please check product IDs and quantities.' });
        return;
    }
    // If it's one of our thrown errors for price config
    if (e instanceof Error && e.message.startsWith('Internal error: Price configuration')) {
        res.status(500).json({ message: 'An internal error occurred while processing your order. Please try again later.' });
        return;
    }
    res.status(500).json({ message: 'Failed to create order due to an internal error.' });
  }
}

// if req.role is admin, return all orders
// if req.role is seller, return orders by sellerId
// else, return only orders filtered by req.userId
export async function listOrders(req: Request, res: Response) {
  try {
    const orders = await db.select().from(ordersTable);
    res.json(orders);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);

    // TODO: required to setup the relationship
    // const result = await db.query.ordersTable.findFirst({
    //   where: eq(ordersTable.id, id),
    //   with: {
    //     items: true,
    //   },
    // });

    const orderWithItems = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .leftJoin(orderItemsTable, eq(ordersTable.id, orderItemsTable.orderId));

    if (orderWithItems.length === 0) {
      res.status(404).send('Order not found');
    }

    const mergedOrder = {
      ...orderWithItems[0].orders,
      items: orderWithItems.map((oi) => oi.order_items),
    };

    res.status(200).json(mergedOrder);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

export async function updateOrder(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);

    const [updatedOrder] = await db
      .update(ordersTable)
      .set(req.body)
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updatedOrder) {
      res.status(404).send('Order not found');
    } else {
      res.status(200).json(updatedOrder);
    }
  } catch (error) {
    res.status(500).send(error);
  }
}