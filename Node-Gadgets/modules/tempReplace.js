module.exports = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%BRAND%}/g, product.brand);
  output = output.replace(/{%BATTERY%}/g, product.batteryLife);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%DISCOUNT%}/g, product.discount);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  return output;
};
