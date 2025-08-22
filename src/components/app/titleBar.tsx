import { Button } from "../ui/button";
import { RxCross2 } from "react-icons/rx";
import { VscChromeMinimize } from "react-icons/vsc";
import { IoMdSquareOutline } from "react-icons/io";

export default function TitleBar(){
    return (
        <div className="flex flex-row items-center justify-between pl-2 drag">
        <div>
            <p>FileEx</p>
        </div>
        <div className="no-drag">
            <Button variant="ghost"><VscChromeMinimize /></Button>
            <Button variant="ghost"><IoMdSquareOutline /></Button>
            <Button variant="ghost"><RxCross2 /></Button>
        </div>
        </div>
    );
}