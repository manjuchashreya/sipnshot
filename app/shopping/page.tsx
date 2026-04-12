import { AppShell } from "@/components/app-shell";
import { ShoppingList } from "@/components/shopping-list";

export const metadata = { title: "Shopping List · Sipwise" };

export default function ShoppingPage() {
    return (
        <AppShell>
            <ShoppingList />
        </AppShell>
    );
}
