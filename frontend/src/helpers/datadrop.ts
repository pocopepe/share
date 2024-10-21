async function datadrop(filename: string, content: string, contentType: string) {
    const url = 'https://share-backend.avijusanjai.workers.dev/upload/codeshare/' + filename;
    try {
      const response = await fetch(url, {
        method: "POST",
        body: content,
        headers: {
          "Content-Type": contentType
        }
      });
  
      if (response.ok) {
        return "success"; 
      } else {
        return filename;
      }
    } catch (error) {
      console.error('Error saving data:', error);
      return "error"; 
    }
  }

export default datadrop;