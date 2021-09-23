function openMultiple(data){
  let arr = data.split(',')
  console.log(arr)
  console.log(arr[8])
  console.log(arr[12])
  console.log(arr[20])

  window.open(arr[8])
  window.open(arr[12])
  window.open(arr[20])
}