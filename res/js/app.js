"use strict";

var webStorage = WebStorage();

function NWItem(itemName, database, options) {
    options = options || {};

    var Refiner = (name, maxAdditionalMultiplier) => {
        return {
            name: name,
            addedMultiplier: maxAdditionalMultiplier
        };
    };
    var Ingredient = (name, count) => {
        return {
            name: name,
            count: count
        };
    };

    var Craft = (ingredients) => {
        return {
            valuePerOne: 0,
            ingredients: ingredients
        };
    };

    var self;
    self = {
        database: database,
        options: {
            maxBaseMultiplier: options.maxBaseMultiplier || 0,
        },
        name: itemName,
        ingredientList: [],
        marketValue: 0,
        refinedCraftIngredientList: [],
        craftValue: 0,
        marketCheaper: false,
        usedIn: {},
        refinerFor: {},
        type: "",
        refinerList: [],
        bestRefinerIdx: null,
        xp: null,
        tags: [],
        setMarketValue: (marketValue) => {
            self.marketValue = marketValue;
            return self;
        },
        updateCraftValue: () => {
            var rawCraftValue = 0;
            var craftValue = 0;
            var craftIngredients = [];
            var maxBaseMultiplier = self.options.maxBaseMultiplier;
            var totalMultiplier = maxBaseMultiplier;
            if(self.ingredientList.length > 0) {
                for(var i = 0; i < self.ingredientList.length; i++) {
                    var ingredient = self.ingredientList[i];
                    var ingredientItem = database.getItem(ingredient.name);
                    if(ingredientItem) {
                        ingredientItem.usedIn[self.name] = ingredient.count;
                        ingredientItem.updateCraftValue();

                        var craftIngredient = Ingredient(ingredient.name, ingredient.count);
                        craftIngredients.push(craftIngredient);
                        rawCraftValue += ingredientItem.craftValue * ingredient.count;
                    }
                    else {
                        console.error(`Ingredient "${ingredient.name}" not in database`);
                    }
                }
                var refinerAddedMultiplier = 0;
                if(self.refinerList.length > 0) {
                    var bestRefinerValue = null;
                    self.bestRefinerIdx = null;
                    var bestRefinerItem = null;
                    for(var i = 0; i < self.refinerList.length; i++) {
                        var refiner = self.refinerList[i];
                        var refinerItem = database.getItem(refiner.name);
                        refinerItem.refinerFor[self.name] = 1;
                        refiner.addedValue = (rawCraftValue * (1 + refiner.addedMultiplier)) - rawCraftValue - refinerItem.marketValue;
                        if(refiner.addedValue > bestRefinerValue || bestRefinerValue === null) {
                            bestRefinerValue = refiner.addedValue;
                            self.bestRefinerIdx = i;
                            bestRefinerItem = refinerItem;
                        }
                    }
                    refinerAddedMultiplier = self.refinerList[self.bestRefinerIdx].addedMultiplier;
                    totalMultiplier = maxBaseMultiplier + refinerAddedMultiplier;
                    craftValue += bestRefinerItem.marketValue / (1 + totalMultiplier);
                }
                for(var i = 0; i < craftIngredients.length; i++) {
                    var craftIngredient = craftIngredients[i];
                    var ingredientItem = database.getItem(craftIngredient.name);
                    craftIngredient.count /= 1 + totalMultiplier;
                }
                for(var i = 0; i < craftIngredients.length; i++) {
                    var craftIngredient = craftIngredients[i];
                    var ingredientItem = database.getItem(craftIngredient.name);
                    craftValue += ingredientItem.craftValue * craftIngredient.count;
                }
                //craftValue /= (1 + totalMultiplier);
                self.refinedCraftIngredientList = craftIngredients;
            }
            else {
                craftValue = self.marketValue;
            }
            self.totalMultiplier = totalMultiplier;
            self.craftValue = craftValue;
            self.isMarketCheaper = self.marketValue > 0 && self.marketValue <= self.craftValue;
            self.cheapestValue = self.isMarketCheaper ? self.marketValue : self.craftValue;
        },
        addIngredient: (name, count) => {
            self.ingredientList.push(Ingredient(name, count));
            return self;
        },
        setXp: (xp) => {
            self.xp = xp;
            return self;
        },
        addRefiner: (name, maxAdditionalMultiplier) => {
            var addIdx = 0;
            for(var i = 0; i < self.refinerList.length; i++) {
                var refiner = self.refinerList[i];
                if(maxAdditionalMultiplier > refiner.addedMultiplier) {
                    addIdx = i + 1;
                }
            }
            self.refinerList.splice(addIdx, 0, Refiner(name, maxAdditionalMultiplier));
            return self;
        },
        exportToJson: () => {
            var op = {};
            var json = {
                name: self.name,
                marketValue: self.marketValue,
            };
            if(Object.keys(self.options).length > 0) {
                json.options = self.options;
            }
            if(self.ingredientList.length > 0) {
                var ingredientList = [];
                for(var i = 0; i < self.ingredientList.length; i++) {
                    var ingredient = self.ingredientList[i];
                    ingredientList.push({
                        name: ingredient.name,
                        count: ingredient.count
                    });
                }
                json.ingredients = ingredientList;
            }
            if(self.refinerList.length > 0) {
                var refinerList = [];
                for(var i = 0; i < self.refinerList.length; i++) {
                    var refiner = self.refinerList[i];
                    refinerList.push({
                        name: refiner.name,
                        addedMultiplier: refiner.addedMultiplier
                    });
                }
                json.refiners = refinerList;
            }
            if(self.type.length) json.type = self.type;
            if(self.xp !== null) json.xp = self.xp;
            return json;
        },
        node: null,
        remove: () => {
            var infoInputs = self.node.querySelectorAll(".item_info_misc input");
            for(var i = 0; i < infoInputs.length; i++) {
                var input = infoInputs[i];
                domEventListener.removeEvent(input, "change", "info");
            }
            if(self.recipeVlist) self.recipeVlist.vlist.remove();
            if(self.ingredientVlist) self.ingredientVlist.vlist.remove();
            if(self.node) removeFromParent(self.node);
            var keys = Object.keys(self.usedIn);
            for(var i = 0; i < keys.length; i++) {
                var item = self.database.getItem(self.usedIn[keys[i]]);
                if(!item) continue;
                delete item.usedIn[self.name];
            }
            delete self.database.itemList[self.name];
        },
        getAllIngredients: () => {
            var db = self.database;
            var results = {
                items: [],
                refiners: []
            };
            var itemList = [];
            for(var j = 0; j < self.refinedCraftIngredientList.length; j++) {
                var ingredient = self.refinedCraftIngredientList[j];
                var ingredientItem = db.getItem(ingredient.name);
                if(!ingredientItem) {
                    continue;
                }
                itemList.push({
                    item: ingredientItem,
                    count: ingredient.count
                });
            }
            var idx = 0;
            var endIdx = itemList.length;
            while(idx < endIdx) {
                var itemListItem = itemList[idx].item;
                if(!self.isMarketCheaper) {
                    for(var k = 0; k < itemListItem.refinedCraftIngredientList.length; k++) {
                        var refinedIngredient = itemListItem.refinedCraftIngredientList[k];
                        var refinedItem = db.getItem(refinedIngredient.name);
                        if(!refinedItem) continue;

                        var count = itemList[idx].count * refinedIngredient.count;
                        var matched = null;
                        for(var j = 0; j < itemList.length; j++) {
                            if(itemList[j].item !== refinedItem) continue;
                            itemList[j].count += count;
                            matched = j;
                            break;
                        }
                        if(matched === null) {
                            itemList.push({
                                item: refinedItem,
                                count: count
                            });
                        }
                    }
                }
                idx++;
                endIdx = itemList.length;
            }
            for(var j = 0; j < itemList.length; j++) {
                var ingredient = itemList[j];
                results.items.push(ingredient);
            }
            if(self.refinerList.length) {
                for(var i = 0; i < self.refinerList.length; i++) {
                    var refiner = self.refinerList[i];
                    var refinerItem = db.getItem(refiner.name);
                    if(refinerItem) {
                        results.refiners.push({
                            bestRefiner: self.bestRefinerIdx === i,
                            item: refinerItem,
                            count: 1.0 / (1 + self.totalMultiplier)
                        });
                    }
                }
            }
            return results;
        },
        renderedCraftCount: 1,
        updateNode: (craftCount) => {
            if(typeof craftCount === "undefined") craftCount = 1;
            self.renderedCraftCount = craftCount;
            if(self.node) {
                requestAnimationFrame(() => {
                    var xpString = null;
                    if(self.xp) xpString = `Xp/Tot: ${Math.round(self.xp * craftCount * 100)/100} Xp/g:${Math.round(self.xp / self.craftValue * 100) / 100}`;
                    if(self.node) {
                        console.log(self);
                        var inject = {
                            item_info_name: self.name + (craftCount > 1 ? ` X ${craftCount}` : ""),
                            craft_price: `$${Math.round(self.craftValue * 100 * craftCount) / 100}`,
                            market_price: `$${Math.round(self.marketValue * 100) / 100}`,
                            xp: self.xp || 0,
                            base_multiplier: `${self.options.maxBaseMultiplier ? (Math.round(self.options.maxBaseMultiplier * 10000)/100) : "N/A"}%`,
                            total_multiplier: `${Math.round(self.totalMultiplier * 10000)/100}%`,
                            xp_per_gold: self.xp ? `${Math.round(self.xp / self.craftValue)}` : "0",
                            tags: self.tags.join(", ")
                        };
                        console.log(self.node);
                        injectHtml(self.node, inject);
                        //appendTextToSelector(self.node, ".item_name", `${self.name}: $${Math.round(self.craftValue * 100) / 100} - ${Math.round(self.totalMultiplier * 10000)/100}%`);
                        //appendTextToSelector(self.node, ".item_xp", xpString);
                    }
                    var ingredientsDiv = self.node.querySelector(".item_ingredients");
                    //removeAllChildren(ingredientsDiv);
                    var ingredients = self.getAllIngredients();
                    self.ingredientVlist.setList(ingredients.items);
                    self.refinerVlist.setList(ingredients.refiners);
                    self.recipeVlist.setList(self.ingredientList);
                    self.usedInVlist.setList(Object.keys(self.usedIn));
                });
            }
        },
        generateNode: () => {
            var db = self.database;
            var cont = document.querySelector(".templates .item_info").cloneNode(true);
            self.node = cont;
            if(self.recipeVlist) self.recipeVlist.vlist.remove();
            var onInput = (e) => {
                var value = e.target.value;
                var node = getFirstParentWithClass(e.target, "virtual_list_item");
                if(node) {
                    var name = node.getAttribute("data-name");
                    var inputType = e.target.getAttribute("data-value_type");
                    switch(inputType) {
                        case "count":
                            var ingredientList = self.ingredientList;
                            for(var i = 0; i < ingredientList.length; i++) {
                                var ingredient = ingredientList[i];
                                if(ingredient.name === name) {
                                    self.database.save("default");
                                    ingredient.count = numbersOnly(value)
                                    break;
                                }
                            }
                            break;
                        case "price":
                            var item = self.database.getItem(name);
                            if(item) {
                                self.database.save("default");
                                item.marketValue = numbersOnly(value);
                            }
                            break;
                    }
                    self.database.updateCraftValues();
                    var ingredients = self.getAllIngredients();
                    console.log(ingredients.refiners);
                    self.ingredientVlist.setList(ingredients.refiners);
                    self.updateNode();
                }
            };
            var refinerOnInput = (e) => {
                var value = e.target.value;
                var node = getFirstParentWithClass(e.target, "virtual_list_item");
                if(node) {
                    var name = node.getAttribute("data-name");
                    var inputType = e.target.getAttribute("data-value_type");
                    switch(inputType) {
                        case "multiplier":
                            var refinerList = self.refinerList;
                            for(var i = 0; i < refinerList.length; i++) {
                                var refiner = refinerList[i];
                                if(refiner.name === name) {
                                    refiner.options.maxBaseMultiplier = numbersOnly(value) / 100;
                                    self.database.save("default");
                                    break;
                                }
                            }
                            break;
                        case "price":
                            var item = self.database.getItem(name);
                            if(item) {
                                item.marketValue = numbersOnly(value);
                                self.database.save("default");
                            }
                            break;
                    }
                    self.database.updateCraftValues();
                    var ingredients = self.getAllIngredients();
                    self.ingredientVlist.setList(ingredients.items);
                    self.updateNode();
                }
            };
            var miscOnChange = (e) => {
                var value = e.target.value;
                var inputType = e.target.getAttribute("data-value_type");
                switch(inputType) {
                    case "market_price":
                        self.marketValue = numbersOnly(value);
                        break;
                    case "xp":
                        self.xp = numbersOnly(value);
                        self.database.save("default");
                        break;
                    case "multiplier":
                        self.multiplier = numbersOnly(value) / 100;
                        self.database.save("default");
                        break;
                    case "tags":
                        var tags = value.split(",");
                        for(var i = 0; i < tags.length; i++) tags[i] = tags[i].trim();
                        self.tags = tags;
                        self.database.save("default");
                        break;
                }
                self.database.updateCraftValues();
                self.updateNode();
            };
            var infoInputs = self.node.querySelectorAll(".item_info_misc input");
            for(var i = 0; i < infoInputs.length; i++) {
                var input = infoInputs[i];
                domEventListener.addEvent(input, "change", "info", miscOnChange);
            }
            if(self.recipeVlist) self.recipeVlist.vlist.remove();
            self.recipeVlist = SelectableList(cont.querySelector(".recipe_cont"), {
                onCreateNode: () => {
                    var node = document.querySelector(".templates .recipe_ingredient").cloneNode(true);
                    node.classList.add("virtual_list_item");
                    var inputs = node.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.addEventListener("change", onInput);
                    }
                    return node;
                },
                onFillNode: (itemNode, item, idx) => {
                    itemNode.setAttribute("data-name", item.name);
                    var itemObj = self.database.getItem(item.name);
                    var inject = {
                        name: item.name,
                        price: `$${itemObj ? itemObj.marketValue : 0}`,
                        count: item.count
                    };
                    injectHtml(itemNode, inject);
                },
                onItemSelect: (e, item, selectOptions) => {
                    console.log(item);
                },
                onNodeRemove: (itemNode) => {
                    console.error("remove", itemNode);
                    var inputs = itemNode.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.removeEventListener("input", onInput);
                    }
                },
            });
            if(self.refinerVlist) self.refinerVlist.vlist.remove();
            self.refinerVlist = SelectableList(cont.querySelector(".refiner_cont"), {
                onCreateNode: () => {
                    var node = document.querySelector(".templates .refiner_ingredient").cloneNode(true);
                    node.classList.add("virtual_list_item");
                    var inputs = node.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.addEventListener("change", refinerOnInput);
                    }
                    return node;
                },
                onFillNode: (itemNode, item, idx) => {
                    itemNode.setAttribute("data-name", item.item.name);
                    var itemObj = self.database.getItem(item.item.name);
                    var addedMultiplier = 0;
                    for(var i = 0; i < self.refinerList.length; i++) {
                        var refiner = self.refinerList[i];
                        if(refiner.name === item.item.name) {
                            addedMultiplier = refiner.addedMultiplier;
                        }
                    }
                    var multiplier = Math.round(addedMultiplier * 10000)/100;
                    var inject = {
                        name: `${item.item.name}${item.bestRefiner ? "*" : ""}`,
                        price: `$${(itemObj ? itemObj.marketValue : 0) * self.renderedCraftCount}`,
                        multiplier: `${multiplier}%`,
                        count: `${Math.floor(self.renderedCraftCount / (1 + addedMultiplier)*100)/100}`
                    };
                    injectHtml(itemNode, inject);
                },
                onItemSelect: (e, item, selectOptions) => {
                    if(e.type === "dblclick" || e.type === "input") {
                        self.database.nwTool.renderItemRecipe(1, item.item.name);
                    }
                },
                onNodeRemove: (itemNode) => {
                    console.error("remove", itemNode);
                    var inputs = itemNode.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.removeEventListener("input", onInput);
                    }
                },
            });
            if(self.ingredientVlist) self.ingredientVlist.vlist.remove();
            self.ingredientVlist = SelectableList(cont.querySelector(".ingredients_cont"), {
                onCreateNode: () => {
                    var node = document.querySelector(".templates .ingredient").cloneNode(true);
                    node.classList.add("virtual_list_item");
                    var inputs = node.querySelectorAll("input");
                    for(var i = 0; i < inputs.length; i++) {
                        var input = inputs[i];
                        input.addEventListener("change", onInput);
                    }
                    return node;
                },
                onFillNode: (itemNode, item, idx) => {
                    itemNode.setAttribute("data-name", item.item.name);
                    var count = roundTo(item.count, {
                        decimals: 2
                    });
                    var inject = {
                        name: item.item.name,
                        craft_price: `$${formatNumber(item.count * item.item.cheapestValue * self.renderedCraftCount) + (item.item.isMarketCheaper ? "*" : "")}`,
                        price: `$${formatNumber(item.item.marketValue)}`,
                        count: Math.floor(count * self.renderedCraftCount * 100) / 100
                    };
                    injectHtml(itemNode, inject);
                },
                onItemSelect: (e, item, selectOptions) => {
                    console.log(item);
                    if(e.type === "dblclick" || e.type === "input") {
                        self.database.nwTool.renderItemRecipe(1, item.item.name);
                    }
                }
            });
            if(self.usedInVlist) self.usedInVlist.vlist.remove();
            self.usedInVlist = SelectableList(cont.querySelector(".used_in_cont"), {
                onCreateNode: () => {
                    var node = document.querySelector(".templates .used_in").cloneNode(true);
                    node.classList.add("virtual_list_item");
                    return node;
                },
                onFillNode: (itemNode, itemName, idx) => {
                    var item = self.database.getItem(itemName);
                    if(item) {
                        var count = 0;
                        for(var i = 0; i < item.ingredientList.length; i++) {
                            var ingredient = item.ingredientList[i];
                            if(ingredient.name === self.name) {
                                count = ingredient.count;
                                break;
                            }
                        }
                        count = roundTo(count, {
                            decimals: 2
                        });
                        var inject = {
                            name: item.name,
                            count: count
                        };
                        injectHtml(itemNode, inject);
                    }
                },
                onItemSelect: (e, itemName, selectOptions) => {
                    console.log(e);
                    if(e.type === "dblclick" || e.type === "input") {
                        self.database.nwTool.renderItemRecipe(1, itemName);
                    }
                }
            });
            return cont;
        }
    };
    return self;
}

