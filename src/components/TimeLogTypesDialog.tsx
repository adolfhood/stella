"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTimeLogTypeContext } from "@/contexts/TimeLogTypeContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/lib/lucide-react";

const TimeLogTypeDialog = () => {
  const {
    timeLogTypes,
    addTimeLogType,
    updateTimeLogType,
    deleteTimeLogType,
    fetchTimeLogTypes,
  } = useTimeLogTypeContext();
  const [open, setOpen] = useState(false);
  const [newTimeLogTypeName, setNewTimeLogTypeName] = useState("");
  const [newTimeLogTypeIcon, setNewTimeLogTypeIcon] = useState("Clock"); // Default icon
  const [editingTimeLogTypeId, setEditingTimeLogTypeId] = useState<
    string | null
  >(null);
  const [editingTimeLogTypeName, setEditingTimeLogTypeName] = useState("");
  const [editingTimeLogTypeIcon, setEditingTimeLogTypeIcon] = useState("Clock"); // Default icon

  const handleAddTimeLogType = async () => {
    if (newTimeLogTypeName.trim() !== "") {
      await addTimeLogType(newTimeLogTypeName, newTimeLogTypeIcon);
      setNewTimeLogTypeName("");
      setNewTimeLogTypeIcon("Clock"); // Reset to default
    }
  };

  const handleEditTimeLogType = (
    timeLogTypeId: string,
    timeLogTypeName: string,
    timeLogTypeIcon: string
  ) => {
    setEditingTimeLogTypeId(timeLogTypeId);
    setEditingTimeLogTypeName(timeLogTypeName);
    setEditingTimeLogTypeIcon(timeLogTypeIcon);
  };

  const handleSaveEdit = async () => {
    if (editingTimeLogTypeId && editingTimeLogTypeName.trim() !== "") {
      await updateTimeLogType(
        editingTimeLogTypeId,
        editingTimeLogTypeName,
        editingTimeLogTypeIcon
      );
      setEditingTimeLogTypeId(null);
      setEditingTimeLogTypeName("");
      setEditingTimeLogTypeIcon("Clock"); // Reset to default
    }
  };

  const handleDeleteTimeLogType = async (timeLogTypeId: string) => {
    await deleteTimeLogType(timeLogTypeId);
  };

  const iconOptions = useMemo(() => {
    return Object.keys(Icons).map((iconName) => ({
      value: iconName,
      label: iconName,
    }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Time Log Types</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Time Log Types</DialogTitle>
          <DialogDescription>
            Add, edit, or delete time log types to categorize your time logs.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="New time log type name"
              value={newTimeLogTypeName}
              onChange={(e) => setNewTimeLogTypeName(e.target.value)}
            />
            <Select
              value={newTimeLogTypeIcon}
              onValueChange={setNewTimeLogTypeIcon}
            >
              <SelectTrigger className="w-max">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent className="w-max min-w-auto">
                {iconOptions.map((option) => {
                  const Icon = Icons[option.value];

                  return (
                    <SelectItem
                      className="w-max"
                      key={option.value}
                      value={option.value}
                    >
                      <Icon className="h-4 w-4" />
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button onClick={handleAddTimeLogType}>Add Time Log Type</Button>
          </div>

          <Table>
            <TableCaption>A list of your time log types.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeLogTypes.map((timeLogType) => {
                const TypeIcon = Icons[timeLogType.icon];

                return (
                  <TableRow key={timeLogType.id}>
                    <TableCell>
                      {editingTimeLogTypeId === timeLogType.id ? (
                        <Input
                          value={editingTimeLogTypeName}
                          onChange={(e) =>
                            setEditingTimeLogTypeName(e.target.value)
                          }
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit();
                            }
                          }}
                        />
                      ) : (
                        timeLogType.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingTimeLogTypeId === timeLogType.id ? (
                        <Select
                          value={editingTimeLogTypeIcon}
                          onValueChange={setEditingTimeLogTypeIcon}
                        >
                          <SelectTrigger className="w-max">
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                          <SelectContent className="w-max min-w-auto">
                            {iconOptions.map((option) => {
                              const Icon = Icons[option.value];

                              return (
                                <SelectItem
                                  className="w-max"
                                  key={option.value}
                                  value={option.value}
                                >
                                  <Icon className="h-4 w-4" />
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      ) : (
                        <TypeIcon className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingTimeLogTypeId === timeLogType.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingTimeLogTypeId(null);
                              setEditingTimeLogTypeName("");
                              setEditingTimeLogTypeIcon("Clock"); // Reset
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditTimeLogType(
                                  timeLogType.id,
                                  timeLogType.name,
                                  timeLogType.icon
                                )
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteTimeLogType(timeLogType.id)
                              }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogClose asChild>
          <Button variant="secondary">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default TimeLogTypeDialog;
