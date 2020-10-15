/*IIFE、Closure、Event Delegation 範例
 
var budgetController = (function(){//創造此函式當下立即invoke
    var x = 23;//"private"
    var add = function(a){ //"private" function: 因為在closure裡
        return x + a;
    }

    return { //return一個帶有method的object
        publicTest: function(b){ //"public"
            return add(b); //budgetController.publicTest(5): 28，因為closure能取用outer scope的變數或function或引數
        }
    }
})();
/*--------------關注點分離 (Separation of concerns):意即不同閉包之間不會互相影響------------------*/

/*var UIController = (function(){


})();
/*--------------關注點分離 (Separation of concerns):意即不同閉包之間不會互相影響------------------*/
//大方向: 利用controller這個module來雙向溝通budgetController和UIController，減少專案的複雜度，達到互相獨立分離的效果
/*var controller = (function(budgetCtrl, UICtrl){
    var z = budgetCtrl.publicTest(5);
    return {
        anotherPublic: function(){ //"public"
            console.log(z);//controller.anotherPublic(z): 28，因為anotherPublic取得外層的z，而且z因為budgetController這個module被傳入，所以能夠使用publicTest函式
        }
    }
})(budgetController, UIController);//使用IIFE直接傳入這兩個module給(budgetCtrl, UICtrl)*/

/*--------------------------------------------------------------------------------------------------*/

// Budget Controller
var budgetController = (function(){
    var Expense = function(id, description, value){ //因為會有很多支出收入，所以用 function constructor 來製造大量 object 
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome)*100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){ //因為會有很多支出收入，所以用 function constructor 來製造大量 object 
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = { //使用 object 來存取任何東西，能夠建立好的 data structor (private)
        allItems:{ //儲存上方物件陣列
            exp: [],
            inc: []
        },
        totals:{    //儲存收入支出金額
            exp: 0,
            inc: 0
        },
        budger: 0,
        percentage: -1
    };

    return{
        addItem: function(type, des, val){
            var newItem, ID;  
            //產生下一個新的id，用來標示每個新的收入支出物件，[type]是指到相對應的收入or支出陣列，[data.allItems[type].length - 1].id 是指到該收入or支出的最後一個陣列元素，+1代表指向下一個新的代加入陣列元素
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;  
            else
                ID = 0;    
            //依照支出or收入來新增一個新的物件
            if(type === 'exp')
                newItem = new Expense(ID, des, val);
            else if(type === 'inc')
                newItem = new Income(ID, des, val);
            //放到上方的 allItem 這個data structure -> 物件陣列
            data.allItems[type].push(newItem);
            return newItem;
        }, 

        deleteItem: function(type, id){
            var ids, index
            //id = 6
            //ids = [1,2,4,6,8]
            //index = 3
            ids = data.allItems[type].map(function(current){//map 會回傳一個全新的array
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);//刪除陣列中的元素，splice(陣列欲起始之位置(預設為0), 欲刪除的數量)  
            }
        },

        calculateBudget: function(){
            //1. 計算所有收入支出
            calculateTotal('exp');
            calculateTotal('inc');
            //2. 計算收入 - 支出
            data.budget = data.totals.inc - data.totals.exp;
            //3. 計算支出佔總收入的百分比
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }  
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget :function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    };

})();

