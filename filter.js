let getFilteredArray = (arr1, arr2, propertyToCompare) => {
  let filteredArray = arr1;
  for (let i = 0; i < filteredArray.length; i++) {
    console.log("el tamaño del array1: ", filteredArray.length);
    console.log("elemento:", i);
    let hasElement = false;
    for (let j = 0; j < arr2.length; j++) {
      if (filteredArray[i][propertyToCompare] === arr2[j][propertyToCompare]) {
        hasElement = true;
        j = 999999;
      }
    }
    if (!hasElement) {
      filteredArray.splice(i, 1);
      i = -1;
    }
  }
  return filteredArray;
};

console.log(getFilteredArray(arr1.planets, arr2.planets, "coords"));
