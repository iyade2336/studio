
import { PageHeader } from "@/components/shared/page-header";
import { ProductCard } from "@/components/products/product-card";
import { mockProducts } from "@/data/mock-products";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// This would typically be a server component fetching data
export default function ProductsPage() {
  // For now, using mock data. In a real app, this could be fetched.
  // Add filtering/searching logic here if needed.
  const products = mockProducts;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Shop Sensors & Equipment"
        description="Browse our selection of IoT hardware for your projects."
      />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="search" placeholder="Search products..." className="pl-10 w-full md:w-[300px] lg:w-[400px]" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter by Category
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* These would ideally be dynamic based on available categories */}
            <DropdownMenuCheckboxItem checked>All</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Sensors</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Equipment</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">No Products Found</p>
            <p className="text-muted-foreground">
                We couldn&apos;t find any products matching your criteria. Try adjusting your search or filters.
            </p>
        </div>
      )}
    </div>
  );
}
