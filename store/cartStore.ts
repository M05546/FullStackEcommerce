import {create} from 'zustand';


export const useCart = create((set) => ({
  items : [],

  addProduct : (product: any) => 
    // TODO: check if product already exists in the cart and update quantity
    set((state) => ({
        items : [...state.items, {product, quantity: 1}],
    })),

    resetCart : () => set({items : []})
        
}));