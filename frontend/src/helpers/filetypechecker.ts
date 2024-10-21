function fileTypeChecker(language: string, action: string): string {
    if (action === 'filetype') {
      switch (language) {
        case 'javascript':
          return 'application/javascript';
        case 'python':
          return 'application/x-python';
        case 'html':
          return 'text/html';
        default:
          return 'text/plain';
      }
    } else if (action === 'reverse') {
      switch (language) {
        case 'application/javascript':
          return 'javascript';
        case 'application/x-python':
          return 'python';
        case 'text/html':
          return 'html';
        default:
          return 'txt';
      }
    }
    
    return '';
  }
  
  export default fileTypeChecker;
  