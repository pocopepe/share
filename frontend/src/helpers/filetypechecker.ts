function fileTypeChecker(language:string, a:string):string{
    if (a=='filetype'){if(language==='javascript'){
      return 'application/javascript';
  }
  else if(language==='python'){
      return 'application/x-python';
  }
  else if(language==='html'){
      return 'text/html';
  }
  else{
      return 'text/plain';
  }
  }
  else if(a=='reverse'){
        if(language==='application/javascript'){
            return 'javascript';
        }
        else if(language==='application/x-python'){
            return 'python';
        }
        else if(language==='text/html'){
            return 'html';
        }
        else{
            return 'txt';
  }
}}
  
  export default fileTypeChecker;