"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "../ui/badge";
import { MoneyItem } from "@/types/MoneyItem";
import { useMoneyItemContext } from "@/contexts/MoneyItemContext";
import MoneyItemCard from "./MoneyItemCard";
import { DatePicker } from "@/components/DatePicker";
import { TimePicker } from "@/components/TimePicker";

export default function DailyMoneyList() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMoneyItem, setEditMoneyItem] = useState<MoneyItem | null>(null);
  const [deleteMoneyItemId, setDeleteMoneyItemId] = useState<string | null>(
    null
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<"date" | null>(
    null
  );
  const [selectedDateValue, setSelectedDateValue] = useState<Date | undefined>(
    undefined
  );

  const { moneyItems, addMoneyItem, updateMoneyItem, deleteMoneyItem } =
    useMoneyItemContext();

  const [moneyItemForm, setMoneyItemForm] = useState<Omit<MoneyItem, "id">>({
    type: "income",
    date: new Date().toISOString(),
    account: "",
    category: "",
    amount: 0,
    note: "",
    description: "",
    repeatConfig: null,
    installmentConfig: null,
  });

  const resetMoneyItemForm = () => {
    setMoneyItemForm({
      type: "income",
      date: new Date().toISOString(),
      account: "",
      category: "",
      amount: 0,
      note: "",
      description: "",
      repeatConfig: null,
      installmentConfig: null,
    });
  };

  const handleOpenDialog = () => {
    resetMoneyItemForm();
    setEditMoneyItem(null);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    resetMoneyItemForm();
    setEditMoneyItem(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setMoneyItemForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleTimeSelection = (date: Date, willCloseSelection: Boolean) => {
    setMoneyItemForm((prev) => ({
      ...prev,
      date: date?.toISOString() || new Date().toISOString(),
    }));

    if (willCloseSelection) {
      setTimePickerOpen(false);
    }
  };

  const handleOpenDatePicker = (field: "date") => {
    setSelectedDateField(field);
    setDatePickerOpen(true);
  };

  const handleDatePickerClose = () => {
    setDatePickerOpen(false);
    setSelectedDateField(null);
  };

  const handleDateChange = (date: Date) => {
    setMoneyItemForm((prev) => ({
      ...prev,
      date: date?.toISOString() || new Date().toISOString(),
    }));
    setTimePickerOpen(true);
    setDatePickerOpen(false);
  };

  const handleCreateMoneyItem = async () => {
    setLoading(true);

    try {
      await addMoneyItem(moneyItemForm);
      handleCloseDialog();
    } catch (error) {
      console.error("Error adding money item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMoneyItem = (moneyItem: MoneyItem) => {
    setMoneyItemForm(moneyItem);
    setEditMoneyItem(moneyItem);
    setOpen(true);
  };

  const handleSaveEdit = async () => {
    setLoading(true);

    try {
      if (editMoneyItem) {
        await updateMoneyItem({ ...editMoneyItem, ...moneyItemForm });
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error editing money item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMoneyItem = async () => {
    try {
      if (deleteMoneyItemId) {
        await deleteMoneyItem(deleteMoneyItemId);
      }
    } catch (error) {
      console.error("Error deleting money item:", error);
    } finally {
      setDeleteOpen(false);
      setDeleteMoneyItemId(null);
    }
  };

  const handleSubmit = () => {
    if (editMoneyItem) {
      handleSaveEdit();
    } else {
      handleCreateMoneyItem();
    }
  };

  const [groupedMoneyItems, setGroupedMoneyItems] = useState<{
    [date: string]: MoneyItem[];
  }>({});

  useEffect(() => {
    const grouped = moneyItems.reduce(
      (acc: { [date: string]: MoneyItem[] }, item) => {
        const date = format(parseISO(item.date), "yyyy-MM-dd");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      },
      {}
    );
    setGroupedMoneyItems(grouped);
  }, [moneyItems]);

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Income/Expenses
        </h2>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={handleOpenDialog}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editMoneyItem ? "Edit Item" : "Add Item"}
                </DialogTitle>
                <DialogDescription>
                  {editMoneyItem
                    ? "Edit the fields for this item."
                    : "Create a new item to add to your list."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={moneyItemForm.type}
                    onValueChange={(value) =>
                      setMoneyItemForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="col-span-3 w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Button
                    onClick={() => handleOpenDatePicker("date")}
                    className="w-max font-normal col-span-3"
                    variant="outline"
                  >
                    {format(
                      new Date(moneyItemForm.date || ""),
                      "MMMM dd, yyyy hh:mmaaa"
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="account" className="text-right">
                    Account
                  </Label>
                  <Input
                    type="text"
                    id="account"
                    value={moneyItemForm.account}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    type="text"
                    id="category"
                    value={moneyItemForm.category}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    type="number"
                    id="amount"
                    value={moneyItemForm.amount}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="note" className="text-right">
                    Note
                  </Label>
                  <Input
                    type="text"
                    id="note"
                    value={moneyItemForm.note}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={moneyItemForm.description || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={handleCloseDialog}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-700 text-white"
                >
                  {editMoneyItem ? "Save" : "Add"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {Object.entries(groupedMoneyItems).map(([date, items]) => {
        const totalIncome = items
          .filter((item) => item.type === "income")
          .reduce((sum, item) => sum + item.amount, 0);
        const totalExpense = items
          .filter((item) => item.type === "expense")
          .reduce((sum, item) => sum + item.amount, 0);

        const weekDay = format(parseISO(date), "EEE");

        return (
          <div key={date} className="mb-4">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold mr-2">
                  {new Date(date).getDate()}
                </h3>
                <Badge
                  variant={
                    weekDay === "Sat" || weekDay === "Sun"
                      ? "default"
                      : "secondary"
                  }
                  className="mr-1"
                >
                  {weekDay}
                </Badge>
                <p className="text-xs text-gray-500">
                  {format(parseISO(date), "MMM yyyy")}
                </p>
              </div>
              <div className="flex items-center">
                <span className="ml-2 text-sm text-primary">
                  +${totalIncome}
                </span>
                <span className="ml-2 text-sm text-destructive">
                  -${totalExpense}
                </span>
              </div>
            </div>

            <ul className="space-y-2">
              {items.map((item) => (
                <MoneyItemCard
                  key={item.id}
                  item={item}
                  setDeleteMoneyItemId={setDeleteMoneyItemId}
                  setDeleteOpen={setDeleteOpen}
                  handleEditMoneyItem={handleEditMoneyItem}
                />
              ))}
            </ul>
          </div>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => {
                handleDeleteMoneyItem();
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Date Picker Dialog */}
      <Dialog open={datePickerOpen} onOpenChange={handleDatePickerClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
            <DialogDescription>
              Select the date for the money item.
            </DialogDescription>
          </DialogHeader>
          <DatePicker
            onDateSelected={handleDateChange}
            selectedDate={new Date(moneyItemForm.date || "")}
          />
        </DialogContent>
      </Dialog>

      {/* Time Picker Dialog */}
      <Dialog open={timePickerOpen} onOpenChange={setTimePickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Time</DialogTitle>
            <DialogDescription>
              Select the time for the money item.
            </DialogDescription>
          </DialogHeader>
          <TimePicker
            onTimeSelected={handleTimeSelection}
            selectedDate={selectedDateValue || new Date()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
