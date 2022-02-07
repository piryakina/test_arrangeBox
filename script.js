'use strict'

window.onload = function () {
    ArrangeBox.countBoxes = 1;
    let box = new ArrangeBox();
}

class ArrangeBox {
    _left = [];
    _right = [];
    _select = [];

    boxName;
    static countBoxes;
    n = 8;
    count = 0; //кол-во элементов
    //вернуть id
    getMyId(id) {
        return this.boxName + '-' + (id ?? '');
    }

    //создание контейнера для экземпляра класса
    createBox() {
        let div = document.createElement("div");
        div.className = "box";
        div.id = this.getMyId();
        document.body.append(div);

        let namesLeft = ["upLeft", "topLeft", "bottomLeft", "downLeft"];
        let namesMove = ["toRight", "toLeft", "toRightAll", "toLeftAll"];
        let namesRight = ["upRight", "topRight", "bottomRight", "downRight"];
        let symbols = ["<", "<<", ">>", ">"];
        let symbols2 = [">", "<", ">>", "<<"];
        let settingNames = ["addItemLeft", "add", "reset", "result"];
        let settings = ["add item", "add instance", "reset", "result"];

        this.createButtons('buttonsLeft');
        for (let i = 0; i < namesLeft.length; i++) {
            this.insertButton("sort", namesLeft[i], symbols[i], "buttonsLeft");
        }
        for (let i = 0; i < settings.length; i++) {
            this.insertButton("setting", settingNames[i], settings[i], "buttonsLeft");
        }
        this.createContainer("inputLeft", "container-left");
        this.createButtons('buttonsMove');
        for (let i = 0; i < namesMove.length; i++) {
            this.insertButton("button", namesMove[i], symbols2[i], 'buttonsMove');
        }
        this.createContainer('inputRight', 'container-right');
        this.createButtons('buttonsRight');
        for (let i = 0; i < namesRight.length; i++) {
            this.insertButton("sort", namesRight[i], symbols[i], 'buttonsRight');
        }
        this.insertButton("setting", "addItemRight", "add item", 'buttonsRight');
    }

    //проверка на наличие элемента id  в select
    checkSelect(id) {
        for (let i = 0; i < this._select.length; i++) {
            if (this._select[i].id === id)
                return true;
        }
        return false;
    }

    constructor(nameBox) {
        if (!nameBox) {
            nameBox = ArrangeBox.countBoxes++;
        }
        this.boxName = 'box-' + nameBox;
        this.createBox();
        this.listOfElements(this.n, this._left, "container-left", "end");
        let h = document.getElementById(this.getMyId("container-left")).clientHeight;
        document.getElementById(this.getMyId("container-right")).style.height = h + "px";
        document.getElementById(this.getMyId("container-left")).style.height = h + "px";
        this.setSort();
        this.setButtons();
        this.setSearch();
    }

    //создание списка элементов
    listOfElements(n, list, container, place) {
        if (place === 'end') {
            for (let i = 0; i < n; i++)
                this.createNode(i, list, place, container)
        } else if (place === "front")
            for (let i = n - 1; i >= 0; i--)
                this.createNode(i, list, place, container)
    }

    //составление случайного слова
    randomWord() {
        let abc = "abcdefghijklmnopqrstuvwxyz";
        let rs = "";
        while (rs.length < 6) {
            rs += abc[Math.floor(Math.random() * abc.length)];
        }
        return rs;
    }

