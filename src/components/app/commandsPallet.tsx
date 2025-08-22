import { ClipboardIcon, ScissorsIcon, Trash, Copy, FolderPlus, FilePlus, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

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

    const handleCreateFolder = async () => {
        const folderName = prompt("Enter folder name:");
        if (!folderName || folderName.trim() === "") return;

        setIsLoading(true);
        try {
            await invoke("create_folder", { 
                path: currentPath, 
                name: folderName.trim() 
            });
            onRefresh();
        } catch (error) {
            alert(`Failed to create folder: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFile = async () => {
        const fileName = prompt("Enter file name (with extension):");
        if (!fileName || fileName.trim() === "") return;

        setIsLoading(true);
        try {
            await invoke("create_file", { 
                path: currentPath, 
                name: fileName.trim() 
            });
            onRefresh();
        } catch (error) {
            alert(`Failed to create file: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) {
            alert("No items selected for deletion");
            return;
        }

        const confirmDelete = confirm(
            `Are you sure you want to delete ${selectedItems.length} item(s)?`
        );
        if (!confirmDelete) return;

        setIsLoading(true);
        try {
            // Delete each selected item
            for (const itemPath of selectedItems) {
                await invoke("delete_item", { path: itemPath });
            }
            onItemsDeleted();
            onRefresh();
        } catch (error) {
            alert(`Failed to delete items: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopySelected = () => {
        if (selectedItems.length === 0) {
            alert("No items selected to copy");
            return;
        }
        
        // Store items for clipboard operations
        clipboardItems = [...selectedItems];
        clipboardOperation = 'copy';
        
        // Also copy file paths to system clipboard for external use
        const pathsText = selectedItems.join("\n");
        navigator.clipboard.writeText(pathsText)
            .then(() => alert(`Copied ${selectedItems.length} item(s) to clipboard`))
            .catch(() => alert("Failed to copy to clipboard"));
    };

    const handleCutSelected = () => {
        if (selectedItems.length === 0) {
            alert("No items selected to cut");
            return;
        }
        
        // Store items for clipboard operations
        clipboardItems = [...selectedItems];
        clipboardOperation = 'cut';
        
        alert(`Cut ${selectedItems.length} item(s) to clipboard`);
    };

    const handlePaste = async () => {
        if (clipboardItems.length === 0 || !clipboardOperation) {
            alert("Nothing to paste");
            return;
        }

        setIsLoading(true);
        try {
            if (clipboardOperation === 'copy') {
                await invoke("copy_items", { 
                    source_paths: clipboardItems, 
                    destination_path: currentPath 
                });
                alert(`Pasted ${clipboardItems.length} item(s)`);
            } else if (clipboardOperation === 'cut') {
                await invoke("move_items", { 
                    source_paths: clipboardItems, 
                    destination_path: currentPath 
                });
                alert(`Moved ${clipboardItems.length} item(s)`);
                
                // Clear clipboard after cutting
                clipboardItems = [];
                clipboardOperation = null;
            }
            
            onRefresh();
        } catch (error) {
            alert(`Failed to paste: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <TooltipProvider>
            <div className="flex flex-row items-center gap-1 p-2 border-b bg-background">
                {/* File operations */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={handleCreateFolder}
                                disabled={isLoading}
                            >
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>New Folder</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={handleCreateFile}
                                disabled={isLoading}
                            >
                                <FilePlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>New File</p>
                        </TooltipContent>
                    </Tooltip>
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

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={handleDeleteSelected}
                                disabled={selectedItems.length === 0 || isLoading}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete Selected ({selectedItems.length})</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )   
}