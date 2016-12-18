// makes array from string containing comma with random spaces
module.exports.splitByComma = (inputString) =>{
    return inputString.replace(/(\s+,\s+)|(,\s+)|(\s+,)/g,',').split(',').filter(arrPart => {
        //console.log(arrPart)
        return arrPart
    });
};

module.exports.getFieldToArr = (inputData,fieldName) => {
    let arr = [];
    inputData.filter(data => {
        arr.push(data[fieldName]);
    });
    return arr;
};

module.exports.removeArrFromArr = (arrMain,arrToRemove) => {
    return arrMain.filter(x => arrToRemove.indexOf(x) < 0 );
};

// specialised stuff

module.exports.getGenresNotInDB = (genresArr, genresDBObj) => {
    let genresInDBArr = this.getFieldToArr(genresDBObj,'name');

    return this.removeArrFromArr(genresArr,genresInDBArr)
};

module.exports.arrayIfNeeded = (data)=> {
    //console.log('Data Type:' + typeof data + ' of data ' + data);

    if(typeof data === 'undefined'){
        console.log("Data is Undefined");
        return undefined;
    }

    if(typeof data === 'string'){
        let dataArr = [];
        dataArr.push(data);
        return dataArr;
    }

    if(typeof data === 'object'){
        return data;
    }




}