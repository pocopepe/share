import { useState } from "react";
import MonacoEditor from '../components/Editor';

function CodeShare() {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (content: string) => {
    console.log('Current code:', content); // Log the current code to the console
  };

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
    console.log('Selected value:', event.target.value); // Log the selected value
  };

  return (
    <div className="flex flex-col h-screen bg-slate-700">
      {/* Top bar with Dropdown */}
      <div className="p-3 flex justify-center items-center space-x-4"> {/* Align items in a row */}
        <select
          value={selectedValue}
          onChange={handleDropdownChange}
          className="bg-white text-black p-2 rounded"
        >
          <option value="">Select an option</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
          {/* Add more options as needed */}
        </select>
      </div>

      {/* Monaco Editor */}
      <div className="flex-grow">
        <MonacoEditor onChange={handleChange} />
      </div>
    </div>
  );
}

export default CodeShare;
