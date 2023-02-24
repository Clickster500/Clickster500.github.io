const MAP_NAMES = ["00/01", "02/03", "04/05", "06/07", "08", "09", "10", "11/12", "13", "14", "15", "16", "17", "18", "19", "e00", "e01", "e02"];
const ANSWER_KEY = ['A', 'B', 'C', 'D', 'E'];
const KEY = Date.now();

////////////////////////////////////////////////////////////////////////////////
// Helper functions (return values used by main/configure on screen text)
////////////////////////////////////////////////////////////////////////////////

// Inclusive on both boundaries.
function nextRandInt(lower, upper) {
    return Math.floor(lower + Math.random() * (1 + upper - lower));
}

function nextRandBool() {
    return Math.random() < 0.5;
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function getKey(val) {
    if (val) {
        return nextRandInt(1, 1000)*KEY;
    } else {
        return nextRandInt(1, 1000)*KEY + nextRandInt(1, KEY - 1);
    }
}

function getOperator(val) {
    if (val >= 0) {
        return " + ";
    } return " - ";
}

function getCloseAns(allAns) {
    let close = allAns[0];
    while (allAns.indexOf(close) != -1) {
        close += nextRandInt(-5, 5);
    }
    return close;
}

function getTensAns(allAns) {
    let tens = allAns[0];
    while (allAns.indexOf(tens) != -1) {
        tens = allAns[0] + 10 * nextRandInt(-2, 2);
    }
    return tens;
}

function getRandAns(allAns, lower, upper) {
    let rand = allAns[0];
    while (allAns.indexOf(rand) != -1) {
        rand = nextRandInt(lower, upper);
    }
    return rand;
}

function addLineBreak(className) {
    let lineBreak = document.createElement("br");
    lineBreak.setAttribute("class", className);
    document.getElementById("parent").appendChild(lineBreak);
}

function removeClass(className) {
    let elems = document.getElementsByClassName(className);
    while (elems.length) {
        elems[0].remove();
    }
}

function printInstruct(text) {
    let instructions = document.getElementById("instructions");
    if (!instructions) {
        instructions = document.createElement('p');
        instructions.setAttribute("id", "instructions");
        document.getElementById("parent").appendChild(instructions);
    }
    instructions.innerHTML = text;
}

function makeButton(text, onClick, className = "", idName = "", parent = "parent") {
    let button = document.createElement("button");
    button.innerHTML = text;
    button.setAttribute("onClick", onClick);
    button.setAttribute("class", className);
    button.setAttribute("id", idName)
    document.getElementById(parent).appendChild(button);
}

function getBaseText(numSolved, questNum, attempts) {
    let baseText = questNum != 0 
        ? "<div align='left'>Question: " + questNum + "</div>"
        : "<div align='left'>Now leaving: " + MAP_NAMES[numSolved] + "</div>"
        + "<div align='left'>Next level:  " + MAP_NAMES[numSolved + 1] + "</div>";
    if (attempts >= 1) {
        baseText = "INCORRECT" + baseText;
    }
    return baseText;
}

////////////////////////////////////////////////////////////////////////////////
// Logic functions (call other functions, but do not deal with buttons).
////////////////////////////////////////////////////////////////////////////////

function questionSetup(numSolved, questNum, totAttempts) {
    let diff = nextRandInt(0, 45) + numSolved;
    let attempts = 0;
    
    nextQuestion(numSolved, questNum, diff, attempts, totAttempts);
}

async function nextQuestion(numSolved, questNum, diff, attempts, totAttempts) {
    let baseText = getBaseText(numSolved, questNum, attempts);
    
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
    
    baseText += "<div align='left'>Attempt: " + (attempts + 1) + "</div>";
    await sleep(attempts * 500);
    
    let variation = nextRandInt(0, 2);
    if (diff < numSolved + 5) {
        baseText += "<div align='left'>Category: FREE PASS</div><br>";
        nextFree(baseText, numSolved);
    } else if (diff < 20) {
        baseText += "<div align='left'>Category: ARITHMETIC</div><br>";
        nextArithmetic(variation, baseText, numSolved, questNum, diff, attempts, totAttempts);
    } else if (diff < 35) {
        baseText += "<div align='left'>Category: ALGEBRA I</div><br>";
        nextAlgebra(variation, baseText, numSolved, questNum, diff, attempts, totAttempts);
    } else if (diff < 50) {
        baseText += "<div align='left'>Category: GEOMETRY or BASIC TRIG</div><br>";
        nextGeometry(variation, baseText, numSolved, questNum, diff, attempts, totAttempts);
    } else {
        baseText += "<div align='left'>Category: BASIC CALCULUS</div><br>";
        nextCalculus(variation, baseText, numSolved, questNum, diff, attempts, totAttempts);
    }
}

function nextArithmetic(variation, baseText, numSolved, questNum, diff, attempts, totAttempts) {
    if (variation == 0) { // 1-3 Digit addition.
        let a = nextRandInt(1, 100);
        let b = nextRandInt(10, 200);
        let trueAns = a + b;
        let multAns = a * b;
        
        let subtrAns = a - b;
        if (subtrAns < 0) {
            subtrAns = b - a;
        }
        
        let ansChoices = [trueAns, multAns, subtrAns];
        ansChoices.push(getCloseAns(ansChoices));
        ansChoices.push(getRandAns(ansChoices, 11, 300));
        
        let question = baseText + "What is: &emsp;" + a + " + " + b + "?";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    } else if (variation == 1) { // 1-3 Digit subtration.
        let a = nextRandInt(1, 200);
        let b = nextRandInt(1, a);
        let trueAns = a - b;
        let addAns = a + b;
        
        let ansChoices = [trueAns, addAns];
        ansChoices.push(getTensAns(ansChoices));
        ansChoices.push(getCloseAns(ansChoices));
        ansChoices.push(getRandAns(ansChoices, 0, 199));
        
        let question = baseText + "What is: &emsp;" + a + " - " + b + "?";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    } else { //1-2 Digit multiplication
        let a = nextRandInt(1, 30);
        let b = nextRandInt(1, 10);
        let trueAns = a * b;
        let addAns = a + b;
        if (addAns == trueAns) { addAns++;}
        let subtrAns = a - b;
        
        let ansChoices = [trueAns, addAns, subtrAns];
        ansChoices.push(getCloseAns(ansChoices));
        ansChoices.push(getRandAns(ansChoices, 1, 300));
        
        let question = baseText + "What is: &emsp;" + a + " * " + b + "?";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    }
}

function nextAlgebra(variation, baseText, numSolved, questNum, diff, attempts, totAttempts) {
    if (variation == 0) { // a(x + b) = n*a
        let a = nextRandInt(1, 10);
        let na = a * getRandAns([0], -10, 10); // n cannot be 0
        let b = 0;
        while (b == 0 || (na/a*-1 - b) == (na/a - b)) {
            b = nextRandInt(-10, 10);
        }
        let trueAns = na / a - b;
        let signAns1 = na / a * (-1) - b;
        let signAns2 = na / a + b;
        
        let ansChoices = [trueAns, signAns1, signAns2];
        ansChoices.push(getCloseAns(ansChoices, trueAns));
        ansChoices.push(getRandAns(ansChoices, -20, 20));
        
        let operator = getOperator(b);
        let question = baseText + "Solve for x: &emsp;" + a + "(x" + operator + Math.abs(b) + ") = " + na + ".";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    } else if (variation == 1) { // Evaluate x(ax + b) at x = c.
        let a = nextRandInt(-5, 5);
        let b = getRandAns([0], -10, 10); // b cannot be 0.
        let c = nextRandInt(0, 6);
        let trueAns = c*(a*c + b);
        let signAns1 = c*(a*c - b);
        let signAns2 = -1*trueAns;
        let signAns3 = -1*signAns1;
        if (c == 0 || a == 0) {
            signAns1 = -1*b;
            signAns2 = getRandAns([trueAns, signAns1], -240, 240);
            signAns3 = getRandAns([trueAns, signAns1, signAns2], -240, 240);
        }
        
        let ansChoices = [trueAns, signAns1, signAns2, signAns3];
        ansChoices.push(getRandAns(ansChoices, -240, 240));
        
        let operator = getOperator(b);
        let question = baseText + "Evaluate when x=" + c + ": &emsp;" + "x(" + a + "*x" + operator + Math.abs(b) + ").";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    } else { // What is the y-intercept / or slope: y = mx + b
        let m = getRandAns([0], -1000, 1000);
        let b = getRandAns([0, m, -1*m], -1000, 1000);
        
        let ansChoices = [];
        let goal = "";
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
        
        let operator = getOperator(b);
        let question = baseText + "What is the " + goal + " of: &emsp;y = " + m + "*x" + operator + Math.abs(b) + "?";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    }
}

function nextGeometry(variation, baseText, numSolved, questNum, diff, attempts, totAttempts) {
    if (variation == 0) { // 30°-60°-90° triangle. Find length b or c given a
        let a = 2 * nextRandInt(1, 100);
        
        let ansChoices = [];
        let goal = "";
        if (nextRandBool()) {
            ansChoices.push(2*a, a+"(√3)");
            goal = "hypotenuse";
        } else {
            ansChoices.push(a+"(√3)", 2*a);
            goal = "long leg"
        }
        
        ansChoices.push(a/2, a+" / (√3)");
        let randAns = getRandAns([a, 2*a, a/2], 1, 200);
        if (nextRandBool()) { 
            ansChoices.push(randAns);
        } else {
            ansChoices.push(randAns + "(√3)");
        }
        
        let question = baseText + "In a 30°-60°-90° triangle:<br>The short leg has a length of " + a + ".<br><br>";
        question += "What is the length of the " + goal + "?";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    } else if (variation == 1) { // sin(x) in first quadrant
        const ANGLES = ["0°", "30°", "45°", "60°", "90°"];
        let ans = ['0', "1 / 2", "1 / (√2)", "(√3) / 2", '1'];
        let index = nextRandInt(0, 4);
        let trueAns = ans.splice(index, 1);
        
        let lastAns = ans.splice(nextRandInt(0, 3), 1);
        let ansChoices = [trueAns, ans[0], ans[1], ans[2], lastAns];
        
        let question = baseText + "What is sin(" + ANGLES[index] + ")?";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    } else { // Volume of a cylinder, V = pi r^2 h
        let r = getRandAns([2], 1, 6);
        let h = getRandAns([r, 2], 1, 10);
        let trueCoeff = r**2 * h;
        let circumCoeff = 2*r*h;
        let heightCoeff = h**2 * r;
        
        let ansCoeffs = [trueCoeff, circumCoeff, heightCoeff];
        ansCoeffs.push(getCloseAns(ansCoeffs));
        ansCoeffs.push(getRandAns(ansCoeffs, 1, 360));
        
        let ansChoices = []
        for (let i = 0; i < ansCoeffs.length; i++) {
            ansChoices.push(ansCoeffs[i] + 'π');
        }
    
        let question = baseText + "What is the volume of a cylinder with<br>radius = " + r + " and height = " + h + "?";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    }
}

function nextCalculus(variation, baseText, numSolved, questNum, diff, attempts, totAttempts) {
    variation = 1 // TESTING ONLY
    if (variation == 0) { // What is the area under y = 2x from a to b.
        let a = nextRandInt(-10, 5);
        let b = nextRandInt(a, 10);
        let trueAns = b**2 - a**2;
        let addAns = b**2 + a**2;
        let orderAns = a**2 - b**2;
        let integrateAns = 2*b - 2*a;   
        
        let ansChoices = [trueAns, addAns, orderAns, integrateAns];
        ansChoices.push(getCloseAns(ansChoices));
        for (let i = 1; i < ansChoices.length - 1; i++) {
            for (let j = 0; j < ansChoices.length; j++) {
                if (j != i && ansChoices[i] == ansChoices[j]) {
                    ansChoices[i] = getRandAns(ansChoices, -100, 100);
                    break;
                }
            }
        }
        
        let question = baseText + "What is the area under y = 2x from x=" + a + " to x=" + b + "?";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    } else if (variation == 1) { // Derivatives of common, non-polynomial functions.
        const FUNCTIONS = ["e<sup>x</sup>", "sin(x)", "cos(x)", "ln(x)", "cosh(x)"];
        let ans = ["e<sup>x</sup>", "cos(x)", "-sin(x)", "1 / x", "sinh(x)"];
        let index = nextRandInt(0, 4);
        let trueAns = ans.splice(index, 1);
        
        let lastAns = ans.splice(nextRandInt(0, 3), 1);

        if (trueAns == "sinh(x)") {
            ans.splice(nextRandInt(0, 2), 1);
            var ansChoices = [trueAns, "-sinh(x)", ans[0], ans[1], lastAns];
        } else {
            var ansChoices = [trueAns, ans[0], ans[1], ans[2], lastAns];
        }
        
        let questFunc = FUNCTIONS[index];
        questFunc += nextRandBool() ? "" : " + " + nextRandInt(1, 100);
        
        let question = baseText + "What is the derivative of: &emsp;f(x) = " + questFunc + "?";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    } else { // Calculate f'(c), given f(x) = x^3 + ax + b?
        let a = getRandAns([-1, 0, 1], -20, 20);
        let b = 2 * getRandAns([0], -100, 100);
        let c = getRandAns([0], -6, 6);
        
        let trueAns = 3 * c**2 + a;
        let missedPrimeAns = c**3 + a*c + b;
        let secondDerivAns = 6*c;

        let ansChoices = [trueAns, missedPrimeAns, secondDerivAns];
        ansChoices.push(getCloseAns(ansChoices));
        ansChoices.push(getTensAns(ansChoices));

        for (let i = 1; i < ansChoices.length - 1; i++) {
            for (let j = 0; j < ansChoices.length; j++) {
                if (j != i && ansChoices[i] == ansChoices[j]) {
                    ansChoices[i] = getRandAns(ansChoices, -20, 100);
                    break;
                }
            }
        }
        
        let question = baseText + "Calculate f'("+ c + "), given f(x) = x^3" + getOperator(a) + Math.abs(a) + "x" + getOperator(b) + Math.abs(b) + ".";
        getAnswer(question, ansChoices, numSolved, questNum, diff, attempts, totAttempts);
    }
}

function choice(numSolved, questNum, diff, attempts, totAttempts, indexSelected) {
    attempts++;

    let elems = document.getElementsByClassName("ansButton");
    for (let i = 0; i < elems.length; i++) {
        elems[i].setAttribute("disabled", true);

        let keyVal = elems[i].getAttribute("id");
        if (keyVal % KEY == 0) {
            elems[i].setAttribute("id", "correctAnswer");
            var wasCorrect = (i == indexSelected);
        } else if (i == indexSelected) {
            elems[i].setAttribute("id", "wrongAnswer");
        }
    }

    return;

    if (!wasCorrect) {
        bottomText = document.createElement('p');
        instructions.setAttribute("class", "ansButton");
        document.getElementById("end").appendChild(bottomText);
        instructions.innerHTML = "INCORRECT. Try again when ready.";

        makeButton("Try again.", "removeClass('ansButton'); nextQuestion("+numSolved+","+questNum+","+diff-1+","+attempts+","+totAttempts+");", "contButton", "", "end")
    }






    if (keyVal % KEY) {
        nextQuestion(numSolved, questNum, diff - 1, attempts, totAttempts);
        return;
    }
    if (numSolved < 0) { // Practice
        practiceRoom(numSolved, questNum, attempts, totAttempts);
    } else { // Standard
        waitingRoom(numSolved + 1);
    }
}

////////////////////////////////////////////////////////////////////////////////
// Main functions (triggered by button push, end with generating a new button)
////////////////////////////////////////////////////////////////////////////////

function begin(numSolved = 0) {
    removeClass("begin");
    
    let introduction = "You should be able to solve all problems in your head";
    introduction += ", but pen/pencil and paper is allowed.<br>"
    printInstruct(introduction + 'Click "Continue" for the first question.');
    
    makeButton("Continue", "removeClass('contButton'); questionSetup(" + numSolved + ",0,0);", "contButton");
}

function findStart() {
    removeClass("begin");
    printInstruct("What was the last level you beat?");
    for (let i = 1; i < MAP_NAMES.length - 1; i++) {
        makeButton(MAP_NAMES[i], "removeClass('findStart'); begin("+i+");", "findStart");
        if (i % 4 == 0) {
            addLineBreak("findStart");
        }
    }
}

function nextFree(text, numSolved) {
    printInstruct(text + 'Click "Continue" when ready.');
    makeButton("Continue", "removeClass('contButton'); waitingRoom(" + (numSolved+1) + ");", "contButton");
}

function getAnswer(promptText, ansChoices, numSolved, questNum, diff, attempts, totAttempts) {
    printInstruct(promptText);
    
    let isAnsFound = false;
    if (nextRandInt(0, 4) == 4) {
        isAnsFound = true;
        ansChoices.shift();
    }
    
    for (let i = 0; i < 4; i++) {
        let index = nextRandInt(0, 3-i);
        
        if (index == 0 && !isAnsFound) {
            isAnsFound = true;
            makeButton(ANSWER_KEY[i] + ". " + ansChoices[index], "choice("+numSolved+","+questNum+","+diff+","+attempts+","+totAttempts+","+i+");", "ansButton", getKey(1));
        } else {
            makeButton(ANSWER_KEY[i] + ". " + ansChoices[index], "choice("+numSolved+","+questNum+","+diff+","+attempts+","+totAttempts+","+i+");", "ansButton", getKey(0));
        }
        
        ansChoices.splice(index, 1);
        if (i % 2 == 1) {
            addLineBreak("ansButton");
        }
    }
    
    if (ansChoices.length == 0) {
        makeButton("E. None of the above", "choice("+numSolved+","+questNum+","+diff+","+attempts+","+totAttempts+",4);", "ansButton", getKey(1));
    } else {
        makeButton("E. None of the above", "choice("+numSolved+","+questNum+","+diff+","+attempts+","+totAttempts+",4);", "ansButton", getKey(0));
    }
}

function waitingRoom(numSolved) {
    if (numSolved > 0) {
        makeButton("Redo Previous", "removeClass('contButton'); waitingRoom(" + (numSolved-1) + ");", "contButton", "stopButton");
    }
    
    if (numSolved < MAP_NAMES.length - 1) {
        printInstruct("CORRECT!<br>" + "You are currently in: " + MAP_NAMES[numSolved] + '<br>Click "Continue" for the next problem.');
        makeButton("Continue", "removeClass('contButton'); questionSetup(" + numSolved + ",0,0);", "contButton");
    } else {
        printInstruct("Rule Completed!<br>Good luck in e02 :)");
        makeButton("Reset", "removeClass('contButton'); resetNorm();", "contButton", "stopButton");
    }
}

function resetNorm() {
    document.getElementById("instructions").remove();
    makeButton("Start at the Beginning", "begin();", "begin");
    makeButton("Continue Progress", "findStart();", "begin");
}

function practice(typeVal) {
    let questNum = 1;
    questionSetup(-1*typeVal, questNum, 0);
}

function practiceRoom(numSolved, questNum, attempts, totAttempts) {
    totAttempts += attempts;
    printInstruct("You have solved " + questNum + " question(s) in " + totAttempts + " attempt(s).");
    makeButton("Continue", "removeClass('contButton'); questionSetup("+numSolved+","+(questNum+1)+","+totAttempts+");", "contButton");
    makeButton("End Practice", "removeClass('contButton'); resetPractice();", "contButton", "stopButton", "end");
}

function resetPractice() {
    document.getElementById("instructions").remove();
    let catNames = ["Arithmetic", "Algebra I", "Geometry or Basic Trig", "Basic Calculus"];
    for (let i = 0; i < catNames.length; i++) {
        makeButton(catNames[i], "removeClass('practButton'); practice("+(i+1)+");", "practButton");
        if (i == 1) {
            addLineBreak("practButton");
        }
    }
}
