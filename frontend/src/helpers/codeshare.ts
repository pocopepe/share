import { codeShareApi } from "@/helpers/api";

const fetchCodeShare = async (filename: string): Promise<{ content: string; contentType: string }> =>
    codeShareApi.get(filename);

export default fetchCodeShare;