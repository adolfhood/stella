"use client";

import { useState, useEffect } from "react";
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
import { useTagContext } from "@/contexts/TagContext";
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

const TagsDialog = () => {
  const { tags, addTag, updateTag, deleteTag, fetchTags } = useTagContext();
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");

  const handleAddTag = async () => {
    if (newTagName.trim() !== "") {
      await addTag(newTagName);
      setNewTagName("");
    }
  };

  const handleEditTag = (tagId: string, tagName: string) => {
    setEditingTagId(tagId);
    setEditingTagName(tagName);
  };

  const handleSaveEdit = async () => {
    if (editingTagId && editingTagName.trim() !== "") {
      await updateTag(editingTagId, editingTagName);
      setEditingTagId(null);
      setEditingTagName("");
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    await deleteTag(tagId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Tags</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add, edit, or delete tags to categorize your tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
            <Button onClick={handleAddTag}>Add Tag</Button>
          </div>

          <Table>
            <TableCaption>A list of your tags.</TableCaption>
            <TableHeader>
              <TableRow>
                {/* <TableHead className="w-[100px]">ID</TableHead> */}
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  {/* <TableCell className="font-medium">{tag.id}</TableCell> */}
                  <TableCell>
                    {editingTagId === tag.id ? (
                      <Input
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit();
                          }
                        }}
                      />
                    ) : (
                      tag.name
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingTagId === tag.id ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTagId(null);
                            setEditingTagName("");
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
                            onClick={() => handleEditTag(tag.id, tag.name)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTag(tag.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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

export default TagsDialog;
