"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { MoneyItem } from "@/types/MoneyItem";
import { toast } from "sonner";

interface MoneyItemContextType {
  moneyItems: MoneyItem[];
  fetchMoneyItems: () => Promise<void>;
  addMoneyItem: (moneyItem: Omit<MoneyItem, "id">) => Promise<void>;
  updateMoneyItem: (moneyItem: MoneyItem) => Promise<void>;
  deleteMoneyItem: (moneyItemId: string) => Promise<void>;
}

const MoneyItemContext = createContext<MoneyItemContextType | undefined>(
  undefined
);

export const MoneyItemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [moneyItems, setMoneyItems] = useState<MoneyItem[]>([]);

  const fetchMoneyItems = async () => {
    // Here you would typically fetch money items from a database or API
    // For now, let's use some dummy data
    const dummyMoneyItems: MoneyItem[] = [
      {
        id: "1",
        type: "income",
        date: new Date().toISOString(),
        account: "Savings",
        category: "Salary",
        amount: 5000,
        note: "Monthly salary",
        description: "Received monthly salary",
        repeatConfig: null,
        installmentConfig: null,
      },
      {
        id: "2",
        type: "expense",
        date: new Date().toISOString(),
        account: "Credit Card",
        category: "Groceries",
        amount: 200,
        note: "Weekly groceries",
        description: "Bought groceries for the week",
        repeatConfig: null,
        installmentConfig: null,
      },
    ];
    setMoneyItems(dummyMoneyItems);
  };

  const addMoneyItem = async (moneyItem: Omit<MoneyItem, "id">) => {
    try {
      const newMoneyItem: MoneyItem = {
        id: '123', // Generate a unique ID
        ...moneyItem,
      };
      setMoneyItems([...moneyItems, newMoneyItem]);
      toast.success("Money item added successfully!");
    } catch (error) {
      console.error("Error adding money item:", error);
      toast.error("Failed to add money item.");
    }
  };

  const updateMoneyItem = async (moneyItem: MoneyItem) => {
    try {
      setMoneyItems(
        moneyItems.map((item) => (item.id === moneyItem.id ? moneyItem : item))
      );
      toast.success("Money item updated successfully!");
    } catch (error) {
      console.error("Error updating money item:", error);
      toast.error("Failed to update money item.");
    }
  };

  const deleteMoneyItem = async (moneyItemId: string) => {
    try {
      setMoneyItems(moneyItems.filter((item) => item.id !== moneyItemId));
      toast.success("Money item deleted successfully!");
    } catch (error) {
      console.error("Error deleting money item:", error);
      toast.error("Failed to delete money item.");
    }
  };

  useEffect(() => {
    fetchMoneyItems();
  }, []);

  const value: MoneyItemContextType = {
    moneyItems,
    fetchMoneyItems,
    addMoneyItem,
    updateMoneyItem,
    deleteMoneyItem,
  };

  return (
    <MoneyItemContext.Provider value={value}>
      {children}
    </MoneyItemContext.Provider>
  );
};

export const useMoneyItemContext = () => {
  const context = useContext(MoneyItemContext);
  if (!context) {
    throw new Error(
      "useMoneyItemContext must be used within a MoneyItemProvider"
    );
  }
  return context;
};