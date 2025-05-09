import "@/global.css";
import { Link, Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Icon } from "@/components/ui/icon";
import { ShoppingCart, User, LogOut } from "lucide-react-native"; // Import LogOut icon
import { Pressable } from "react-native";
import { useCart } from "@/store/cartStore";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/store/authStore";

const queryClient = new QueryClient()

export default function RootLayout() {

    const cartItemsNum = useCart((state) => state.items.length);
    const isLoggedIn = useAuth((s) => !!s.token);
    const logoutAction = useAuth((s) => s.logout); // Get the logout action
    const tokenFromStore = useAuth((s) => s.token);


    return (
        <QueryClientProvider client={queryClient}>
        <GluestackUIProvider>
            <Stack 
                screenOptions={{ 
                    headerRight: () => (
                        <Link href={ '/cart' } asChild>
                            <Pressable className='flex-row items-center gap-2'>
                            <Icon as={ShoppingCart} />
                            <Text>{cartItemsNum}</Text>
                            </Pressable>
                        </Link>
                    ),

                }}
            >
                <Stack.Screen name="index" options={{ 
                    title: "Shop",
                    headerLeft: () => (
                        isLoggedIn ? (
                            // If logged in, show Logout button
                            <Pressable onPress={() => {
                                console.log("Logout button pressed");
                                logoutAction();
                            }} className='flex-row items-center gap-2 ml-3'>
                                <Icon as={LogOut} />
                            </Pressable>
                        ) : (
                            // If not logged in, show Login link
                            <Link href={ '/(auth)/login' } asChild>
                                <Pressable className='flex-row items-center gap-2'>
                                <Icon as={User} />
                                </Pressable>
                            </Link>
                        )
                    ),
                    headerTitleAlign: 'center'  
                    }} 
                />
                <Stack.Screen name="product/[id]" options={{ title: "Product", headerTitleAlign: 'center'  }} />
                <Stack.Screen name="cart" options={{ title: "Cart", headerTitleAlign: 'center'  }} />
                <Stack.Screen name="(auth)/login" options={{ title: "Login", headerTitleAlign: 'center'  }} />
            </Stack>
        </GluestackUIProvider>
        </QueryClientProvider> 
    );
} 