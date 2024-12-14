import { useState } from 'react';

const mainurl = "https://share-backend.avijusanjai.workers.dev/get/files/";

function MyFiles() {
  const [inputValue, setInputValue] = useState('');
  const [fileName, setFileName] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    setFileName(value);
  };

  const handleFetchFile = () => {
    const url = `${mainurl}${fileName}`;
    console.log("Fetching file from:", url);
  };

  return (
    <>
      <div className="text-white">mehmehmemhejsdhdbfsjhdbf</div>
      <button className="bg-white">meh</button>
      <br></br>
      <br></br>
      <input type="text" value={inputValue} onChange={handleInputChange} />
      <button className="bg-white" onClick={handleFetchFile}>doop</button>
    </>
  );
}

export default MyFiles;