    //создать узел в контейнер
    createNode(i, list, place, container) {
        let div = document.createElement("div");
        if (this._select.length === 0) {
            div.id = this.getMyId(`${this.count++}`);
            div.innerHTML = this.randomWord();
        } else {
            div.id = this._select[i].id;
            div.innerHTML = this._select[i].text;
        }
        div.className = 'item';
        list.push(div.id);

        div.tabIndex = 0;
        div.addEventListener('dblclick', () => {
            //console.log('double');
            if (this._left.includes(div.id)) {
                this.deleteElements(this._left, "container-left");
                this.listOfElements(this._select.length, this._right, "container-right", "end");
                this.clearSelect(this._select)
            } else if (this._right.includes(div.id)) {
                this.deleteElements(this._right, "container-right");
                this.listOfElements(this._select.length, this._left, "container-left", "end");
                this.clearSelect()
            }
        })
        div.addEventListener('click', () => {
            console.log(div.id)
            let element = document.getElementById(div.id);
            if (event.ctrlKey) {
                if (!this.checkSelect(div.id)) {
                    this._select.push({
                        id: div.id,
                        text: div.innerText
                    });
                    element.style.backgroundColor = "#a9d1f5";
                } else {
                    this._select.splice(this._select.findIndex(x => x.id === div.id), 1)
                    element.style.backgroundColor = "#fff";
                }
            } else {
                for (let j = 0; j < this._select.length; j++) {
                    document.getElementById(this._select[j].id).style.backgroundColor = "#fff";
                }
                this.clearSelect();
                this._select.push({
                    id: div.id,
                    text: div.innerText
                });
                element.style.backgroundColor = "#a9d1f5";
            }
        });
        if (place === 'end')
            document.getElementById(this.getMyId(container)).append(div);
        else if (place === 'front')
            document.getElementById(this.getMyId(container)).prepend(div);
    }

    //установить цвет элементов селекта
    setColor() {
        for (let i = 0; i < this._select.length; i++)
            document.getElementById(this._select[i].id).style.background = "#a9d1f5";
    }

    //удалить элементы селекта из list
    deleteElements(list, container) {

        for (let i = 0; i < this._select.length; i++) {
            if (list.includes(this._select[i].id)) {
                console.log(this.getMyId(container))
                document.getElementById(this.getMyId(container)).removeChild(document.getElementById(this._select[i].id));
                list.splice(list.indexOf(this._select[i].id), 1);

            }
        }
    }

    //установить обработчики поиска
    setSearch() {
        let inputL = document.getElementById(this.getMyId("inputLeft"));
        let inputR = document.getElementById(this.getMyId("inputRight"));

        inputL.oninput = () => {
            this.search(this._left, inputL.value);

        }
        inputR.oninput = () => {
            this.search(this._right, inputR.value);

        }
    }

    //установить обработчики на кнопки настройки и перемещения
    setButtons() {
        let buttonRight = document.getElementById(this.getMyId("toRight"));
        let buttonRightAll = document.getElementById(this.getMyId("toRightAll"));
        let buttonLeft = document.getElementById(this.getMyId("toLeft"));
        let buttonLeftAll = document.getElementById(this.getMyId("toLeftAll"));

        let addItemLeft = document.getElementById(this.getMyId("addItemLeft"));
        let addItemRight = document.getElementById(this.getMyId("addItemRight"));

        addItemRight.addEventListener('click', () => {
            this.setList(this._right, "container-right")
        })
        addItemLeft.addEventListener('click', () => {
            this.setList(this._left, "container-left")
        })

        let reset = document.getElementById(this.getMyId("reset"))
        let result = document.getElementById(this.getMyId("result"))
        let addInstance = document.getElementById(this.getMyId("add"))

        addInstance.addEventListener('click', () => {
            let example = new ArrangeBox()

        })

        reset.addEventListener('click', () => {
            this.resetList();
        })
        result.addEventListener("click", () => {
            this.getResult()
        })

        //1 или несколько в правый контейнер
        buttonRight.addEventListener('click', () => {
            let temp = [];
            for (let i = 0; i < this._select.length; i++) {
                if (this._right.includes(this._select[i].id)) {
                    temp.push(this._select[i]);
                    this._select.splice(this._select.indexOf(this._select[i]), 1);
                    i--;
                }
            }
            this.deleteElements(this._left, "container-left");
            this.listOfElements(this._select.length, this._right, "container-right", "end");
            if (temp.length !== 0)
                this._select = temp;
            this.setColor()
        })

        //все в правый контейнер
        buttonRightAll.addEventListener('click', () => {
            this.clearSelect();
            for (let i = 0; i < this._left.length; i++) {
                this._select.push({
                    id: this._left[i],
                    text: document.getElementById(this._left[i]).innerText
                })
            }
            this.deleteElements(this._left, "container-left");
            this.listOfElements(this._select.length, this._right, "container-right", "end");
        })

        //1 или несколько в левый контейнер
        buttonLeft.addEventListener('click', () => {
            let temp = [];
            for (let i = 0; i < this._select.length; i++) {
                if (this._left.includes(this._select[i].id)) {
                    temp.push(this._select[i]);
                    //this.namesItem.push(document.getElementById(this._select[i]).innerText)
                    this._select.splice(this._select.indexOf(this._select[i]), 1);
                    i--;
                }
            }
            this.deleteElements(this._right, "container-right");
            this.listOfElements(this._select.length, this._left, "container-left", "end");
            if (temp.length !== 0)
                this._select = temp;
            this.setColor()
        })

        //все в левый контейнер
        buttonLeftAll.addEventListener('click', () => {
            this.clearSelect();
            for (let i = 0; i < this._right.length; i++) {
                this._select.push({
                    id: this._right[i],
                    text: document.getElementById(this._right[i]).innerText
                })
            }
            this.deleteElements(this._right, "container-right");
            this.listOfElements(this._select.length, this._left, "container-left", "end");
        })

    }