// UI Controller
var UIController = (function(){
    var DOMstrings = { //當 DOM 選擇器一多時，若是更改 html 裡的 class 就要去JS找 code，所以用 object 集中管理會比較好改(private) 
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);//小數後兩位
        numSplit = num.split('.');//1234.00
        int = numSplit[0];//分段完變成兩個字串存入陣列
        dec = numSplit[1];

        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);//擷取片段的字串，substr(1,3):第1和第2的字元
        }

        return (type === 'exp' ?  '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i<list.length; i++){
            callback(list[i], i);
        }
    };

    return{ //return method 裡的 object 
        getInput: function(){ 
            return{  //return object
                type : document.querySelector(DOMstrings.inputType).value, //+ or - 
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem : function(obj, type){
            var html, newHtml, element;
            //create HTML strings with placeholder text(使用單引號把 html 轉成 string)
            if(type === 'inc'){//把需要取代的項目用 %className% 表示 
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' 
            }
            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id); //此時newHtml包含更新過id的html字串
            newHtml = newHtml.replace('%description%', obj.description);//利用上方剛更新過id的字串再次更新他的description
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));//同上
            //insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);//<div>   ->放這裡<-</div> = 放在child部分的最後面那個，也就是parent結尾前
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el); //不能直接刪除子節點，要先回到父節點再去刪除子節點，這是js奇怪的邏輯
        },

        clearFields: function(){
            var fields, fieldsArr;
            //此時 fields 是 list 不是 array
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            //利用 "Array" 是所有陣列的 function constructor，且 "Array" 的所有內建 method 都來自其 prototype 
            fieldsArr = Array.prototype.slice.call(fields);//slice: 拷貝一份原陣列，call: 可讓call 裡面的參數當作 this 來傳 
            //forEach 會將陣列內的每個元素，皆傳入並執行給定的函式一次，所以我們才要把 list 轉成 method
            fieldsArr.forEach(function(current, index, array){
                current.value = "";// 目前被處理的元素
            });
            //清除完指回 inputDescription
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'; 
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); //形成 nodelist ，是由 DOM tree 中多個 node 所集合而成

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else 
                    current.textContent = '---';
            });
        },

        displayMonth: function(){
            var now, year, month;
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septemper', 'October', 'November', 'December'];

            now = new Date(); //顯示今天日期
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue); //nodelist

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function(){ //此舉是為了把上方的 private DOMstrings 變成 public，好讓 controller 能夠去使用
            return DOMstrings; //return object
        }
    };
})();

// Global APP Controller
var controller = (function(budgetCtrl, UICtrl){
    var setupEventListeners = function(){ //集中管理 addEventListener 
        var DOM = UICtrl.getDOMstrings(); //此時就能夠使用 UIController 的 private object(DOMstrings)

        document.querySelector(DOM.inputBtn).addEventListener('click', crtlAddItem);
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){ //which能兼容舊版瀏覽器
                crtlAddItem();
            }
        });
        //Event Delegation 事件委派 : 利用此特性可以把 Event handler 設在 parent node ，再繼續向下選出想要選取的child node
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); // 當要選取的 child node 很多時，就可以使用此方法
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function(){
        //1. 計算錢包
        budgetCtrl.calculateBudget();
        //2. return 錢包
        var budget = budgetCtrl.getBudget();
        //3. 把錢包更新到 UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        //1. 計算百分比
        budgetCtrl.calculatePercentages();
        //2. 從 budge controller 讀取百分比
        var percentages = budgetCtrl.getPercentages();
        //3. 把新的百分比更新UI
        UICtrl.displayPercentages(percentages);
    };

    var crtlAddItem = function(){
        var input, newItem

        //1. 抓取 input data
        input = UICtrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){//isNaN: 不為數字則TRUE
            //2. 新增 item 到 budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3. 把新增的 item 更新到 UI
            UICtrl.addListItem(newItem, input.type);
            //4. 清除輸入
            UICtrl.clearFields();
            //5. 計算並更新錢包
            updateBudget();
            //6. 計算並更新百分比
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event){//Event Bubbling : 可以從子節點利用 parentNode 的方式選到 parentNode
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;//inc-1

        if(itemID){
            splitID = itemID.split('-');//inc-1.split('-') -> [inc, 1] Array type
            type = splitID[0]; //inc/exp
            ID = parseInt(splitID[1]);
            //1. 從 data structor 中刪除 item
            budgetCtrl.deleteItem(type, ID);
            //2. 從 UI 刪除 item
            UICtrl.deleteListItem(itemID);
            //3. 更新錢包
            updateBudget();
            //4. 計算並更新百分比
            updatePercentages();
        }
    };

    return { //return method
        init: function(){ //為了讓它變 public，所以透過 return object 
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);//使用IIFE直接傳入這兩個module給(budgetCtrl, UICtrl)

controller.init(); //必須在外層，因為要啟動 init 裡的 setupEventListeners()