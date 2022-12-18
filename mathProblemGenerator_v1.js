const MAP_NAMES = ["00/01", "02/03", "04/05", "06/07", "08", "09", "10", "11/12", "13", "14", "15", "16", "17", "18", "19", "e00", "e01", "e02"];
const ANSWER_KEY = ['A', 'B', 'C', 'D', 'E'];
var canCont_GV; // Used in clickContinue()
var practOver_GV; // Used in practice()
var userChoice_GV; // Used in getAnswer()

function printInstruct(text) {
    var instructions = document.getElementById("instructions");
    if (!instructions) {
        var parent = document.getElementById("parent");
        instructions = document.createElement('p');
        instructions.setAttribute("id", "instructions")
        parent.appendChild(instructions);
    }
    instructions.innerHTML = text;
}

async function clickContinue() { // Removed.
    canCont_GV = false;
    
    contButton = document.createElement("button");
    contButton.innerHTML = "Continue";
    contButton.setAttribute("onClick", "canCont_GV=true");
    document.getElementById("parent").appendChild(contButton);
    
    while (!canCont_GV) {
        await sleep(50);
    }
    
    contButton.remove();
    return;
}

function addLineBreak(className) {
    var lineBreak = document.createElement("br");
    lineBreak.setAttribute("class", className);
    document.getElementById("parent").appendChild(lineBreak);
}

function removeClass(className) {
    var elems = document.getElementsByClassName(className);
    while (elems.length) {
        elems[0].remove();
    }
}

function findStart() {
    removeClass("begin");
    
    printInstruct("What was the last level you beat?");
    for (var i = 1; i < MAP_NAMES.length - 1; i++) {
        var levelButton = document.createElement("button");
        levelButton.innerHTML = MAP_NAMES[i];
        levelButton.setAttribute("class", "findStart");
        levelButton.setAttribute("onClick", "main("+i+")");
        document.getElementById("parent").appendChild(levelButton);
        
        if (i % 4 == 0) {
            addLineBreak("findStart");
        }
    }
}

async function practice(typeVal) {
    removeClass("practButton")
    
    var end = document.getElementById("end");
    var endButton = document.createElement("button");
    endButton.setAttribute("onClick", "practOver_GV=true; canCont_GV=true;");
    endButton.innerHTML = "End Practice"
    end.appendChild(endButton);
    
    var questNum = 0;
    var totAttempts = 0;
    practOver_GV = false;
    while (!practOver_GV) {
        endButton.remove();
        questNum++;
        totAttempts += await nextQuestion("<div align='left'>Question: " + questNum + "</div>", -1*typeVal);
        
        printInstruct("You have solved " + questNum + " question(s) in " + totAttempts + " attempt(s).");
        end.appendChild(endButton);
        await clickContinue();
    }
    
    endButton.remove();
    document.getElementById("instructions").remove();
    
    var catNames = ["Arithmetic", "Algebra I", "Geometry or Basic Trig", "Basic Calculus"];
    for (var i = 0; i < catNames.length; i++) {
        var practButton = document.createElement("button");
        practButton.setAttribute("class", "practButton");
        practButton.setAttribute("onClick", "practice("+i+1+")");
        practButton.innerHTML = catNames[i];
        document.getElementById("parent").appendChild(practButton);
        
        if (i == 1) {
            addLineBreak("practButton");
        }
    }
}

