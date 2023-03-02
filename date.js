exports.getDate = function() {
    const today = new Date();
    // getDay() method will return a number for a day 
    // Sunday-Saturday (0-6)
    // const currentDay = today.getDay();
   const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
   };
   return today.toLocaleDateString("en-US", options);
}

exports.getDay = function() {
   const today = new Date();
   const options = {
    weekday: "long"
   };
   return today.toLocaleDateString("en-US", options);
}