    //установить обработчики на кнопки сортировки
    setSort() {
        let upRight = document.getElementById(this.getMyId("upRight"));
        let topRight = document.getElementById(this.getMyId("topRight"));
        let downRight = document.getElementById(this.getMyId("downRight"));
        let bottomRight = document.getElementById(this.getMyId("bottomRight"));


        let upLeft = document.getElementById(this.getMyId("upLeft"));
        let topLeft = document.getElementById(this.getMyId("topLeft"));
        let downLeft = document.getElementById(this.getMyId("downLeft"));
        let bottomLeft = document.getElementById(this.getMyId("bottomLeft"));

        //в левом контенере все выбранное наверх
        topLeft.addEventListener('click', () => {
            this.cutElements(this._left)
            this.deleteElements(this._left, "container-left");
            this.listOfElements(this._select.length, this._left, "container-left", "front");
            this.setColor()
        })

        //в правом контенере все выбранное наверх
        topRight.addEventListener('click', () => {
            this.cutElements(this._right)
            this.deleteElements(this._right, "container-right");
            this.listOfElements(this._select.length, this._right, "container-right", "front");
            this.setColor()
        })

        //в левом контенере все выбранное вниз
        bottomLeft.addEventListener('click', () => {
            this.cutElements(this._left)
            this.deleteElements(this._left, "container-left");
            this.listOfElements(this._select.length, this._left, "container-left", "end");
            this.setColor()
        })

        //в правом контенере все выбранное вниз
        bottomRight.addEventListener('click', () => {
            this.cutElements(this._right)
            this.deleteElements(this._right, "container-right");
            this.listOfElements(this._select.length, this._right, "container-right", "end");
            this.setColor()
        })

        //выбранные на 1 вверх
        upLeft.addEventListener('click', () => {
            if (!this.checkSelect(this._left[0])) {
                this.cutElements(this._left);
                for (let i = 0; i < this._select.length; i++) {
                    let temp1 = document.getElementById(this._select[i].id);
                    let node = document.getElementById(this._left[this._left.indexOf(this._select[i].id) - 1]);
                    let pos = this._left.indexOf(this._select[i].id);
                    [this._left[pos], this._left[pos - 1]] = [this._left[pos - 1], this._left[pos]];
                    node.before(temp1);
                }
                this.setColor()
            }
        })

        upRight.addEventListener('click', () => {
            if (!this.checkSelect(this._right[0])) {
                this.cutElements(this._right);
                for (let i = 0; i < this._select.length; i++) {
                    let temp1 = document.getElementById(this._select[i].id);
                    let node = document.getElementById(this._right[this._right.indexOf(this._select[i].id) - 1]);
                    let pos = this._right.indexOf(this._select[i].id);
                    [this._right[pos], this._right[pos - 1]] = [this._right[pos - 1], this._right[pos]];
                    node.before(temp1);
                }
                this.setColor()
            }
        })
        downLeft.addEventListener("click", () => {
            if (!this.checkSelect(this._left[this._left.length - 1])) {
                let temp = [];
                for (let i = this._left.length - 1; i >= 0; i--) {
                    if (this.checkSelect(this._left[i]))
                        temp.push({
                            id: this._left[i],
                            text: document.getElementById(this._left[i]).innerText
                        })
                }
                this._select = temp;
                for (let i = 0; i < this._select.length; i++) {
                    let temp1 = document.getElementById(this._select[i].id);
                    let node = document.getElementById(this._left[this._left.indexOf(this._select[i].id) + 1]);
                    let pos = this._left.indexOf(this._select[i].id);
                    [this._left[pos], this._left[pos + 1]] = [this._left[pos + 1], this._left[pos]];
                    node.after(temp1);
                }
                this.setColor()
            }
        })
        downRight.addEventListener("click", () => {
            if (!this.checkSelect(this._right[this._right.length - 1])) {
                let temp = [];
                for (let i = this._right.length - 1; i >= 0; i--) {
                    if (this.checkSelect(this._right[i]))
                        temp.push({
                            id: this._right[i],
                            text: document.getElementById(this._right[i]).innerHTML
                        })
                }
                this._select = temp;
                for (let i = 0; i < this._select.length; i++) {
                    let temp1 = document.getElementById(this._select[i].id);
                    let node = document.getElementById(this._right[this._right.indexOf(this._select[i].id) + 1]);
                    let pos = this._right.indexOf(this._select[i].id);
                    [this._right[pos], this._right[pos + 1]] = [this._right[pos + 1], this._right[pos]];
                    node.after(temp1);
                }
                this.setColor()
            }
        })
    }

