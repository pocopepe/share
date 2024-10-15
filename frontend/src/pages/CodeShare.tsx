import CodeMirror from '@/components/CodeMirror';

interface CodeShareProps {
  someString: string; // Define the string prop
}

const CodeShare: React.FC<CodeShareProps> = ({ someString }) => {
  

  return (
    <div className="flex flex-col h-screen bg-slate-700">
      <div className="flex-grow">
        <div>{someString}</div>
        <CodeMirror></CodeMirror>
      </div>
    </div>
  );
};

export default CodeShare;
