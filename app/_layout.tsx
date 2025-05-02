import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

export default function RootLayout() {
    return (
        <GluestackUIProvider>
            <Stack>
                <Stack.Screen name="index" options={{ title: "Shop", headerTitleAlign: 'center'  }} />
                <Stack.Screen name="product/[id]" options={{ title: "Product", headerTitleAlign: 'center'  }} />
            </Stack>
        </GluestackUIProvider>
    );
} 