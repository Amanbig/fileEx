import { Button } from "../ui/button";
import { RxCross2 } from "react-icons/rx";
import { VscChromeMinimize } from "react-icons/vsc";
import { IoMdSquareOutline } from "react-icons/io";
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

export default function TitleBar() {
    return (
        <div className="flex flex-row items-center justify-between pl-2 drag">
            <div>
                <p>FileEx</p>
            </div>
            <div className="no-drag">
                <Button variant="ghost" onClick={() => appWindow.minimize()}><VscChromeMinimize /></Button>
                <Button variant="ghost" onClick={async () => {
                    if (await appWindow.isMaximized()) {
                        await appWindow.unmaximize();
                    } else {
                        await appWindow.maximize();
                    }
                }}><IoMdSquareOutline /></Button>
                <Button variant="ghost" onClick={() => appWindow.close()}><RxCross2 /></Button>
            </div>
        </div>
    );
}