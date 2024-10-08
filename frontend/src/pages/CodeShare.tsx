import MonacoEditor from '../components/Editor';

interface CodeShareProps {
  someString: string; // Define the string prop
}

const CodeShare: React.FC<CodeShareProps> = ({ someString }) => {
  const handleChange = (content: string) => {
    console.log('Current code:', content); // Log the current code to the console
  };

  return (
    <div className="flex flex-col h-screen bg-slate-700">
      <div className="flex-grow">
        <MonacoEditor onChange={handleChange} language={someString} />
      </div>
    </div>
  );
};

export default CodeShare;
