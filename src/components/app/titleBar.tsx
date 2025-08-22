const TitleBar = ()=>{
    return (
        <div className="w-full flex items-center justify-between bg-gray-800 text-white drag">
            <h2 className="text-lg font-semibold">File Explorer</h2>
            <div className="no-drag">
                <button className=" hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-l">X</button>
                <button className=" hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-r">Y</button>
            </div>
        </div>
    )
}

export default TitleBar;