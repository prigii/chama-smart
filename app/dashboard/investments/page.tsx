"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAssets, createAsset, updateAssetValue, deleteAsset } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function InvestmentsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "MEMBER";
  const isMember = role === "MEMBER";

  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    purchaseDate: "",
    purchasePrice: "",
    currentValue: "",
    category: "",
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    const result = await getAssets();
    if (result.success) {
      setAssets(result.assets || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createAsset({
      name: formData.name,
      description: formData.description || undefined,
      purchaseDate: new Date(formData.purchaseDate),
      purchasePrice: parseFloat(formData.purchasePrice),
      currentValue: parseFloat(formData.currentValue),
      category: formData.category,
    });

    if (result.success) {
      setDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        purchaseDate: "",
        purchasePrice: "",
        currentValue: "",
        category: "",
      });
      loadAssets();
      toast.success("Asset added successfully");
    } else {
      toast.error(String(result.error) || "Failed to add asset");
    }
  };

  const handleDelete = (assetId: string) => {
    toast.warning("Are you sure you want to delete this asset?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => {
          toast.promise(
            (async () => {
              const result = await deleteAsset(assetId);
              if (!result.success) throw new Error("Failed to delete asset");
              loadAssets();
              return "Asset deleted successfully";
            })(),
            {
              loading: "Deleting asset...",
              success: (msg) => msg,
              error: (err) => `Error: ${err.message}`,
            }
          );
        },
      },
    });
  };

  const calculateGainLoss = (purchasePrice: number, currentValue: number) => {
    const diff = currentValue - purchasePrice;
    const percentage = (diff / purchasePrice) * 100;
    return { diff, percentage };
  };

  const totalInvestment = assets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
  const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalInvestment;
  const totalGainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your investment portfolio</p>
        </div>

        {!isMember && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>
                  Record a new investment or asset
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Asset Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Land in Kiambu"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Land, Equity, Bonds"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (KES)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value (KES)</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    step="0.01"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Title Deed PDF (Optional)</Label>
                  <Input id="document" type="file" accept=".pdf" className="cursor-pointer" />
                </div>
                <Button type="submit" className="w-full">
                  Add Asset
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Investment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalInvestment)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Current Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalCurrentValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Gain/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalGainLoss >= 0 ? "+" : ""}
              {formatCurrency(totalGainLoss)}
            </div>
            <p className={`text-sm ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalGainLoss >= 0 ? "+" : ""}
              {totalGainLossPercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading assets...</p>
          ) : assets.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No assets yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Gain/Loss</TableHead>
                  {!isMember && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => {
                  const { diff, percentage } = calculateGainLoss(
                    asset.purchasePrice,
                    asset.currentValue
                  );
                  const isGain = diff >= 0;

                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                          {asset.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{asset.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {asset.category}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(asset.purchaseDate)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(asset.purchasePrice)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(asset.currentValue)}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${isGain ? "text-green-600" : "text-red-600"}`}>
                          {isGain ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {isGain ? "+" : ""}
                              {formatCurrency(diff)}
                            </p>
                            <p className="text-xs">
                              {isGain ? "+" : ""}
                              {percentage.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      {!isMember && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