function NWDatabase(nwTool) {
    var self;
    self = {
        itemList: {},
        nwTool: nwTool,
        addItem: (itemName, itemOptions) => {
            var item = NWItem(itemName, self, itemOptions);
            self.itemList[itemName] = item;
            return item;
        },
        removeItem: (itemName) => {
            var item = self.getItem(itemName);
            if(item) item.remove();
        },
        setMarketValue: (itemName, marketValue) => {
            var item = self.itemList[itemName];
            if(item) item.setMarketValue(marketValue);
        },
        updateCraftValues: () => {
            var keys = Object.keys(self.itemList);
            for(var i = 0; i < keys.length; i++) {
                var item = self.itemList[keys[i]];
                item.updateCraftValue();
            }
        },
        getItem: (itemName) => {
            return self.itemList[itemName];
        },
        loadFromJson: (db) => {
            self.itemList = {};
            if(db.items) {
                var keys = Object.keys(db.items);
                for(var i = 0; i < keys.length; i++) {
                    var item = db.items[keys[i]];

                    var dbItem = self.addItem(item.name, item.options);
                    if (item.ingredients) {
                        for(var j = 0; j < item.ingredients.length; j++) {
                            dbItem.addIngredient(item.ingredients[j].name, item.ingredients[j].count);
                        }
                    }
                    if(item.refiners) {
                        for(var j = 0; j < item.refiners.length; j++) {
                            dbItem.addRefiner(item.refiners[j].name, item.refiners[j].addedMultiplier);
                        }
                    }
                    if(typeof item.marketValue !== "undefined") dbItem.setMarketValue(item.marketValue);
                    if(typeof item.xp !== "undefined") dbItem.setXp(item.xp);
                }
            }
        },
        exportToJson: () => {
            var db = {
                items: {}
            };
            var keys = Object.keys(self.itemList);
            for(var i = 0; i < keys.length; i++) {
                var item = self.itemList[keys[i]];
                db.items[item.name] = item.exportToJson();
            }
            return db;
        },
        save: (databaseName) => {
            var databases = webStorage.loadKey("databases");
            databases = databases || {};
            databases[databaseName] = self.exportToJson();
            webStorage.saveKey("databases", databases);
        }
    };
    return self;
}

