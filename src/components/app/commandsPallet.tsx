import { ClipboardIcon, ScissorsIcon, Trash, Copy, FolderPlus, FilePlus, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { toast } from "sonner";

interface CommandsPalletProps {
  currentPath: string;
  selectedItems: string[];
  onRefresh: () => void;
  onItemsDeleted: () => void;
}

// Global clipboard state for cut/copy operations
let clipboardItems: string[] = [];
let clipboardOperation: 'copy' | 'cut' | null = null;

export default function CommandsPallet({ 
  currentPath, 
  selectedItems, 
  onRefresh, 
  onItemsDeleted 
}: CommandsPalletProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [fileDialogOpen, setFileDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [fileName, setFileName] = useState("");

    const handleCreateFolder = async () => {
        if (!folderName.trim()) {
            toast.error("Please enter a folder name");
            return;
        }

        setIsLoading(true);
        try {
            await invoke("create_folder", { 
                path: currentPath, 
                name: folderName.trim() 
            });
            toast.success(`Folder "${folderName.trim()}" created successfully`);
            setFolderName("");
            setFolderDialogOpen(false);
            onRefresh();
        } catch (error) {
            toast.error(`Failed to create folder: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFile = async () => {
        if (!fileName.trim()) {
            toast.error("Please enter a file name");
            return;
        }

        setIsLoading(true);
        try {
            await invoke("create_file", { 
                path: currentPath, 
                name: fileName.trim() 
            });
            toast.success(`File "${fileName.trim()}" created successfully`);
            setFileName("");
            setFileDialogOpen(false);
            onRefresh();
        } catch (error) {
            toast.error(`Failed to create file: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) {
            toast.error("No items selected for deletion");
            return;
        }

        setDeleteDialogOpen(false);
        setIsLoading(true);
        try {
            // Delete each selected item
            for (const itemPath of selectedItems) {
                await invoke("delete_item", { path: itemPath });
            }
            toast.success(`${selectedItems.length} item(s) deleted successfully`);
            onItemsDeleted();
            onRefresh();
        } catch (error) {
            toast.error(`Failed to delete items: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopySelected = () => {
        if (selectedItems.length === 0) {
            toast.error("No items selected to copy");
            return;
        }
        
        // Store items for clipboard operations
        clipboardItems = [...selectedItems];
        clipboardOperation = 'copy';
        
        // Also copy file paths to system clipboard for external use
        const pathsText = selectedItems.join("\n");
        navigator.clipboard.writeText(pathsText)
            .then(() => toast.success(`Copied ${selectedItems.length} item(s) to clipboard`))
            .catch(() => toast.error("Failed to copy to clipboard"));
    };

    const handleCutSelected = () => {
        if (selectedItems.length === 0) {
            toast.error("No items selected to cut");
            return;
        }
        
        // Store items for clipboard operations
        clipboardItems = [...selectedItems];
        clipboardOperation = 'cut';
        
        toast.success(`Cut ${selectedItems.length} item(s) to clipboard`);
    };

    const handlePaste = async () => {
        if (clipboardItems.length === 0 || !clipboardOperation) {
            toast.error("Nothing to paste");
            return;
        }

        setIsLoading(true);
        try {
            if (clipboardOperation === 'copy') {
                await invoke("copy_items", { 
                    source_paths: clipboardItems, 
                    destination_path: currentPath 
                });
                toast.success(`Pasted ${clipboardItems.length} item(s)`);
            } else if (clipboardOperation === 'cut') {
                await invoke("move_items", { 
                    source_paths: clipboardItems, 
                    destination_path: currentPath 
                });
                toast.success(`Moved ${clipboardItems.length} item(s)`);
                
                // Clear clipboard after cutting
                clipboardItems = [];
                clipboardOperation = null;
            }
            
            onRefresh();
        } catch (error) {
            toast.error(`Failed to paste: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <TooltipProvider>
            <div className="flex flex-row items-center gap-1 p-2 border-b bg-background">
                {/* File operations */}
                <div className="flex items-center gap-1">
                    <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        disabled={isLoading}
                                    >
                                        <FolderPlus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>New Folder</p>
                            </TooltipContent>
                        </Tooltip>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Folder</DialogTitle>
                                <DialogDescription>
                                    Enter a name for the new folder.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="folder-name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="folder-name"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        className="col-span-3"
                                        placeholder="Enter folder name..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleCreateFolder();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                    type="submit" 
                                    onClick={handleCreateFolder}
                                    disabled={isLoading || !folderName.trim()}
                                >
                                    Create Folder
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        disabled={isLoading}
                                    >
                                        <FilePlus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>New File</p>
                            </TooltipContent>
                        </Tooltip>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New File</DialogTitle>
                                <DialogDescription>
                                    Enter a name for the new file (include extension).
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="file-name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="file-name"
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        className="col-span-3"
                                        placeholder="example.txt"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleCreateFile();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                    type="submit" 
                                    onClick={handleCreateFile}
                                    disabled={isLoading || !fileName.trim()}
                                >
                                    Create File
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Clipboard operations */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={handleCutSelected}
                                disabled={selectedItems.length === 0}
                            >
                                <ScissorsIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Cut Selected ({selectedItems.length})</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={handleCopySelected}
                                disabled={selectedItems.length === 0}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copy Selected ({selectedItems.length})</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={handlePaste}
                                disabled={clipboardItems.length === 0 || isLoading}
                            >
                                <ClipboardIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Paste {clipboardItems.length > 0 ? `(${clipboardItems.length} items)` : ''}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Refresh and Delete operations */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={onRefresh}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Refresh</p>
                        </TooltipContent>
                    </Tooltip>

                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                        disabled={selectedItems.length === 0 || isLoading}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Delete Selected ({selectedItems.length})</p>
                            </TooltipContent>
                        </Tooltip>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete {selectedItems.length} item(s)? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setDeleteDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleDeleteSelected}
                                    disabled={isLoading}
                                >
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </TooltipProvider>
    )   
}