function resetMain() {
    document.getElementById("instructions").remove();
    document.getElementById("resetButton").remove();
    var parent = document.getElementById("parent");
    
    var begin0 = document.createElement("button");
    begin0.setAttribute("class", "begin");
    begin0.setAttribute("onClick", "main(0)");
    begin0.innerHTML = "Start at the Beginning";
    parent.appendChild(begin0);
    
    var begin1 = document.createElement("button");
    begin1.setAttribute("class", "begin");
    begin1.setAttribute("onClick", "findStart()");
    begin1.innerHTML = "Continue Progress";
    parent.appendChild(begin1);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function nextRandInt(lower, upper) {
    return Math.floor(lower + Math.random() * (1 + upper - lower));
}

function nextRandBool() {
    return Math.random() < 0.5;
}

function getOperator(val) {
    if (val >= 0) {
        return " + ";
    } return " - ";
}

function getCloseAns(allAns) {
    var close = allAns[0];
    while (allAns.indexOf(close) != -1) {
        close += nextRandInt(-5, 5);
    }
    return close;
}

function getTensAns(allAns) {
    var tens = allAns[0];
    while (allAns.indexOf(tens) != -1) {
        tens = allAns[0] + 10 * nextRandInt(-2, 2);
    }
    return tens;
}

function getRandAns(allAns, lower, upper) {
    var rand = allAns[0];
    while (allAns.indexOf(rand) != -1) {
        rand = nextRandInt(lower, upper);
    }
    return rand;
}

async function nextQuestion(baseText, numSolved) {
    var attempts = 0;
    var isSolved = false;
    var diff = nextRandInt(0, 45) + numSolved;
    while (!isSolved) {
        // Negative numSolved values correspond to practicing a specific difficulty.
        if (numSolved == -1) {
            diff = 15; // Arithmetic
        } else if(numSolved == -2) {
            diff = 30; // Algebra I
        }else if (numSolved == -3) {
            diff = 45; // Geometry or Basic Trig
        } else if (numSolved == -4) {
            diff = 60; // Basic Calculus
        }
        
        var variation = nextRandInt(0, 2);
        // variation = 2; // FOR TESTING ONLY
        
        if (attempts == 1) {
            baseText = "INCORRECT" + baseText;
        }
        var promptText = "<div align='left'>Attempt: " + (attempts + 1) + "</div>";
        await sleep(attempts * 500);
        
        if (diff < numSolved + 5) {
            promptText += "<div align='left'>Category: FREE PASS</div><br>";
            isSolved = await nextFree(baseText + promptText);
        } else if (diff < 20) {
            promptText += "<div align='left'>Category: ARITHMETIC</div><br>";
            isSolved = await nextArithmetic(variation, baseText + promptText);
        } else if (diff < 35) {
            promptText += "<div align='left'>Category: ALGEBRA I</div><br>";
            isSolved = await nextAlgebra(variation, baseText + promptText);
        } else if (diff < 50) {
            promptText += "<div align='left'>Category: GEOMETRY or BASIC TRIG</div><br>";
            isSolved = await nextGeometry(variation, baseText + promptText);
        } else {
            promptText += "<div align='left'>Category: BASIC CALCULUS</div><br>";
            isSolved = await nextCalculus(variation, baseText + promptText);
        }
        attempts++;
        diff--;
    }
    return attempts;
}

async function nextFree(text) {
    printInstruct(text + 'Click "Continue" when ready.');
    await clickContinue();
    return true;
}

function nextArithmetic(variation, baseText) {
    var isCorrect = false;
    if (variation == 0) { // 1-3 Digit addition.
        var a = nextRandInt(1, 100);
        var b = nextRandInt(10, 200);
        var trueAns = a + b;
        var multAns = a * b;
        
        var subtrAns = a - b;
        if (subtrAns < 0) {
            subtrAns = b - a;
        }
        
        var ansChoices = [trueAns, multAns, subtrAns];
        ansChoices.push(getCloseAns(ansChoices));
        ansChoices.push(getRandAns(ansChoices, 11, 300));
        
        var question = baseText + "What is: " + a + " + " + b + "?\n";
        isCorrect = getAnswer(question, ansChoices);
    } else if (variation == 1) { // 1-3 Digit subtration.
        var a = nextRandInt(1, 200);
        var b = nextRandInt(1, a);
        var trueAns = a - b;
        var addAns = a + b;
        
        var ansChoices = [trueAns, addAns];
        ansChoices.push(getTensAns(ansChoices));
        ansChoices.push(getCloseAns(ansChoices));
        ansChoices.push(getRandAns(ansChoices, 0, 199));
        
        var question = baseText + "What is: " + a + " - " + b + "?\n";
        isCorrect = getAnswer(question, ansChoices);
    } else { //1-2 Digit multiplication
        var a = nextRandInt(1, 30);
        var b = nextRandInt(1, 10);
        var trueAns = a * b;
        var addAns = a + b;
        if (addAns == trueAns) { addAns++;}
        var subtrAns = a - b;
        
        var ansChoices = [trueAns, addAns, subtrAns];
        ansChoices.push(getCloseAns(ansChoices));
        ansChoices.push(getRandAns(ansChoices, 1, 300));
        
        var question = baseText + "What is: " + a + " * " + b + "?\n";
        isCorrect = getAnswer(question, ansChoices);
    }
    return isCorrect;
}

function nextAlgebra(variation, baseText) {
    var isCorrect = false;
    if (variation == 0) { // a(x + b) = n*a
        var a = nextRandInt(1, 10);
        var na = a * getRandAns([0], -10, 10); // n cannot be 0
        var b = 0;
        while (b == 0 || (na/a*-1 - b) == (na/a - b)) {
            b = nextRandInt(-10, 10);
        }
        var trueAns = na / a - b;
        var signAns1 = na / a * (-1) - b;
        var signAns2 = na / a + b;
        
        var ansChoices = [trueAns, signAns1, signAns2];
        ansChoices.push(getCloseAns(ansChoices, trueAns));
        ansChoices.push(getRandAns(ansChoices, -20, 20));
        
        var operator = getOperator(b);
        var question = baseText + "Solve for x: " + a + "(x" + operator + Math.abs(b) + ") = " + na + '\n';
        isCorrect = getAnswer(question, ansChoices);
    } else if (variation == 1) { // Evaluate x(ax + b) at x = c.
        var a = nextRandInt(-5, 5);
        var b = getRandAns([0], -10, 10); // b cannot be 0.
        var c = nextRandInt(0, 6);
        var trueAns = c*(a*c + b);
        var signAns1 = c*(a*c - b);
        var signAns2 = -1*trueAns;
        var signAns3 = -1*signAns1;
        if (c == 0 || a == 0) {
            signAns1 = -1*b;
            signAns2 = getRandAns([trueAns, signAns1], -240, 240);
            signAns3 = getRandAns([trueAns, signAns1, signAns2], -240, 240);
        }
        
        var ansChoices = [trueAns, signAns1, signAns2, signAns3];
        ansChoices.push(getRandAns(ansChoices, -240, 240));
        
        var operator = getOperator(b);
        var question = baseText + "Evaluate when x=" + c + ":    " + "x(" + a + "*x" + operator + Math.abs(b) + ")\n";
        isCorrect = getAnswer(question, ansChoices);
    } else { // What is the y-intercept / or slope: y = mx + b
        var m = getRandAns([0], -1000, 1000);
        var b = getRandAns([0, m, -1*m], -1000, 1000);
        
        var ansChoices = [];
        var goal = "";
        if (nextRandBool()) {
            ansChoices.push(m, b);
            goal = "slope";
        } else {
            ansChoices.push(b, m);
            goal = "y-intercept";
        }
        
        ansChoices.push(-1*m);
        ansChoices.push(-1*b);
        ansChoices.push(getRandAns(ansChoices, -1000, 1000));
        
        var operator = getOperator(b);
        var question = baseText + "What is the " + goal + " of:    y = " + m + "*x" + operator + Math.abs(b) + "\n";
        isCorrect = getAnswer(question, ansChoices);
    }
    return isCorrect;
}

function nextGeometry(variation, baseText) {
    var isCorrect = false;
    if (variation == 0) { // 30°-60°-90° triangle. Find length b or c given a
        var a = 2 * nextRandInt(1, 100);
        
        var ansChoices = [];
        var goal = "";
        if (nextRandBool()) {
            ansChoices.push(2*a, a+"(√3)");
            goal = "hypotenuse";
        } else {
            ansChoices.push(a+"(√3)", 2*a);
            goal = "long leg"
        }
        
        ansChoices.push(a/2, a+" / (√3)");
        var randAns = getRandAns([a, 2*a, a/2], 1, 200);
        if (nextRandBool()) { 
            ansChoices.push(randAns);
        } else {
            ansChoices.push(randAns + "(√3)");
        }
        
        var question = baseText + "In a 30°-60°-90° triangle, the short leg has a length of " + a + ".<br>";
        question += "What is the length of the " + goal + "?\n";
        isCorrect = getAnswer(question, ansChoices);
    } else if (variation == 1) { // sin(x) in first quadrant
        const ANGLES = ["0°", "30°", "45°", "60°", "90°"];
        var ans = ['0', "1 / 2", "1 / (√2)", "(√3) / 2", '1'];
        var index = nextRandInt(0, 4);
        var trueAns = ans.splice(index, 1);
        
        var lastAns = ans.splice(nextRandInt(0, 3), 1);
        var ansChoices = [trueAns, ans[0], ans[1], ans[2], lastAns];
        
        var question = baseText + "What is sin(" + ANGLES[index] + ")?\n";
        isCorrect = getAnswer(question, ansChoices);
    } else { // Volume of a cylinder, V = pi r^2 h
        var r = getRandAns([2], 1, 6);
        var h = getRandAns([r, 2], 1, 10);
        var trueCoeff = r**2 * h;
        var circumCoeff = 2*r*h;
        var heightCoeff = h**2 * r;
        
        var ansCoeffs = [trueCoeff, circumCoeff, heightCoeff];
        ansCoeffs.push(getCloseAns(ansCoeffs));
        ansCoeffs.push(getRandAns(ansCoeffs, 1, 360));
        
        var ansChoices = []
        for (var i = 0; i < ansCoeffs.length; i++) {
            ansChoices.push(ansCoeffs[i] + 'π');
        }
    
        var question = baseText + "What is the volume of a cylinder with radius = " + r + " and height = " + h + "?\n";
        isCorrect = getAnswer(question, ansChoices);
    }
    return isCorrect;
}

// Possibly rewrite one of the questions to be an integral once web integration is added.
// Consider finding the derivative of a polynomial evaluated when x = a.
function nextCalculus(variation, baseText) {
    var isCorrect = false;
    if (variation == 0) { // What is the area under y = 2x from a to b.
        var a = nextRandInt(-10, 5);
        var b = nextRandInt(a, 10);
        var trueAns = b**2 - a**2;
        var addAns = b**2 + a**2;
        var orderAns = a**2 - b**2;
        var integrateAns = 2*b - 2*a;
        
        var ansChoices = [trueAns, addAns, orderAns, integrateAns];
        ansChoices.push(getCloseAns(ansChoices));
        for (var i = 1; i < ansChoices.length - 1; i++) {
            for (var j = 0; j < ansChoices.length; j++) {
                if (j != i && ansChoices[i] == ansChoices[j]) {
                    ansChoices[i] = getRandAns(ansChoices, -100, 100);
                    break;
                }
            }
        }
        
        var question = baseText + "What is the area under y = 2x from x=" + a + " to x=" + b + "?\n";
        isCorrect = getAnswer(question, ansChoices);
    } else if (variation == 1) { // Derivative of ±sin(ax) and cos(ax).
        var a = nextRandInt(1, 100);
        var trueCoeff = a;
        
        const sinOrCos = ["sin(" + a + "x)", "cos(" + a + "x)"];
        var index = 0;
        if (nextRandBool()) {
            index = 1;
            trueCoeff *= -1;
        }
        var goal = sinOrCos[index];
        if (nextRandBool()) {
            goal = '-' + goal;
            trueCoeff *= -1
        }
        
        var ansChoices = [trueCoeff + sinOrCos[1 - index]]
        ansChoices.push(trueCoeff + sinOrCos[index]);
        ansChoices.push(-1*trueCoeff + sinOrCos[1 - index]);
        ansChoices.push(-1*trueCoeff + sinOrCos[index]);
        ansChoices.push(getCloseAns([trueCoeff, -1*trueCoeff]) + sinOrCos[1 - index]);
        
        var question = baseText + "What is the derivative (with respect to x) of " + goal + "?\n";
        isCorrect = getAnswer(question, ansChoices);
    } else { // What function(s) have the derivative f'(x) = ae^(ax) + bx + c?
        var a = getRandAns([0], -10, 10);
        var b = 2 * getRandAns([0], -25, 25);
        var c = getRandAns([0], -100, 100);
        
        var trueAns = "e^(" + a + "x)" + getOperator(b) + Math.abs(b/2) + "x^2" + getOperator(c) + Math.abs(c) + "x + C";
        var derivativeAns = a**2 + "e^(" + a + "x)" + getOperator(b) + Math.abs(b) + 'x';
        var multAns = "e^(" + a + "x)" + getOperator(b) + Math.abs(2*b) + "x^2" + getOperator(c) + Math.abs(c) + "x + C";
        var multSignAns = "e^(" + a + "x)" + getOperator(-1*b) + Math.abs(2*b) + "x^2" + getOperator(-1*c) + Math.abs(c) + "x + C";
        var signAns = "e^(" + a + "x)" + getOperator(-1*b) + Math.abs(b/2) + "x^2" + getOperator(-1*c) + Math.abs(c) + "x + C";
        
        var ansChoices = [trueAns, derivativeAns, multAns, multSignAns, signAns];
        var question = baseText + "What functions have the derivative f'(x) = ";
        question += a + "e^(" + a + "x)" + getOperator(b) + Math.abs(b) + 'x' + getOperator(c) + Math.abs(c) + "?\n";
        isCorrect = getAnswer(question, ansChoices);
    }
    return isCorrect;
}

async function getAnswer(baseText, ansChoices) {
    printInstruct(baseText)
    
    var corChoice = '';
    if (nextRandInt(0, 4) == 4) {
        corChoice = 'E';
        ansChoices.shift();
    }
    
    for (var i = 0; i < 4; i++) {
        var index = nextRandInt(0, 3-i);
        var ansButton = document.createElement("button");
        ansButton.innerHTML = ANSWER_KEY[i] + ". " + ansChoices[index];
        ansButton.setAttribute("class", "ansButton");
        ansButton.setAttribute("onClick", "userChoice_GV=" + "'" + ANSWER_KEY[i] + "'");
        document.getElementById("parent").appendChild(ansButton);
        
        ansChoices.splice(index, 1);
        if (index == 0 && !corChoice) {
            corChoice = ANSWER_KEY[i];
        }
        
        if (i % 2 == 1) {
            addLineBreak("ansButton");
        }
    }
    
    var noneButton = document.createElement("button");
    noneButton.innerHTML = "E. None of the above";
    noneButton.setAttribute("class", "ansButton");
    noneButton.setAttribute("onClick", "userChoice_GV='E'");
    document.getElementById("parent").appendChild(noneButton);
    
    userChoice_GV = '';
    while (ANSWER_KEY.indexOf(userChoice_GV) == -1) {
        await sleep(50);
    }
    
    removeClass("ansButton");
    
    if (userChoice_GV == corChoice) {
        return true;
    } else {
        return false;
    }
}

async function main(numSolved) {
    if (numSolved) {
        removeClass("findStart");
    } else {
        removeClass("begin");
    }
    
    var introduction = "You should be able to solve all problems in your head";
    introduction += ", but pen/pencil and paper is allowed.<br>"
    printInstruct(introduction + 'Click "Continue" for the first question.');
    await clickContinue();
    
    while (numSolved < MAP_NAMES.length - 1) {
    //while (numSolved < 2) { // TESTING ONLY
        var levelText = "<div align='left'>Now leaving: " + MAP_NAMES[numSolved] + "</div>";
        levelText += "<div align='left'>Next level:  " + MAP_NAMES[numSolved + 1] + "</div>";
        
        await nextQuestion(levelText, numSolved);
        ++numSolved;
        await sleep(25); // To allows the page to update and prevent accidentally hitting "Continue" twice
        
        if (numSolved == MAP_NAMES.length - 1) { break; }
        printInstruct("CORRECT!<br>" + "You are currently in: " + MAP_NAMES[numSolved] + '<br>Click "Continue" for the next problem.');
        await clickContinue();
    }
    printInstruct("Rule Completed!<br>Good luck in e02 :)");
    
    var resetButton = document.createElement("button");
    resetButton.setAttribute("id", "resetButton");
    resetButton.setAttribute("onClick", "resetMain()");
    resetButton.innerHTML = "Reset";
    document.getElementById("parent").appendChild(resetButton);
}