function formatItemName(name) {
    var arr = name.split("_");
    for(var i = 0; i < arr.length; i++) arr[i][0].toUpperCase();
    return arr.join(" ");
}

function NWTool() {
    var self;
    self = {
        tabNav: TabNav({
            onTabChange: (url) => {
                if(url === "recipes") {
                }
            }
        }),
        getDatabaseList: () => {
            var databases = webStorage.loadKey("databases");
            var list = [];
            if(databases) list = Object.keys(databases);
            list.sort(stringCompare);
            return list;
        },
        populateDatabaseSelect: () => {
            var select = self.databaseSelect;
            var selectOptions = [];
            var databases = self.getDatabaseList();
            var hasDefault = false;
            for(var i = 0; i < databases.length; i++) {
                if(databases[i] === "default") {
                    hasDefault = true;
                    break;
                }
            }
            if(!hasDefault) databases.push("default");
            var selectOptions = [];
            for(var i = 0; i < databases.length; i++) {
                selectOptions.push({
                    text: databases[i],
                    value: databases[i]
                });
            }
            var styledSelect = StyledSelect(select);
            styledSelect.setList(selectOptions);
            styledSelect.setValue(selectOptions[0].value);
        },
        onLoad: () => {
            self.tabNav.setupBindings();
            self.tabNav.selectDefaultTab();
            self.databaseSelect = document.querySelector(".database_select");
            var options = webStorage.loadKey("options") || {};
            var dbName = options.currentSelectedDatabase || "default";
            var databases = webStorage.loadKey("databases");
            if(databases && databases[dbName]) {
                self.database.loadFromJson(databases[dbName]);
                self.database.updateCraftValues();
            }
            self.populateDatabaseSelect();
            //self.populateList(1);
            self.setupBindings();
            self.populateRecipeList();
        },
        populateRecipeList: () => {
            var db = self.database;
            var keys = Object.keys(db.itemList);
            keys.sort(stringCompare);
            var selectOptions = [];
            for(var i = 0; i < keys.length; i++) {
                selectOptions.push({
                    text: formatItemName(keys[i]),
                    value: keys[i]
                });
            }
            var recipeList = document.getElementById("recipe_list");
            if(recipeList) {
            //  console.log(recipeList);
            //  var styledSelect = StyledSelect(recipeList);
            //  styledSelect.setList(selectOptions);
            //  styledSelect.setValue("bob");
                var list = SelectableList(recipeList, {
                    onFillNode: (itemNode, item, idx) => {
                        appendText(itemNode, item.text);
                    },
                    onItemSelect: (e, item, selectOptions) => {
                        self.renderItemRecipe(1, item.value);
                    }
                });
                list.setList(selectOptions);
            }
        },
        currentRenderedItemRecipe: null,
        renderItemRecipe: (craftCount, itemName) => {
            var item = self.database.getItem(itemName);
            if(item) {
                var cont = document.querySelector(".tab_recipes");
                if(cont) {
                    var input = document.querySelector(".count_input");
                    var count = input ? numbersOnly(input.value) : 1;
                    removeAllChildren(cont);
                    var node = item.generateNode();
                    item.updateNode(1);
                    cont.appendChild(node);
                    self.currentRenderedItem = item.name;
                }
            }
        },
        setupBindings: () => {
            var input = document.querySelector(".count_input");
            input.addEventListener("input", (e) => {
                var value = numbersOnly(input.value);
                if(self.currentRenderedItem) {
                    var item = self.database.getItem(self.currentRenderedItem);
                    if(item) {
                        item.updateNode(value || 1);
                    }
                }
            });
            self.databaseSelect.addEventListener("change", (e) => {
                console.log(`Changed db to ${getSelectValue(self.databaseSelect)}`);
            });
        }
    };
    self.database = NWDatabase(self);
    return self;
}

