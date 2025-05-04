import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useCart } from "@/store/cartStore";
import { View, FlatList } from "react-native";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Redirect } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { createOrder } from "@/api/orders";
import { User } from "lucide-react-native";

export default function CartScreen() {
  const items = useCart((state) => state.items);
  const resetCart = useCart((state) => state.resetCart);

  const createOrderMutation = useMutation({
    mutationFn: () => 
      createOrder(
        items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price, // Manage from server side
        }))
      ),
    onSuccess: (data) => {
      console.log(data);
      resetCart();
    },
    onError: (error) => {
      console.log(error);
    } 
  });

  const onCheckout = async () => {
    createOrderMutation.mutate();
    // send order to server
    // reset cart
    //
  };

  if (items.length === 0) {
    return <Redirect href={"/"} />
  }


  return (
    <FlatList
      data={items}
      contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full p-2"
      renderItem={({ item }) => (
        <HStack className="bg-white p-3">
          <VStack space='sm'>
            <Text bold>{item.product.name}</Text>
            <Text>${item.product.price}</Text>
          </VStack>
          <Text className="ml-auto">{item.quantity}</Text>
        </HStack>
      )}
      ListFooterComponent={() => (
        <Button onPress={onCheckout}>
          <ButtonText>Checkout</ButtonText>
        </Button>
      )}
    />    
  );
}