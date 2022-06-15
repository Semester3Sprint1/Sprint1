const random = Math.floor(Math.random() * 50);
const random2 = Math.floor(Math.random() * 50);

const whichIsBigger = (num1, num2) => {
  num1 > num2
    ? console.log("The first rando is bigger!")
    : console.log("The second rando is bigger!");
};

whichIsBigger(random, random2);