var nwTool = NWTool();

function loadDefaults() {
    var db = nwTool.database;
    var options = webStorage.loadKey("options") || {};
    var databases = webStorage.loadKey("databases");
    if(true || (databases && typeof databases["default"] === "undefined")) {
        var item;
        db.addItem("sand_flux");
        db.addItem("shelldust_flux");
        db.addItem("obsidian_flux");
        db.addItem("coarse_sandpaper");
        db.addItem("fine_sandpaper");
        db.addItem("obsidian_sandpaper");
        db.addItem("weak_solvent");
        db.addItem("pure_solvent");
        db.addItem("potent_solvent");
        db.addItem("tannin");
        db.addItem("rested_tannin");
        db.addItem("aged_tannin");
        db.addItem("crossweave");
        db.addItem("silkweave");
        db.addItem("wireweave");

        db.addItem("rawhide");
        db.addItem("thick_hide");
        db.addItem("iron_hide");
        db.addItem("coarse_leather", {
            maxBaseMultiplier: 0.30
        }).addIngredient("rawhide", 4);
        db.addItem("rugged_leather", {
            maxBaseMultiplier: 0.28
        }).addIngredient("coarse_leather", 4).addRefiner("tannin", 0).addRefiner("rested_tannin", 0.50).addRefiner("aged_tannin", 0.75);
        db.addItem("layered_leather", {
            maxBaseMultiplier: 0.20
        }).addIngredient("rugged_leather", 2).addIngredient("thick_hide", 6).addRefiner("tannin", 0).addRefiner("rested_tannin", 0.05).addRefiner("aged_tannin", 0.30);
        db.addItem("infused_leather", {
            maxBaseMultiplier: 0.13
        }).addIngredient("layered_leather", 2).addIngredient("iron_hide", 6).addRefiner("tannin", 0).addRefiner("rested_tannin", 0.05).addRefiner("aged_tannin", 0.10);
        db.addItem("coarse_leather_pants").setXp(216).addIngredient("coarse_leather", 10).addIngredient("iron_ingot", 2).addIngredient("linen", 6);
        db.addItem("rugged_leather_pants").setXp(540).addIngredient("rugged_leather", 10).addIngredient("iron_ingot", 2).addIngredient("linen", 6);
        db.addItem("layered_leather_pants").setXp(1350).addIngredient("layered_leather", 10).addIngredient("iron_ingot", 2).addIngredient("linen", 6);

        db.addItem("infused_leather_pants").setXp(2790).addIngredient("infused_leather", 10).addIngredient("iron_ingot", 2).addIngredient("linen", 6);
        db.addItem("infused_leather_gloves").setXp(1395).addIngredient("infused_leather", 4).addIngredient("iron_ingot", 1).addIngredient("linen", 4);
        db.addItem("infused_leather_shirt").setXp(5425).addIngredient("infused_leather", 22).addIngredient("iron_ingot", 1).addIngredient("linen", 12);
        db.addItem("infused_leather_hat").setXp(2790).addIngredient("infused_leather", 11).addIngredient("iron_ingot", 1).addIngredient("linen", 6);
        db.addItem("infused_leather_shoes").setXp(1395).addIngredient("infused_leather", 5).addIngredient("iron_ingot", 1).addIngredient("linen", 3);

        db.addItem("iron_plate_greaves").setXp(216).addIngredient("coarse_leather", 10).addIngredient("iron_ingot", 10).addIngredient("linen", 2);
        db.addItem("steel_plate_greaves").setXp(540).addIngredient("coarse_leather", 10).addIngredient("steel_ingot", 10).addIngredient("linen", 2);
        db.addItem("starmetal_plate_greaves").setXp(1350).addIngredient("coarse_leather", 10).addIngredient("starmetal_ingot", 10).addIngredient("linen", 2);
        db.addItem("orichalcum_plate_greaves").setXp(2790).addIngredient("coarse_leather", 10).addIngredient("orichalcum_ingot", 10).addIngredient("linen", 2);
        db.addItem("linen_pants").setXp(216).addIngredient("coarse_leather", 6).addIngredient("iron_ingot", 2).addIngredient("linen", 10);
        db.addItem("sateen_pants").setXp(540).addIngredient("coarse_leather", 6).addIngredient("iron_ingot", 2).addIngredient("sateen", 10);
        db.addItem("silk_pants").setXp(1350).addIngredient("coarse_leather", 6).addIngredient("iron_ingot", 2).addIngredient("silk", 10);
        db.addItem("infused_silk_pants").setXp(2790).addIngredient("coarse_leather", 6).addIngredient("iron_ingot", 2).addIngredient("infused_silk", 10);
        db.addItem("infused_silk_gloves").setXp(1395).addIngredient("coarse_leather", 4).addIngredient("iron_ingot", 1).addIngredient("infused_silk", 4);
        db.addItem("infused_silk_shirt").setXp(5425).addIngredient("coarse_leather", 12).addIngredient("iron_ingot", 1).addIngredient("infused_silk", 22);
        db.addItem("infused_silk_hat").setXp(2790).addIngredient("coarse_leather", 6).addIngredient("iron_ingot", 1).addIngredient("infused_silk", 11);
        db.addItem("infused_silk_shoes").setXp(1395).addIngredient("coarse_leather", 3).addIngredient("iron_ingot", 1).addIngredient("infused_silk", 5);
        db.addItem("stone");
        db.addItem("lodestone");
        db.addItem("loamy_lodestone");
        db.addItem("iron_ore");
        db.addItem("silver_ore");
        db.addItem("gold_ore");
        db.addItem("platinum_ore");
        db.addItem("starmetal_ore");
        db.addItem("orichalcum_ore");
        db.addItem("charcoal");
        db.addItem("fibers");
        db.addItem("silk_threads");
        db.addItem("wirefiber");
        db.addItem("linen", {
            maxBaseMultiplier: 0.30
        }).setXp(36).addIngredient("fibers", 4);
        db.addItem("sateen", {
            maxBaseMultiplier: 0.25
        }).setXp(190).addIngredient("linen", 4).addRefiner("crossweave", 0).addRefiner("silkweave", .50).addRefiner("wireweave", .75);
        db.addItem("silk", {
            maxBaseMultiplier: 0.18
        }).setXp(1665).addIngredient("sateen", 2).addIngredient("silk_threads", 6).addRefiner("crossweave", 0).addRefiner("silkweave", .10).addRefiner("wireweave", .35);
        db.addItem("infused_silk", {
            maxBaseMultiplier: 0.13
        }).setXp(8470).addIngredient("silk", 2).addIngredient("wirefiber", 8).addRefiner("crossweave", 0).addRefiner("silkweave", .05).addRefiner("wireweave", .10);
        db.addItem("iron_ingot", {
            maxBaseMultiplier: 0.20
        }).addIngredient("iron_ore", 4);
        db.addItem("steel_ingot", {
            maxBaseMultiplier: 0.18
        }).addIngredient("iron_ingot", 3).addIngredient("charcoal", 2).addRefiner("sand_flux", 0).addRefiner("shelldust_flux", 0.50).addRefiner("obsidian_flux", 0.75);
        db.addItem("starmetal_ingot", {
            maxBaseMultiplier: 0.10
        }).addIngredient("steel_ingot", 2).addIngredient("starmetal_ore", 6).addIngredient("charcoal", 2).addRefiner("sand_flux", 0).addRefiner("shelldust_flux", 0.05).addRefiner("obsidian_flux", 0.30);
        db.addItem("orichalcum_ingot", {
            maxBaseMultiplier: 0.03
        }).addIngredient("starmetal_ingot", 2).addIngredient("orichalcum_ore", 6).addIngredient("charcoal", 2).addRefiner("sand_flux", 0).addRefiner("shelldust_flux", 0.05).addRefiner("obsidian_flux", 0.10);

        db.addItem("mote");
        db.addItem("wisp", {
            maxBaseMultiplier: 0.20
        }).addIngredient("mote", 5);
        db.addItem("essence", {
            maxBaseMultiplier: 0.20
        }).addIngredient("wisp", 4);
        db.addItem("quintessence", {
            maxBaseMultiplier: 0.20
        }).addIngredient("essence", 3);
        db.addItem("green_wood");
        db.addItem("aged_wood");
        db.addItem("asmodeum_ingot");
        db.addItem("wyrdwood");
        db.addItem("ironwood");
        db.addItem("timber", {
            maxBaseMultiplier: 0.26
        }).setXp(36).addIngredient("green_wood", 4);
        db.addItem("lumber", {
            maxBaseMultiplier: 0.24
        }).setXp(266).addIngredient("timber", 2).addIngredient("aged_wood", 4).addRefiner("coarse_sandpaper", 0).addRefiner("fine_sandpaper", 0.50).addRefiner("obsidian_sandpaper", 0.75);
        db.addItem("wyrdwood_planks", {
            maxBaseMultiplier: 0.16
        }).setXp(1665).addIngredient("lumber", 2).addIngredient("wyrdwood", 6).addRefiner("coarse_sandpaper", 0).addRefiner("fine_sandpaper", 0.05).addRefiner("obsidian_sandpaper", 0.25);
        db.addItem("ironwood_planks", {
            maxBaseMultiplier: 0.09
        }).setXp(8470).addIngredient("wyrdwood_planks", 2).addIngredient("ironwood", 8).addRefiner("coarse_sandpaper", 0).addRefiner("fine_sandpaper", 0.05).addRefiner("obsidian_sandpaper", 0.10);

        db.addItem("orichalcum_pickaxe").addIngredient("orichalcum_ingot", 15);

        db.addItem("gem_brilliant");
        db.addItem("gem_pristine_expensive");
        db.addItem("gem_pristine", {
            maxBaseMultiplier: 0.30
        }).addIngredient("gem_brilliant", 5).addIngredient("quintessence", 1);
        db.addItem("gem_brilliant_cut", {
            maxBaseMultiplier: 0.30
        }).addIngredient("gem_brilliant", 1).addIngredient("essence", 2).addRefiner("weak_solvent", 0);
        db.addItem("gem_pristine_cut", {
            maxBaseMultiplier: 0.30
        }).addIngredient("gem_pristine", 1).addIngredient("quintessence", 3).addRefiner("weak_solvent", 0);
        db.addItem("silver_ingot", {
            maxBaseMultiplier: 0.20
        }).addIngredient("silver_ore", 4);
        db.addItem("gold_ingot", {
            maxBaseMultiplier: 0.12
        }).addIngredient("silver_ingot", 2).addIngredient("gold_ore", 6).addRefiner("sand_flux", 0).addRefiner("shelldust_flux", 0.20).addRefiner("obsidian_flux", 0.40);
        db.addItem("platinum_ingot", {
            maxBaseMultiplier: 0.08
        }).addIngredient("gold_ingot", 2).addIngredient("platinum_ore", 6).addRefiner("sand_flux", 0).addRefiner("shelldust_flux", 0.14).addRefiner("obsidian_flux", 0.25);
        db.addItem("silver_setting").addIngredient("silver_ingot", 4);
        db.addItem("silver_band").addIngredient("silver_ingot", 5);
        db.addItem("platinum_setting").addIngredient("platinum_ingot", 4);
        db.addItem("platinum_band").addIngredient("platinum_ingot", 8);
        db.addItem("asmodeum_setting").addIngredient("asmodeum_ingot", 4);
        db.addItem("asmodeum_band").addIngredient("asmodeum_ingot", 8);
        db.addItem("jewelry_ring_brilliant").setXp(1200).addIngredient("gem_brilliant_cut", 1).addIngredient("silver_setting", 1).addIngredient("silver_band", 1).addIngredient("silver_ingot", 1);
        db.addItem("jewelry_ring_pristine").setXp(2000).addIngredient("gem_pristine_cut", 1).addIngredient("platinum_setting", 1).addIngredient("platinum_band", 1).addIngredient("orichalcum_ingot", 1);
        db.addItem("jewelry_ring_legendary").setXp(2000).addIngredient("gem_pristine_expensive", 1).addIngredient("asmodeum_setting", 1).addIngredient("asmodeum_band", 1).addIngredient("asmodeum_ingot", 1);

        db.addItem("stone_block", {
            maxBaseMultiplier: 0.30
        }).addIngredient("stone", 4);
        db.addItem("stone_brick", {
            maxBaseMultiplier: 0.28
        }).addIngredient("stone_block", 4).addRefiner("coarse_sandpaper", 0).addRefiner("fine_sandpaper", 0.50).addRefiner("obsidian_sandpaper", 0.75);
        db.addItem("lodestone_brick", {
            maxBaseMultiplier: 0.20
        }).addIngredient("stone_brick", 2).addIngredient("lodestone", 6).addRefiner("coarse_sandpaper", 0).addRefiner("fine_sandpaper", 0.05).addRefiner("obsidian_sandpaper", 0.30);
        db.addItem("obsidian_voidstone", {
            maxBaseMultiplier: 0.18
        }).addIngredient("lodestone_brick", 8).addIngredient("lodestone", 2).addIngredient("loamy_lodestone", 1).addRefiner("coarse_sandpaper", 0).addRefiner("fine_sandpaper", 0.05).addRefiner("obsidian_sandpaper", 0.30);
        db.addItem("common_honing_stone").addIngredient("stone_brick", 1).addIngredient("wisp", 2);
        db.addItem("strong_honing_stone").addIngredient("lodestone_brick", 1).addIngredient("essence", 2);
        db.addItem("powerful_honing_stone").addIngredient("obsidian_voidstone", 1).addIngredient("quintessence", 2);
        db.addItem("oil");
        db.addItem("ash_stain").setXp(14/10).addIngredient("charcoal", 10/10).addIngredient("weak_solvent", 4/10);
        db.addItem("maple_stain").setXp(84/10).addIngredient("oil", 4/10).addIngredient("weak_solvent", 10/10);
        db.addItem("oak_stain").setXp(336/10).addIngredient("oil", 4/10).addIngredient("potent_solvent", 10/10);
        db.addItem("mahogany_stain").setXp(1344/10).addIngredient("oil", 4/10).addIngredient("pure_solvent", 10/10);
        db.addItem("furniture_t1_incense").setXp(24).addIngredient("timber", 1).addIngredient("hyssop", 1).addIngredient("cinnamon", 1).addIngredient("charcoal", 1);
        db.addItem("furniture_t1_small_oil").setXp(150).addIngredient("iron_ingot", 15).addIngredient("oil", 5).addIngredient("fibers", 5);
        db.addItem("furniture_t1_small_iron").setXp(156).addIngredient("timber", 15).addIngredient("iron_ingot", 10).addIngredient("ash_stain", 1);
        db.addItem("furniture_t1_large_iron").setXp(282).addIngredient("timber", 30).addIngredient("iron_ingot", 15).addIngredient("ash_stain", 2);
        db.addItem("furniture_t2_incense").setXp(96).addIngredient("lumber", 1).addIngredient("hyssop", 1).addIngredient("cinnamon", 1).addIngredient("charcoal", 1);
        db.addItem("furniture_t2_trophy").setXp(1704).addIngredient("lumber", 25).addIngredient("steel_ingot", 20).addIngredient("maple_stain", 1).addIngredient("mote", 25);
        db.addItem("furniture_t2_large_steel").setXp(1128).addIngredient("lumber", 30).addIngredient("steel_ingot", 15).addIngredient("maple_stain", 2);
        db.addItem("furniture_t2_large_solvent").setXp(1128).addIngredient("lumber", 35).addIngredient("weak_solvent", 10).addIngredient("maple_stain", 2);
        db.addItem("furniture_t2_large_starmetal_1").setXp(4512).addIngredient("wyrdwood_planks", 35).addIngredient("starmetal_ingot", 10).addIngredient("oak_stain", 2);
        db.addItem("furniture_t2_large_starmetal_2").setXp(4512).addIngredient("wyrdwood_planks", 30).addIngredient("starmetal_ingot", 15).addIngredient("oak_stain", 2);
        db.addItem("furniture_t3_incense").setXp(384).addIngredient("wyrdwood_planks", 1).addIngredient("hyssop", 1).addIngredient("cinnamon", 1).addIngredient("charcoal", 1);
        db.addItem("furniture_t4_incense").setXp(1280).addIngredient("ironwood_planks", 1).addIngredient("hyssop", 1).addIngredient("cinnamon", 1).addIngredient("charcoal", 1);
        db.addItem("furniture_t4_large_orichalcum_special").setXp(6720).addIngredient("orichalcum_ingot", 20).addIngredient("mote", 1);
        db.addItem("furniture_t4_large_orichalcum_1").setXp(15040).addIngredient("orichalcum_ingot", 15).addIngredient("ironwood_planks", 30).addIngredient("mahogany_stain", 2);
        db.addItem("furniture_t4_large_orichalcum_2").setXp(15040).addIngredient("orichalcum_ingot", 10).addIngredient("ironwood_planks", 35).addIngredient("mahogany_stain", 2);
        db.addItem("infused_corrupted_coating").setXp(620).addIngredient("salamander_slime", 1).addIngredient("blightroot_stem", 1).addIngredient("rivercress_stem", 1).addIngredient("oil", 1);
        db.addItem("trophy_minor").setXp(1704).addIngredient("lumber", 25).addIngredient("steel_ingot", 25).addIngredient("ash_stain", 1);;
        db.addItem("trophy_basic").setXp(4608).addIngredient("wyrdwood_planks", 25).addIngredient("starmetal_ingot", 25).addIngredient("maple_stain", 1);
        db.addItem("trophy_major").setXp(15360).addIngredient("ironwood_planks", 25).addIngredient("orichalcum_ingot", 25).addIngredient("mahogany_stain", 1);

        db.addItem("cartridge_iron").setXp(72).addIngredient("iron_ingot", 4).addIngredient("linen", 1).addIngredient("gunpowder", 1);
        db.addItem("cartridge_steel").setXp(270).addIngredient("steel_ingot", 3).addIngredient("sateen", 2).addIngredient("gunpowder", 1);
        db.addItem("cartridge_starmetal").setXp(840).addIngredient("starmetal_ingot", 2).addIngredient("silk", 2).addIngredient("gunpowder", 1);
        db.addItem("cartridge_orichalcum").setXp(2520).addIngredient("orichalcum_ingot", 1).addIngredient("infused_silk", 3).addIngredient("gunpowder", 1);
        db.addItem("arrow_iron").setXp(108).addIngredient("iron_ingot", 4).addIngredient("timber", 2).addIngredient("feathers", 3);
        db.addItem("arrow_steel").setXp(360).addIngredient("steel_ingot", 3).addIngredient("lumber", 2).addIngredient("feathers", 3);
        db.addItem("arrow_starmetal").setXp(1176).addIngredient("starmetal_ingot", 2).addIngredient("wyrdwood_planks", 2).addIngredient("feathers", 3);
        db.addItem("arrow_orichalcum").setXp(3024).addIngredient("orichalcum_ingot", 1).addIngredient("ironwood_planks", 2).addIngredient("feathers", 3);
        db.addItem("feathers").setMarketValue(0.01);
        db.addItem("gunpowder").setMarketValue(0.01).setXp(96/5).addIngredient("charcoal", 5/5).addIngredient("flint", 2/5).addIngredient("saltpeter", 1/5);

        db.addItem("longsword_iron").setXp(120).addIngredient("iron_ingot", 7).addIngredient("timber", 2).addIngredient("coarse_leather", 1);
        db.addItem("longsword_steel").setXp(330).addIngredient("steel_ingot", 8).addIngredient("timber", 2).addIngredient("coarse_leather", 1);
        db.addItem("longsword_starmetal").setXp(900).addIngredient("starmetal_ingot", 9).addIngredient("timber", 2).addIngredient("coarse_leather", 1);
        db.addItem("longsword_orichalcum").setXp(2015).addIngredient("orichalcum_ingot", 10).addIngredient("timber", 2).addIngredient("coarse_leather", 1);

        db.addItem("great_axe_iron").setXp(204).addIngredient("iron_ingot", 12).addIngredient("timber", 3).addIngredient("coarse_leather", 2);
        db.addItem("great_axe_steel").setXp(540).addIngredient("steel_ingot", 13).addIngredient("timber", 3).addIngredient("coarse_leather", 2);
        db.addItem("great_axe_starmetal").setXp(1425).addIngredient("starmetal_ingot", 14).addIngredient("timber", 3).addIngredient("coarse_leather", 2);
        db.addItem("great_axe_orichalcum").setXp(3100).addIngredient("orichalcum_ingot", 15).addIngredient("timber", 3).addIngredient("coarse_leather", 2);

        db.addItem("honing_stone_weak").setXp(36).addIngredient("stone_block", 1).addIngredient("mote", 2);
        db.addItem("honing_stone_common").setXp(90).addIngredient("stone_brick", 1).addIngredient("wisp", 2);
        db.addItem("honing_stone_strong").setXp(225).addIngredient("lodestone_brick", 1).addIngredient("essence", 2);
        db.addItem("honing_stone_powerful").setXp(465).addIngredient("obsidian_voidstone", 1).addIngredient("quintessence", 2);
        db.addItem("gemstone_dust_strong").setXp(900).addIngredient("gem_brilliant", 3);
        db.addItem("food_pork_belly_fried_rice", {
            maxBaseMultiplier: 0.96
        }).addIngredient("egg", 1).addIngredient("onion", 1).addIngredient("garlic", 1).addIngredient("salt", 1).addIngredient("rice", 1).addIngredient("pork_belly", 1).addIngredient("cooking_oil", 1);

        db.addItem("egg").setMarketValue(11);
        db.addItem("onion").setMarketValue(2.3);
        db.addItem("garlic").setMarketValue(4.4);
        db.addItem("rice").setMarketValue(0.5);
        db.addItem("pork_belly").setMarketValue(0.5);
        db.addItem("cooking_oil").setMarketValue(0.5);
        db.addItem("salt").setMarketValue(10);
        db.addItem("cinnamon").setMarketValue(1);
        db.addItem("hyssop").setMarketValue(0.01);
        db.addItem("flint").setMarketValue(0.3);
        db.addItem("saltpeter").setMarketValue(0.7);
        db.addItem("salamander_slime").setMarketValue(3.0);
        db.addItem("blightroot_stem").setMarketValue(0.03);
        db.addItem("rivercress_stem").setMarketValue(0.35);
        db.setMarketValue("gem_pristine_expensive", 300);
        db.setMarketValue("oil", 0.35);
        db.setMarketValue("loamy_lodestone", 1.00);
        db.setMarketValue("lodestone", 0.12);
        db.setMarketValue("stone", 0.07);
        db.setMarketValue("charcoal", 0.26);
        db.setMarketValue("mote", 0.50);
        db.setMarketValue("sand_flux", 1);
        db.setMarketValue("shelldust_flux", 1.2);
        db.setMarketValue("obsidian_flux", 1.7);
        db.setMarketValue("coarse_sandpaper", 0.60);
        db.setMarketValue("fine_sandpaper", 0.77);
        db.setMarketValue("obsidian_sandpaper", 0.70);
        db.setMarketValue("weak_solvent", 0.01);
        db.setMarketValue("potent_solvent", 0.2);
        db.setMarketValue("pure_solvent", 0.01);
        db.setMarketValue("tannin", 0.15);
        db.setMarketValue("rested_tannin", 0.25);
        db.setMarketValue("aged_tannin", 0.5);
        db.setMarketValue("crossweave", 0.1);
        db.setMarketValue("silkweave", 0.13);
        db.setMarketValue("crossweave", 3.0);
        db.setMarketValue("fibers", 0.09);
        db.setMarketValue("silk_threads", 0.40);
        db.setMarketValue("wirefiber", 0.20);
        db.setMarketValue("asmodeum_ingot", 350);

        db.setMarketValue("starmetal_ore", 0.30);
        db.setMarketValue("orichalcum_ore", 0.03);
        db.setMarketValue("iron_ore", 0.06);
        db.setMarketValue("iron_ingot", 0.48);
        db.setMarketValue("silver_ore", 0.035);
        db.setMarketValue("gold_ore", 0.03);
        db.setMarketValue("platinum_ore", 0.08);
        db.setMarketValue("green_wood", 0.10);
        db.setMarketValue("aged_wood", 0.10);
        db.setMarketValue("wyrdwood", 0.10);
        db.setMarketValue("ironwood", 0.40);
        db.setMarketValue("gem_brilliant", 4);
        db.setMarketValue("rawhide", 0.10);
        db.setMarketValue("thick_hide", 0.12);
        db.setMarketValue("iron_hide", 0.01);
        var databases = webStorage.loadKey("databases") || {};
        databases.default = db.exportToJson();
        webStorage.saveKey("databases", databases);
    }
}

window.addEventListener('load', () => {
    loadDefaults();
    nwTool.onLoad();
    console.log(nwTool);
    //var vlist = ValueVirtualList(document.querySelector(".vlist_test", {
    //}));
    //vlist.reflow();
    //setTimeout(() => {
    //  console.log("Loaded");
    //  var json = db.exportToJson();
    //  console.log(json);
    //  db.loadFromJson(json);
    //  db.updateCraftValues();
    //  nwTool.populateList(1);
    //}, 1000);
});

