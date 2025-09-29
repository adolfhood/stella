import { MoneyItem } from "@/types/MoneyItem";

const MoneyItemCard = ({
  item,
  setDeleteMoneyItemId,
  setDeleteOpen,
  handleEditMoneyItem,
}: {
  item: MoneyItem;
  setDeleteMoneyItemId: (itemId: string) => void;
  setDeleteOpen: (open: boolean) => void;
  handleEditMoneyItem: (item: MoneyItem) => void;
}) => {
  return (
    <div className="flex justify-between items-center relative">
      <div className="flex items-center gap-8">
        <div className="w-20">
          <p className="text-xs text-gray-500">{item.category}</p>
        </div>
        <div className="col-span-4">
          <p>{item.note}</p>
          <p className="text-xs text-gray-500">{item.account}</p>
        </div>
      </div>
      <div>
        <p
          className={
            item.type === "income" ? "text-primary" : "text-destructive"
          }
        >
          ${item.amount}
        </p>
      </div>
    </div>
  );
};

export default MoneyItemCard;