    //очистить массив селект
    clearSelect() {
        if (this._select.length !== 0) {
            for (let i = 0; i < this._select.length; i++) {
                document.getElementById(this._select[i].id).style.background = "#fff";
                this._select[i] = null;
            }
            this._select.length = 0;
        }
    }

    //поиск введеного значения
    search(list, input) {
        for (let i = 0; i < list.length; i++) {
            document.getElementById(list[i]).style.display = "block";
        }
        for (let i = 0; i < list.length; i++) {
            let text = String(document.getElementById(list[i]).textContent);
            if (!text.includes(input))
                document.getElementById(list[i]).style.display = "none";
        }

    }

    //добавить элемент
    setList(list, cont) {
        this.clearSelect()
        let k = 1;
        this.listOfElements(k, list, cont, "end")
    }

    //сбросить к начальному значению
    resetList() {
        this.clearSelect()
        for (let i = 0; i < this._left.length; i++) {
            this._select.push({
                id: this._left[i],
                text: document.getElementById(this._left[i]).innerText
            })
        }
        this.deleteElements(this._left, "container-left")
        for (let i = 0; i < this._right.length; i++) {
            this._select.push({
                id: this._right[i],
                text: document.getElementById(this._right[i]).innerText
            })
        }
        this.deleteElements(this._right, "container-right")
        this.listOfElements(this.n, this._left, "container-left", "end")
        this.clearSelect()
        this.count = 0;
    }

    //создать контейнер для значений
    createContainer(inputId, containerId) {
        let div = document.createElement("div");
        div.className = "col";
        let divIn = document.createElement("input");
        divIn.type = "text";
        divIn.placeholder = "search...";
        divIn.id = this.getMyId(inputId);
        div.append(divIn);

        let divCol = document.createElement("div");
        divCol.className = "container";
        divCol.id = this.getMyId(containerId);
        div.append(divCol);
        document.getElementById(this.getMyId()).append(div);
    }

    //создать контейнер для кнопок
    createButtons(buttonsName) {
        let div = document.createElement("div");
        div.className = "buttons";
        div.id = this.getMyId(buttonsName);
        document.getElementById(this.getMyId()).append(div);
    }

    //вставить кнопки взаимодействия
    insertButton(className, id, symbol, node) {
        let div = document.createElement('div');
        div.className = className;
        div.id = this.getMyId(id);
        div.innerText = symbol;
        document.getElementById(this.getMyId(node)).append(div);
    }

    //оставить элементы селекта, которые есть в текущем массиве
    cutElements(list) {
        let temp = [];
        for (let i = 0; i < list.length; i++) {
            if (this.checkSelect(list[i]))
                temp.push({
                    id: list[i],
                    text: document.getElementById(list[i]).innerText
                })
        }
        this.clearSelect()
        this._select = temp;
    }

    //текущее значение контрола
    getResult() {
        let itemsLeft = [];
        let itemsRight = [];
        for (let i = 0; i < this._left.length; i++) {
            itemsLeft.push(document.getElementById(this._left[i]).innerText)
        }
        for (let i = 0; i < this._right.length; i++) {
            itemsRight.push(document.getElementById(this._right[i]).innerText)
        }
        alert("now we have " + itemsLeft + " at left column" + " and " + itemsRight + " at right column")
    }
}



