import { codeValueAtom } from "@/recoil/code";
import { useRecoilValue } from "recoil";
import axios from 'axios';
async function saving(){
    const code=useRecoilValue(codeValueAtom);
    const backend='https://share-backend.avijusanjai.workers.dev/codeshare';
    const options={
        method: 'POST', 
        url : backend,
        headers: {
            'Content-Type': 'text/plain', // Set the content type to plain text
          },
        params: { 'filename': 'grrr' },
        data:code
    }
    await axios.request(options);
    console.log('File uploaded successfully');
}

export default saving;