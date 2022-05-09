function pad(number) {
    var r = String(number);
    if (r.length === 1) {
    r = '0' + r;
  }
  return r;
}
//Modifying the prototype so it adds one year to expiration data
Date.prototype.toISOString = function() {
    return (this.getUTCFullYear() + 1) +
    '-' + pad(this.getUTCMonth() + 1) +
    '-' + pad(this.getUTCDate()) +
    'T' + pad(this.getUTCHours()) +
    ':' + pad(this.getUTCMinutes()) +
    ':' + pad(this.getUTCSeconds()) +
    '.' + String((this.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5) +
    'Z';
}
function setexpires(r) {
var date = new Date();
return ("Expires: " + date.toISOString() + "\n");
}
export default {setexpires};