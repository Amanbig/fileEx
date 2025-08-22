import "./App.css";
import { FileStructure } from "./components/app/fileStructure";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="h-full">
      <FileStructure/>
      <Toaster />
    </div>
  );
}

export default App;
