import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Shadcn Button

function MyFiles() {
  const [inputValue, setInputValue] = useState("");

  function grr() {
    console.log("Input value:", inputValue);
    setInputValue("");
  }

  return (
    <>
      {/* Main Section - Centered Content */}
      <div className="h-screen flex flex-col items-center justify-center space-y-4 px-4">

        {/* Instructions Section */}
        <div className="text-white text-center max-w-3xl mx-auto px-4 py-4">
          <div className="text-xl font-bold mb-2">A Quick Guide</div>
          <p className="text-lg mb-4">
            Choose a file and upload it through the file upload portal. To retrieve a file you've uploaded, type in the name of the file along with the code you’ve submitted. Enter the file name and file type to download it onto your PC locally.
          </p>
        </div>

        {/* File Upload and Retrieve Files Sections - Flex layout (Responsive) */}
        <div className="w-full flex flex-col lg:flex-row justify-center gap-6 lg:mt-10">

          {/* File Upload Section */}
          <div className="w-full max-w-md p-6 rounded-lg shadow-md bg-white/10 backdrop-blur-md">
            <div className="grid w-full max-w-sm items-center gap-2.5">
              <Label className="text-[#b3b3b3] text-lg font-semibold">File Upload</Label>
              <Input
                type="file"
                className="text-[#b3b3b3] file:text-[#b3b3b3] file:bg-[#222] 
                           file:border file:border-[#444] file:rounded-md 
                           file:py-1 file:px-3 focus:ring-0 focus:outline-none 
                           border border-[#333]"
              />
            </div>
          </div>

          {/* Retrieve Files Section */}
          <div className="w-full max-w-md p-6 rounded-lg shadow-md bg-white/10 backdrop-blur-md">
            <div className="grid w-full max-w-sm items-center gap-2.5">
              <Label className="text-[#b3b3b3] text-lg font-semibold">Retrieve Files</Label>
              <Input
                className="text-white bg-[#222] border border-[#444] focus:ring-0 focus:outline-none placeholder-[#b3b3b3]"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type here"
              />
              <Button
                variant="ghost"
                className="text-white hover:bg-[#222] hover:!text-[#b3b3b3] transition duration-200 ease-in-out"
                onClick={grr}
              >
                Submit
              </Button>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

export default MyFiles;
